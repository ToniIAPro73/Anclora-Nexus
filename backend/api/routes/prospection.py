"""
Prospection & Buyer Matching API Routes.
Feature: ANCLORA-PBM-001

Endpoints for properties, buyers, matches, and activity logging.
All filtered by org_id for isolation.
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from backend.api.deps import get_org_id
from backend.models.prospection import (
    ActivityCreate,
    ActivityList,
    BuyerCreate,
    BuyerList,
    BuyerUpdate,
    MatchList,
    MatchUpdate,
    PropertyCreate,
    PropertyList,
    PropertyUpdate,
    RecomputeRequest,
    RecomputeResponse,
)
from backend.services.prospection_service import prospection_service

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
# PROPERTIES
# ═══════════════════════════════════════════════════════════════════════════════


@router.post("/properties", status_code=status.HTTP_201_CREATED)
async def create_property(
    data: PropertyCreate,
    org_id: str = Depends(get_org_id),
) -> dict:
    """
    Create a new prospected property.

    Automatically computes high_ticket_score on creation.
    Source must be from the allowed list (compliance).
    """
    try:
        result = await prospection_service.create_property(org_id, data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating property: {str(e)}",
        )


@router.get("/properties", response_model=PropertyList)
async def list_properties(
    org_id: str = Depends(get_org_id),
    zone: Optional[str] = Query(None, description="Filter by zone"),
    property_status: Optional[str] = Query(None, alias="status", description="Filter by status"),
    min_score: Optional[float] = Query(None, ge=0, le=100, description="Minimum high_ticket_score"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> dict:
    """List prospected properties ordered by high_ticket_score descending."""
    return await prospection_service.list_properties(
        org_id=org_id,
        zone=zone,
        status=property_status,
        min_score=min_score,
        limit=limit,
        offset=offset,
    )


@router.patch("/properties/{property_id}")
async def update_property(
    property_id: UUID,
    data: PropertyUpdate,
    org_id: str = Depends(get_org_id),
) -> dict:
    """Update a prospected property."""
    result = await prospection_service.update_property(
        org_id, str(property_id), data
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property {property_id} not found",
        )
    return result


@router.post("/properties/{property_id}/score")
async def rescore_property(
    property_id: UUID,
    org_id: str = Depends(get_org_id),
) -> dict:
    """Recalculate high_ticket_score for a property."""
    result = await prospection_service.rescore_property(
        org_id, str(property_id)
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property {property_id} not found",
        )
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# BUYERS
# ═══════════════════════════════════════════════════════════════════════════════


@router.post("/buyers", status_code=status.HTTP_201_CREATED)
async def create_buyer(
    data: BuyerCreate,
    org_id: str = Depends(get_org_id),
) -> dict:
    """Create a new buyer profile."""
    try:
        result = await prospection_service.create_buyer(org_id, data)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating buyer: {str(e)}",
        )


@router.get("/buyers", response_model=BuyerList)
async def list_buyers(
    org_id: str = Depends(get_org_id),
    buyer_status: Optional[str] = Query(None, alias="status"),
    min_budget: Optional[float] = Query(None, ge=0),
    max_budget: Optional[float] = Query(None, ge=0),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> dict:
    """List buyer profiles ordered by motivation_score descending."""
    return await prospection_service.list_buyers(
        org_id=org_id,
        status=buyer_status,
        min_budget=min_budget,
        max_budget=max_budget,
        limit=limit,
        offset=offset,
    )


@router.patch("/buyers/{buyer_id}")
async def update_buyer(
    buyer_id: UUID,
    data: BuyerUpdate,
    org_id: str = Depends(get_org_id),
) -> dict:
    """Update a buyer profile."""
    result = await prospection_service.update_buyer(
        org_id, str(buyer_id), data
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Buyer {buyer_id} not found",
        )
    return result


# ═══════════════════════════════════════════════════════════════════════════════
# MATCHES
# ═══════════════════════════════════════════════════════════════════════════════


@router.post("/matches/recompute", response_model=RecomputeResponse)
async def recompute_matches(
    data: Optional[RecomputeRequest] = None,
    org_id: str = Depends(get_org_id),
) -> RecomputeResponse:
    """
    Recompute match scores for all or filtered property-buyer pairs.

    Creates new matches for unmatched pairs and updates existing scores.
    """
    property_ids = [str(pid) for pid in data.property_ids] if data and data.property_ids else None
    buyer_ids = [str(bid) for bid in data.buyer_ids] if data and data.buyer_ids else None

    return await prospection_service.recompute_matches(
        org_id=org_id,
        property_ids=property_ids,
        buyer_ids=buyer_ids,
    )


@router.get("/matches", response_model=MatchList)
async def list_matches(
    org_id: str = Depends(get_org_id),
    match_status: Optional[str] = Query(None, alias="status"),
    min_score: Optional[float] = Query(None, ge=0, le=100),
    property_id: Optional[UUID] = Query(None),
    buyer_id: Optional[UUID] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> dict:
    """List matches ordered by match_score descending."""
    return await prospection_service.list_matches(
        org_id=org_id,
        status=match_status,
        min_score=min_score,
        property_id=str(property_id) if property_id else None,
        buyer_id=str(buyer_id) if buyer_id else None,
        limit=limit,
        offset=offset,
    )


@router.patch("/matches/{match_id}")
async def update_match(
    match_id: UUID,
    data: MatchUpdate,
    org_id: str = Depends(get_org_id),
) -> dict:
    """Update match status, commission estimate, or notes."""
    result = await prospection_service.update_match(
        org_id, str(match_id), data
    )
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match {match_id} not found",
        )
    return result


@router.post("/matches/{match_id}/activity", status_code=status.HTTP_201_CREATED)
async def log_match_activity(
    match_id: UUID,
    data: ActivityCreate,
    org_id: str = Depends(get_org_id),
) -> dict:
    """Log a commercial activity for a match (call, viewing, offer, etc.)."""
    try:
        result = await prospection_service.log_activity(
            org_id=org_id,
            match_id=str(match_id),
            data=data,
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get("/matches/{match_id}/activities", response_model=ActivityList)
async def list_match_activities(
    match_id: UUID,
    org_id: str = Depends(get_org_id),
) -> dict:
    """List all activities for a specific match."""
    return await prospection_service.list_activities(
        org_id=org_id,
        match_id=str(match_id),
    )
