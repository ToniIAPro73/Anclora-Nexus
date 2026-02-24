from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.deps import get_current_user, get_org_id
from backend.api.routes.automation import router


app = FastAPI()
app.include_router(router, prefix="/api/automation")
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
            ("GET", "/api/automation/rules"),
            ("POST", "/api/automation/rules"),
            ("PATCH", "/api/automation/rules/{rule_id}"),
            ("POST", "/api/automation/rules/{rule_id}/dry-run"),
            ("POST", "/api/automation/rules/{rule_id}/execute"),
            ("GET", "/api/automation/executions"),
            ("GET", "/api/automation/alerts"),
            ("POST", "/api/automation/alerts/{alert_id}/ack"),
        ],
    )
    def test_endpoint_exists(self, method: str, path: str) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [r for r in routes if hasattr(r, "path") and r.path == path and method in r.methods]
        assert len(matching) == 1


class TestAutomationRoutes:
    @patch("backend.api.routes.automation.automation_service")
    def test_list_rules(self, mock_svc: MagicMock) -> None:
        mock_svc.list_rules = AsyncMock(
            return_value={
                "version": "ANCLORA-GAA-001.v1",
                "scope": {"org_id": ORG_ID, "role": "owner"},
                "items": [],
                "total": 0,
            }
        )
        resp = client.get("/api/automation/rules")
        assert resp.status_code == 200
        body = resp.json()
        assert body["scope"]["org_id"] == ORG_ID

    @patch("backend.api.routes.automation.automation_service")
    def test_create_rule(self, mock_svc: MagicMock) -> None:
        rule_id = str(uuid4())
        mock_svc.create_rule = AsyncMock(
            return_value={
                "id": rule_id,
                "org_id": ORG_ID,
                "name": "alerta budget",
                "status": "active",
                "event_type": "cost.threshold",
                "channel": "slack",
                "action_type": "notify",
                "schedule_cron": None,
                "max_cost_eur_per_run": 5,
                "requires_human_checkpoint": True,
                "conditions": {},
                "created_at": "2026-02-24T00:00:00Z",
                "updated_at": "2026-02-24T00:00:00Z",
            }
        )
        resp = client.post(
            "/api/automation/rules",
            json={
                "name": "alerta budget",
                "event_type": "cost.threshold",
                "channel": "slack",
                "action_type": "notify",
                "max_cost_eur_per_run": 5,
                "requires_human_checkpoint": True,
            },
        )
        assert resp.status_code == 201
        assert resp.json()["id"] == rule_id

    @patch("backend.api.routes.automation.automation_service")
    def test_dry_run(self, mock_svc: MagicMock) -> None:
        rule_id = str(uuid4())
        mock_svc.dry_run = AsyncMock(
            return_value={
                "version": "ANCLORA-GAA-001.v1",
                "scope": {"org_id": ORG_ID, "role": "manager"},
                "rule_id": rule_id,
                "decision": "allow",
                "reasons": [],
                "guardrails": {"finops_status": "ok"},
            }
        )
        resp = client.post(
            f"/api/automation/rules/{rule_id}/dry-run",
            json={"event_payload": {"k": "v"}, "cost_estimate_eur": 1},
        )
        assert resp.status_code == 200
        assert resp.json()["decision"] == "allow"

    @patch("backend.api.routes.automation.automation_service")
    def test_execute(self, mock_svc: MagicMock) -> None:
        rule_id = str(uuid4())
        execution_id = str(uuid4())
        mock_svc.execute = AsyncMock(
            return_value={
                "version": "ANCLORA-GAA-001.v1",
                "scope": {"org_id": ORG_ID, "role": "owner"},
                "rule_id": rule_id,
                "execution_id": execution_id,
                "status": "blocked",
                "decision": "blocked",
                "reasons": ["HUMAN_CHECKPOINT_REQUIRED"],
                "trace_id": str(uuid4()),
            }
        )
        resp = client.post(
            f"/api/automation/rules/{rule_id}/execute",
            json={"event_payload": {"event": "x"}, "cost_estimate_eur": 2, "confirm_human_checkpoint": False},
        )
        assert resp.status_code == 200
        assert resp.json()["execution_id"] == execution_id
        assert resp.json()["status"] == "blocked"

    @patch("backend.api.routes.automation.automation_service")
    def test_list_executions(self, mock_svc: MagicMock) -> None:
        mock_svc.list_executions = AsyncMock(
            return_value={
                "version": "ANCLORA-GAA-001.v1",
                "scope": {"org_id": ORG_ID, "role": "owner"},
                "items": [],
                "total": 0,
            }
        )
        resp = client.get("/api/automation/executions")
        assert resp.status_code == 200
        assert "items" in resp.json()

    @patch("backend.api.routes.automation.automation_service")
    def test_ack_alert_not_found(self, mock_svc: MagicMock) -> None:
        mock_svc.acknowledge_alert = AsyncMock(return_value=False)
        resp = client.post(f"/api/automation/alerts/{uuid4()}/ack")
        assert resp.status_code == 404
