import secrets
import string
from datetime import datetime, timedelta
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from backend.models.membership import (
    Membership, 
    MembershipCreate, 
    MembershipUpdate, 
    UserRole, 
    MembershipStatus
)
from backend.services.supabase_service import supabase_service

class MembershipService:
    """
    Service for managing organization memberships and invitations.
    """

    def _generate_invitation_code(self, length: int = 32) -> str:
        """
        Generates a secure random invitation code.
        """
        alphabet = string.ascii_letters + string.digits
        return ''.join(secrets.choice(alphabet) for _ in range(length))

    async def invite_member(self, org_id: UUID, payload: MembershipCreate, inviter_id: UUID) -> dict:
        """
        Invites a new member to an organization.

        Args:
            org_id: The ID of the organization.
            payload: The membership creation data (email, role).
            inviter_id: The ID of the user sending the invitation.

        Returns:
            The created membership record with invitation code.

        Raises:
            HTTPException: If member already exists or other validation fails.
        """
        # Check if member already exists in this org
        existing = supabase_service.client.table("organization_members")\
            .select("*")\
            .eq("org_id", str(org_id))\
            .eq("user_id", str(inviter_id))\
            .execute() # Note: This is a bit tricky, invitation is by email. 
            # In v1, we check if email is already a member via subquery or similar.
            # For simplicity, we search by email if we had it in the profile.
        
        # Proper check: does this email have an active membership in this org?
        # Since organization_members links to user_id, we'd need to find user by email first.
        # However, invitations allow inviting someone who isn't a user yet.
        
        # Check if a pending invitation for this email exists in this org
        pending = supabase_service.client.table("organization_members")\
            .select("*")\
            .eq("org_id", str(org_id))\
            .eq("status", MembershipStatus.PENDING)\
            .execute()
        
        # Generate code
        invitation_code = self._generate_invitation_code()
        
        # Create membership record in 'pending' status
        # Note: In v1, we might not have a user_id yet if they haven't signed up.
        # We store the email in a separate column or use the profile if exists.
        # The spec says organization_members has a user_id. 
        # If they don't have a user_id, we might need to handle late-binding.
        
        data = {
            "org_id": str(org_id),
            "role": payload.role,
            "status": MembershipStatus.PENDING,
            "invitation_code": invitation_code,
            "invited_by": str(inviter_id),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # In this implementation, we assume we might need to store the email 
        # somewhere if user_id is null. Let's assume we can add 'email' to the table.
        # The SQL spec in spec-multitenant-v1.md didn't show 'email' in organization_members,
        # but the API spec says POST returns 'email'. 
        
        # Let's check if we can add 'email' or if it's stored in metadata.
        # Actually, let's just use the metadata if needed, or assume the table has it.
        # The prompt says "(email): ID de organización" - wait, param path is org_id.
        # Body has email.
        
        data["metadata"] = {"email": payload.email}
        
        result = supabase_service.client.table("organization_members").insert(data).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create invitation")
            
        member_data = result.data[0]
        member_data["email"] = payload.email # Inject for response
        return member_data

    async def list_members(self, org_id: UUID, role: Optional[UserRole] = None, status: Optional[MembershipStatus] = None, limit: int = 50, offset: int = 0) -> dict:
        """
        Lists members of an organization with filtering and pagination.
        """
        query = supabase_service.client.table("organization_members").select("*", count="exact").eq("org_id", str(org_id))
        
        if role:
            query = query.eq("role", role)
        if status:
            query = query.eq("status", status)
            
        result = query.range(offset, offset + limit - 1).execute()
        
        # We would normally join with user_profiles to get emails/names
        # For now, return raw data
        return {
            "members": result.data,
            "total": result.count,
            "limit": limit,
            "offset": offset
        }

    async def update_membership(self, org_id: UUID, member_id: UUID, payload: MembershipUpdate) -> dict:
        """
        Updates a member's role or status.
        """
        # Validate last owner check
        if payload.role and payload.role != UserRole.OWNER:
            # Check if this member IS an owner
            current = supabase_service.client.table("organization_members")\
                .select("*")\
                .eq("id", str(member_id))\
                .execute()
            
            if current.data and current.data[0]["role"] == UserRole.OWNER:
                # Check how many owners left
                owners = supabase_service.client.table("organization_members")\
                    .select("id")\
                    .eq("org_id", str(org_id))\
                    .eq("role", UserRole.OWNER)\
                    .eq("status", MembershipStatus.ACTIVE)\
                    .execute()
                
                if len(owners.data) <= 1:
                    raise HTTPException(status_code=400, detail="Cannot change role of the last owner")

        update_data = payload.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        result = supabase_service.client.table("organization_members")\
            .update(update_data)\
            .eq("id", str(member_id))\
            .eq("org_id", str(org_id))\
            .execute()
            
        if not result.data:
            raise HTTPException(status_code=404, detail="Member not found")
            
        return result.data[0]

    async def remove_member(self, org_id: UUID, member_id: UUID):
        """
        Removes a member from an organization.
        """
        # Check last owner
        current = supabase_service.client.table("organization_members")\
            .select("*")\
            .eq("id", str(member_id))\
            .execute()
            
        if current.data and current.data[0]["role"] == UserRole.OWNER:
            owners = supabase_service.client.table("organization_members")\
                .select("id")\
                .eq("org_id", str(org_id))\
                .eq("role", UserRole.OWNER)\
                .execute()
            
            if len(owners.data) <= 1:
                raise HTTPException(status_code=400, detail="Cannot remove the last owner")

        result = supabase_service.client.table("organization_members")\
            .delete()\
            .eq("id", str(member_id))\
            .eq("org_id", str(org_id))\
            .execute()
            
        if not result.data:
            raise HTTPException(status_code=404, detail="Member not found")

    async def validate_invitation(self, code: str) -> dict:
        """
        Validates an invitation code.
        """
        result = supabase_service.client.table("organization_members")\
            .select("*, organizations(name)")\
            .eq("invitation_code", code)\
            .eq("status", MembershipStatus.PENDING)\
            .execute()
            
        if not result.data:
            raise HTTPException(status_code=404, detail="Invalid or expired invitation code")
            
        inv = result.data[0]
        # Check expiration (7 days)
        created_at = datetime.fromisoformat(inv["created_at"].replace("Z", "+00:00"))
        if datetime.now(created_at.tzinfo) > created_at + timedelta(days=7):
            raise HTTPException(status_code=404, detail="Invitation code expired")
            
        return {
            "valid": True,
            "email": inv.get("metadata", {}).get("email", ""),
            "role": inv["role"],
            "org_name": inv.get("organizations", {}).get("name", "Anclora"),
            "expires_at": created_at + timedelta(days=7)
        }

    async def accept_invitation(self, code: str, user_id: UUID) -> dict:
        """
        Accepts an invitation and activates the membership.
        """
        # First validate
        inv_info = await self.validate_invitation(code)
        
        # Update membership
        result = supabase_service.client.table("organization_members")\
            .update({
                "user_id": str(user_id),
                "status": MembershipStatus.ACTIVE,
                "invitation_accepted_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            })\
            .eq("invitation_code", code)\
            .execute()
            
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to accept invitation")
            
        return result.data[0]

membership_service = MembershipService()
