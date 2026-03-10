from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.deps import get_current_user, get_org_id
from backend.api.routes.command_center import router


app = FastAPI()
app.include_router(router, prefix="/api/command-center")
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
            ("GET", "/api/command-center/snapshot"),
            ("GET", "/api/command-center/trends"),
        ],
    )
    def test_endpoint_exists(self, method: str, path: str) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [r for r in routes if hasattr(r, "path") and r.path == path and method in r.methods]
        assert len(matching) == 1


class TestCommandCenterRoutes:
    @patch("backend.api.routes.command_center.command_center_service")
    def test_snapshot(self, mock_svc: MagicMock) -> None:
        mock_svc.get_snapshot = AsyncMock(
            return_value={
                "version": "ANCLORA-FCCC-001.v1_2",
                "scope": {"org_id": ORG_ID, "role": "owner"},
                "commercial_kpis": [{"label": "leads_total", "value": 10, "unit": "count"}],
                "productivity_kpis": [{"label": "tasks_total", "value": 8, "unit": "count"}],
                "budget_status": "ok",
                "burn_pct": 32.0,
                "monthly_budget_eur": 1000.0,
                "current_usage_eur": 320.0,
                "cost_visibility": "full",
                "operational_overview": {
                    "active_alerts": 3,
                    "critical_alerts": 1,
                    "degraded_sources": 2,
                    "stale_sources": 1,
                    "cloud_warning_checks": 1,
                    "cloud_critical_checks": 0,
                    "territorial_sync_status": "ready",
                    "territorial_pipeline_status": "warning",
                    "seller_signal_source_status": "healthy",
                    "ai_runtime_status": "warning",
                    "top_alerts": [],
                },
                "pipeline_overview": {
                    "seller_signals_processed": 8,
                    "sellers_total": 5,
                    "sellers_high_priority": 3,
                    "sellers_converted": 1,
                    "seller_conversion_rate": 20.0,
                    "supervised_sends_confirmed": 2,
                    "active_workbench_ready": 4,
                },
            }
        )
        resp = client.get("/api/command-center/snapshot")
        assert resp.status_code == 200
        body = resp.json()
        assert body["scope"]["org_id"] == ORG_ID
        assert body["budget_status"] == "ok"
        assert body["operational_overview"]["active_alerts"] == 3
        assert body["pipeline_overview"]["sellers_total"] == 5

    @patch("backend.api.routes.command_center.command_center_service")
    def test_trends(self, mock_svc: MagicMock) -> None:
        mock_svc.get_trends = AsyncMock(
            return_value={
                "version": "ANCLORA-FCCC-001.v1_2",
                "scope": {"org_id": ORG_ID, "role": "manager"},
                "months": 6,
                "points": [
                    {"period": "2025-09", "leads_created": 3, "tasks_completed": 2, "cost_eur": 120.5, "active_alerts": 1, "critical_alerts": 0, "seller_signals_processed": 2, "sellers_created": 1, "supervised_sends_confirmed": 0},
                    {"period": "2025-10", "leads_created": 4, "tasks_completed": 3, "cost_eur": 95.0, "active_alerts": 2, "critical_alerts": 1, "seller_signals_processed": 5, "sellers_created": 2, "supervised_sends_confirmed": 1},
                ],
            }
        )
        resp = client.get("/api/command-center/trends?months=6")
        assert resp.status_code == 200
        assert len(resp.json()["points"]) == 2
        assert resp.json()["points"][1]["critical_alerts"] == 1
        assert resp.json()["points"][1]["seller_signals_processed"] == 5
