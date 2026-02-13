# conftest.py - Pytest fixtures para Multi-Tenant tests

import pytest
from uuid import uuid4
from datetime import datetime, timedelta

# ============================================================================
# FIXTURES: ORGANIZATIONS
# ============================================================================

@pytest.fixture
def test_org():
    """Create test organization"""
    return {
        "id": str(uuid4()),
        "name": "Test Organization",
        "status": "active",
    }

# ============================================================================
# FIXTURES: USERS
# ============================================================================

@pytest.fixture
def test_owner():
    """Create owner user"""
    return {
        "id": str(uuid4()),
        "email": "owner@test.com",
        "full_name": "Owner User",
    }

@pytest.fixture
def test_manager():
    """Create manager user"""
    return {
        "id": str(uuid4()),
        "email": "manager@test.com",
        "full_name": "Manager User",
    }

@pytest.fixture
def test_agent():
    """Create agent user"""
    return {
        "id": str(uuid4()),
        "email": "agent@test.com",
        "full_name": "Agent User",
    }

# ============================================================================
# FIXTURES: MEMBERSHIPS
# ============================================================================

@pytest.fixture
def owner_membership(test_org, test_owner):
    """Owner membership"""
    return {
        "id": str(uuid4()),
        "org_id": test_org["id"],
        "user_id": test_owner["id"],
        "role": "owner",
        "status": "active",
    }

@pytest.fixture
def manager_membership(test_org, test_manager):
    """Manager membership"""
    return {
        "id": str(uuid4()),
        "org_id": test_org["id"],
        "user_id": test_manager["id"],
        "role": "manager",
        "status": "active",
    }

@pytest.fixture
def agent_membership(test_org, test_agent):
    """Agent membership"""
    return {
        "id": str(uuid4()),
        "org_id": test_org["id"],
        "user_id": test_agent["id"],
        "role": "agent",
        "status": "active",
    }

# ============================================================================
# FIXTURES: INVITATIONS
# ============================================================================

@pytest.fixture
def pending_invitation(test_org):
    """Pending invitation"""
    return {
        "id": str(uuid4()),
        "org_id": test_org["id"],
        "email": "pending@test.com",
        "role": "manager",
        "status": "pending",
        "invitation_code": "abc123xyz" * 4,
        "expires_at": (datetime.utcnow() + timedelta(days=7)).isoformat(),
    }

# ============================================================================
# FIXTURES: API CLIENT
# ============================================================================

@pytest.fixture
def api_client_owner(test_owner):
    """API client with owner authentication"""
    return {
        "headers": {
            "Authorization": f"Bearer test-token-owner-{test_owner['id']}",
            "X-User-ID": test_owner["id"],
        }
    }

@pytest.fixture
def api_client_manager(test_manager):
    """API client with manager authentication"""
    return {
        "headers": {
            "Authorization": f"Bearer test-token-manager-{test_manager['id']}",
            "X-User-ID": test_manager["id"],
        }
    }

@pytest.fixture
def api_client_agent(test_agent):
    """API client with agent authentication"""
    return {
        "headers": {
            "Authorization": f"Bearer test-token-agent-{test_agent['id']}",
            "X-User-ID": test_agent["id"],
        }
    }

# ============================================================================
# PYTEST CONFIGURATION
# ============================================================================

pytest_plugins = []

def pytest_configure(config):
    """Configure pytest"""
    config.addinivalue_line(
        "markers", "asyncio: mark test as async"
    )
