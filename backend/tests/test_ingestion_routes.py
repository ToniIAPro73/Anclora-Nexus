import os
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-key")
os.environ.setdefault("AI_RUNTIME_PROFILE", "groq-cloudflare")
os.environ.setdefault("GROQ_API_KEY", "groq-test")
os.environ.setdefault("CLOUDFLARE_ACCOUNT_ID", "cf-account-test")
os.environ.setdefault("CLOUDFLARE_API_TOKEN", "cf-token-test")
os.environ.setdefault("INTERNAL_AUDIT_SECRET", "test-secret")

from backend.api.routes.ingestion import router
from backend.api.deps import get_org_id

app = FastAPI()
app.include_router(router, prefix="/api")
app.dependency_overrides[get_org_id] = lambda: "org-1"
client = TestClient(app)


class TestIngestionRouteRegistration:
    def test_ingestion_events_endpoint_exists(self) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [
            r for r in routes
            if hasattr(r, "path") and r.path == "/api/ingestion/events" and "GET" in r.methods
        ]
        assert len(matching) == 1

    def test_seller_signals_endpoint_exists(self) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [
            r for r in routes
            if hasattr(r, "path") and r.path == "/api/ingestion/seller-signals" and "POST" in r.methods
        ]
        assert len(matching) == 1


class TestIngestionRouteContracts:
    @patch("backend.api.routes.ingestion.ingestion_service.get_events", new_callable=AsyncMock)
    def test_events_route_returns_filtered_payload(self, mock_get_events: AsyncMock) -> None:
        mock_get_events.return_value = [
            {
                "id": "event-1",
                "org_id": "org-1",
                "entity_type": "seller_signal",
                "external_id": "ad-1",
                "connector_name": "statefox:bridge",
                "status": "processed",
                "payload": {},
                "dedupe_key": "key-1",
            }
        ]

        response = client.get(
            "/api/ingestion/events?entity_type=seller_signal&connector_name=statefox:bridge",
        )

        assert response.status_code == 200
        assert response.json()[0]["entity_type"] == "seller_signal"

    @patch("backend.api.routes.ingestion.ingestion_service.ingest_seller_signals", new_callable=AsyncMock)
    def test_seller_signal_route_returns_payload(self, mock_ingest: AsyncMock) -> None:
        mock_ingest.return_value = {
            "status": "processed",
            "trace_id": "trace-1",
            "created": 1,
            "duplicates": 0,
            "rejected": 0,
            "failed": 0,
        }

        response = client.post(
            "/api/ingestion/seller-signals",
            json={
                "org_id": "org-1",
                "connector_name": "statefox:bridge",
                "signals": [{"direccion": "Andratx", "anuncio_url": "https://example.com/ad/1"}],
            },
        )

        assert response.status_code == 200
        assert response.json()["created"] == 1
