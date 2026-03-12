from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.deps import get_current_user, get_org_id
from backend.api.routes.intelligence import router


app = FastAPI()
app.include_router(router, prefix="/api/intelligence")
ORG_ID = str(uuid4())
USER_ID = str(uuid4())


async def mock_get_org_id() -> str:
    return ORG_ID


class MockUser:
    id = USER_ID


async def mock_get_current_user() -> MockUser:
    return MockUser()


app.dependency_overrides[get_org_id] = mock_get_org_id
app.dependency_overrides[get_current_user] = mock_get_current_user
client = TestClient(app)


class TestDataLabAccessRoutes:
    @pytest.mark.parametrize("method,path", [
        ("GET", "/api/intelligence/data-lab-access"),
        ("GET", "/api/intelligence/data-lab-access/summary"),
        ("PATCH", "/api/intelligence/data-lab-access/{request_id}"),
    ])
    def test_route_exists(self, method: str, path: str) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [r for r in routes if hasattr(r, "path") and r.path == path and method in r.methods]
        assert len(matching) == 1

    @patch("backend.api.routes.intelligence.data_lab_access_service")
    def test_list_requests(self, mock_service: MagicMock) -> None:
        mock_service.list_requests = AsyncMock(return_value={"items": [], "total": 0, "limit": 25, "offset": 0})
        response = client.get("/api/intelligence/data-lab-access?status=submitted")
        assert response.status_code == 200

    @patch("backend.api.routes.intelligence.data_lab_access_service")
    def test_review_request(self, mock_service: MagicMock) -> None:
        request_id = str(uuid4())
        mock_service.review_request = AsyncMock(return_value={"id": request_id, "status": "approved"})
        response = client.patch(
            f"/api/intelligence/data-lab-access/{request_id}",
            json={"status": "approved", "review_notes": "ok", "notify_applicant": False},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "approved"
