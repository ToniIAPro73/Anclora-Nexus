from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.api.deps import get_org_id, get_current_user
from backend.models.feed_orchestrator import (
    FeedChannelConfigResponse,
    FeedChannelConfigUpdate,
    FeedPublishRequest,
    FeedPublishResponse,
    FeedRunListResponse,
    FeedValidationResponse,
    FeedWorkspaceResponse,
)
from backend.services.feed_orchestrator_service import feed_orchestrator_service

router = APIRouter()


@router.get("/workspace", response_model=FeedWorkspaceResponse)
async def get_feed_workspace(
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
) -> FeedWorkspaceResponse:
    try:
        return await feed_orchestrator_service.get_workspace(org_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading feed workspace: {str(e)}",
        )


@router.post("/channels/{channel}/validate", response_model=FeedValidationResponse)
async def validate_channel(
    channel: str,
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
) -> FeedValidationResponse:
    normalized_channel = channel.lower().strip()
    if normalized_channel not in feed_orchestrator_service.CHANNELS:
        raise HTTPException(status_code=404, detail=f"Channel '{channel}' not found")
    try:
        return await feed_orchestrator_service.validate_channel(org_id, normalized_channel)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error validating channel: {str(e)}",
        )


@router.get("/channels/{channel}/config", response_model=FeedChannelConfigResponse)
async def get_channel_config(
    channel: str,
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
) -> FeedChannelConfigResponse:
    normalized_channel = channel.lower().strip()
    if normalized_channel not in feed_orchestrator_service.CHANNELS:
        raise HTTPException(status_code=404, detail=f"Channel '{channel}' not found")
    try:
        cfg = await feed_orchestrator_service.get_channel_config(org_id, normalized_channel)
        return FeedChannelConfigResponse(**cfg)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading channel config: {str(e)}",
        )


@router.patch("/channels/{channel}/config", response_model=FeedChannelConfigResponse)
async def update_channel_config(
    channel: str,
    payload: FeedChannelConfigUpdate,
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
) -> FeedChannelConfigResponse:
    normalized_channel = channel.lower().strip()
    if normalized_channel not in feed_orchestrator_service.CHANNELS:
        raise HTTPException(status_code=404, detail=f"Channel '{channel}' not found")
    try:
        cfg = await feed_orchestrator_service.update_channel_config(
            org_id=org_id,
            channel=normalized_channel,
            is_enabled=payload.is_enabled,
            max_items_per_run=payload.max_items_per_run,
            rules_json=payload.rules_json,
        )
        return FeedChannelConfigResponse(**cfg)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating channel config: {str(e)}",
        )


@router.post("/channels/{channel}/publish", response_model=FeedPublishResponse)
async def publish_channel(
    channel: str,
    payload: FeedPublishRequest,
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
) -> FeedPublishResponse:
    normalized_channel = channel.lower().strip()
    if normalized_channel not in feed_orchestrator_service.CHANNELS:
        raise HTTPException(status_code=404, detail=f"Channel '{channel}' not found")
    try:
        return await feed_orchestrator_service.publish_channel(
            org_id=org_id,
            channel=normalized_channel,
            dry_run=payload.dry_run,
            max_items=payload.max_items,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error publishing channel: {str(e)}",
        )


@router.get("/runs", response_model=FeedRunListResponse)
async def list_runs(
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
    channel: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
) -> FeedRunListResponse:
    normalized_channel = channel.lower().strip() if channel else None
    if normalized_channel and normalized_channel not in feed_orchestrator_service.CHANNELS:
        raise HTTPException(status_code=404, detail=f"Channel '{channel}' not found")
    try:
        items, total = await feed_orchestrator_service.list_runs(
            org_id=org_id,
            channel=normalized_channel,
            limit=limit,
        )
        return FeedRunListResponse(items=items, total=total)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading feed runs: {str(e)}",
        )
