from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.deps import get_current_user, get_org_id
from backend.api.routes.source_observatory import router


app = FastAPI()
app.include_router(router, prefix="/api/source-observatory")
ORG_ID = str(uuid4())
USER_ID = str(uuid4())


class MockUser:
    id = USER_ID


async def mock_get_org_id() -> str:
    return ORG_ID


async def mock_get_current_user() -> MockUser:
    return MockUser()


app.dependency_overrides[get_org_id] = mock_get_org_id
app.dependency_overrides[get_current_user] = mock_get_current_user
client = TestClient(app)


class TestRouteRegistration:
    @pytest.mark.parametrize(
        "method,path",
        [
            ("GET", "/api/source-observatory/overview"),
            ("GET", "/api/source-observatory/ranking"),
            ("GET", "/api/source-observatory/trends"),
        ],
    )
    def test_endpoint_exists(self, method: str, path: str) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [r for r in routes if hasattr(r, "path") and r.path == path and method in r.methods]
        assert len(matching) == 1


class TestSourceObservatoryRoutes:
    @patch("backend.api.routes.source_observatory.source_observatory_service")
    def test_overview(self, mock_svc: MagicMock) -> None:
        mock_svc.get_overview = AsyncMock(
            return_value={
                "version": "ANCLORA-SPO-001.v1_1",
                "scope": {"org_id": ORG_ID, "role": "owner"},
                "summary": {
                    "total_sources": 1,
                    "healthy_sources": 1,
                    "warning_sources": 0,
                    "critical_sources": 0,
                    "stale_sources": 0,
                    "total_events": 20,
                    "total_created_entities": 14,
                    "total_failures": 2,
                },
                "items": [
                    {
                        "source_key": "cta_web:website",
                        "total_events": 20,
                        "success_events": 16,
                        "duplicate_events": 2,
                        "error_events": 2,
                        "success_rate_pct": 80.0,
                        "lead_count": 14,
                        "property_count": 0,
                        "seller_count": 0,
                        "processed_events": 16,
                        "rejected_events": 1,
                        "failed_events": 1,
                        "created_entities": 14,
                        "freshness_hours": 4.0,
                        "latest_event_at": "2026-03-10T10:00:00+00:00",
                        "operational_status": "healthy",
                        "entity_types": ["lead"],
                    }
                ],
                "total": 1,
            }
        )
        resp = client.get("/api/source-observatory/overview")
        assert resp.status_code == 200
        assert resp.json()["total"] == 1

    @patch("backend.api.routes.source_observatory.source_observatory_service")
    def test_ranking(self, mock_svc: MagicMock) -> None:
        mock_svc.get_ranking = AsyncMock(
            return_value={
                "version": "ANCLORA-SPO-001.v1_1",
                "scope": {"org_id": ORG_ID, "role": "manager"},
                "items": [
                    {
                        "source_key": "cta_web:website",
                        "score": 84.2,
                        "success_rate_pct": 80.0,
                        "lead_count": 14,
                        "created_entities": 14,
                        "freshness_hours": 4.0,
                        "operational_status": "healthy",
                    }
                ],
                "total": 1,
            }
        )
        resp = client.get("/api/source-observatory/ranking")
        assert resp.status_code == 200
        assert resp.json()["items"][0]["score"] == 84.2

    @patch("backend.api.routes.source_observatory.source_observatory_service")
    def test_trends(self, mock_svc: MagicMock) -> None:
        mock_svc.get_trends = AsyncMock(
            return_value={
                "version": "ANCLORA-SPO-001.v1_1",
                "scope": {"org_id": ORG_ID, "role": "agent"},
                "months": 6,
                "points": [
                    {
                        "period": "2026-01",
                        "source_key": "cta_web:website",
                        "events": 10,
                        "success_rate_pct": 90.0,
                        "processed_events": 9,
                        "failed_events": 1,
                        "created_entities": 8,
                    }
                ],
            }
        )
        resp = client.get("/api/source-observatory/trends?months=6")
        assert resp.status_code == 200
        assert resp.json()["months"] == 6
