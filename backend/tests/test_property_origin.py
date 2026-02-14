import pytest
from decimal import Decimal
from unittest.mock import MagicMock, patch
from uuid import uuid4

from backend.models.prospection import (
    PropertyCreate,
    PropertySourceSystem,
    PropertySourcePortal,
)
from backend.services.prospection_service import ProspectionService

ORG_A = str(uuid4())

class MockSupabaseQuery:
    def __init__(self, data: list):
        self._data = data

    def table(self, name: str): return self
    def insert(self, record: dict):
        self._data = [record]
        return self
    def update(self, data: dict):
        if self._data: self._data[0].update(data)
        return self
    def eq(self, *args): return self
    def execute(self):
        result = MagicMock()
        result.data = self._data
        return result

@pytest.mark.asyncio
async def test_create_property_with_origin():
    service = ProspectionService()
    prop_data = PropertyCreate(
        source="idealista",
        title="Test Villa",
        price=Decimal("1000000"),
        source_system=PropertySourceSystem.WIDGET,
        source_portal=PropertySourcePortal.IDEALISTA
    )

    mock_query = MockSupabaseQuery([])
    with patch("backend.services.prospection_service.supabase_service") as mock_sb:
        mock_sb.client.table.return_value = mock_query
        result = await service.create_property(ORG_A, prop_data)

    assert result["source_system"] == "widget"
    assert result["source_portal"] == "idealista"
    assert result["org_id"] == ORG_A

@pytest.mark.asyncio
async def test_create_property_default_origin():
    service = ProspectionService()
    prop_data = PropertyCreate(
        source="idealista",
        title="Test Villa",
        price=Decimal("1000000")
        # source_system defaults to manual
    )

    mock_query = MockSupabaseQuery([])
    with patch("backend.services.prospection_service.supabase_service") as mock_sb:
        mock_sb.client.table.return_value = mock_query
        result = await service.create_property(ORG_A, prop_data)

    assert result["source_system"] == "manual"
    assert result["source_portal"] is None

@pytest.mark.asyncio
async def test_normalize_portal_validation():
    # Test normalization logic in model
    prop_data = PropertyCreate(
        source="idealista",
        title="Test Villa",
        price=Decimal("1000000"),
        source_portal="IDEALISTA " # Mixed case and space
    )
    assert prop_data.source_portal == PropertySourcePortal.IDEALISTA

    prop_data_other = PropertyCreate(
        source="idealista",
        title="Test Villa",
        price=Decimal("1000000"),
        source_portal="unknown-portal"
    )
    assert prop_data_other.source_portal == PropertySourcePortal.OTHER
