"""
Unit tests for Prospection Pydantic models — validation & compliance.
Feature: ANCLORA-PBM-001

Tests:
  - Source validation (allowed vs. disallowed)
  - Budget range validation (min <= max)
  - Score field constraints
  - Enum correctness
  - Model serialization
"""

import pytest
from decimal import Decimal
from pydantic import ValidationError

from backend.models.prospection import (
    ALLOWED_SOURCES,
    ActivityCreate,
    ActivityType,
    BuyerCreate,
    BuyerStatus,
    BuyerUpdate,
    MatchStatus,
    MatchUpdate,
    PropertyCreate,
    PropertyStatus,
    PropertyUpdate,
    RecomputeRequest,
    ScoreBreakdown,
    ScoreResult,
)


# ═══════════════════════════════════════════════════════════════════════════════
# PROPERTY CREATE — SOURCE COMPLIANCE
# ═══════════════════════════════════════════════════════════════════════════════


class TestPropertyCreateSource:
    """TC-CS-1, TC-CS-2: Source validation for compliance."""

    @pytest.mark.parametrize("source", sorted(ALLOWED_SOURCES))
    def test_allowed_source_accepted(self, source: str) -> None:
        """TC-CS-1: All allowed sources are accepted."""
        prop = PropertyCreate(source=source)
        assert prop.source == source

    def test_allowed_source_case_insensitive(self) -> None:
        """Source validation normalizes to lowercase."""
        prop = PropertyCreate(source="Idealista")
        assert prop.source == "idealista"

    def test_allowed_source_with_whitespace(self) -> None:
        """Source validation strips whitespace."""
        prop = PropertyCreate(source="  fotocasa  ")
        assert prop.source == "fotocasa"

    def test_disallowed_source_rejected(self) -> None:
        """TC-CS-2: Unauthorized source raises validation error."""
        with pytest.raises(ValidationError, match="not authorized"):
            PropertyCreate(source="scraper_bot")

    def test_disallowed_source_empty_string(self) -> None:
        """Empty string is not a valid source."""
        with pytest.raises(ValidationError):
            PropertyCreate(source="")

    def test_disallowed_source_special_chars(self) -> None:
        """Source with special characters fails."""
        with pytest.raises(ValidationError, match="not authorized"):
            PropertyCreate(source="<script>alert('xss')</script>")


# ═══════════════════════════════════════════════════════════════════════════════
# PROPERTY CREATE — MINIMUM FIELDS
# ═══════════════════════════════════════════════════════════════════════════════


class TestPropertyCreateMinimal:
    """TC-PP-1: Create property with minimum required fields."""

    def test_minimal_property_creation(self) -> None:
        """Only source is required; all else optional."""
        prop = PropertyCreate(source="idealista")
        assert prop.source == "idealista"
        assert prop.status == PropertyStatus.NEW
        assert prop.price is None
        assert prop.zone is None

    def test_full_property_creation(self) -> None:
        """Full property with all fields."""
        prop = PropertyCreate(
            source="rightmove",
            source_url="https://rightmove.co.uk/123",
            title="Villa Mediterranean",
            zone="Port d'Andratx",
            city="Andratx",
            price=Decimal("3250000.00"),
            property_type="villa",
            bedrooms=5,
            bathrooms=4,
            area_m2=Decimal("420.00"),
        )
        assert prop.price == Decimal("3250000.00")
        assert prop.bedrooms == 5

    def test_negative_price_rejected(self) -> None:
        """Price cannot be negative."""
        with pytest.raises(ValidationError):
            PropertyCreate(source="idealista", price=Decimal("-100"))

    def test_negative_bedrooms_rejected(self) -> None:
        """Bedrooms cannot be negative."""
        with pytest.raises(ValidationError):
            PropertyCreate(source="idealista", bedrooms=-1)


# ═══════════════════════════════════════════════════════════════════════════════
# BUYER CREATE — BUDGET VALIDATION
# ═══════════════════════════════════════════════════════════════════════════════


class TestBuyerBudgetValidation:
    """TC-BP-1, TC-BP-2: Budget range validation."""

    def test_valid_budget_range(self) -> None:
        """TC-BP-1: budget_min <= budget_max accepted."""
        buyer = BuyerCreate(
            budget_min=Decimal("1000000"),
            budget_max=Decimal("3000000"),
        )
        assert buyer.budget_min < buyer.budget_max

    def test_equal_budget_accepted(self) -> None:
        """budget_min == budget_max is valid (exact target)."""
        buyer = BuyerCreate(
            budget_min=Decimal("2000000"),
            budget_max=Decimal("2000000"),
        )
        assert buyer.budget_min == buyer.budget_max

    def test_invalid_budget_min_gt_max(self) -> None:
        """TC-BP-2: budget_min > budget_max rejected."""
        with pytest.raises(ValidationError, match="budget_min"):
            BuyerCreate(
                budget_min=Decimal("5000000"),
                budget_max=Decimal("1000000"),
            )

    def test_single_budget_set(self) -> None:
        """Only one budget field set is acceptable."""
        buyer = BuyerCreate(budget_max=Decimal("2000000"))
        assert buyer.budget_min is None
        assert buyer.budget_max == Decimal("2000000")

    def test_no_budget_set(self) -> None:
        """No budget fields is valid."""
        buyer = BuyerCreate()
        assert buyer.budget_min is None
        assert buyer.budget_max is None


# ═══════════════════════════════════════════════════════════════════════════════
# BUYER CREATE — STATUS & PREFERENCES
# ═══════════════════════════════════════════════════════════════════════════════


class TestBuyerCreateFields:
    """TC-BP-3, TC-BP-4: Buyer fields and status transitions."""

    def test_default_status_active(self) -> None:
        """Default status is 'active'."""
        buyer = BuyerCreate()
        assert buyer.status == BuyerStatus.ACTIVE

    def test_set_inactive_status(self) -> None:
        """TC-BP-4: Can create buyer with custom status."""
        buyer = BuyerCreate(status=BuyerStatus.INACTIVE)
        assert buyer.status == BuyerStatus.INACTIVE

    def test_preferred_zones_list(self) -> None:
        """Preferred zones stored as list."""
        buyer = BuyerCreate(
            preferred_zones=["Port d'Andratx", "Es Capdellà"],
        )
        assert len(buyer.preferred_zones) == 2

    def test_motivation_score_range(self) -> None:
        """Motivation score must be 0-100."""
        buyer = BuyerCreate(motivation_score=Decimal("85"))
        assert buyer.motivation_score == Decimal("85")

    def test_motivation_score_too_high(self) -> None:
        """Motivation score > 100 rejected."""
        with pytest.raises(ValidationError):
            BuyerCreate(motivation_score=Decimal("150"))

    def test_motivation_score_negative(self) -> None:
        """Motivation score < 0 rejected."""
        with pytest.raises(ValidationError):
            BuyerCreate(motivation_score=Decimal("-5"))


# ═══════════════════════════════════════════════════════════════════════════════
# MATCH STATUS ENUM
# ═══════════════════════════════════════════════════════════════════════════════


class TestMatchStatusEnum:
    """TC-ME-7: Match status transitions."""

    def test_all_statuses_exist(self) -> None:
        """All expected statuses are defined."""
        expected = {
            "candidate", "contacted", "viewing",
            "negotiating", "offer", "closed", "discarded",
        }
        actual = {s.value for s in MatchStatus}
        assert expected == actual

    def test_match_update_with_status(self) -> None:
        """Can update match status."""
        update = MatchUpdate(match_status=MatchStatus.VIEWING)
        assert update.match_status == MatchStatus.VIEWING


# ═══════════════════════════════════════════════════════════════════════════════
# ACTIVITY CREATE
# ═══════════════════════════════════════════════════════════════════════════════


class TestActivityCreate:
    """TC-ME-6: Activity model validation."""

    def test_valid_activity(self) -> None:
        """Valid activity creation."""
        act = ActivityCreate(
            activity_type=ActivityType.CALL,
            outcome="interested",
            details={"duration_min": 15},
        )
        assert act.activity_type == ActivityType.CALL

    def test_all_activity_types(self) -> None:
        """All activity types are valid."""
        for t in ActivityType:
            act = ActivityCreate(activity_type=t)
            assert act.activity_type == t


# ═══════════════════════════════════════════════════════════════════════════════
# SCORE MODELS
# ═══════════════════════════════════════════════════════════════════════════════


class TestScoreModels:
    """Score model validation."""

    def test_score_result_bounds(self) -> None:
        """ScoreResult enforces [0, 100]."""
        result = ScoreResult(score=85.5, breakdown={"price": 40, "location": 45.5})
        assert result.score == 85.5

    def test_score_result_too_high(self) -> None:
        """ScoreResult > 100 rejected."""
        with pytest.raises(ValidationError):
            ScoreResult(score=101, breakdown={})

    def test_score_result_negative(self) -> None:
        """ScoreResult < 0 rejected."""
        with pytest.raises(ValidationError):
            ScoreResult(score=-1, breakdown={})

    def test_score_breakdown_weight_bounds(self) -> None:
        """ScoreBreakdown weight must be [0, 100]."""
        sb = ScoreBreakdown(
            factor="price", weight=40, raw_value=95, weighted_value=38
        )
        assert sb.weight == 40

    def test_score_breakdown_weight_too_high(self) -> None:
        """ScoreBreakdown weight > 100 rejected."""
        with pytest.raises(ValidationError):
            ScoreBreakdown(
                factor="price", weight=150, raw_value=95, weighted_value=38
            )
