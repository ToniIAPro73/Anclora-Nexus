import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

from backend.services.sellers_service import _build_workbench_console, build_supervised_send_payload


def test_build_workbench_console_requests_dossier_if_core_artifacts_missing() -> None:
    console = _build_workbench_console(
        seller={"estado_contacto": "sin_contacto"},
        latest_artifacts={
            "dossier": None,
            "email_draft": None,
            "whatsapp_draft": None,
            "call_brief": None,
            "context_brief": None,
        },
        interactions=[],
        memory_payload={"matches": []},
    )

    assert console["readiness"] == "needs_dossier"
    assert console["recommended_channel"] == "review"


def test_build_workbench_console_prefers_whatsapp_for_cold_seller_with_ready_channel() -> None:
    console = _build_workbench_console(
        seller={
            "estado_contacto": "sin_contacto",
            "whatsapp_contacto": "+34600111222",
        },
        latest_artifacts={
            "dossier": {"id": "d1"},
            "email_draft": {"id": "e1"},
            "whatsapp_draft": {"id": "w1"},
            "call_brief": {"id": "c1"},
            "context_brief": {"id": "cb1"},
        },
        interactions=[],
        memory_payload={
            "matches": [
                {
                    "matched_keywords": ["seguimiento", "exclusividad"],
                    "record": {"summary": "seguimiento exclusividad"},
                    "score": 88,
                }
            ]
        },
    )

    assert console["readiness"] == "ready_to_send"
    assert console["recommended_channel"] == "whatsapp"
    assert "seguimiento" in console["memory_focus_terms"]


def test_build_workbench_console_prefers_call_for_follow_up_states() -> None:
    console = _build_workbench_console(
        seller={"estado_contacto": "en_seguimiento"},
        latest_artifacts={
            "dossier": {"id": "d1"},
            "email_draft": {"id": "e1"},
            "whatsapp_draft": {"id": "w1"},
            "call_brief": {"id": "c1"},
            "context_brief": {"id": "cb1"},
        },
        interactions=[{"created_at": "2026-03-10T10:00:00+00:00"}],
        memory_payload={"matches": []},
    )

    assert console["recommended_channel"] == "call"
    assert console["last_touch_at"] == "2026-03-10T10:00:00+00:00"


def test_build_supervised_send_payload_uses_mailto_when_native_email_unavailable() -> None:
    db = MagicMock()
    with patch("backend.services.sellers_service.build_seller_dossier_export", new_callable=AsyncMock) as mock_export, \
         patch("backend.services.sellers_service.add_interaction", new_callable=AsyncMock) as mock_add, \
         patch("backend.services.sellers_service.get_email_transport_summary", return_value={"native_email_enabled": False}):
        mock_export.return_value = {
            "seller": {"id": "seller-1", "email_contacto": "owner@example.com", "estado_contacto": "sin_contacto"},
            "sections": {"email_subject": "Subject", "email_body": "Body"},
        }
        mock_add.return_value = {"id": "interaction-1"}

        payload = asyncio.run(
            build_supervised_send_payload(
                db=db,
                org_id="org-1",
                seller_id="seller-1",
                channel="email",
                transport="auto",
            )
        )

    assert payload["status"] == "ready_for_human_send"
    assert payload["transport"] == "mailto"
    assert payload["launch_url"].startswith("mailto:")


def test_build_supervised_send_payload_sends_native_email_when_available() -> None:
    db = MagicMock()
    with patch("backend.services.sellers_service.build_seller_dossier_export", new_callable=AsyncMock) as mock_export, \
         patch("backend.services.sellers_service.add_interaction", new_callable=AsyncMock) as mock_add, \
         patch("backend.services.sellers_service.send_email_native") as mock_send_native, \
         patch("backend.services.sellers_service.get_email_transport_summary", return_value={"native_email_enabled": True}), \
         patch("backend.services.sellers_service.get_seller", new_callable=AsyncMock) as mock_get_seller, \
         patch("backend.services.sellers_service.update_seller_estado", new_callable=AsyncMock) as mock_update_estado:
        mock_export.return_value = {
            "seller": {"id": "seller-1", "email_contacto": "owner@example.com", "estado_contacto": "sin_contacto"},
            "sections": {"email_subject": "Subject", "email_body": "Body"},
        }
        mock_send_native.return_value = {"provider": "smtp", "message_id": "<msg@test>", "from_email": "ops@anclora.es"}
        mock_add.return_value = {"id": "interaction-1"}
        mock_get_seller.return_value = {"id": "seller-1", "estado_contacto": "sin_contacto"}

        payload = asyncio.run(
            build_supervised_send_payload(
                db=db,
                org_id="org-1",
                seller_id="seller-1",
                channel="email",
                transport="native_email",
            )
        )

    assert payload["status"] == "sent_natively"
    assert payload["transport"] == "native_email"
    assert payload["delivery"]["provider"] == "smtp"
    assert payload["launch_url"] is None
    mock_update_estado.assert_awaited_once()
