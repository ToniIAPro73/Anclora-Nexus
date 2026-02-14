"""
Scoring Service — Prospection & Buyer Matching v1.
Feature: ANCLORA-PBM-001

Pure business logic with no DB dependency.
Computes high_ticket_score and match_score with full breakdown.
"""

from typing import Any, Dict, List, Optional

from backend.models.prospection import ScoreResult


# ═══════════════════════════════════════════════════════════════════════════════
# CONSTANTS — Premium zone definitions for Mallorca SW
# ═══════════════════════════════════════════════════════════════════════════════

# Zones classified by premium tier (0-100)
ZONE_PREMIUM_SCORES: Dict[str, float] = {
    # Tier S — Ultra premium
    "Port d'Andratx": 95.0,
    "Camp de Mar": 90.0,
    "Son Vida": 92.0,
    # Tier A — Premium
    "Es Capdellà": 82.0,
    "Andratx": 78.0,
    "Bendinat": 85.0,
    "Portals Nous": 83.0,
    # Tier B — High
    "Santa Ponsa": 72.0,
    "Son Ferrer": 68.0,
    "Calvià": 70.0,
    "Peguera": 65.0,
    # Tier C — Standard
    "Palmanova": 55.0,
    "Magaluf": 45.0,
}

DEFAULT_ZONE_SCORE: float = 50.0

# Price thresholds for liquidity estimation (Mallorca SW luxury)
LIQUIDITY_BRACKETS: list[tuple[float, float]] = [
    (0, 500_000, ),        # Not in target — low score
    (500_000, 1_000_000),  # Entry
    (1_000_000, 2_000_000),  # Sweet spot — high liquidity
    (2_000_000, 4_000_000),  # High luxury — medium liquidity
    (4_000_000, float("inf")),  # Ultra — lower liquidity
]

LIQUIDITY_SCORES: list[float] = [30.0, 60.0, 85.0, 70.0, 50.0]

# Property type quality multipliers
PROPERTY_TYPE_QUALITY: Dict[str, float] = {
    "villa": 85.0,
    "finca": 80.0,
    "penthouse": 78.0,
    "apartment": 65.0,
    "townhouse": 60.0,
    "plot": 55.0,
}

DEFAULT_TYPE_QUALITY: float = 50.0

# Purchase horizon scoring
HORIZON_SCORES: Dict[str, float] = {
    "immediate": 100.0,
    "1-3 months": 90.0,
    "3-6 months": 75.0,
    "6-12 months": 55.0,
    "12+ months": 35.0,
}

DEFAULT_HORIZON_SCORE: float = 50.0


# ═══════════════════════════════════════════════════════════════════════════════
# SCORING SERVICE
# ═══════════════════════════════════════════════════════════════════════════════


class ScoringService:
    """
    Stateless scoring engine for prospection and matching.

    Score formulas per spec-v1:
      high_ticket_score: 40% price, 25% location, 20% liquidity, 15% quality
      match_score: 35% budget, 25% zone, 20% type, 10% horizon, 10% motivation
    """

    # ─────────────────────────────────────────────────────────────────────
    # HIGH TICKET SCORE
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    def compute_high_ticket_score(
        price: Optional[float],
        zone: Optional[str],
        property_type: Optional[str],
        area_m2: Optional[float] = None,
        bedrooms: Optional[int] = None,
    ) -> ScoreResult:
        """
        Compute high_ticket_score for a prospected property.

        Weights (spec v1):
          40% — price & price/m² in target microzone
          25% — location quality (zone premium tier)
          20% — estimated liquidity
          15% — asset quality (type, state, uniqueness)

        Returns ScoreResult with score in [0, 100] and breakdown.
        """
        # Factor 1: Price score (40%)
        price_score: float = ScoringService._score_price(price, area_m2)

        # Factor 2: Location score (25%)
        location_score: float = ScoringService._score_location(zone)

        # Factor 3: Liquidity score (20%)
        liquidity_score: float = ScoringService._score_liquidity(price)

        # Factor 4: Asset quality score (15%)
        quality_score: float = ScoringService._score_quality(
            property_type, bedrooms
        )

        # Weighted total
        weighted_price: float = price_score * 0.40
        weighted_location: float = location_score * 0.25
        weighted_liquidity: float = liquidity_score * 0.20
        weighted_quality: float = quality_score * 0.15

        total: float = min(
            100.0,
            max(
                0.0,
                weighted_price + weighted_location + weighted_liquidity + weighted_quality,
            ),
        )

        breakdown: Dict[str, float] = {
            "price": round(weighted_price, 2),
            "location": round(weighted_location, 2),
            "liquidity": round(weighted_liquidity, 2),
            "quality": round(weighted_quality, 2),
        }

        return ScoreResult(score=round(total, 2), breakdown=breakdown)

    # ─────────────────────────────────────────────────────────────────────
    # MATCH SCORE
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    def compute_match_score(
        property_data: Dict[str, Any],
        buyer_data: Dict[str, Any],
    ) -> ScoreResult:
        """
        Compute match_score for a property-buyer pair.

        Weights (spec v1):
          35% — budget fit
          25% — zone overlap
          20% — type/features fit
          10% — purchase horizon
          10% — motivation/response probability

        Returns ScoreResult with score in [0, 100] and breakdown.
        """
        # Factor 1: Budget fit (35%)
        budget_score: float = ScoringService._score_budget_fit(
            property_price=property_data.get("price"),
            budget_min=buyer_data.get("budget_min"),
            budget_max=buyer_data.get("budget_max"),
        )

        # Factor 2: Zone overlap (25%)
        zone_score: float = ScoringService._score_zone_overlap(
            property_zone=property_data.get("zone"),
            preferred_zones=buyer_data.get("preferred_zones", []),
        )

        # Factor 3: Type & features fit (20%)
        type_score: float = ScoringService._score_type_fit(
            property_type=property_data.get("property_type"),
            preferred_types=buyer_data.get("preferred_types", []),
            required_features=buyer_data.get("required_features", {}),
        )

        # Factor 4: Horizon (10%)
        horizon_score: float = ScoringService._score_horizon(
            purchase_horizon=buyer_data.get("purchase_horizon"),
        )

        # Factor 5: Motivation (10%)
        motivation: float = float(buyer_data.get("motivation_score") or 50.0)
        motivation_score: float = min(100.0, max(0.0, motivation))

        # Weighted total
        weighted_budget: float = budget_score * 0.35
        weighted_zone: float = zone_score * 0.25
        weighted_type: float = type_score * 0.20
        weighted_horizon: float = horizon_score * 0.10
        weighted_motivation: float = motivation_score * 0.10

        total: float = min(
            100.0,
            max(
                0.0,
                weighted_budget
                + weighted_zone
                + weighted_type
                + weighted_horizon
                + weighted_motivation,
            ),
        )

        breakdown: Dict[str, float] = {
            "budget": round(weighted_budget, 2),
            "zone": round(weighted_zone, 2),
            "type": round(weighted_type, 2),
            "horizon": round(weighted_horizon, 2),
            "motivation": round(weighted_motivation, 2),
        }

        return ScoreResult(score=round(total, 2), breakdown=breakdown)

    # ─────────────────────────────────────────────────────────────────────
    # INTERNAL SCORING FUNCTIONS
    # ─────────────────────────────────────────────────────────────────────

    @staticmethod
    def _score_price(
        price: Optional[float], area_m2: Optional[float]
    ) -> float:
        """Score based on price tier and price/m² ratio."""
        if price is None or price <= 0:
            return 0.0

        # Base score from price tier
        if price >= 3_000_000:
            base: float = 95.0
        elif price >= 2_000_000:
            base = 85.0
        elif price >= 1_000_000:
            base = 70.0
        elif price >= 500_000:
            base = 50.0
        else:
            base = 30.0

        # Bonus for good price/m² (if area available)
        if area_m2 and area_m2 > 0:
            price_per_m2: float = price / float(area_m2)
            if price_per_m2 >= 8_000:
                base = min(100.0, base + 5)
            elif price_per_m2 >= 5_000:
                base = min(100.0, base + 3)

        return min(100.0, base)

    @staticmethod
    def _score_location(zone: Optional[str]) -> float:
        """Score based on zone premium tier."""
        if not zone:
            return DEFAULT_ZONE_SCORE
        return ZONE_PREMIUM_SCORES.get(zone, DEFAULT_ZONE_SCORE)

    @staticmethod
    def _score_liquidity(price: Optional[float]) -> float:
        """Estimate liquidity based on price bracket."""
        if price is None or price <= 0:
            return 0.0

        for i, (low, high) in enumerate(LIQUIDITY_BRACKETS):
            if low <= price < high:
                return LIQUIDITY_SCORES[i]
        return LIQUIDITY_SCORES[-1]

    @staticmethod
    def _score_quality(
        property_type: Optional[str], bedrooms: Optional[int] = None
    ) -> float:
        """Score based on property type and characteristics."""
        base: float = PROPERTY_TYPE_QUALITY.get(
            (property_type or "").lower(), DEFAULT_TYPE_QUALITY
        )
        # Bonus for larger properties
        if bedrooms and bedrooms >= 5:
            base = min(100.0, base + 10)
        elif bedrooms and bedrooms >= 4:
            base = min(100.0, base + 5)
        return base

    @staticmethod
    def _score_budget_fit(
        property_price: Optional[float],
        budget_min: Optional[float],
        budget_max: Optional[float],
    ) -> float:
        """Score how well the property price fits the buyer budget."""
        if property_price is None:
            return 50.0  # Neutral if unknown

        p: float = float(property_price)
        b_min: float = float(budget_min or 0)
        b_max: float = float(budget_max or float("inf"))

        # Perfect fit: price within budget range
        if b_min <= p <= b_max:
            # Higher score if closer to budget center
            if b_max > b_min:
                center: float = (b_min + b_max) / 2
                distance_ratio: float = abs(p - center) / ((b_max - b_min) / 2)
                return max(70.0, 100.0 - (distance_ratio * 30))
            return 90.0

        # Slightly over budget (within 10%)
        if b_max > 0 and p <= b_max * 1.1:
            return 55.0

        # Slightly under budget (within 20% below min)
        if b_min > 0 and p >= b_min * 0.8:
            return 50.0

        # Way outside budget
        return 20.0

    @staticmethod
    def _score_zone_overlap(
        property_zone: Optional[str],
        preferred_zones: List[str],
    ) -> float:
        """Score based on zone matching."""
        if not property_zone or not preferred_zones:
            return 50.0  # Neutral

        if property_zone in preferred_zones:
            return 100.0

        # Partial match: check if any preferred zone is nearby
        # For now, simple binary — future version can use geo distance
        return 20.0

    @staticmethod
    def _score_type_fit(
        property_type: Optional[str],
        preferred_types: List[str],
        required_features: Optional[Dict[str, Any]] = None,
    ) -> float:
        """Score based on property type and features overlap."""
        score: float = 50.0  # Neutral default

        if property_type and preferred_types:
            if property_type.lower() in [t.lower() for t in preferred_types]:
                score = 90.0
            else:
                score = 30.0
        elif not preferred_types:
            score = 70.0  # No preference = flexible buyer

        # Feature matching would require property features data
        # For v1, we keep it simple
        return score

    @staticmethod
    def _score_horizon(purchase_horizon: Optional[str]) -> float:
        """Score based on purchase timeline urgency."""
        if not purchase_horizon:
            return DEFAULT_HORIZON_SCORE
        return HORIZON_SCORES.get(purchase_horizon, DEFAULT_HORIZON_SCORE)


# Module-level singleton
scoring_service = ScoringService()
