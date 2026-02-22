from backend.services.origin_editability_policy import build_policy, sanitize_payload


def test_lead_policy_non_manual_locks_capture_fields():
    policy = build_policy("lead", "cta_web")
    assert "name" in policy["locked_fields"]
    assert "email" in policy["locked_fields"]
    assert "priority" in policy["editable_fields"]


def test_property_policy_pbm_locks_trace_and_scoring():
    policy = build_policy("property", "pbm")
    assert "source_system" in policy["locked_fields"]
    assert "source_portal" in policy["locked_fields"]
    assert "high_ticket_score" in policy["locked_fields"]
    assert "match_score" in policy["locked_fields"]


def test_sanitize_payload_removes_locked_fields():
    payload = {"name": "Lead X", "email": "x@test.com", "priority": 2, "status": "new"}
    sanitized = sanitize_payload(payload, "lead", "social")
    assert "name" not in sanitized
    assert "email" not in sanitized
    assert sanitized["priority"] == 2
    assert sanitized["status"] == "new"
