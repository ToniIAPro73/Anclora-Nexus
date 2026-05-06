from unittest.mock import AsyncMock, patch

import pytest
from fastapi import FastAPI, HTTPException
from httpx import ASGITransport, AsyncClient

from backend.api.deps import get_current_user, get_org_id
from backend.api.routes.access_requests import router


ORG_ID = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"
USER_ID = "agent-user"


class MockUser:
    id = USER_ID


async def mock_get_org_id() -> str:
    return ORG_ID


async def mock_get_current_user() -> MockUser:
    return MockUser()


@pytest.fixture
def app():
    test_app = FastAPI()
    test_app.include_router(router, prefix="/api/access-requests")
    test_app.dependency_overrides[get_org_id] = mock_get_org_id
    test_app.dependency_overrides[get_current_user] = mock_get_current_user
    return test_app


@pytest.fixture
def unauthenticated_app():
    test_app = FastAPI()
    test_app.include_router(router, prefix="/api/access-requests")
    return test_app


@pytest.mark.anyio
async def test_authenticated_non_reviewer_gets_403(app):
    with patch(
        "backend.api.deps.verify_org_membership",
        new=AsyncMock(side_effect=HTTPException(status_code=403, detail="ACCESS_REQUEST_REVIEW_FORBIDDEN")),
    ), patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.approve_request = AsyncMock()

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/access-requests/request-1/approve", json={})

    assert response.status_code == 403
    mock_service.approve_request.assert_not_awaited()


@pytest.mark.anyio
async def test_authenticated_non_reviewer_gets_403_for_analytics(app):
    with patch(
        "backend.api.deps.verify_org_membership",
        new=AsyncMock(side_effect=HTTPException(status_code=403, detail="ACCESS_REQUEST_REVIEW_FORBIDDEN")),
    ), patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.get_analytics_summary = AsyncMock()

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/access-requests/analytics/summary")

    assert response.status_code == 403
    mock_service.get_analytics_summary.assert_not_awaited()


@pytest.mark.anyio
async def test_missing_auth_gets_401_for_review_route(unauthenticated_app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.approve_request = AsyncMock()

        async with AsyncClient(transport=ASGITransport(app=unauthenticated_app), base_url="http://test") as ac:
            response = await ac.post("/api/access-requests/request-1/approve", json={})

    assert response.status_code == 401
    mock_service.approve_request.assert_not_awaited()
