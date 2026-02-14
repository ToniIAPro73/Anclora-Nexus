"""
API route tests — FastAPI TestClient. Feature: ANCLORA-PBM-001
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4
from fastapi import FastAPI
from fastapi.testclient import TestClient
from backend.api.routes.prospection import router

app = FastAPI()
app.include_router(router, prefix="/api/prospection")
ORG_ID = str(uuid4())

async def mock_get_org_id() -> str:
    return ORG_ID

from backend.api.deps import get_org_id
app.dependency_overrides[get_org_id] = mock_get_org_id
client = TestClient(app)


class TestRouteRegistration:
    @pytest.mark.parametrize("method,path", [
        ("POST", "/api/prospection/properties"),
        ("GET", "/api/prospection/properties"),
        ("PATCH", "/api/prospection/properties/{property_id}"),
        ("POST", "/api/prospection/properties/{property_id}/score"),
        ("POST", "/api/prospection/buyers"),
        ("GET", "/api/prospection/buyers"),
        ("PATCH", "/api/prospection/buyers/{buyer_id}"),
        ("POST", "/api/prospection/matches/recompute"),
        ("GET", "/api/prospection/matches"),
        ("PATCH", "/api/prospection/matches/{match_id}"),
        ("POST", "/api/prospection/matches/{match_id}/activity"),
        ("GET", "/api/prospection/matches/{match_id}/activities"),
    ])
    def test_endpoint_exists(self, method: str, path: str) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [r for r in routes if hasattr(r, "path") and r.path == path and method in r.methods]
        assert len(matching) == 1, f"{method} {path} not found"


class TestPropertyEndpoints:
    @patch("backend.api.routes.prospection.prospection_service")
    def test_create_property_valid(self, mock_svc: MagicMock) -> None:
        mock_svc.create_property = AsyncMock(return_value={"id": str(uuid4()), "org_id": ORG_ID, "source": "idealista", "status": "new"})
        resp = client.post("/api/prospection/properties", json={"source": "idealista", "title": "Test"})
        assert resp.status_code == 201

    def test_create_property_invalid_source(self) -> None:
        resp = client.post("/api/prospection/properties", json={"source": "scraper"})
        assert resp.status_code == 422

    @patch("backend.api.routes.prospection.prospection_service")
    def test_list_properties(self, mock_svc: MagicMock) -> None:
        mock_svc.list_properties = AsyncMock(return_value={"items": [], "total": 0, "limit": 50, "offset": 0})
        resp = client.get("/api/prospection/properties")
        assert resp.status_code == 200
        assert "items" in resp.json()

    @patch("backend.api.routes.prospection.prospection_service")
    def test_update_property_not_found(self, mock_svc: MagicMock) -> None:
        mock_svc.update_property = AsyncMock(return_value=None)
        resp = client.patch(f"/api/prospection/properties/{uuid4()}", json={"title": "X"})
        assert resp.status_code == 404


class TestBuyerEndpoints:
    @patch("backend.api.routes.prospection.prospection_service")
    def test_create_buyer_valid(self, mock_svc: MagicMock) -> None:
        mock_svc.create_buyer = AsyncMock(return_value={"id": str(uuid4()), "org_id": ORG_ID, "status": "active"})
        resp = client.post("/api/prospection/buyers", json={"full_name": "Buyer", "budget_min": 1000000, "budget_max": 3000000})
        assert resp.status_code == 201

    def test_create_buyer_invalid_budget(self) -> None:
        resp = client.post("/api/prospection/buyers", json={"budget_min": 5000000, "budget_max": 1000000})
        assert resp.status_code == 422


class TestMatchEndpoints:
    @patch("backend.api.routes.prospection.prospection_service")
    def test_recompute(self, mock_svc: MagicMock) -> None:
        from backend.models.prospection import RecomputeResponse
        mock_svc.recompute_matches = AsyncMock(return_value=RecomputeResponse(matches_created=5, matches_updated=3, total_computed=8))
        resp = client.post("/api/prospection/matches/recompute", json={})
        assert resp.status_code == 200
        assert resp.json()["total_computed"] == 8

    @patch("backend.api.routes.prospection.prospection_service")
    def test_update_match_not_found(self, mock_svc: MagicMock) -> None:
        mock_svc.update_match = AsyncMock(return_value=None)
        resp = client.patch(f"/api/prospection/matches/{uuid4()}", json={"match_status": "contacted"})
        assert resp.status_code == 404


class TestActivityEndpoints:
    @patch("backend.api.routes.prospection.prospection_service")
    def test_log_activity(self, mock_svc: MagicMock) -> None:
        mock_svc.log_activity = AsyncMock(return_value={"id": str(uuid4()), "activity_type": "call"})
        resp = client.post(f"/api/prospection/matches/{uuid4()}/activity", json={"activity_type": "call"})
        assert resp.status_code == 201

    @patch("backend.api.routes.prospection.prospection_service")
    def test_list_activities(self, mock_svc: MagicMock) -> None:
        mock_svc.list_activities = AsyncMock(return_value={"items": [], "total": 0})
        resp = client.get(f"/api/prospection/matches/{uuid4()}/activities")
        assert resp.status_code == 200
