from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from uuid import UUID

from backend.api.deps import get_current_user, get_org_id, check_budget_hard_stop
from backend.models.dq import (
    DQIssuesResponse, DQMetricsResponse, DQResolveRequest,
    EntityType, IssueStatus
)
from backend.services.dq_service import dq_service

router = APIRouter()

@router.get("/issues", response_model=DQIssuesResponse)
async def get_issues(
    entity_type: Optional[EntityType] = None,
    status: IssueStatus = IssueStatus.OPEN,
    limit: int = 50,
    offset: int = 0,
    org_id: UUID = Depends(get_org_id)
):
    """
    Get a list of quality issues for the current organization.
    """
    return await dq_service.get_issues(
        org_id=str(org_id),
        entity_type=entity_type,
        status=status,
        limit=limit,
        offset=offset
    )

@router.get("/metrics", response_model=DQMetricsResponse)
async def get_metrics(org_id: UUID = Depends(get_org_id)):
    """
    Get aggregated data quality metrics for the current organization.
    """
    return await dq_service.get_metrics(str(org_id))

@router.post("/resolve")
async def resolve_candidate(
    request: DQResolveRequest,
    org_id: UUID = Depends(get_org_id),
    current_user = Depends(get_current_user)
):
    """
    Resolve a potential duplicate candidate (approve merge, reject, etc.).
    """
    try:
        return await dq_service.resolve_candidate(
            org_id=str(org_id),
            candidate_id=request.candidate_id,
            action=request.action,
            actor_user_id=current_user.id,
            details=request.details
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recompute")
async def recompute_dq(
    background_tasks: BackgroundTasks,
    org_id: UUID = Depends(get_org_id),
    _ = Depends(check_budget_hard_stop)
):
    """
    Trigger a full re-computation of quality issues and duplication candidates.
    This is an expensive operation and runs in the background.
    """
    background_tasks.add_task(dq_service.recompute_all, str(org_id))
    return {"status": "accepted", "message": "Recompute task queued in background"}
