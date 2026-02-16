import pytest
from backend.services.dq_service import dq_service
from backend.models.dq import EntityType, IssueType, Severity

def test_normalize_phone():
    assert dq_service.normalize_phone("600123456") == "34600123456"
    assert dq_service.normalize_phone("+34 600 123 456") == "34600123456"
    assert dq_service.normalize_phone("971 123 456") == "34971123456"
    assert dq_service.normalize_phone(None) is None

def test_normalize_email():
    assert dq_service.normalize_email(" Test@Example.com ") == "test@example.com"
    assert dq_service.normalize_email(None) is None

def test_detect_quality_issues_lead():
    # Valid lead
    lead = {"name": "Toni", "email": "toni@anclora.com", "phone": "600000000"}
    issues = dq_service.detect_quality_issues(EntityType.LEAD, lead)
    assert len(issues) == 0

    # Missing both contact methods
    lead_bad = {"name": "Toni"}
    issues = dq_service.detect_quality_issues(EntityType.LEAD, lead_bad)
    assert any(i["issue_type"] == IssueType.MISSING_FIELD for i in issues)

    # Invalid email
    lead_invalid_email = {"name": "Toni", "email": "not-an-email"}
    issues = dq_service.detect_quality_issues(EntityType.LEAD, lead_invalid_email)
    assert any(i["issue_type"] == IssueType.INVALID_FORMAT and i["issue_payload"]["field"] == "email" for i in issues)

def test_detect_quality_issues_property():
    # Valid property
    prop = {"address": "Cala Vinyes", "price": 1000000, "built_area_m2": 200, "useful_area_m2": 150}
    issues = dq_service.detect_quality_issues(EntityType.PROPERTY, prop)
    assert len(issues) == 0

    # Inconsistent area
    prop_bad_area = {"address": "Cala Vinyes", "price": 1000000, "built_area_m2": 150, "useful_area_m2": 200}
    issues = dq_service.detect_quality_issues(EntityType.PROPERTY, prop_bad_area)
    assert any(i["severity"] == Severity.CRITICAL for i in issues)

    # Zero price
    prop_zero_price = {"address": "Cala Vinyes", "price": 0}
    issues = dq_service.detect_quality_issues(EntityType.PROPERTY, prop_zero_price)
    assert any(i["issue_type"] == IssueType.INCONSISTENT_VALUE and i["issue_payload"]["field"] == "price" for i in issues)

def test_calculate_similarity_score_lead():
    l1 = {"name": "Toni Nexus", "email": "toni@nexus.ai", "phone": "600111222"}
    l2 = {"name": "Toni N.", "email": "toni@nexus.ai", "phone": "600999888"}
    
    score, signals = dq_service.calculate_similarity_score(EntityType.LEAD, l1, l2)
    assert score >= 50
    assert signals["email_match"] is True

    l3 = {"name": "Toni Nexus", "email": "other@nexus.ai", "phone": "600111222"}
    score, signals = dq_service.calculate_similarity_score(EntityType.LEAD, l1, l3)
    assert score >= 35
    assert signals["phone_match"] is True

def test_calculate_similarity_score_property():
    p1 = {"address": "Calle Mayor 1", "catastro_ref": "12345ABC", "price": 500000, "surface_m2": 100}
    p2 = {"address": "Calle Mayor 1", "catastro_ref": "99999XYZ", "price": 505000, "surface_m2": 102}
    
    score, signals = dq_service.calculate_similarity_score(EntityType.PROPERTY, p1, p2)
    assert score >= 25 # Address match
    assert signals["address_match"] is True
    assert signals["price_proximity"] is True
    assert signals["surface_proximity"] is True

    p3 = {"address": "Calle Diferente", "catastro_ref": "12345ABC"}
    score, signals = dq_service.calculate_similarity_score(EntityType.PROPERTY, p1, p3)
    assert score >= 60
    assert signals["catastro_match"] is True
