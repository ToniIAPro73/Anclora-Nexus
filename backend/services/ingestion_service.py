import hashlib
import json
from datetime import datetime
from typing import Any, Dict, List, Optional

from backend.models.ingestion import (
    EntityType,
    IngestionEvent,
    IngestionStatus,
    LeadIngestionPayload,
    PropertyIngestionPayload,
)
from backend.services.supabase_service import supabase_service

class IngestionService:
    def _generate_dedupe_key(self, org_id: str, entity_type: str, source_system: str, external_id: str) -> str:
        """Generates a unique dedupe key for an ingestion item."""
        base = f"{org_id}:{entity_type}:{source_system}:{external_id}"
        return hashlib.sha256(base.encode()).hexdigest()

    async def ingest_lead(self, payload: LeadIngestionPayload) -> Dict[str, Any]:
        dedupe_key = self._generate_dedupe_key(
            payload.org_id, "lead", payload.source_system.value, payload.external_id
        )

        # 1. Check for duplicate
        # For v0, we check the ingestion_events table
        # We use direct client access as the service methods update failed
        existing = supabase_service.client.table("ingestion_events").select("*").eq("dedupe_key", dedupe_key).execute()
        
        if existing.data:
            event_data = {
                "org_id": payload.org_id,
                "entity_type": EntityType.LEAD,
                "external_id": payload.external_id,
                "connector_name": f"{payload.source_system.value}:{payload.source_channel.value}",
                "status": IngestionStatus.DUPLICATE,
                "message": "Duplicate lead ignored",
                "payload": payload.dict(),
                "dedupe_key": dedupe_key,
                "processed_at": datetime.utcnow().isoformat()
            }
            supabase_service.client.table("ingestion_events").insert(event_data).execute()
            return {"status": "duplicate", "dedupe_key": dedupe_key}

        try:
            # 2. Insert into leads
            lead_data = {
                "org_id": payload.org_id,
                "name": payload.name,
                "email": str(payload.email) if payload.email else None,
                "phone": payload.phone,
                "budget": payload.budget,
                "notes": payload.notes,
                "source": payload.source_system.value,
                "source_channel": payload.source_channel.value,
                "source_detail": payload.source_detail,
                "source_url": payload.source_url,
                "source_referrer": payload.source_referrer,
                "captured_at": payload.captured_at.isoformat(),
                "metadata_json": payload.metadata,
                "status": "new"
            }
            # We use supabase_service.insert_lead if it matches the schema, but we might need all fields
            supabase_service.client.table("leads").insert(lead_data).execute()

            # 3. Log success event
            event_data = {
                "org_id": payload.org_id,
                "entity_type": EntityType.LEAD,
                "external_id": payload.external_id,
                "connector_name": f"{payload.source_system.value}:{payload.source_channel.value}",
                "status": IngestionStatus.SUCCESS,
                "message": "Lead ingested successfully",
                "payload": payload.dict(),
                "dedupe_key": dedupe_key,
                "processed_at": datetime.utcnow().isoformat()
            }
            supabase_service.client.table("ingestion_events").insert(event_data).execute()
            
            return {"status": "success", "dedupe_key": dedupe_key}

        except Exception as e:
            # 4. Log error event
            event_data = {
                "org_id": payload.org_id,
                "entity_type": EntityType.LEAD,
                "external_id": payload.external_id,
                "connector_name": f"{payload.source_system.value}:{payload.source_channel.value}",
                "status": IngestionStatus.ERROR,
                "message": str(e),
                "payload": payload.dict(),
                "error_detail": {"error": str(e)},
                "dedupe_key": dedupe_key,
                "processed_at": datetime.utcnow().isoformat()
            }
            supabase_service.client.table("ingestion_events").insert(event_data).execute()
            raise e

    async def ingest_property(self, payload: PropertyIngestionPayload) -> Dict[str, Any]:
        dedupe_key = self._generate_dedupe_key(
            payload.org_id, "property", payload.source_system.value, payload.external_id
        )

        existing = supabase_service.client.table("ingestion_events").select("*").eq("dedupe_key", dedupe_key).execute()
        
        if existing.data:
            event_data = {
                "org_id": payload.org_id,
                "entity_type": EntityType.PROPERTY,
                "external_id": payload.external_id,
                "connector_name": f"{payload.source_system.value}:{payload.source_portal.value}",
                "status": IngestionStatus.DUPLICATE,
                "message": "Duplicate property ignored",
                "payload": payload.dict(),
                "dedupe_key": dedupe_key,
                "processed_at": datetime.utcnow().isoformat()
            }
            supabase_service.client.table("ingestion_events").insert(event_data).execute()
            return {"status": "duplicate", "dedupe_key": dedupe_key}

        try:
            property_data = {
                "org_id": payload.org_id,
                "title": payload.title,
                "address": payload.address,
                "price_eur": payload.price_eur,
                "zone": payload.zone,
                "built_area_m2": payload.built_area_m2,
                "useful_area_m2": payload.useful_area_m2,
                "plot_area_m2": payload.plot_area_m2,
                "bedrooms": payload.bedrooms,
                "bathrooms": payload.bathrooms,
                "description": payload.description,
                "status": "prospect",
                "source": payload.source_system.value,
                "source_portal": payload.source_portal.value,
                "captured_at": payload.captured_at.isoformat(),
                "metadata_json": payload.metadata
            }
            supabase_service.client.table("properties").insert(property_data).execute()

            event_data = {
                "org_id": payload.org_id,
                "entity_type": EntityType.PROPERTY,
                "external_id": payload.external_id,
                "connector_name": f"{payload.source_system.value}:{payload.source_portal.value}",
                "status": IngestionStatus.SUCCESS,
                "message": "Property ingested successfully",
                "payload": payload.dict(),
                "dedupe_key": dedupe_key,
                "processed_at": datetime.utcnow().isoformat()
            }
            supabase_service.client.table("ingestion_events").insert(event_data).execute()
            
            return {"status": "success", "dedupe_key": dedupe_key}

        except Exception as e:
            event_data = {
                "org_id": payload.org_id,
                "entity_type": EntityType.PROPERTY,
                "external_id": payload.external_id,
                "connector_name": f"{payload.source_system.value}:{payload.source_portal.value}",
                "status": IngestionStatus.ERROR,
                "message": str(e),
                "payload": payload.dict(),
                "error_detail": {"error": str(e)},
                "dedupe_key": dedupe_key,
                "processed_at": datetime.utcnow().isoformat()
            }
            supabase_service.client.table("ingestion_events").insert(event_data).execute()
            raise e

    async def get_events(self, org_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        response = supabase_service.client.table("ingestion_events")\
            .select("*")\
            .eq("org_id", org_id)\
            .order("processed_at", desc=True)\
            .limit(limit)\
            .execute()
        return response.data

    async def get_event_by_id(self, event_id: str) -> Optional[Dict[str, Any]]:
        response = supabase_service.client.table("ingestion_events")\
            .select("*")\
            .eq("id", event_id)\
            .execute()
        return response.data[0] if response.data else None

ingestion_service = IngestionService()
