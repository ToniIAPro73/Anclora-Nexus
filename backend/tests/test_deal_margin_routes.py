from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from backend.api.deps import get_current_user, get_org_id
from backend.api.routes.deal_margin import router


app = FastAPI()
app.include_router(router, prefix="/api/deal-margin")
ORG_ID = str(uuid4())
USER_ID = str(uuid4())


class MockUser:
    id = USER_ID


async def mock_get_org_id() -> str:
    return ORG_ID


async def mock_get_current_user() -> MockUser:
    return MockUser()


app.dependency_overrides[get_org_id] = mock_get_org_id
app.dependency_overrides[get_current_user] = mock_get_current_user
client = TestClient(app)


class TestRouteRegistration:
    @pytest.mark.parametrize(
        "method,path",
        [
            ("POST", "/api/deal-margin/simulate"),
            ("POST", "/api/deal-margin/compare"),
        ],
    )
    def test_endpoint_exists(self, method: str, path: str) -> None:
        routes = [r for r in app.routes if hasattr(r, "methods")]
        matching = [r for r in routes if hasattr(r, "path") and r.path == path and method in r.methods]
        assert len(matching) == 1


class TestDealMarginRoutes:
    @patch("backend.api.routes.deal_margin.deal_margin_service")
    def test_simulate(self, mock_svc: MagicMock) -> None:
        mock_svc.simulate = AsyncMock(
            return_value={
                "version": "ANCLORA-DMS-001.v1",
                "scope": {"org_id": ORG_ID, "role": "owner"},
                "result": {
                    "scenario_name": "base",
                    "gross_margin_eur": 120000,
                    "gross_margin_pct": 12,
                    "expected_commission_eur": 30000,
                    "expected_margin_eur": 96000,
                    "recommendation_band": "B",
                    "drivers": [{"label": "deal_value_eur", "value_eur": 1000000}],
                },
            }
        )
        resp = client.post(
            "/api/deal-margin/simulate",
            json={
                "scenario_name": "base",
                "assumptions": {
                    "deal_value_eur": 1000000,
                    "acquisition_cost_eur": 800000,
                    "closing_cost_eur": 25000,
                    "renovation_cost_eur": 15000,
                    "holding_cost_eur": 10000,
                    "tax_cost_eur": 30000,
                    "commission_rate_pct": 3,
                    "confidence_pct": 80,
                },
            },
        )
        assert resp.status_code == 200
        assert resp.json()["result"]["recommendation_band"] == "B"

    @patch("backend.api.routes.deal_margin.deal_margin_service")
    def test_compare(self, mock_svc: MagicMock) -> None:
        mock_svc.compare = AsyncMock(
            return_value={
                "version": "ANCLORA-DMS-001.v1",
                "scope": {"org_id": ORG_ID, "role": "manager"},
                "results": [
                    {
                        "scenario_name": "s1",
                        "gross_margin_eur": 100000,
                        "gross_margin_pct": 10,
                        "expected_commission_eur": 30000,
                        "expected_margin_eur": 80000,
                        "recommendation_band": "B",
                        "drivers": [],
                    },
                    {
                        "scenario_name": "s2",
                        "gross_margin_eur": 140000,
                        "gross_margin_pct": 14,
                        "expected_commission_eur": 30000,
                        "expected_margin_eur": 112000,
                        "recommendation_band": "A",
                        "drivers": [],
                    },
                ],
                "best_scenario": "s2",
            }
        )
        resp = client.post(
            "/api/deal-margin/compare",
            json={
                "scenarios": [
                    {
                        "scenario_name": "s1",
                        "assumptions": {
                            "deal_value_eur": 1000000,
                            "acquisition_cost_eur": 850000,
                        },
                    },
                    {
                        "scenario_name": "s2",
                        "assumptions": {
                            "deal_value_eur": 1000000,
                            "acquisition_cost_eur": 800000,
                        },
                    },
                ]
            },
        )
        assert resp.status_code == 200
        assert resp.json()["best_scenario"] == "s2"
