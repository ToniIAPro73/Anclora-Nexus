from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.routes.partners import router


app = FastAPI()
app.include_router(router, prefix="/api/partners")
client = TestClient(app)


def _override_org_id():
    return "org-1"


def _override_user():
    return type("User", (), {"id": "user-1"})()


app.dependency_overrides = {}
from backend.api.deps import get_org_id, get_current_user  # noqa: E402
app.dependency_overrides[get_org_id] = _override_org_id
app.dependency_overrides[get_current_user] = _override_user


class TestPartnerNetworkRoutes:
    @patch("backend.api.routes.partners.partner_network_service")
    def test_list_partner_network(self, mock_service: MagicMock) -> None:
        mock_service.list_network = AsyncMock(return_value={"items": [], "total": 0, "limit": 50, "offset": 0})
        response = client.get("/api/partners/network?preferred_opportunity_type=buyer_opportunity&response_status=responsive")
        assert response.status_code == 200
        assert response.json()["total"] == 0

    @patch("backend.api.routes.partners.partner_network_service")
    def test_update_partner_network(self, mock_service: MagicMock) -> None:
        mock_service.update_network_partner = AsyncMock(return_value={"id": "ws-1", "partner_tier": "strategic"})
        response = client.patch(
            "/api/partners/network/00000000-0000-0000-0000-000000000001",
            json={"partner_tier": "strategic"},
        )
        assert response.status_code == 200
        assert response.json()["partner_tier"] == "strategic"

    @patch("backend.api.routes.partners.partner_network_service")
    def test_share_partner_opportunity(self, mock_service: MagicMock) -> None:
        mock_service.share_opportunity_with_partner = AsyncMock(return_value={"id": "shared-1", "status": "shared"})
        response = client.post(
            "/api/partners/network/00000000-0000-0000-0000-000000000001/shared-opportunities",
            json={
                "title": "Buyer opportunity",
                "summary": "Buyer internacional con interés en villas prime en Mallorca.",
                "opportunity_type": "buyer_opportunity",
            },
        )
        assert response.status_code == 201
        assert response.json()["status"] == "shared"
