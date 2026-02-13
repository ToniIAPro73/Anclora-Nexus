import pytest
import json
from datetime import datetime, timezone
from backend.intelligence.components.governor import Governor, create_governor
from backend.intelligence.intelligence_types import (
    QueryPlan, QueryMode, DomainKey, Confidence, Recommendation, RiskLevel,
    RiskProfile, RiskItem
)

@pytest.fixture
def governor():
    return create_governor()

def test_governor_initialization(governor):
    """Test that governor initializes with correct values."""
    assert governor.strategic_mode_version == "1.0-validation-phase"
    assert "Consolidate Base" in governor.principle
    assert len(governor.priorities) == 4
    assert len(governor.hard_constraints) == 5

# --- Happy Paths (TC-GOV-01, 15) ---

def test_evaluate_happy_path(governor, sample_query_plan):
    """TC-GOV-15: Full happy path check."""
    decision, error = governor.evaluate(sample_query_plan)
    
    assert error is None
    assert decision is not None
    assert decision.recommendation == Recommendation.EXECUTE
    assert len(decision.next_steps) == 3
    assert 2 <= len(decision.dont_do) <= 5
    assert decision.confidence == Confidence.HIGH

def test_evaluate_transition_domain(governor, sample_query_plan):
    """TC-GOV-03: Transition/Labor domain should increase risk."""
    sample_query_plan.domains_selected = [DomainKey.TRANSITION.value]
    decision, error = governor.evaluate(sample_query_plan)
    
    assert decision.risks.labor.level == RiskLevel.HIGH
    # Should recommend postpone due to high risk + transition
    assert decision.recommendation == Recommendation.POSTPONE

def test_evaluate_tax_domain(governor, sample_query_plan):
    """TC-GOV-02: Tax domain logic."""
    sample_query_plan.domains_selected = [DomainKey.TAX.value]
    decision, error = governor.evaluate(sample_query_plan)
    
    assert decision.risks.tax.level == RiskLevel.HIGH
    assert "fiscal" in decision.diagnosis.lower()

# --- Input Validation & Edge Cases (TC-GOV-04, 05, 06, 07) ---

def test_evaluate_empty_domains(governor, sample_query_plan):
    """Test handling of empty domains."""
    sample_query_plan.domains_selected = []
    decision, error = governor.evaluate(sample_query_plan)
    
    assert error is None
    assert decision.recommendation == Recommendation.EXECUTE
    assert decision.domains_used == ["unknown"]

def test_evaluate_low_confidence(governor, sample_query_plan):
    """Test response when plan confidence is low."""
    sample_query_plan.confidence = Confidence.LOW
    decision, error = governor.evaluate(sample_query_plan)
    
    assert decision.recommendation == Recommendation.POSTPONE

# --- Hard Constraints (TC-GOV-12) ---

def test_hard_constraint_hc_005(governor, sample_query_plan):
    """TC-GOV-04: Transition domain triggers hc_005 (no emotional labor)."""
    sample_query_plan.domains_selected = [DomainKey.TRANSITION.value]
    decision, error = governor.evaluate(sample_query_plan)
    
    assert "hitl_required=true" in decision.flags

def test_hard_constraint_hc_003(governor, sample_query_plan):
    """Test Lab flag triggers hc_003."""
    sample_query_plan.flags = ["lab"]
    decision, error = governor.evaluate(sample_query_plan)
    
    assert "hitl_required=true" in decision.flags

# --- Internal Method Testing ---

def test_evaluate_principle_alignment(governor, sample_query_plan):
    """Test internal principle alignment logic."""
    # MARKET is aligned
    assert governor._evaluate_principle_alignment(sample_query_plan) is True
    
    # TRANSITION + FAST is NOT aligned (needs DEEP validation)
    sample_query_plan.domains_selected = [DomainKey.TRANSITION.value]
    sample_query_plan.mode = QueryMode.FAST
    assert governor._evaluate_principle_alignment(sample_query_plan) is False
    
    # TRANSITION + DEEP is aligned
    sample_query_plan.mode = QueryMode.DEEP
    assert governor._evaluate_principle_alignment(sample_query_plan) is True

def test_assess_risks_growth(governor, sample_query_plan):
    """Test risk assessment for growth domain."""
    risks = governor._assess_risks(sample_query_plan, DomainKey.GROWTH.value)
    assert risks.focus.level == RiskLevel.HIGH
    assert risks.labor.level == RiskLevel.MEDIUM

def test_generate_dont_do_limits(governor, sample_query_plan):
    """Verify dont_do is between 2 and 5."""
    sample_query_plan.domains_selected = [DomainKey.MARKET.value]
    dont_do = governor._generate_dont_do(DomainKey.MARKET.value, sample_query_plan, governor._assess_risks(sample_query_plan, "market"))
    assert 2 <= len(dont_do) <= 5

# --- Error Handling Scenarios (TC-GOV-08, 09, 10) ---

def test_evaluate_exception(governor, sample_query_plan):
    """Test governor handles internal exceptions gracefully."""
    # Force an exception by passing None
    decision, error = governor.evaluate(None)
    assert decision is None
    assert "Governor error" in error

# --- Strategic Logic Refined (TC-GOV-11, 13, 14) ---

def test_recommendation_reframe(governor, sample_query_plan):
    """Verify REFRAME recommendation on non-aligned principle."""
    sample_query_plan.domains_selected = [DomainKey.TRANSITION.value]
    sample_query_plan.mode = QueryMode.FAST
    # Principle not aligned -> should be REFRAME if no high risk labor/tax violations
    # Wait, _determine_recommendation logic:
    # 1. High risk labor/tax + violations -> POSTPONE
    # 2. Not aligns_with_principle -> REFRAME
    
    # In this case: Transition -> Risk Labor High. Violation hc_005 exists.
    # So it should be POSTPONE.
    decision, error = governor.evaluate(sample_query_plan)
    assert decision.recommendation == Recommendation.POSTPONE

def test_recommendation_reframe_only(governor, sample_query_plan):
    """Test REFRAME when only principle alignment fails."""
    # Tax domain with deep mode (aligned) vs fast (not aligned)
    # But tax domain also sets High risk tax.
    # Fixed case: suppose a domain that isn't high risk but we force alignment fail.
    # Governor code says: only TAX and TRANSITION trigger alignment fail if FAST.
    # Let's mock _assess_risks to return LOW risks for everything.
    
    governor._assess_risks = lambda q, d: RiskProfile(
        labor=RiskItem(level=RiskLevel.LOW, rationale=""),
        tax=RiskItem(level=RiskLevel.LOW, rationale=""),
        brand=RiskItem(level=RiskLevel.LOW, rationale=""),
        focus=RiskItem(level=RiskLevel.LOW, rationale="")
    )
    governor._check_hard_constraints = lambda q: []
    
    sample_query_plan.domains_selected = [DomainKey.TRANSITION.value]
    sample_query_plan.mode = QueryMode.FAST
    # Align fail -> REFRAME
    decision, error = governor.evaluate(sample_query_plan)
    assert decision.recommendation == Recommendation.REFRAME

# --- Extra Tests for Coverage (Total > 20) ---

def test_generate_diagnosis_market(governor):
    risks = RiskProfile(
        labor=RiskItem(level=RiskLevel.LOW, rationale=""),
        tax=RiskItem(level=RiskLevel.LOW, rationale=""),
        brand=RiskItem(level=RiskLevel.LOW, rationale=""),
        focus=RiskItem(level=RiskLevel.LOW, rationale="")
    )
    diagnosis = governor._generate_diagnosis(DomainKey.MARKET.value, Recommendation.EXECUTE, risks)
    assert "dominio market" in diagnosis.lower()

def test_calculate_decision_confidence_violations(governor, sample_query_plan):
    risks = governor._assess_risks(sample_query_plan, "market")
    conf = governor._calculate_decision_confidence(Confidence.HIGH, 1, risks)
    assert conf == Confidence.MEDIUM

def test_generate_next_steps_tax(governor):
    steps = governor._generate_next_steps(DomainKey.TAX.value, Recommendation.EXECUTE)
    assert "asesor fiscal" in steps[0].lower()

def test_generate_next_steps_brand(governor):
    steps = governor._generate_next_steps(DomainKey.BRAND.value, Recommendation.EXECUTE)
    assert "diferenciador" in steps[0].lower()

def test_generate_flags_multiple(governor, sample_query_plan):
    risks = RiskProfile(
        labor=RiskItem(level=RiskLevel.HIGH, rationale=""),
        tax=RiskItem(level=RiskLevel.HIGH, rationale=""),
        brand=RiskItem(level=RiskLevel.LOW, rationale=""),
        focus=RiskItem(level=RiskLevel.HIGH, rationale="")
    )
    flags = governor._generate_flags(["v1"], risks, sample_query_plan)
    assert "hitl_required=true" in flags
    assert "labor-risk=HIGH" in flags
    assert "tax-risk=HIGH" in flags
    assert "focus-risk=HIGH" in flags

def test_check_hard_constraints_lab(governor, sample_query_plan):
    sample_query_plan.flags = ["LAB"]
    violations = governor._check_hard_constraints(sample_query_plan)
    assert "hc_003" in violations

def test_factory_function():
    gov = create_governor("v2")
    assert gov.strategic_mode_version == "v2"
