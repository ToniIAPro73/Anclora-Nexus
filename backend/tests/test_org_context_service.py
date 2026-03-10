import pytest

from backend.services.org_context_service import resolve_legacy_org_id


def test_resolve_legacy_org_id_prefers_explicit_request(monkeypatch) -> None:
    monkeypatch.setattr("backend.services.org_context_service.settings.LEGACY_SINGLE_TENANT_ORG_ID", "legacy-org")
    assert resolve_legacy_org_id("explicit-org", "unit-test") == "explicit-org"


def test_resolve_legacy_org_id_uses_configured_legacy_fallback(monkeypatch) -> None:
    monkeypatch.setattr("backend.services.org_context_service.settings.LEGACY_SINGLE_TENANT_ORG_ID", "legacy-org")
    assert resolve_legacy_org_id(None, "unit-test") == "legacy-org"


def test_resolve_legacy_org_id_raises_when_missing(monkeypatch) -> None:
    monkeypatch.setattr("backend.services.org_context_service.settings.LEGACY_SINGLE_TENANT_ORG_ID", None)
    with pytest.raises(ValueError, match="ORG_ID_REQUIRED:unit-test"):
        resolve_legacy_org_id(None, "unit-test")
