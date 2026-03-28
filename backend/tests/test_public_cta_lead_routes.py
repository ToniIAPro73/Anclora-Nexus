from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.routes.public import router


app = FastAPI()
app.include_router(router, prefix="/api/public")
client = TestClient(app)


class TestPublicCtaLeadRoutes:
    @patch("backend.api.routes.public.agent_executor")
    def test_public_cta_lead_returns_lead_id(self, mock_agent_executor) -> None:
        mock_agent_executor.ainvoke = AsyncMock(
            return_value={
                "status": "success",
                "final_result": {"lead_id": "lead-123"},
            }
        )

        response = client.post(
            "/api/public/cta/lead",
            json={"name": "Toni Test", "email": "toni@example.com"},
        )

        assert response.status_code == 200
        assert response.json() == {"status": "success", "lead_id": "lead-123"}

    @patch("backend.api.routes.public.agent_executor")
    def test_public_cta_lead_returns_429_when_blocked(self, mock_agent_executor) -> None:
        mock_agent_executor.ainvoke = AsyncMock(
            return_value={
                "status": "blocked",
                "error": "Constitutional limit reached: max_daily_leads (50)",
            }
        )

        response = client.post(
            "/api/public/cta/lead",
            json={"name": "Toni Test", "email": "toni@example.com"},
        )

        assert response.status_code == 429
        assert "max_daily_leads" in response.json()["detail"]

    @patch("backend.api.routes.public.agent_executor")
    def test_public_cta_lead_fails_when_lead_id_missing(self, mock_agent_executor) -> None:
        mock_agent_executor.ainvoke = AsyncMock(
            return_value={
                "status": "success",
                "final_result": {},
            }
        )

        response = client.post(
            "/api/public/cta/lead",
            json={"name": "Toni Test", "email": "toni@example.com"},
        )

        assert response.status_code == 500
        assert response.json()["detail"] == "Lead intake completed without lead_id"
