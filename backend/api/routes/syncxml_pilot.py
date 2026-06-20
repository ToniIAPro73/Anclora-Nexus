from fastapi import APIRouter, Depends, HTTPException, status

from backend.api.deps import get_org_id, require_access_request_reviewer
from backend.services.syncxml_pilot_service import (
    SyncXmlApprovePayload,
    SyncXmlMoreInfoPayload,
    SyncXmlRejectPayload,
    syncxml_pilot_service,
)

router = APIRouter()


@router.post("/{request_id}/approve")
async def approve_syncxml_pilot(
    request_id: str,
    payload: SyncXmlApprovePayload,
    org_id: str = Depends(get_org_id),
    current_user=Depends(require_access_request_reviewer),
):
    try:
        return await syncxml_pilot_service.approve_manual(
            org_id=org_id,
            request_id=request_id,
            reviewer_id=str(current_user.id),
            payload=payload,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("/{request_id}/reject")
async def reject_syncxml_pilot(
    request_id: str,
    payload: SyncXmlRejectPayload,
    org_id: str = Depends(get_org_id),
    current_user=Depends(require_access_request_reviewer),
):
    try:
        return await syncxml_pilot_service.reject_manual(
            org_id=org_id,
            request_id=request_id,
            reviewer_id=str(current_user.id),
            payload=payload,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("/{request_id}/request-more-info")
async def request_more_info_syncxml_pilot(
    request_id: str,
    payload: SyncXmlMoreInfoPayload,
    org_id: str = Depends(get_org_id),
    current_user=Depends(require_access_request_reviewer),
):
    try:
        return await syncxml_pilot_service.request_more_info_manual(
            org_id=org_id,
            request_id=request_id,
            reviewer_id=str(current_user.id),
            payload=payload,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
