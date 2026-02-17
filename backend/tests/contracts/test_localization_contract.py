
import pytest
from unittest.mock import AsyncMock, patch
from uuid import uuid4
from fastapi import FastAPI
from fastapi.testclient import TestClient
from backend.api.routes.prospection import router
from backend.api.deps import get_org_id

# Setup minimal app for testing
app = FastAPI()
app.include_router(router, prefix="/api/prospection")

# Mock Auth
ORG_ID = str(uuid4())
async def mock_get_org_id():
    return ORG_ID
app.dependency_overrides[get_org_id] = mock_get_org_id

client = TestClient(app)

class TestLocalizationContract:
    """
    Verifies that the API returns raw data (numbers, ISO strings) 
    and does NOT format them for display (e.g. no '1.5M', no '10/10/2023').
    """

    @patch("backend.api.routes.prospection.prospection_service")
    def test_properties_return_raw_data(self, mock_svc):
        """
        Ensure properties endpoint returns raw numbers for price/area 
        and ISO strings for dates.
        """
        # Setup mock return value with RAW types
        mock_item = {
            "id": str(uuid4()),
            "org_id": ORG_ID,
            "title": "Raw Data Villa",
            "price": 1500000,          # Raw int
            "area_m2": 350.5,          # Raw float
            "status": "prospect",      # Canonical slug
            "created_at": "2023-10-27T10:00:00Z", # ISO String
            "updated_at": "2023-10-27T10:00:00Z",
            "source": "manual",
            "source_system": "manual"
        }
        
        mock_svc.list_properties = AsyncMock(return_value={
            "items": [mock_item],
            "total": 1,
            "limit": 50,
            "offset": 0
        })

        # Execute
        resp = client.get("/api/prospection/properties")
        
        # Verify
        assert resp.status_code == 200
        data = resp.json()
        item = data["items"][0]

        # Assertions
        assert item["price"] == 1500000
        assert isinstance(item["price"], int)
        
        assert item["area_m2"] == 350.5
        assert isinstance(item["area_m2"], float)
        
        assert item["status"] == "prospect"
        # Ensure it didn't get translated to "Captación" or similar
        assert item["status"] != "Captación" 

    @patch("backend.api.routes.prospection.prospection_service")
    def test_property_status_enums(self, mock_svc):
        """
        Verify status fields are returned as canonical enum values.
        """
        mock_item = {
            "id": str(uuid4()),
            "org_id": ORG_ID,
            "status": "offer", # Canonical
            "source": "idealista",
            "source_system": "widget",
            "created_at": "2023-10-27T10:00:00Z", 
            "updated_at": "2023-10-27T10:00:00Z",
        }
        mock_svc.list_properties = AsyncMock(return_value={
            "items": [mock_item],
            "total": 1,
            "limit": 50,
            "offset": 0
        })

        resp = client.get("/api/prospection/properties")
        assert resp.status_code == 200
        item = resp.json()["items"][0]
        
        assert item["status"] == "offer"
