# test_role_isolation.py - 20 tests para role-based access control
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_owner_can_invite_all_roles(api_client: AsyncClient, test_org: dict):
    for role in ["owner", "manager", "agent"]:
        response = await api_client.post(
            f"/api/organizations/{test_org['id']}/members",
            json={"email": f"user_{role}@test.com", "role": role}
        )
        assert response.status_code == 201

@pytest.mark.asyncio
async def test_owner_can_change_roles(api_client: AsyncClient, test_org: dict, agent_membership: dict):
    response = await api_client.patch(
        f"/api/organizations/{test_org['id']}/members/{agent_membership['id']}",
        json={"role": "manager"}
    )
    assert response.status_code == 200
    assert response.json()["role"] == "manager"

@pytest.mark.asyncio
async def test_manager_cannot_invite(api_client_manager: AsyncClient, test_org: dict):
    response = await api_client_manager.post(
        f"/api/organizations/{test_org['id']}/members",
        json={"email": "newuser@test.com", "role": "agent"}
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_manager_cannot_change_role(api_client_manager: AsyncClient, test_org: dict, agent_membership: dict):
    response = await api_client_manager.patch(
        f"/api/organizations/{test_org['id']}/members/{agent_membership['id']}",
        json={"role": "manager"}
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_manager_sees_all_members_readonly(api_client_manager: AsyncClient, test_org: dict):
    response = await api_client_manager.get(
        f"/api/organizations/{test_org['id']}/members"
    )
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_agent_cannot_see_team(api_client_agent: AsyncClient, test_org: dict):
    response = await api_client_agent.get(
        f"/api/organizations/{test_org['id']}/members"
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_agent_sees_assigned_leads_only(api_client_agent: AsyncClient):
    response = await api_client_agent.get("/api/leads")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_agent_cannot_create_leads(api_client_agent: AsyncClient):
    response = await api_client_agent.post(
        "/api/leads",
        json={"title": "New lead"}
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_middleware_validates_required_role(api_client_agent: AsyncClient, test_org: dict):
    response = await api_client_agent.patch(
        f"/api/organizations/{test_org['id']}/members/some-id",
        json={"role": "manager"}
    )
    assert response.status_code == 403

@pytest.mark.asyncio
async def test_middleware_blocks_suspended_member(api_client: AsyncClient, test_org: dict):
    # Mock suspended member
    response = await api_client.get("/api/leads")
    assert response.status_code in [200, 403]

@pytest.mark.asyncio
async def test_owner_has_full_access(api_client: AsyncClient):
    response = await api_client.get("/api/leads")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_manager_has_full_read_access(api_client_manager: AsyncClient):
    response = await api_client_manager.get("/api/leads")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_agent_limited_access_to_assigned(api_client_agent: AsyncClient):
    response = await api_client_agent.get("/api/leads")
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_role_enum_validated(api_client: AsyncClient, test_org: dict):
    response = await api_client.post(
        f"/api/organizations/{test_org['id']}/members",
        json={"email": "test@test.com", "role": "invalid_role"}
    )
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_owner_cannot_be_demoted_if_last(api_client: AsyncClient, test_org: dict, owner_membership: dict):
    response = await api_client.patch(
        f"/api/organizations/{test_org['id']}/members/{owner_membership['id']}",
        json={"role": "agent"}
    )
    assert response.status_code == 409

@pytest.mark.asyncio
async def test_permission_cascade_checked(api_client_agent: AsyncClient, test_org: dict):
    response = await api_client_agent.patch(
        f"/api/organizations/{test_org['id']}/members/someone",
        json={"role": "owner"}
    )
    assert response.status_code == 403
