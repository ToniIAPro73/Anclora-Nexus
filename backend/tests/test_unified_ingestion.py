import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from pydantic import ValidationError

from backend.models.ingestion import (
    EntityType,
    IngestionStatus,
    LeadIngestionPayload,
    LeadSourceChannel,
    LeadSourceSystem,
    PropertyIngestionPayload,
    PropertySourcePortal,
    PropertySourceSystem,
    SellerSignalIngestionPayload,
)
from backend.services.ingestion_service import IngestionService


def test_lead_payload_validation() -> None:
    payload = LeadIngestionPayload(
        org_id="org-1",
        external_id="ext-lead-1",
        source_system=LeadSourceSystem.CTA_WEB,
        source_channel=LeadSourceChannel.WEBSITE,
        name="Test User",
        email="test@example.com",
    )
    assert payload.source_system == LeadSourceSystem.CTA_WEB
    assert payload.connector_name is None

    with pytest.raises(ValidationError):
        LeadIngestionPayload(
            org_id="org-1",
            external_id="ext-lead-1",
            source_system=LeadSourceSystem.CTA_WEB,
            source_channel=LeadSourceChannel.WEBSITE,
            name="Test User",
            email="not-an-email",
        )


def test_property_payload_validation() -> None:
    payload = PropertyIngestionPayload(
        org_id="org-1",
        external_id="ext-prop-1",
        source_system=PropertySourceSystem.MANUAL,
        source_portal=PropertySourcePortal.IDEALISTA,
        title="Luxury Villa",
        address="Andratx, Mallorca",
        price_eur=1500000.0,
    )
    assert payload.source_portal == PropertySourcePortal.IDEALISTA


def test_seller_signal_payload_validation() -> None:
    payload = SellerSignalIngestionPayload(
        org_id="org-1",
        connector_name="firecrawl:idealista",
        snapshot_id="snapshot-1",
        signals=[{"direccion": "Andratx", "fuente": "idealista"}],
    )
    assert payload.connector_name == "firecrawl:idealista"
    assert len(payload.signals) == 1


def test_generate_dedupe_key_uses_connector_name() -> None:
    service = IngestionService()
    a = service._generate_dedupe_key("org-1", "cta:web", EntityType.LEAD, "x")
    b = service._generate_dedupe_key("org-1", "import:web", EntityType.LEAD, "x")
    assert a != b


def test_ingestion_service_duplicate_short_circuit() -> None:
    service = IngestionService()
    payload = LeadIngestionPayload(
        org_id="org-1",
        external_id="ext-lead-dup",
        source_system=LeadSourceSystem.CTA_WEB,
        source_channel=LeadSourceChannel.WEBSITE,
        name="Duplicate User",
    )

    with patch.object(service, "_get_existing_event", return_value={"id": "event-1", "trace_id": "trace-1"}):
        result = asyncio.run(service.ingest_lead(payload))

    assert result["status"] == "duplicate"
    assert result["event_id"] == "event-1"


def test_ingestion_service_success_updates_processed_status() -> None:
    service = IngestionService()
    payload = LeadIngestionPayload(
        org_id="org-1",
        external_id="ext-lead-new",
        source_system=LeadSourceSystem.CTA_WEB,
        source_channel=LeadSourceChannel.WEBSITE,
        name="New User",
    )

    mock_table = MagicMock()
    mock_table.insert.return_value.execute.return_value.data = [{"id": "lead-1"}]
    mock_supabase = MagicMock()
    mock_supabase.client.table.return_value = mock_table

    with patch("backend.services.ingestion_service.supabase_service", mock_supabase), \
         patch.object(service, "_get_existing_event", return_value=None), \
         patch.object(service, "_register_received", return_value={"id": "event-1"}), \
         patch.object(service, "_ensure_connector_enabled", return_value=None), \
         patch.object(service, "_update_event") as mock_update:
        result = asyncio.run(service.ingest_lead(payload))

    assert result["status"] == "processed"
    mock_update.assert_any_call("event-1", status=IngestionStatus.VALIDATED)
    mock_update.assert_any_call("event-1", status=IngestionStatus.PROCESSED, processed_entity_id="lead-1")


def test_seller_signal_ingestion_routes_to_skill() -> None:
    service = IngestionService()
    payload = SellerSignalIngestionPayload(
        org_id="org-1",
        connector_name="statefox:bridge",
        snapshot_id="snapshot-1",
        signals=[{"direccion": "Calvia", "anuncio_url": "https://example.com/ad/1"}],
    )

    with patch.object(service, "_get_existing_event", return_value=None), \
         patch.object(service, "_register_received", return_value={"id": "event-1"}), \
         patch.object(service, "_ensure_connector_enabled", return_value=None), \
         patch.object(service, "_update_event"), \
         patch("backend.services.ingestion_service.run_seller_signal_ingest", new_callable=AsyncMock) as mock_skill:
        mock_skill.return_value = {"created_ids": ["seller-1"]}
        result = asyncio.run(service.ingest_seller_signals(payload))

    assert result["status"] == "processed"
    assert result["created"] == 1
