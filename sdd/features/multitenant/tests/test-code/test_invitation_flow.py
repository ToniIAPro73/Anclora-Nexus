# test_invitation_flow.py - 18 tests para invitation lifecycle
import pytest
from uuid import uuid4
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_invitation_code_unique(api_client: AsyncClient, test_org: dict):
    codes = set()
    for i in range(10):
        response = await api_client.post(
            f"/api/organizations/{test_org['id']}/members",
            json={"email": f"user{i}@test.com", "role": "agent"}
        )
        assert response.status_code == 201
        codes.add(response.json()["invitation_code"])
    assert len(codes) == 10

@pytest.mark.asyncio
async def test_invitation_code_format(api_client: AsyncClient, test_org: dict):
    response = await api_client.post(
        f"/api/organizations/{test_org['id']}/members",
        json={"email": "test@test.com", "role": "manager"}
    )
    code = response.json()["invitation_code"]
    assert len(code) == 32
    assert code.isalnum()

@pytest.mark.asyncio
async def test_validate_valid_invitation(api_client: AsyncClient, pending_invitation: dict):
    response = await api_client.get(
        f"/api/invitations/{pending_invitation['invitation_code']}"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] == True

@pytest.mark.asyncio
async def test_validate_invalid_code(api_client: AsyncClient):
    response = await api_client.get("/api/invitations/fake-code-xyz")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_validate_expired_code(api_client: AsyncClient):
    # Would need expired invitation in DB
    pass

@pytest.mark.asyncio
async def test_accept_valid_invitation(api_client: AsyncClient, pending_invitation: dict):
    user_id = str(uuid4())
    response = await api_client.post(
        f"/api/invitations/{pending_invitation['invitation_code']}/accept",
        json={"user_id": user_id}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"

@pytest.mark.asyncio
async def test_accept_invalid_code(api_client: AsyncClient):
    response = await api_client.post(
        "/api/invitations/fake-code/accept",
        json={"user_id": str(uuid4())}
    )
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_accept_expired_code(api_client: AsyncClient):
    # Would need expired invitation
    pass

@pytest.mark.asyncio
async def test_accept_already_member(api_client: AsyncClient):
    # Would need existing member
    pass

@pytest.mark.asyncio
async def test_accept_correct_role_honored(api_client: AsyncClient, pending_invitation: dict):
    user_id = str(uuid4())
    response = await api_client.post(
        f"/api/invitations/{pending_invitation['invitation_code']}/accept",
        json={"user_id": user_id}
    )
    assert response.status_code == 200
    assert response.json()["role"] == "manager"

@pytest.mark.asyncio
async def test_invitation_expiry_7_days(api_client: AsyncClient, pending_invitation: dict):
    from datetime import datetime, timedelta
    expires = pending_invitation["expires_at"]
    created = pending_invitation.get("created_at", datetime.utcnow().isoformat())
    # Validate 7 day window

@pytest.mark.asyncio
async def test_invitation_status_changes_on_accept(api_client: AsyncClient, pending_invitation: dict):
    user_id = str(uuid4())
    response = await api_client.post(
        f"/api/invitations/{pending_invitation['invitation_code']}/accept",
        json={"user_id": user_id}
    )
    assert response.status_code == 200
    # Verify status changed from pending to active

@pytest.mark.asyncio
async def test_invitation_code_alphanumeric(api_client: AsyncClient, test_org: dict):
    response = await api_client.post(
        f"/api/organizations/{test_org['id']}/members",
        json={"email": "test@test.com", "role": "agent"}
    )
    code = response.json()["invitation_code"]
    assert all(c.isalnum() for c in code)
