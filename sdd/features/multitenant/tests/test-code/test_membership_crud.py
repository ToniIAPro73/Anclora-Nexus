import pytest
from uuid import uuid4
from unittest.mock import MagicMock, AsyncMock
from backend.models.membership import UserRole, MembershipStatus

def test_invite_member_happy_path(api_client, mock_supabase, owner_headers, test_org_id):
    headers, user_id = owner_headers
    
    # Mock verify_org_membership (called via Depends in routes)
    # Since it's a sub-call to supabase, we mock the supabase call inside verify_org_membership
    query_mock = MagicMock()
    query_mock.execute.return_value = MagicMock(data=[{"role": UserRole.OWNER, "status": MembershipStatus.ACTIVE}])
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value = query_mock
    
    # Mock invite_member service call
    insert_mock = MagicMock()
    insert_mock.execute.return_value = MagicMock(data=[{
        "id": str(uuid4()),
        "org_id": str(test_org_id),
        "role": "manager",
        "status": "pending",
        "invitation_code": "abc123xyz"
    }])
    mock_supabase.table.return_value.insert.return_value.execute = insert_mock.execute
    
    payload = {"email": "manager@test.com", "role": "manager"}
    response = api_client.post(f"/api/organizations/{test_org_id}/members", json=payload, headers=headers)
    
    assert response.status_code == 201
    assert response.json()["invitation_code"] == "abc123xyz"
    assert response.json()["status"] == "pending"

def test_invite_member_forbidden(api_client, mock_supabase, agent_headers, test_org_id):
    headers, user_id = agent_headers
    
    # Mock verify_org_membership failure (Agent cannot invite)
    query_mock = MagicMock()
    query_mock.execute.return_value = MagicMock(data=[{"role": UserRole.AGENT, "status": MembershipStatus.ACTIVE}])
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value = query_mock
    
    payload = {"email": "manager@test.com", "role": "manager"}
    response = api_client.post(f"/api/organizations/{test_org_id}/members", json=payload, headers=headers)
    
    # Middleware verify_org_membership will raise 403 because Agent doesn't have OWNER role
    assert response.status_code == 403

def test_list_members_happy_path(api_client, mock_supabase, owner_headers, test_org_id):
    headers, user_id = owner_headers
    
    # Mock verify_org_membership
    query_verify = MagicMock()
    query_verify.execute.return_value = MagicMock(data=[{"role": UserRole.OWNER, "status": MembershipStatus.ACTIVE}])
    
    # Mock list_members query
    query_list = MagicMock()
    query_list.execute.return_value = MagicMock(data=[
        {"id": str(uuid4()), "role": "owner"},
        {"id": str(uuid4()), "role": "agent"}
    ], count=2)
    
    # Side effects for different table calls
    def table_side_effect(table_name):
        if table_name == "organization_members":
            m = MagicMock()
            m.select.return_value.eq.return_value.eq.return_value = query_verify
            m.select.return_value.eq.return_value.range.return_value.execute = query_list.execute
            return m
        return MagicMock()

    mock_supabase.table.side_effect = table_side_effect
    
    response = api_client.get(f"/api/organizations/{test_org_id}/members", headers=headers)
    
    assert response.status_code == 200
    assert len(response.json()["members"]) == 2
    assert response.json()["total"] == 2

def test_update_member_role(api_client, mock_supabase, owner_headers, test_org_id):
    headers, user_id = owner_headers
    member_id = uuid4()
    
    # Mock verify_org_membership
    query_verify = MagicMock()
    query_verify.execute.return_value = MagicMock(data=[{"role": UserRole.OWNER, "status": MembershipStatus.ACTIVE}])
    
    # Mock update query
    update_mock = MagicMock()
    update_mock.execute.return_value = MagicMock(data=[{"id": str(member_id), "role": "manager"}])
    
    def table_side_effect(table_name):
        m = MagicMock()
        if table_name == "organization_members":
             m.select.return_value.eq.return_value.eq.return_value = query_verify
             # Mock the 'current' check in service
             m.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"role": "agent"}])
             m.update.return_value.eq.return_value.eq.return_value.execute = update_mock.execute
             return m
        return m

    mock_supabase.table.side_effect = table_side_effect
    
    payload = {"role": "manager"}
    response = api_client.patch(f"/api/organizations/{test_org_id}/members/{member_id}", json=payload, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["role"] == "manager"

def test_remove_member_happy_path(api_client, mock_supabase, owner_headers, test_org_id):
    headers, user_id = owner_headers
    member_id = uuid4()
    
    # Mock verify_org_membership
    query_verify = MagicMock()
    query_verify.execute.return_value = MagicMock(data=[{"role": UserRole.OWNER, "status": MembershipStatus.ACTIVE}])
    
    # Mock delete query
    delete_mock = MagicMock()
    delete_mock.execute.return_value = MagicMock(data=[{"id": str(member_id)}])
    
    def table_side_effect(table_name):
        m = MagicMock()
        if table_name == "organization_members":
             m.select.return_value.eq.return_value.eq.return_value = query_verify
             # Mock last owner check
             m.select.return_value.eq.return_value.execute.return_value = MagicMock(data=[{"role": "agent"}])
             m.delete.return_value.eq.return_value.eq.return_value.execute = delete_mock.execute
             return m
        return m

    mock_supabase.table.side_effect = table_side_effect
    
    response = api_client.delete(f"/api/organizations/{test_org_id}/members/{member_id}", headers=headers)
    
    assert response.status_code == 204

def test_validate_invitation(api_client, mock_supabase):
    code = "valid-code"
    
    query_mock = MagicMock()
    query_mock.execute.return_value = MagicMock(data=[{
        "invitation_code": code,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "role": "agent",
        "metadata": {"email": "test@test.com"},
        "organizations": {"name": "Test Org"}
    }])
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value = query_mock
    
    response = api_client.get(f"/api/invitations/{code}")
    
    assert response.status_code == 200
    assert response.json()["valid"] is True
    assert response.json()["org_name"] == "Test Org"

def test_accept_invitation_happy_path(api_client, mock_supabase, agent_headers):
    headers, user_id = agent_headers
    code = "valid-code"
    
    # Mock validate
    query_val = MagicMock()
    query_val.execute.return_value = MagicMock(data=[{
        "invitation_code": code,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "role": "agent",
        "organizations": {"name": "Test Org"}
    }])
    
    # Mock update
    update_mock = MagicMock()
    update_mock.execute.return_value = MagicMock(data=[{"id": str(uuid4()), "status": "active"}])
    
    def table_side_effect(table_name):
        m = MagicMock()
        if table_name == "organization_members":
             m.select.return_value.eq.return_value.eq.return_value = query_val
             m.update.return_value.eq.return_value.execute = update_mock.execute
             return m
        return m

    mock_supabase.table.side_effect = table_side_effect
    
    payload = {"user_id": str(user_id)}
    response = api_client.post(f"/api/invitations/{code}/accept", json=payload, headers=headers)
    
    assert response.status_code == 200
    assert response.json()["status"] == "active"

# Additional CRUD Scenarios to reach 32 tests

@pytest.mark.parametrize("role", [UserRole.OWNER, UserRole.MANAGER, UserRole.AGENT])
def test_invite_all_roles_happy_path(api_client, mock_supabase, owner_headers, test_org_id, role):
    headers, user_id = owner_headers
    query_mock = MagicMock()
    query_mock.execute.return_value = MagicMock(data=[{"role": UserRole.OWNER, "status": MembershipStatus.ACTIVE}])
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value = query_mock
    
    insert_mock = MagicMock()
    insert_mock.execute.return_value = MagicMock(data=[{"id": str(uuid4()), "role": role, "status": "pending", "invitation_code": "code"}])
    mock_supabase.table.return_value.insert.return_value.execute = insert_mock.execute
    
    payload = {"email": f"{role}@test.com", "role": role}
    response = api_client.post(f"/api/organizations/{test_org_id}/members", json=payload, headers=headers)
    assert response.status_code == 201

def test_invite_member_duplicate_conflict(api_client, mock_supabase, owner_headers, test_org_id):
    headers, user_id = owner_headers
    # Mocking a conflict (e.g. from service check)
    with patch("backend.services.membership_service.membership_service.invite_member", side_effect=HTTPException(status_code=409, detail="Already exists")):
        payload = {"email": "duplicate@test.com", "role": "agent"}
        response = api_client.post(f"/api/organizations/{test_org_id}/members", json=payload, headers=headers)
        assert response.status_code == 409

def test_update_member_invalid_role(api_client, mock_supabase, owner_headers, test_org_id):
    headers, user_id = owner_headers
    member_id = uuid4()
    payload = {"role": "superadmin"} # Invalid enum value
    response = api_client.patch(f"/api/organizations/{test_org_id}/members/{member_id}", json=payload, headers=headers)
    assert response.status_code == 422

def test_remove_last_owner_conflict(api_client, mock_supabase, owner_headers, test_org_id):
    headers, user_id = owner_headers
    member_id = uuid4()
    
    # Mock last owner check failing
    with patch("backend.services.membership_service.membership_service.remove_member", side_effect=HTTPException(status_code=400, detail="Cannot remove the last owner")):
        response = api_client.delete(f"/api/organizations/{test_org_id}/members/{member_id}", headers=headers)
        assert response.status_code == 400

# Pagination tests
@pytest.mark.parametrize("limit,offset", [(10, 0), (20, 10), (50, 40)])
def test_list_members_pagination(api_client, mock_supabase, owner_headers, test_org_id, limit, offset):
    headers, user_id = owner_headers
    query_list = MagicMock()
    query_list.execute.return_value = MagicMock(data=[], count=100)
    
    mock_supabase.table.return_value.select.return_value.eq.return_value.range.return_value.execute = query_list.execute
    
    response = api_client.get(f"/api/organizations/{test_org_id}/members?limit={limit}&offset={offset}", headers=headers)
    assert response.status_code == 200

# Error cases for validation/accept
def test_validate_invitation_not_found(api_client, mock_supabase):
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value = MagicMock(data=[])
    response = api_client.get("/api/invitations/fake-code")
    assert response.status_code == 404

def test_accept_invitation_missing_payload(api_client, owner_headers):
    headers, user_id = owner_headers
    response = api_client.post("/api/invitations/code/accept", json={}, headers=headers)
    assert response.status_code == 422
