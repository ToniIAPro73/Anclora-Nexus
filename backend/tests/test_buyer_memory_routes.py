import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from uuid import uuid4
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.routes.prospection import router
from backend.api.deps import get_org_id, get_current_user, check_budget_hard_stop


app = FastAPI()
app.include_router(router, prefix="/api/prospection")
ORG_ID = str(uuid4())
USER_ID = str(uuid4())


async def mock_get_org_id() -> str:
    return ORG_ID


class MockUser:
    id = USER_ID


async def mock_get_current_user() -> MockUser:
    return MockUser()


async def mock_check_budget_hard_stop():
    class BudgetStatus:
        status = "ok"
    return BudgetStatus()


app.dependency_overrides[get_org_id] = mock_get_org_id
app.dependency_overrides[get_current_user] = mock_get_current_user
app.dependency_overrides[check_budget_hard_stop] = mock_check_budget_hard_stop
client = TestClient(app)


class TestBuyerMemoryEndpoints:
    @patch("backend.api.routes.prospection.buyer_memory_service")
    def test_get_buyer_memory(self, mock_memory: MagicMock) -> None:
        mock_memory.search = AsyncMock(return_value=type("Resp", (), {"model_dump": lambda self: {"status": "ready", "matches": []}})())
        resp = client.get(f"/api/prospection/buyers/{uuid4()}/memory")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ready"

    @patch("backend.api.routes.prospection.buyer_memory_service")
    def test_rebuild_buyer_memory(self, mock_memory: MagicMock) -> None:
        mock_memory.rebuild_for_buyer = AsyncMock(return_value=type("Resp", (), {"model_dump": lambda self: {"status": "ready", "created_records": 3}})())
        resp = client.post(f"/api/prospection/buyers/{uuid4()}/memory/rebuild")
        assert resp.status_code == 200
        assert resp.json()["created_records"] == 3
