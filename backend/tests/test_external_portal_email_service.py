from backend.services.external_portal_email_service import (
    build_data_lab_review_email,
    build_partner_submission_confirmation,
)


def test_partner_submission_confirmation_includes_html_shell() -> None:
    payload = build_partner_submission_confirmation(full_name="Toni", language="es")
    assert payload["subject"]
    assert "Toni" in payload["body"]
    assert "<table" in payload["html"]
    assert "Synergi" in payload["html"]


def test_data_lab_review_email_includes_launch_url_in_html() -> None:
    payload = build_data_lab_review_email(
        full_name="Toni",
        language="en",
        approved=True,
        review_notes="Approved for strategic overview",
        launch_url="https://example.com/workspace?token=abc",
    )
    assert "https://example.com/workspace?token=abc" in payload["body"]
    assert "https://example.com/workspace?token=abc" in payload["html"]
    assert "Data Lab" in payload["html"]
