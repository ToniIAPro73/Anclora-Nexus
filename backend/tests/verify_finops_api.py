from fastapi import Response
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.supabase_service import supabase_service
from backend.api.deps import get_current_user, get_org_id
from unittest.mock import MagicMock, patch, AsyncMock

client = TestClient(app)

# Mock user and org
MOCK_ORG_ID = "00000000-0000-0000-0000-000000000000"
MOCK_USER_ID = "user-123"

def mock_get_current_user():
    return {"id": MOCK_USER_ID, "email": "test@example.com", "org_id": MOCK_ORG_ID}

def mock_get_org_id():
    return MOCK_ORG_ID

@patch("backend.api.routes.finops.finops_service")
def test_get_budget(mock_service):
    # Setup mock
    mock_service.get_budget_status = AsyncMock(return_value={
        "org_id": MOCK_ORG_ID,
        "monthly_budget_eur": 100.0,
        "warning_threshold_pct": 80.0,
        "hard_stop_threshold_pct": 100.0,
        "hard_stop_enabled": True,
        "current_usage_eur": 50.0,
        "current_usage_pct": 50.0,
        "status": "ok"
    })
    
    # Override dependency
    app.dependency_overrides[get_current_user] = mock_get_current_user
    app.dependency_overrides[get_org_id] = mock_get_org_id
    
    try:
        response = client.get("/api/finops/budget")
        assert response.status_code == 200
        data = response.json()
        assert data["org_id"] == MOCK_ORG_ID
        assert data["status"] == "ok"
    finally:
        app.dependency_overrides = {}

@patch("backend.api.routes.finops.finops_service")
def test_update_budget(mock_service):
    mock_service.update_budget_policy = AsyncMock(return_value={
        "org_id": MOCK_ORG_ID,
        "monthly_budget_eur": 200.0,
        "warning_threshold_pct": 80.0,
        "hard_stop_threshold_pct": 100.0,
        "hard_stop_enabled": True,
        "current_usage_eur": 50.0,
        "current_usage_pct": 25.0,
        "status": "ok"
    })
    
    payload = {"monthly_budget_eur": 200.0}
    
    app.dependency_overrides[get_current_user] = mock_get_current_user
    app.dependency_overrides[get_org_id] = mock_get_org_id
    try:
        response = client.patch("/api/finops/budget", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["monthly_budget_eur"] == 200.0
    finally:
        app.dependency_overrides = {}

@patch("backend.api.routes.finops.finops_service")
def test_log_usage(mock_service):
    mock_service.log_usage_event = AsyncMock(return_value={
        "id": "event-1",
        "org_id": MOCK_ORG_ID,
        "capability_code": "gpt4",
        "provider": None,
        "units": 10,
        "cost_eur": 0.5,
        "trace_id": None,
        "metadata": {},
        "created_at": "2023-01-01T00:00:00Z"
    })
    
    payload = {
        "capability_code": "gpt4",
        "units": 10,
        "cost_eur": 0.5
    }
    app.dependency_overrides[get_current_user] = mock_get_current_user
    app.dependency_overrides[get_org_id] = mock_get_org_id
    try:
        response = client.post("/api/finops/usage/log", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["cost_eur"] == 0.5
    finally:
        app.dependency_overrides = {}

@patch("backend.api.routes.finops.finops_service")
def test_get_usage(mock_service):
    mock_service.get_usage_history = AsyncMock(return_value=[])
    app.dependency_overrides[get_current_user] = mock_get_current_user
    app.dependency_overrides[get_org_id] = mock_get_org_id
    try:
        response = client.get("/api/finops/usage")
        assert response.status_code == 200
        assert response.json() == []
    finally:
        app.dependency_overrides = {}

@patch("backend.api.routes.finops.finops_service")
def test_get_alerts(mock_service):
    mock_service.get_active_alerts = AsyncMock(return_value=[])
    app.dependency_overrides[get_current_user] = mock_get_current_user
    app.dependency_overrides[get_org_id] = mock_get_org_id
    try:
        response = client.get("/api/finops/alerts")
        assert response.status_code == 200
        assert response.json() == []
    finally:
        app.dependency_overrides = {}
