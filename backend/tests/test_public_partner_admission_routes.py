from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.routes.public import router


app = FastAPI()
app.include_router(router, prefix="/api/public")
client = TestClient(app)


class TestPublicPartnerAdmissionRoutes:
    @patch("backend.api.routes.public.partner_admission_service")
    def test_create_partner_admission(self, mock_service: MagicMock) -> None:
        mock_service.create_public_admission = AsyncMock(return_value={"id": "adm-1"})
        response = client.post(
            "/api/public/partner-admissions",
            json={
                "full_name": "Partner Test",
                "email": "partner@example.com",
                "service_category": "eco",
                "service_summary": "Servicios premium de sostenibilidad y eficiencia energetica.",
                "coverage_areas": ["mallorca"],
                "languages": ["es", "en"],
            },
        )
        assert response.status_code == 201
        assert response.json()["status"] == "submitted"
