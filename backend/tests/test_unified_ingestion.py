import pytest
import asyncio
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic import ValidationError

from backend.models.ingestion import (
    LeadIngestionPayload, 
    PropertyIngestionPayload, 
    LeadSourceSystem, 
    LeadSourceChannel,
    PropertySourceSystem,
    PropertySourcePortal,
    IngestionStatus
)
from backend.services.ingestion_service import IngestionService

@pytest.mark.asyncio
async def test_lead_payload_validation():
    # Valid lead
    data = {
        "org_id": "org-1",
        "external_id": "ext-lead-1",
        "source_system": "cta_web",
        "source_channel": "website",
        "name": "Test User",
        "email": "test@example.com"
    }
    payload = LeadIngestionPayload(**data)
    assert payload.name == "Test User"
    assert payload.source_system == LeadSourceSystem.CTA_WEB

    # Invalid email
    invalid_data = data.copy()
    invalid_data["email"] = "not-an-email"
    with pytest.raises(ValidationError):
        LeadIngestionPayload(**invalid_data)

@pytest.mark.asyncio
async def test_property_payload_validation():
    # Valid property
    data = {
        "org_id": "org-1",
        "external_id": "ext-prop-1",
        "source_system": "manual",
        "source_portal": "idealista",
        "title": "Luxury Villa",
        "address": "Andratx, Mallorca",
        "price_eur": 1500000.0,
        "built_area_m2": 300,
        "useful_area_m2": 250
    }
    payload = PropertyIngestionPayload(**data)
    assert payload.title == "Luxury Villa"
    assert payload.price_eur == 1500000.0

@pytest.mark.asyncio
async def test_ingestion_service_deduplication():
    # Mock supabase_service
    mock_supabase = MagicMock()
    mock_supabase.client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": "existing-event"}]
    
    service = IngestionService()
    
    payload = LeadIngestionPayload(
        org_id="org-1",
        external_id="ext-lead-dup",
        source_system=LeadSourceSystem.CTA_WEB,
        source_channel=LeadSourceChannel.WEBSITE,
        name="Duplicate User"
    )

    with patch("backend.services.ingestion_service.supabase_service", mock_supabase):
        result = await service.ingest_lead(payload)
        
        assert result["status"] == "duplicate"
        # Verify that insert into leads was NOT called
        # mock_supabase.client.table("leads").insert should not be called
        # But wait, looking at my implementation:
        # existing = supabase_service.client.table("ingestion_events").select("*").eq("dedupe_key", dedupe_key).execute()
        # if existing.data: ... insert into ingestion_events (duplicate) ... return
        
        # Verify ingestion_events call for duplicate
        mock_supabase.client.table.assert_any_call("ingestion_events")

@pytest.mark.asyncio
async def test_ingestion_service_success():
    mock_supabase = MagicMock()
    # 1. select for dedupe returns empty
    mock_select = MagicMock()
    mock_select.execute.return_value.data = []
    
    # 2. insert for leads
    mock_insert_lead = MagicMock()
    mock_insert_lead.execute.return_value.data = [{"id": "new-lead"}]
    
    # 3. insert for event
    mock_insert_event = MagicMock()
    mock_insert_event.execute.return_value.data = [{"id": "event-id"}]

    def table_side_effect(table_name):
        if table_name == "ingestion_events":
            return mock_supabase.client.table.return_value # Reusing mock for simplicity in chaining
        return MagicMock()

    # Complex chaining mock
    mock_supabase.client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    mock_supabase.client.table.return_value.insert.return_value.execute.return_value.data = [{"id": "dummy"}]

    service = IngestionService()
    
    payload = LeadIngestionPayload(
        org_id="org-1",
        external_id="ext-lead-new",
        source_system=LeadSourceSystem.CTA_WEB,
        source_channel=LeadSourceChannel.WEBSITE,
        name="New User"
    )

    with patch("backend.services.ingestion_service.supabase_service", mock_supabase):
        result = await service.ingest_lead(payload)
        assert result["status"] == "success"
        assert "dedupe_key" in result
