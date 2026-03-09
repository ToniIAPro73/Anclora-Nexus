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

from backend.api.routes.intelligence import router

app = FastAPI()
app.include_router(router, prefix="/api/intelligence")
client = TestClient(app)


class TestStatefoxBridgeRoutes:
    def test_parse_route_exists(self) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [
            r for r in routes
            if hasattr(r, "path") and r.path == "/api/intelligence/statefox-bridge/parse" and "POST" in r.methods
        ]
        assert len(matching) == 1

    @patch("backend.api.routes.intelligence.parse_statefox_raw")
    def test_parse_returns_payload(self, mock_parse) -> None:
        mock_parse.return_value = {"listings": [{"title": "Piso X"}], "count": 1}
        response = client.post("/api/intelligence/statefox-bridge/parse", json={"raw_text": "sample"})
        assert response.status_code == 200
        assert response.json()["parsed"]["count"] == 1

    @patch("backend.api.routes.intelligence.import_statefox_listings", new_callable=AsyncMock)
    @patch("backend.api.routes.intelligence.get_org_id", new_callable=AsyncMock)
    @patch("backend.api.routes.intelligence.check_budget_hard_stop", new_callable=AsyncMock)
    def test_import_returns_payload(self, _budget, _org_id, mock_import) -> None:
        app.dependency_overrides.clear()
        from backend.api.deps import get_org_id as dep_org_id, check_budget_hard_stop as dep_budget
        app.dependency_overrides[dep_org_id] = lambda: "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"
        app.dependency_overrides[dep_budget] = lambda: {}
        mock_import.return_value = {"parsed_count": 1, "imported_count": 1, "skipped_count": 0, "created": []}
        response = client.post("/api/intelligence/statefox-bridge/import", json={"raw_text": "sample"})
        assert response.status_code == 200
        assert response.json()["result"]["imported_count"] == 1
