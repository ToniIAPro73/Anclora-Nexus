from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.api.deps import get_current_user, get_org_id, require_access_request_reviewer
from backend.models.access_requests import (
    AccessRequestAuditEventResponse,
    AccessRequestProduct,
    AccessRequestRejectDecision,
    AccessRequestResponse,
    AccessRequestReviewDecision,
    AccessRequestSource,
    AccessRequestStatus,
)
from backend.services.access_request_service import (
    AccessRequestInvalidTransitionError,
    AccessRequestNotFoundError,
    access_request_service,
)

router = APIRouter()


@router.get("", response_model=list[AccessRequestResponse])
async def list_access_requests(
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
    status_filter: Optional[AccessRequestStatus] = Query(None, alias="status"),
    product: Optional[AccessRequestProduct] = Query(None),
    source: Optional[AccessRequestSource] = Query(None),
    email: Optional[str] = Query(None),
    created_from: Optional[str] = Query(None),
    created_to: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
):
    try:
        return await access_request_service.list_requests(
            org_id=org_id,
            status=status_filter,
            product=product,
            source=source,
            email=email,
            created_from=created_from,
            created_to=created_to,
            limit=limit,
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{request_id}/audit", response_model=list[AccessRequestAuditEventResponse])
async def list_access_request_audit(
    request_id: str,
    org_id: str = Depends(get_org_id),
    _current_user=Depends(require_access_request_reviewer),
):
    try:
        return await access_request_service.list_audit_events(
            org_id=org_id,
            request_id=request_id,
        )
    except AccessRequestNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{request_id}", response_model=AccessRequestResponse)
async def get_access_request(
    request_id: str,
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
):
    try:
        return await access_request_service.get_request(org_id=org_id, request_id=request_id)
    except AccessRequestNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{request_id}/approve", response_model=AccessRequestResponse)
async def approve_access_request(
    request_id: str,
    decision: AccessRequestReviewDecision,
    org_id: str = Depends(get_org_id),
    current_user=Depends(require_access_request_reviewer),
):
    try:
        return await access_request_service.approve_request(
            org_id=org_id,
            request_id=request_id,
            decision=decision,
            reviewer_id=current_user.id,
        )
    except AccessRequestNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AccessRequestInvalidTransitionError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{request_id}/reject", response_model=AccessRequestResponse)
async def reject_access_request(
    request_id: str,
    decision: AccessRequestRejectDecision,
    org_id: str = Depends(get_org_id),
    current_user=Depends(require_access_request_reviewer),
):
    try:
        return await access_request_service.reject_request(
            org_id=org_id,
            request_id=request_id,
            decision=decision,
            reviewer_id=current_user.id,
        )
    except AccessRequestNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except AccessRequestInvalidTransitionError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
