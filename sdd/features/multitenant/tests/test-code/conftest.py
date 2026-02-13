import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient
from uuid import uuid4
from datetime import datetime, timedelta

from backend.main import app
from backend.services.supabase_service import supabase_service
from backend.models.membership import UserRole, MembershipStatus

@pytest.fixture
def api_client():
    return TestClient(app)

@pytest.fixture
def mock_supabase():
    with patch("backend.services.supabase_service.supabase_service.client") as mock:
        yield mock

@pytest.fixture
def test_org_id():
    return uuid4()

@pytest.fixture
def test_user_id():
    return uuid4()

def create_auth_headers(user_id):
    # In a real scenario, this would be a valid JWT
    return {"Authorization": f"Bearer mock-token-{user_id}"}

@pytest.fixture
def owner_headers(mock_supabase):
    user_id = uuid4()
    mock_user = MagicMock()
    mock_user.id = user_id
    mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
    return create_auth_headers(user_id), user_id

@pytest.fixture
def manager_headers(mock_supabase):
    user_id = uuid4()
    mock_user = MagicMock()
    mock_user.id = user_id
    mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
    return create_auth_headers(user_id), user_id

@pytest.fixture
def agent_headers(mock_supabase):
    user_id = uuid4()
    mock_user = MagicMock()
    mock_user.id = user_id
    mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
    return create_auth_headers(user_id), user_id

@pytest.fixture
def mock_membership_verification():
    with patch("backend.api.routes.memberships.verify_org_membership") as mock:
        mock.return_value = {"role": UserRole.OWNER, "status": MembershipStatus.ACTIVE}
        yield mock

@pytest.fixture
def test_membership_data(test_org_id, test_user_id):
    return {
        "id": str(uuid4()),
        "org_id": str(test_org_id),
        "user_id": str(test_user_id),
        "role": UserRole.AGENT,
        "status": MembershipStatus.ACTIVE,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
