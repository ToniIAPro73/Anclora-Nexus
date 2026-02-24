from fastapi import APIRouter, Depends, Query

from backend.api.deps import get_current_user, get_org_id
from backend.models.command_center import (
    CommandCenterSnapshotResponse,
    CommandCenterTrendsResponse,
)
from backend.services.command_center_service import command_center_service

router = APIRouter()


@router.get("/snapshot", response_model=CommandCenterSnapshotResponse)
async def get_command_center_snapshot(
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> CommandCenterSnapshotResponse:
    return await command_center_service.get_snapshot(org_id=org_id, user_id=str(user.id))


@router.get("/trends", response_model=CommandCenterTrendsResponse)
async def get_command_center_trends(
    months: int = Query(6, ge=3, le=12),
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> CommandCenterTrendsResponse:
    return await command_center_service.get_trends(org_id=org_id, user_id=str(user.id), months=months)
