import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4
from fastapi import FastAPI
from fastapi.testclient import TestClient
from backend.api.routes.dq import router
from backend.models.dq import DQMetricsResponse, DQIssuesResponse, CandidateStatus

app = FastAPI()
app.include_router(router, prefix="/api/dq")

ORG_ID = str(uuid4())
USER_ID = str(uuid4())

async def mock_get_org_id() -> str:
    return ORG_ID

async def mock_get_current_user():
    user = MagicMock()
    user.id = USER_ID
    return user

async def mock_check_budget():
    return True

from backend.api.deps import get_org_id, get_current_user, check_budget_hard_stop
app.dependency_overrides[get_org_id] = mock_get_org_id
app.dependency_overrides[get_current_user] = mock_get_current_user
app.dependency_overrides[check_budget_hard_stop] = mock_check_budget

client = TestClient(app)

class TestDQRoutes:
    @pytest.mark.parametrize("method,path", [
        ("GET", "/api/dq/issues"),
        ("GET", "/api/dq/metrics"),
        ("POST", "/api/dq/resolve"),
        ("POST", "/api/dq/recompute"),
    ])
    def test_endpoint_exists(self, method: str, path: str) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [r for r in routes if hasattr(r, "path") and r.path == path and method in r.methods]
        assert len(matching) == 1

    @patch("backend.api.routes.dq.dq_service")
    def test_get_issues(self, mock_svc: MagicMock) -> None:
        mock_svc.get_issues = AsyncMock(return_value=DQIssuesResponse(issues=[], total_count=0))
        resp = client.get("/api/dq/issues")
        assert resp.status_code == 200
        assert "issues" in resp.json()

    @patch("backend.api.routes.dq.dq_service")
    def test_get_metrics(self, mock_svc: MagicMock) -> None:
        mock_svc.get_metrics = AsyncMock(return_value=DQMetricsResponse(
            total_issues=0, open_issues=0, critical_issues=0, 
            total_candidates=0, suggested_merges=0
        ))
        resp = client.get("/api/dq/metrics")
        assert resp.status_code == 200
        assert "total_issues" in resp.json()

    @patch("backend.api.routes.dq.dq_service")
    def test_resolve_candidate(self, mock_svc: MagicMock) -> None:
        mock_svc.resolve_candidate = AsyncMock(return_value={"status": "success", "new_status": "approved_merge"})
        resp = client.post("/api/dq/resolve", json={
            "candidate_id": str(uuid4()),
            "action": "approve_merge"
        })
        assert resp.status_code == 200
        assert resp.json()["status"] == "success"

    @patch("backend.api.routes.dq.dq_service")
    def test_recompute(self, mock_svc: MagicMock) -> None:
        # recompute_all is a background task, so we just check if it returns 200
        resp = client.post("/api/dq/recompute")
        assert resp.status_code == 200
        assert resp.json()["status"] == "accepted"
