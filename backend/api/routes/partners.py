from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.api.deps import get_current_user, get_org_id
from backend.models.partner_network import PartnerNetworkUpdate, PartnerSharedOpportunityCreate
from backend.services.partner_network_service import partner_network_service


router = APIRouter()


@router.get("/network")
async def list_partner_network(
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
    relationship_status: Optional[str] = Query(None),
    service_category: Optional[str] = Query(None),
    preferred_opportunity_type: Optional[str] = Query(None),
    response_status: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> dict:
    try:
        return await partner_network_service.list_network(
            org_id=org_id,
            relationship_status=relationship_status,
            service_category=service_category,
            preferred_opportunity_type=preferred_opportunity_type,
            response_status=response_status,
            q=q,
            limit=limit,
            offset=offset,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error listing partner network: {str(e)}")


@router.get("/network/summary")
async def partner_network_summary(
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
) -> dict:
    try:
        return await partner_network_service.get_summary(org_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error loading partner network summary: {str(e)}")


@router.patch("/network/{workspace_id}")
async def update_partner_network(
    workspace_id: UUID,
    payload: PartnerNetworkUpdate,
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
) -> dict:
    result = await partner_network_service.update_network_partner(
        org_id=org_id,
        workspace_id=str(workspace_id),
        payload=payload,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Partner workspace {workspace_id} not found")
    return result


@router.post("/network/{workspace_id}/shared-opportunities", status_code=status.HTTP_201_CREATED)
async def share_opportunity_with_partner(
    workspace_id: UUID,
    payload: PartnerSharedOpportunityCreate,
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> dict:
    result = await partner_network_service.share_opportunity_with_partner(
        org_id=org_id,
        workspace_id=str(workspace_id),
        created_by_user_id=str(user.id),
        payload=payload,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Partner workspace {workspace_id} not found")
    return result
