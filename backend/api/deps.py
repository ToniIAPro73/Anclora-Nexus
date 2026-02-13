from typing import Optional
from fastapi import Header, HTTPException, Depends
from backend.services.supabase_service import supabase_service

async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Simple Supabase Auth dependency. 
    In v0, we assume the frontend sends a valid Supabase JWT.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Supabase magic link auth verification (simplified for v0)
    # The Supabase client handles JWT validation if configured with service role or anon key
    # For now, we extract the user but don't force RLS.
    try:
        # Extract token from 'Bearer <token>'
        token = authorization.split(" ")[1] if " " in authorization else authorization
        user_response = supabase_service.client.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid session")
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth error: {str(e)}")

async def get_org_id(user = Depends(get_current_user)):
    """
    Injects the fixed org_id for v0 single-tenant.
    """
    return supabase_service.fixed_org_id
