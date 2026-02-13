from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from backend.main import get_current_user
from backend.api.middleware import verify_org_membership
from backend.models.membership import (
    Membership,
    MembershipCreate,
    MembershipUpdate,
    MembershipList,
    InvitationValidateResponse,
    InvitationAcceptRequest,
    UserRole,
    MembershipStatus
)
from backend.services.membership_service import membership_service

router = APIRouter()

@router.post("/organizations/{org_id}/members", response_model=Membership, status_code=status.HTTP_201_CREATED)
async def invite_member(
    org_id: UUID,
    payload: MembershipCreate,
    user=Depends(get_current_user)
):
    """
    Invites a new member to the organization. Requires Owner role.
    """
    # Verify requester is an Owner in this org
    await verify_org_membership(user.id, org_id, required_role=UserRole.OWNER)
    
    return await membership_service.invite_member(org_id, payload, user.id)

@router.get("/organizations/{org_id}/members", response_model=MembershipList)
async def list_members(
    org_id: UUID,
    status: Optional[MembershipStatus] = Query(None),
    role: Optional[UserRole] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user=Depends(get_current_user)
):
    """
    Lists all members of an organization. Requires Owner or Manager role.
    """
    # Verify requester is at least a Manager in this org
    await verify_org_membership(user.id, org_id, required_role=UserRole.MANAGER)
    
    return await membership_service.list_members(org_id, role, status, limit, offset)

@router.patch("/organizations/{org_id}/members/{member_id}", response_model=Membership)
async def update_member(
    org_id: UUID,
    member_id: UUID,
    payload: MembershipUpdate,
    user=Depends(get_current_user)
):
    """
    Updates a member's role or status. Requires Owner role.
    """
    # Verify requester is an Owner in this org
    await verify_org_membership(user.id, org_id, required_role=UserRole.OWNER)
    
    return await membership_service.update_membership(org_id, member_id, payload)

@router.delete("/organizations/{org_id}/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_member(
    org_id: UUID,
    member_id: UUID,
    user=Depends(get_current_user)
):
    """
    Removes a member from the organization. Requires Owner role.
    """
    # Verify requester is an Owner in this org
    await verify_org_membership(user.id, org_id, required_role=UserRole.OWNER)
    
    await membership_service.remove_member(org_id, member_id)
    return None

@router.get("/invitations/{code}", response_model=InvitationValidateResponse)
async def validate_invitation(code: str):
    """
    Validates an invitation code (Public endpoint).
    """
    return await membership_service.validate_invitation(code)

@router.post("/invitations/{code}/accept", response_model=Membership)
async def accept_invitation(
    code: str,
    payload: InvitationAcceptRequest,
    user=Depends(get_current_user)
):
    """
    Accepts an invitation and links it to the authenticated user.
    """
    # Simple validation: user_id in payload must match authenticated user
    if str(payload.user_id) != str(user.id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authenticated user must match invitation recipient"
        )
        
    return await membership_service.accept_invitation(code, user.id)
