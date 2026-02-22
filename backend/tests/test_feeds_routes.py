import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.routes.feeds import router

app = FastAPI()
app.include_router(router, prefix="/api/feeds")

ORG_ID = str(uuid4())
USER_ID = str(uuid4())


async def mock_get_org_id() -> str:
    return ORG_ID


class MockUser:
    id = USER_ID


async def mock_get_current_user() -> MockUser:
    return MockUser()


from backend.api.deps import get_org_id, get_current_user
app.dependency_overrides[get_org_id] = mock_get_org_id
app.dependency_overrides[get_current_user] = mock_get_current_user
client = TestClient(app)


class TestFeedRoutes:
    @pytest.mark.parametrize("method,path", [
        ("GET", "/api/feeds/workspace"),
        ("GET", "/api/feeds/channels/{channel}/config"),
        ("PATCH", "/api/feeds/channels/{channel}/config"),
        ("POST", "/api/feeds/channels/{channel}/validate"),
        ("POST", "/api/feeds/channels/{channel}/publish"),
        ("GET", "/api/feeds/runs"),
    ])
    def test_endpoint_exists(self, method: str, path: str) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [r for r in routes if hasattr(r, "path") and r.path == path and method in r.methods]
        assert len(matching) == 1

    @patch("backend.api.routes.feeds.feed_orchestrator_service")
    def test_workspace(self, mock_svc: MagicMock) -> None:
        mock_svc.get_workspace = AsyncMock(return_value={
            "generated_at": "2026-02-22T00:00:00Z",
            "channels": [],
            "totals": {"channels": 0, "candidates": 0, "ready": 0, "errors": 0, "warnings": 0},
        })
        resp = client.get("/api/feeds/workspace")
        assert resp.status_code == 200
        assert "totals" in resp.json()

    @patch("backend.api.routes.feeds.feed_orchestrator_service")
    def test_validate_invalid_channel(self, mock_svc: MagicMock) -> None:
        mock_svc.CHANNELS = {"idealista": {}}
        resp = client.post("/api/feeds/channels/invalid/validate")
        assert resp.status_code == 404

    @patch("backend.api.routes.feeds.feed_orchestrator_service")
    def test_publish(self, mock_svc: MagicMock) -> None:
        mock_svc.CHANNELS = {"idealista": {}}
        mock_svc.publish_channel = AsyncMock(return_value={
            "run_id": str(uuid4()),
            "channel": "idealista",
            "dry_run": False,
            "status": "success",
            "published_count": 1,
            "rejected_count": 0,
            "error_count": 0,
            "generated_at": "2026-02-22T00:00:00Z",
            "sample_payload": {},
            "issues": [],
        })
        resp = client.post("/api/feeds/channels/idealista/publish", json={"dry_run": False, "max_items": 10})
        assert resp.status_code == 200
        assert resp.json()["status"] == "success"

    @patch("backend.api.routes.feeds.feed_orchestrator_service")
    def test_update_config(self, mock_svc: MagicMock) -> None:
        mock_svc.CHANNELS = {"idealista": {}}
        mock_svc.update_channel_config = AsyncMock(return_value={
            "channel": "idealista",
            "format": "xml",
            "is_enabled": True,
            "max_items_per_run": 150,
            "rules_json": {},
        })
        resp = client.patch("/api/feeds/channels/idealista/config", json={"is_enabled": True, "max_items_per_run": 150})
        assert resp.status_code == 200
        assert resp.json()["max_items_per_run"] == 150
