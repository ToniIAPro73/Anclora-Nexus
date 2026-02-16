from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException, Depends
from backend.models.ingestion import LeadIngestionPayload, PropertyIngestionPayload
from backend.services.ingestion_service import ingestion_service
from backend.api.deps import get_org_id

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
async def get_events(limit: int = 50, org_id: str = Depends(get_org_id)):
    """
    Get ingestion events for an organization.
    """
    try:
        events = await ingestion_service.get_events(org_id, limit=limit)
        return events
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{event_id}", response_model=Dict[str, Any])
async def get_event(event_id: str, org_id: str = Depends(get_org_id)):
    """
    Get a single ingestion event by ID.
    """
    event = await ingestion_service.get_event_by_id(event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if str(event.get("org_id")) != str(org_id):
        raise HTTPException(status_code=403, detail="Forbidden")
    return event
