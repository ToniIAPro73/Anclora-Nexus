import os
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient

os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-key")
os.environ.setdefault("AI_RUNTIME_PROFILE", "groq-cloudflare")
os.environ.setdefault("GROQ_API_KEY", "groq-test")
os.environ.setdefault("CLOUDFLARE_ACCOUNT_ID", "cf-account-test")
os.environ.setdefault("CLOUDFLARE_API_TOKEN", "cf-token-test")
os.environ.setdefault("INTERNAL_AUDIT_SECRET", "test-secret")

from backend.api.routes.sellers import router
from backend.api.deps import check_budget_hard_stop


async def mock_check_budget_hard_stop():
    class BudgetStatus:
        status = "ok"
    return BudgetStatus()


app = FastAPI()
app.include_router(router, prefix="/api/sellers")
app.dependency_overrides[check_budget_hard_stop] = mock_check_budget_hard_stop
client = TestClient(app)


class TestSellersRouteRegistration:
    def test_workbench_endpoint_exists(self) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [
            r for r in routes
            if hasattr(r, "path") and r.path == "/api/sellers/{seller_id}/workbench" and "GET" in r.methods
        ]
        assert len(matching) == 1

    def test_dossier_export_endpoint_exists(self) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [
            r for r in routes
            if hasattr(r, "path") and r.path == "/api/sellers/{seller_id}/dossier-export" and "GET" in r.methods
        ]
        assert len(matching) == 1

    def test_supervised_send_endpoint_exists(self) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [
            r for r in routes
            if hasattr(r, "path") and r.path == "/api/sellers/{seller_id}/send-supervised/{channel}" and "POST" in r.methods
        ]
        assert len(matching) == 1


class TestSellersRouteContracts:
    @patch("backend.api.routes.sellers.sellers_service")
    def test_workbench_returns_payload(self, mock_service: MagicMock) -> None:
        seller_id = str(uuid4())
        mock_service.get_seller_workbench = AsyncMock(return_value={
            "seller": {"id": seller_id, "nombre_propietario": "Toni", "prioridad": 5},
            "interactions": [],
            "latest_artifacts": {
                "dossier": None,
                "email_draft": None,
                "whatsapp_draft": None,
                "call_brief": None,
                "context_brief": None,
            },
            "snapshot": {
                "has_argumentario": False,
                "has_email_draft": False,
                "has_whatsapp_draft": False,
                "has_call_brief": False,
                "has_context_brief": False,
                "interactions_count": 0,
            },
        })

        response = client.get(f"/api/sellers/{seller_id}/workbench")

        assert response.status_code == 200
        body = response.json()
        assert body["seller"]["id"] == seller_id
        assert body["snapshot"]["interactions_count"] == 0

    @patch("backend.api.routes.sellers.run_whale_dossier", new_callable=AsyncMock)
    def test_generate_dossier_returns_multichannel_artifacts(self, mock_skill: AsyncMock) -> None:
        seller_id = str(uuid4())
        mock_skill.return_value = {
            "seller_id": seller_id,
            "argumentario": "Dossier text",
            "email_subject": "Subject",
            "email_body": "Email body",
            "whatsapp_body": "WhatsApp body",
            "call_brief": "Call brief body",
            "context_brief": "Context brief body",
            "zona_insight_used": True,
            "processed_at": "2026-03-09T00:00:00+00:00",
        }

        response = client.post(f"/api/sellers/{seller_id}/generate-dossier")

        assert response.status_code == 200
        body = response.json()
        assert body["whatsapp_body"] == "WhatsApp body"
        assert body["call_brief"] == "Call brief body"
        assert body["context_brief"] == "Context brief body"

    @patch("backend.api.routes.sellers.sellers_service")
    def test_dossier_export_returns_payload(self, mock_service: MagicMock) -> None:
        seller_id = str(uuid4())
        mock_service.build_seller_dossier_export = AsyncMock(return_value={
            "seller": {"id": seller_id, "nombre_propietario": "Toni"},
            "generated_at": "2026-03-09T00:00:00+00:00",
            "file_name": "dossier-toni.pdf",
            "sections": {
                "context_brief": "Context",
                "call_brief": "Call",
                "dossier": "Dossier",
                "email_subject": "Subject",
                "email_body": "Body",
                "whatsapp_body": "WhatsApp",
            },
            "share_summary": "share text",
        })

        response = client.get(f"/api/sellers/{seller_id}/dossier-export")

        assert response.status_code == 200
        body = response.json()
        assert body["file_name"] == "dossier-toni.pdf"
        assert body["sections"]["dossier"] == "Dossier"

    @patch("backend.api.routes.sellers.sellers_service")
    def test_supervised_send_returns_launch_payload(self, mock_service: MagicMock) -> None:
        seller_id = str(uuid4())
        mock_service.build_supervised_send_payload = AsyncMock(return_value={
            "channel": "email",
            "seller_id": seller_id,
            "interaction_id": str(uuid4()),
            "target": "owner@example.com",
            "subject": "Subject",
            "body": "Body",
            "launch_url": "mailto:owner@example.com?subject=Subject&body=Body",
            "status": "ready_for_human_send",
        })

        response = client.post(f"/api/sellers/{seller_id}/send-supervised/email")

        assert response.status_code == 200
        body = response.json()
        assert body["channel"] == "email"
        assert body["target"] == "owner@example.com"
