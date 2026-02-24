from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.api.deps import get_current_user, get_org_id
from backend.models.automation import (
    AlertListResponse,
    DryRunRequest,
    DryRunResponse,
    ExecuteRequest,
    ExecuteResponse,
    ExecutionLogResponse,
    RuleCreateRequest,
    RuleListResponse,
    RuleResponse,
    RuleUpdateRequest,
)
from backend.services.automation_service import automation_service

router = APIRouter()


@router.get("/rules", response_model=RuleListResponse)
async def list_rules(
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> RuleListResponse:
    return await automation_service.list_rules(org_id=org_id, user_id=str(user.id))


@router.post("/rules", response_model=RuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(
    payload: RuleCreateRequest,
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> RuleResponse:
    return await automation_service.create_rule(org_id=org_id, user_id=str(user.id), payload=payload)


@router.patch("/rules/{rule_id}", response_model=RuleResponse)
async def update_rule(
    rule_id: UUID,
    payload: RuleUpdateRequest,
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> RuleResponse:
    result = await automation_service.update_rule(
        org_id=org_id,
        user_id=str(user.id),
        rule_id=str(rule_id),
        payload=payload,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RULE_NOT_FOUND")
    return result


@router.post("/rules/{rule_id}/dry-run", response_model=DryRunResponse)
async def dry_run_rule(
    rule_id: UUID,
    payload: DryRunRequest,
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> DryRunResponse:
    result = await automation_service.dry_run(
        org_id=org_id,
        user_id=str(user.id),
        rule_id=str(rule_id),
        payload=payload,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RULE_NOT_FOUND")
    return result


@router.post("/rules/{rule_id}/execute", response_model=ExecuteResponse)
async def execute_rule(
    rule_id: UUID,
    payload: ExecuteRequest,
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> ExecuteResponse:
    result = await automation_service.execute(
        org_id=org_id,
        user_id=str(user.id),
        rule_id=str(rule_id),
        payload=payload,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="RULE_NOT_FOUND")
    return result


@router.get("/executions", response_model=ExecutionLogResponse)
async def list_executions(
    status_filter: Optional[str] = Query(None, alias="status"),
    rule_id: Optional[UUID] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> ExecutionLogResponse:
    return await automation_service.list_executions(
        org_id=org_id,
        user_id=str(user.id),
        execution_status=status_filter,
        rule_id=str(rule_id) if rule_id else None,
        limit=limit,
        offset=offset,
    )


@router.get("/alerts", response_model=AlertListResponse)
async def list_alerts(
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> AlertListResponse:
    return await automation_service.list_alerts(org_id=org_id, user_id=str(user.id))


@router.post("/alerts/{alert_id}/ack", status_code=status.HTTP_200_OK)
async def acknowledge_alert(
    alert_id: UUID,
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> dict:
    ok = await automation_service.acknowledge_alert(
        org_id=org_id,
        user_id=str(user.id),
        alert_id=str(alert_id),
    )
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ALERT_NOT_FOUND")
    return {"ok": True}
