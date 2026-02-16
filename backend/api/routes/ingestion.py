from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, Depends
from backend.models.ingestion import LeadIngestionPayload, PropertyIngestionPayload
from backend.services.ingestion_service import ingestion_service
from backend.api.deps import get_current_user

router = APIRouter(prefix="/ingestion", tags=["ingestion"])

@router.post("/leads", response_model=Dict[str, Any])
async def ingest_lead(payload: LeadIngestionPayload):
    """
    Ingest a lead into the system. 
    Idempotent based on org_id, source_system, and external_id.
    """
    try:
        result = await ingestion_service.ingest_lead(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/properties", response_model=Dict[str, Any])
async def ingest_property(payload: PropertyIngestionPayload):
    """
    Ingest a property into the system.
    Idempotent based on org_id, source_system, and external_id.
    """
    try:
        result = await ingestion_service.ingest_property(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events", response_model=List[Dict[str, Any]])
async def get_events(org_id: str, current_user: Any = Depends(get_current_user)):
    """
    Get ingestion events for an organization.
    """
    # For v0, we allow any logged in user to see their org events
    # In a real scenario, we'd check if org_id matches current_user's org
    try:
        events = await ingestion_service.get_events(org_id)
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{event_id}", response_model=Dict[str, Any])
async def get_event(event_id: str, current_user: Any = Depends(get_current_user)):
    """
    Get a single ingestion event by ID.
    """
    event = await ingestion_service.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
