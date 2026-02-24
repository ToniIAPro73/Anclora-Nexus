from fastapi import APIRouter, Depends, Query

from backend.api.deps import get_current_user, get_org_id
from backend.models.source_observatory import (
    ObservatoryOverviewResponse,
    ObservatoryRankingResponse,
    ObservatoryTrendsResponse,
)
from backend.services.source_observatory_service import source_observatory_service

router = APIRouter()


@router.get("/overview", response_model=ObservatoryOverviewResponse)
async def get_source_overview(
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> ObservatoryOverviewResponse:
    return await source_observatory_service.get_overview(org_id=org_id, user_id=str(user.id))


@router.get("/ranking", response_model=ObservatoryRankingResponse)
async def get_source_ranking(
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> ObservatoryRankingResponse:
    return await source_observatory_service.get_ranking(org_id=org_id, user_id=str(user.id))


@router.get("/trends", response_model=ObservatoryTrendsResponse)
async def get_source_trends(
    months: int = Query(6, ge=3, le=12),
    org_id: str = Depends(get_org_id),
    user=Depends(get_current_user),
) -> ObservatoryTrendsResponse:
    return await source_observatory_service.get_trends(org_id=org_id, user_id=str(user.id), months=months)
