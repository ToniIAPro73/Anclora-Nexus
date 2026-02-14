"""
Unit tests for ScoringService — Prospection & Buyer Matching v1.
Feature: ANCLORA-PBM-001

Tests:
  - high_ticket_score always in [0, 100]
  - match_score always in [0, 100]
  - Breakdown has expected keys
  - Edge cases: None inputs, extreme values
  - Weight distribution matches spec v1
"""

import pytest

from backend.services.scoring_service import (
    DEFAULT_HORIZON_SCORE,
    DEFAULT_TYPE_QUALITY,
    DEFAULT_ZONE_SCORE,
    HORIZON_SCORES,
    LIQUIDITY_SCORES,
    PROPERTY_TYPE_QUALITY,
    ZONE_PREMIUM_SCORES,
    ScoringService,
)


# ═══════════════════════════════════════════════════════════════════════════════
# HIGH TICKET SCORE
# ═══════════════════════════════════════════════════════════════════════════════


class TestHighTicketScore:
    """Tests for high_ticket_score computation."""

    def test_score_within_bounds_typical_villa(self) -> None:
        """TC-PP-3: Score within [0, 100] for typical premium villa."""
        result = ScoringService.compute_high_ticket_score(
            price=3_250_000.0,
            zone="Port d'Andratx",
            property_type="villa",
            area_m2=420.0,
            bedrooms=5,
        )
        assert 0 <= result.score <= 100
        assert isinstance(result.breakdown, dict)

    def test_score_within_bounds_all_none(self) -> None:
        """Score is valid even with all None inputs."""
        result = ScoringService.compute_high_ticket_score(
            price=None, zone=None, property_type=None
        )
        assert 0 <= result.score <= 100

    def test_score_within_bounds_zero_price(self) -> None:
        """Score handles zero/negative price gracefully."""
        result = ScoringService.compute_high_ticket_score(
            price=0.0, zone="Andratx", property_type="apartment"
        )
        assert 0 <= result.score <= 100

    def test_score_within_bounds_negative_price(self) -> None:
        """Score handles negative price gracefully."""
        result = ScoringService.compute_high_ticket_score(
            price=-100.0, zone="Andratx", property_type="villa"
        )
        assert 0 <= result.score <= 100

    def test_score_within_bounds_extreme_price(self) -> None:
        """Score handles extreme high price without exceeding 100."""
        result = ScoringService.compute_high_ticket_score(
            price=50_000_000.0,
            zone="Port d'Andratx",
            property_type="villa",
            area_m2=2000.0,
            bedrooms=10,
        )
        assert result.score <= 100

    def test_breakdown_has_correct_keys(self) -> None:
        """Breakdown always contains four spec-defined factors."""
        result = ScoringService.compute_high_ticket_score(
            price=1_500_000.0,
            zone="Son Ferrer",
            property_type="apartment",
            area_m2=150.0,
        )
        expected_keys = {"price", "location", "liquidity", "quality"}
        assert set(result.breakdown.keys()) == expected_keys

    def test_breakdown_values_are_non_negative(self) -> None:
        """All breakdown values should be >= 0."""
        result = ScoringService.compute_high_ticket_score(
            price=2_000_000.0,
            zone="Es Capdellà",
            property_type="finca",
            area_m2=800.0,
            bedrooms=6,
        )
        for key, value in result.breakdown.items():
            assert value >= 0, f"Breakdown '{key}' is negative: {value}"

    def test_breakdown_sum_equals_score(self) -> None:
        """Sum of breakdown factors should equal total score (within rounding)."""
        result = ScoringService.compute_high_ticket_score(
            price=1_850_000.0,
            zone="Port d'Andratx",
            property_type="apartment",
            area_m2=185.0,
            bedrooms=3,
        )
        breakdown_sum = sum(result.breakdown.values())
        assert abs(breakdown_sum - result.score) < 0.1, (
            f"Breakdown sum {breakdown_sum} != score {result.score}"
        )

    def test_higher_price_zone_gives_higher_score(self) -> None:
        """Premium villa in top zone scores higher than budget apt in low zone."""
        premium = ScoringService.compute_high_ticket_score(
            price=4_000_000.0,
            zone="Port d'Andratx",
            property_type="villa",
            area_m2=500.0,
            bedrooms=6,
        )
        budget = ScoringService.compute_high_ticket_score(
            price=300_000.0,
            zone="Magaluf",
            property_type="apartment",
            area_m2=60.0,
            bedrooms=1,
        )
        assert premium.score > budget.score

    def test_rescore_changes_on_price_update(self) -> None:
        """TC-PP-4: Score changes when price is updated."""
        original = ScoringService.compute_high_ticket_score(
            price=1_000_000.0,
            zone="Santa Ponsa",
            property_type="apartment",
        )
        updated = ScoringService.compute_high_ticket_score(
            price=3_000_000.0,
            zone="Santa Ponsa",
            property_type="apartment",
        )
        assert updated.score != original.score

    def test_rescore_changes_on_zone_update(self) -> None:
        """TC-PP-4: Score changes when zone changes."""
        low_zone = ScoringService.compute_high_ticket_score(
            price=2_000_000.0,
            zone="Magaluf",
            property_type="villa",
        )
        high_zone = ScoringService.compute_high_ticket_score(
            price=2_000_000.0,
            zone="Port d'Andratx",
            property_type="villa",
        )
        assert high_zone.score > low_zone.score

    def test_unknown_zone_gets_default_score(self) -> None:
        """Unknown zones use DEFAULT_ZONE_SCORE not crash."""
        result = ScoringService.compute_high_ticket_score(
            price=1_500_000.0,
            zone="NonexistentZone",
            property_type="villa",
        )
        assert 0 <= result.score <= 100
        # Location component = DEFAULT_ZONE_SCORE * 0.25
        expected_location = round(DEFAULT_ZONE_SCORE * 0.25, 2)
        assert result.breakdown["location"] == expected_location

    def test_unknown_property_type_gets_default(self) -> None:
        """Unknown property type uses DEFAULT_TYPE_QUALITY."""
        result = ScoringService.compute_high_ticket_score(
            price=1_500_000.0,
            zone="Andratx",
            property_type="castle",
        )
        assert 0 <= result.score <= 100

    @pytest.mark.parametrize(
        "zone,expected_tier",
        [
            ("Port d'Andratx", "S"),
            ("Son Ferrer", "B"),
            ("Magaluf", "C"),
        ],
    )
    def test_zone_tier_ranking(self, zone: str, expected_tier: str) -> None:
        """Zone premium scores follow tiered ranking."""
        score = ZONE_PREMIUM_SCORES[zone]
        if expected_tier == "S":
            assert score >= 90
        elif expected_tier == "B":
            assert 60 <= score < 80
        elif expected_tier == "C":
            assert score < 60


# ═══════════════════════════════════════════════════════════════════════════════
# MATCH SCORE
# ═══════════════════════════════════════════════════════════════════════════════


class TestMatchScore:
    """Tests for match_score computation."""

    @pytest.fixture()
    def property_villa(self) -> dict:
        return {
            "price": 3_250_000.0,
            "zone": "Port d'Andratx",
            "property_type": "villa",
            "status": "new",
        }

    @pytest.fixture()
    def buyer_premium(self) -> dict:
        return {
            "budget_min": 2_000_000.0,
            "budget_max": 4_000_000.0,
            "preferred_zones": ["Port d'Andratx", "Es Capdellà"],
            "preferred_types": ["villa", "finca"],
            "purchase_horizon": "3-6 months",
            "motivation_score": 88.0,
        }

    @pytest.fixture()
    def buyer_budget(self) -> dict:
        return {
            "budget_min": 200_000.0,
            "budget_max": 400_000.0,
            "preferred_zones": ["Magaluf"],
            "preferred_types": ["apartment"],
            "purchase_horizon": "12+ months",
            "motivation_score": 30.0,
        }

    def test_match_score_within_bounds(
        self, property_villa: dict, buyer_premium: dict
    ) -> None:
        """TC-ME-1: match_score always in [0, 100]."""
        result = ScoringService.compute_match_score(property_villa, buyer_premium)
        assert 0 <= result.score <= 100

    def test_match_score_breakdown_keys(
        self, property_villa: dict, buyer_premium: dict
    ) -> None:
        """TC-ME-4: Breakdown includes all 5 spec factors."""
        result = ScoringService.compute_match_score(property_villa, buyer_premium)
        expected_keys = {"budget", "zone", "type", "horizon", "motivation"}
        assert set(result.breakdown.keys()) == expected_keys

    def test_match_breakdown_sum_equals_score(
        self, property_villa: dict, buyer_premium: dict
    ) -> None:
        """Breakdown sum matches total score."""
        result = ScoringService.compute_match_score(property_villa, buyer_premium)
        breakdown_sum = sum(result.breakdown.values())
        assert abs(breakdown_sum - result.score) < 0.1

    def test_strong_match_scores_high(
        self, property_villa: dict, buyer_premium: dict
    ) -> None:
        """Well-matched pair should score >= 60."""
        result = ScoringService.compute_match_score(property_villa, buyer_premium)
        assert result.score >= 60

    def test_weak_match_scores_lower(
        self, property_villa: dict, buyer_budget: dict
    ) -> None:
        """Mismatched pair should score lower than strong match."""
        strong = ScoringService.compute_match_score(
            property_villa,
            {
                "budget_min": 2_000_000.0,
                "budget_max": 4_000_000.0,
                "preferred_zones": ["Port d'Andratx"],
                "preferred_types": ["villa"],
                "purchase_horizon": "3-6 months",
                "motivation_score": 88.0,
            },
        )
        weak = ScoringService.compute_match_score(property_villa, buyer_budget)
        assert strong.score > weak.score

    def test_match_score_with_none_price(self, buyer_premium: dict) -> None:
        """Match score handles property with no price."""
        prop = {"price": None, "zone": "Andratx", "property_type": "villa"}
        result = ScoringService.compute_match_score(prop, buyer_premium)
        assert 0 <= result.score <= 100

    def test_match_score_with_empty_buyer(self, property_villa: dict) -> None:
        """Match score handles buyer with minimal data."""
        buyer: dict = {}
        result = ScoringService.compute_match_score(property_villa, buyer)
        assert 0 <= result.score <= 100

    @pytest.mark.parametrize(
        "horizon,expected_score",
        list(HORIZON_SCORES.items()),
    )
    def test_horizon_scoring(self, horizon: str, expected_score: float) -> None:
        """Each horizon value maps to its defined score."""
        score = ScoringService._score_horizon(horizon)
        assert score == expected_score

    def test_unknown_horizon_gets_default(self) -> None:
        """Unknown horizon uses DEFAULT_HORIZON_SCORE."""
        score = ScoringService._score_horizon("unknown_timeline")
        assert score == DEFAULT_HORIZON_SCORE

    def test_budget_perfect_fit(self) -> None:
        """Budget that perfectly centers on price scores high."""
        score = ScoringService._score_budget_fit(1_500_000, 1_000_000, 2_000_000)
        assert score >= 90

    def test_budget_outside_range(self) -> None:
        """Budget way outside range scores low."""
        score = ScoringService._score_budget_fit(5_000_000, 200_000, 400_000)
        assert score <= 55  # Slightly over returns 55, way over returns 20

    def test_zone_exact_match(self) -> None:
        """Exact zone match scores 100."""
        score = ScoringService._score_zone_overlap(
            "Port d'Andratx", ["Port d'Andratx", "Es Capdellà"]
        )
        assert score == 100.0

    def test_zone_no_match(self) -> None:
        """No zone overlap scores low."""
        score = ScoringService._score_zone_overlap(
            "Magaluf", ["Port d'Andratx", "Es Capdellà"]
        )
        assert score <= 30

    def test_type_exact_match(self) -> None:
        """Exact type match scores high."""
        score = ScoringService._score_type_fit("villa", ["villa", "finca"])
        assert score >= 80

    def test_type_no_match(self) -> None:
        """No type match scores low."""
        score = ScoringService._score_type_fit("apartment", ["villa", "finca"])
        assert score <= 40


# ═══════════════════════════════════════════════════════════════════════════════
# SCORE RANGE BOUNDARY TESTS
# ═══════════════════════════════════════════════════════════════════════════════


class TestScoreBounds:
    """Fuzz-style tests ensuring scores never escape [0, 100]."""

    PRICE_SAMPLES = [None, 0, -1, 100_000, 500_000, 1_000_000, 5_000_000, 100_000_000]
    ZONE_SAMPLES = [None, "", "Port d'Andratx", "Magaluf", "NonexistentZone"]
    TYPE_SAMPLES = [None, "", "villa", "apartment", "castle", "yacht"]

    @pytest.mark.parametrize("price", PRICE_SAMPLES)
    @pytest.mark.parametrize("zone", ZONE_SAMPLES)
    @pytest.mark.parametrize("ptype", TYPE_SAMPLES)
    def test_high_ticket_score_always_bounded(
        self, price: float, zone: str, ptype: str
    ) -> None:
        result = ScoringService.compute_high_ticket_score(
            price=price, zone=zone, property_type=ptype
        )
        assert (
            0 <= result.score <= 100
        ), f"OOB score {result.score} for price={price}, zone={zone}, type={ptype}"

    @pytest.mark.parametrize("price", PRICE_SAMPLES)
    def test_match_score_always_bounded(self, price: float) -> None:
        prop = {"price": price, "zone": "Andratx", "property_type": "villa"}
        buyer = {
            "budget_min": 1_000_000,
            "budget_max": 3_000_000,
            "preferred_zones": ["Andratx"],
            "preferred_types": ["villa"],
            "purchase_horizon": "3-6 months",
            "motivation_score": 50,
        }
        result = ScoringService.compute_match_score(prop, buyer)
        assert 0 <= result.score <= 100
