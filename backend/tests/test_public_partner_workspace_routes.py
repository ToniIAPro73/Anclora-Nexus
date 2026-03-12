from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.routes.public import router


app = FastAPI()
app.include_router(router, prefix="/api/public")
client = TestClient(app)


class TestPublicPartnerWorkspaceRoutes:
    @patch("backend.api.routes.public.partner_workspace_service")
    def test_get_workspace(self, mock_service: MagicMock) -> None:
        mock_service.get_workspace_by_token = AsyncMock(return_value={"id": "ws-1", "partner_name": "Partner Test"})
        response = client.get("/api/public/partner-workspace?token=token-123456789012")
        assert response.status_code == 200
        assert response.json()["id"] == "ws-1"

    @patch("backend.api.routes.public.partner_workspace_service")
    def test_create_workspace_opportunity(self, mock_service: MagicMock) -> None:
        mock_service.create_opportunity_from_token = AsyncMock(return_value={"id": "opp-1"})
        response = client.post(
            "/api/public/partner-workspace/opportunities",
            json={
                "token": "token-123456789012",
                "title": "Buyer referral",
                "opportunity_type": "buyer_referral",
                "summary": "Buyer interesado en producto prime en Mallorca.",
            },
        )
        assert response.status_code == 201
        assert response.json()["status"] == "submitted"

    @patch("backend.api.routes.public.partner_workspace_service")
    def test_update_workspace_profile(self, mock_service: MagicMock) -> None:
        mock_service.update_profile_from_token = AsyncMock(return_value={"id": "ws-1"})
        response = client.patch(
            "/api/public/partner-workspace/profile",
            json={
                "token": "token-123456789012",
                "preferred_opportunity_types": ["buyer_referral"],
                "priority_zones": ["mallorca"],
                "contact_preferences": ["email"],
            },
        )
        assert response.status_code == 200
        assert response.json()["status"] == "updated"

    @patch("backend.api.routes.public.partner_workspace_service")
    def test_update_shared_opportunity_status(self, mock_service: MagicMock) -> None:
        mock_service.update_shared_opportunity_status_from_token = AsyncMock(return_value={"id": "shared-1"})
        response = client.patch(
            "/api/public/partner-workspace/shared-opportunities/shared-1",
            json={"token": "token-123456789012", "status": "interested"},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "updated"
