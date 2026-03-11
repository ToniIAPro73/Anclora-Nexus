from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.api.deps import get_current_user, get_org_id
from backend.models.partner_admissions import PartnerAdmissionReview
from backend.services.partner_admission_service import partner_admission_service


router = APIRouter()


@router.get("/admissions")
async def list_partner_admissions(
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
    status_filter: Optional[str] = Query(None, alias="status"),
    service_category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
    limit: int = Query(25, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> dict:
    try:
        return await partner_admission_service.list_admissions(
            org_id=org_id,
            status=status_filter,
            service_category=service_category,
            query=q,
            limit=limit,
            offset=offset,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error listing admissions: {str(e)}")


@router.get("/admissions/summary")
async def partner_admissions_summary(
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
) -> dict:
    try:
        return await partner_admission_service.get_summary(org_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error loading summary: {str(e)}")


@router.patch("/admissions/{admission_id}")
async def review_partner_admission(
    admission_id: UUID,
    payload: PartnerAdmissionReview,
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> dict:
    result = await partner_admission_service.review_admission(
        org_id=org_id,
        admission_id=str(admission_id),
        reviewer_user_id=str(user.id),
        payload=payload,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Partner admission {admission_id} not found")
    return result
