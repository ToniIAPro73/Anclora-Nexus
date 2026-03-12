from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.routes.public import router


app = FastAPI()
app.include_router(router, prefix="/api/public")
client = TestClient(app)


class TestPublicDataLabAccessRoutes:
    @patch("backend.api.routes.public.data_lab_access_service")
    def test_create_public_request(self, mock_service: MagicMock) -> None:
        mock_service.create_public_request = AsyncMock(return_value={"id": "req-1"})
        response = client.post(
            "/api/public/data-lab-access-requests",
            json={
                "full_name": "Investor Test",
                "email": "investor@example.com",
                "profile_type": "investor",
                "requested_scope": "market_brief",
                "intended_use": "Necesito inteligencia territorial para evaluar una posible inversión en Mallorca.",
                "geography_focus": ["mallorca"],
                "languages": ["es", "en"],
            },
        )
        assert response.status_code == 201
        assert response.json()["status"] == "submitted"

    @patch("backend.api.routes.public.data_lab_access_service")
    def test_get_public_workspace(self, mock_service: MagicMock) -> None:
        mock_service.get_workspace_by_token = AsyncMock(return_value={"id": "ws-1", "requester_name": "Investor Test"})
        response = client.get("/api/public/data-lab-workspace?token=token-123456789012")
        assert response.status_code == 200
        assert response.json()["id"] == "ws-1"
