from unittest.mock import AsyncMock, patch

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from backend.api.deps import get_current_user, get_org_id, require_access_request_reviewer
from backend.api.routes.access_requests import router
from backend.services.access_request_service import (
    AccessRequestInvalidTransitionError,
    AccessRequestNotFoundError,
)


ORG_ID = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"
USER_ID = "admin-user"


class MockUser:
    id = USER_ID


async def mock_get_org_id() -> str:
    return ORG_ID


async def mock_get_current_user() -> MockUser:
    return MockUser()


async def mock_require_access_request_reviewer() -> MockUser:
    return MockUser()


@pytest.fixture
def app():
    test_app = FastAPI()
    test_app.include_router(router, prefix="/api/access-requests")
    test_app.dependency_overrides[get_org_id] = mock_get_org_id
    test_app.dependency_overrides[get_current_user] = mock_get_current_user
    test_app.dependency_overrides[require_access_request_reviewer] = mock_require_access_request_reviewer
    return test_app


def access_request_response(request_id: str = "request-1", status: str = "pending") -> dict:
    return {
        "id": request_id,
        "org_id": ORG_ID,
        "product": "synergi",
        "source": "syncxml_landing",
        "status": status,
        "full_name": "Test User",
        "email": "test@example.com",
        "privacy_accepted": True,
        "gdpr_consent": True,
        "submission_language": "es",
        "captcha_verified": True,
        "created_at": "2026-05-06T10:00:00+00:00",
        "updated_at": "2026-05-06T10:00:00+00:00",
    }


@pytest.mark.anyio
async def test_list_access_requests_route(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.list_requests = AsyncMock(return_value=[access_request_response()])

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get(
                "/api/access-requests?status=pending&product=synergi&source=nexus_manual&email=test@example.com"
            )

    assert response.status_code == 200
    assert response.json()[0]["id"] == "request-1"
    mock_service.list_requests.assert_awaited_once()
    assert mock_service.list_requests.await_args.kwargs["source"].value == "nexus_manual"
    assert mock_service.list_requests.await_args.kwargs["email"] == "test@example.com"


@pytest.mark.anyio
async def test_list_access_requests_accepts_empty_lifecycle(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.list_requests = AsyncMock(
            return_value=[
                {
                    **access_request_response(),
                    "product": "data_lab",
                    "source": "data_lab_app",
                    "lifecycle": {},
                }
            ]
        )

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/access-requests?status=pending&product=data_lab")

    assert response.status_code == 200
    assert response.json()[0]["product"] == "data_lab"
    assert response.json()[0]["lifecycle"] is None


@pytest.mark.anyio
async def test_get_access_request_route(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.get_request = AsyncMock(return_value=access_request_response("request-1"))

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/access-requests/request-1")

    assert response.status_code == 200
    assert response.json()["id"] == "request-1"


@pytest.mark.anyio
async def test_get_access_request_not_found_route(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.get_request = AsyncMock(side_effect=AccessRequestNotFoundError("missing"))

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/access-requests/missing")

    assert response.status_code == 404


@pytest.mark.anyio
async def test_approve_access_request_route(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.approve_request = AsyncMock(
            return_value=access_request_response("request-1", status="approved")
        )

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post(
                "/api/access-requests/request-1/approve",
                json={"admin_notes": "Approved"},
            )

    assert response.status_code == 200
    assert response.json()["status"] == "approved"
    mock_service.approve_request.assert_awaited_once()
    assert mock_service.approve_request.await_args.kwargs["reviewer_id"] == USER_ID


@pytest.mark.anyio
async def test_reject_access_request_route(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.reject_request = AsyncMock(
            return_value=access_request_response("request-1", status="rejected")
        )

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post(
                "/api/access-requests/request-1/reject",
                json={
                    "admin_notes": "Rejected",
                    "rejection_reason": "Not eligible",
                },
            )

    assert response.status_code == 200
    assert response.json()["status"] == "rejected"
    mock_service.reject_request.assert_awaited_once()
    assert mock_service.reject_request.await_args.kwargs["reviewer_id"] == USER_ID


@pytest.mark.anyio
async def test_invalid_transition_route_returns_409(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.approve_request = AsyncMock(
            side_effect=AccessRequestInvalidTransitionError("already approved")
        )

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post(
                "/api/access-requests/request-1/approve",
                json={},
            )

    assert response.status_code == 409


@pytest.mark.anyio
async def test_access_request_audit_route(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.list_audit_events = AsyncMock(
            return_value=[
                {
                    "id": "audit-1",
                    "timestamp": "2026-05-06T10:00:00+00:00",
                    "actor_type": "user",
                    "actor_id": USER_ID,
                    "action": "access_request.approved",
                    "resource_type": "access_request",
                    "resource_id": "request-1",
                    "details": {"admin_notes": "Approved"},
                }
            ]
        )

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/access-requests/request-1/audit")

    assert response.status_code == 200
    assert response.json()[0]["action"] == "access_request.approved"
    mock_service.list_audit_events.assert_awaited_once_with(org_id=ORG_ID, request_id="request-1")


@pytest.mark.anyio
async def test_access_request_lifecycle_route(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.get_lifecycle = AsyncMock(
            return_value={
                "request_id": "request-1",
                "status": "approved",
                "decision_status": "approved",
                "provisioning_status": "invite_ready",
                "email_status": "failed",
                "reviewed_by": USER_ID,
                "reviewed_at": "2026-05-06T10:00:00+00:00",
                "invite_expires_at": "2026-05-20T10:00:00+00:00",
                "retry_available": True,
                "last_event_at": "2026-05-06T10:01:00+00:00",
            }
        )

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.get("/api/access-requests/request-1/lifecycle")

    assert response.status_code == 200
    assert response.json()["retry_available"] is True
    mock_service.get_lifecycle.assert_awaited_once_with(org_id=ORG_ID, request_id="request-1")


@pytest.mark.anyio
async def test_retry_decision_email_route_uses_authenticated_reviewer(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.retry_decision_email = AsyncMock(
            return_value={
                **access_request_response("request-1", status="approved"),
                "decision_email": {"status": "sent", "transport": "smtp"},
            }
        )

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/access-requests/request-1/decision-email/retry")

    assert response.status_code == 200
    assert response.json()["decision_email"]["status"] == "sent"
    mock_service.retry_decision_email.assert_awaited_once_with(
        org_id=ORG_ID,
        request_id="request-1",
        reviewer_id=USER_ID,
    )


@pytest.mark.anyio
async def test_retry_decision_email_invalid_transition_returns_409(app):
    with patch("backend.api.routes.access_requests.access_request_service") as mock_service:
        mock_service.retry_decision_email = AsyncMock(
            side_effect=AccessRequestInvalidTransitionError("retry unavailable")
        )

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post("/api/access-requests/request-1/decision-email/retry")

    assert response.status_code == 409
