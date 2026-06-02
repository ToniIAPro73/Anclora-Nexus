import pytest

from backend.services.access_request_email_service import (
    build_access_request_approved_email,
    build_access_request_rejected_email,
    build_syncxml_pilot_acceptance_email,
)


def record(product: str = "synergi", rejection_reason: str | None = None) -> dict:
    return {
        "id": "request-1",
        "product": product,
        "full_name": "Toni Test",
        "email": "toni@example.com",
        "rejection_reason": rejection_reason,
    }


def assert_non_empty_bodies(payload: dict) -> None:
    assert payload["text"].strip()
    assert payload["html"].strip()
    assert "<table" in payload["html"]


def assert_syncxml_premium_shell(payload: dict) -> None:
    assert "Anclora SyncXML" in payload["html"]
    assert "logo-anclora-syncxml-email.png" in payload["html"]
    assert "#070A12" in payload["html"]
    assert "#BFA46A" in payload["html"]


def test_approval_email_for_synergi_includes_product_recipient_subject_and_name() -> None:
    payload = build_access_request_approved_email(record("synergi"))

    assert payload["to"] == "toni@example.com"
    assert "Synergi" in payload["subject"]
    assert "Synergi" in payload["text"]
    assert "Toni Test" in payload["text"]
    assert_non_empty_bodies(payload)


def test_approval_email_for_data_lab_includes_product_recipient_subject_and_name() -> None:
    payload = build_access_request_approved_email(record("data_lab"))

    assert payload["to"] == "toni@example.com"
    assert "Data Lab" in payload["subject"]
    assert "Data Lab" in payload["text"]
    assert "Toni Test" in payload["text"]
    assert_non_empty_bodies(payload)


def test_rejection_email_includes_rejection_reason_when_present() -> None:
    payload = build_access_request_rejected_email(
        record("synergi", rejection_reason="Insufficient service coverage")
    )

    assert "Insufficient service coverage" in payload["text"]
    assert "Insufficient service coverage" in payload["html"]
    assert_non_empty_bodies(payload)


@pytest.mark.parametrize("reason", [None, "", "   "])
def test_rejection_email_handles_missing_or_empty_reason(reason) -> None:
    payload = build_access_request_rejected_email(record("data_lab", rejection_reason=reason))

    assert payload["to"] == "toni@example.com"
    assert "Data Lab" in payload["subject"]
    assert "Toni Test" in payload["text"]
    assert_non_empty_bodies(payload)


def test_syncxml_acceptance_email_uses_premium_shell_and_credentials() -> None:
    payload = build_syncxml_pilot_acceptance_email(
        record("syncxml"),
        {
            "email": "toni@example.com",
            "temporaryPassword": "tmp-password",
            "expiresAt": "2026-07-01T00:00:00Z",
        },
    )

    assert payload["to"] == "toni@example.com"
    assert "Acceso al piloto controlado" in payload["subject"]
    assert "tmp-password" in payload["text"]
    assert "tmp-password" in payload["html"]
    assert "Acceder al piloto" in payload["html"]
    assert_syncxml_premium_shell(payload)


def test_syncxml_rejection_email_uses_premium_shell() -> None:
    payload = build_access_request_rejected_email(
        record("syncxml", rejection_reason="Fuera del alcance actual del piloto")
    )

    assert "Solicitud revisada" in payload["subject"]
    assert "Fuera del alcance actual del piloto" in payload["html"]
    assert_syncxml_premium_shell(payload)
