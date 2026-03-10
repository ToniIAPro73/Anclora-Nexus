import asyncio
from unittest.mock import AsyncMock, patch

from backend.services.source_observatory_service import SourceObservatoryService


def test_source_observatory_overview_aggregates_health_and_coverage() -> None:
    service = SourceObservatoryService()
    events = [
        {
            "connector_name": "statefox:telegram-bridge",
            "status": "processed",
            "processed_at": "2026-03-10T09:00:00+00:00",
            "created_at": "2026-03-10T08:55:00+00:00",
            "entity_type": "seller_signal",
            "processed_entity_id": "seller-1",
            "dedupe_key": "a",
        },
        {
            "connector_name": "statefox:telegram-bridge",
            "status": "failed",
            "processed_at": "2026-03-10T09:30:00+00:00",
            "created_at": "2026-03-10T09:25:00+00:00",
            "entity_type": "property",
            "processed_entity_id": None,
            "dedupe_key": "b",
        },
    ]
    leads = [{"source_system": "cta_web", "source_channel": "website"}]
    properties = [{"source": "statefox"}]
    sellers = [{"fuente": "scraping"}]

    with patch.object(service, "_get_role", new=AsyncMock(return_value="owner")), \
         patch.object(service, "_load_source_data", new=AsyncMock(return_value=(events, leads, properties, sellers))):
        overview = asyncio.run(service.get_overview(org_id="org-1", user_id="user-1"))

    assert overview.version == "ANCLORA-SPO-001.v1_1"
    assert overview.summary.total_sources == 4
    assert overview.summary.total_created_entities == 1
    statefox_item = next(item for item in overview.items if item.source_key == "statefox:telegram-bridge")
    assert statefox_item.operational_status == "critical"
    assert statefox_item.failed_events == 1
    assert statefox_item.created_entities == 1


def test_source_observatory_trends_use_processed_and_failed_counts() -> None:
    service = SourceObservatoryService()
    events = [
        {
            "connector_name": "statefox:telegram-bridge",
            "status": "processed",
            "processed_at": "2026-03-10T09:00:00+00:00",
            "created_at": "2026-03-10T08:55:00+00:00",
            "processed_entity_id": "seller-1",
        },
        {
            "connector_name": "statefox:telegram-bridge",
            "status": "rejected",
            "processed_at": "2026-03-10T09:30:00+00:00",
            "created_at": "2026-03-10T09:25:00+00:00",
            "processed_entity_id": None,
        },
    ]

    with patch.object(service, "_get_role", new=AsyncMock(return_value="owner")), \
         patch.object(service, "_table_exists", return_value=True):
        service.client = type(
            "MockClient",
            (),
            {
                "table": lambda _self, _table: type(
                    "MockQuery",
                    (),
                    {
                        "select": lambda self, *_args, **_kwargs: self,
                        "eq": lambda self, *_args, **_kwargs: self,
                        "gte": lambda self, *_args, **_kwargs: self,
                        "execute": lambda self: type("Resp", (), {"data": events})(),
                    },
                )()
            },
        )()
        trends = asyncio.run(service.get_trends(org_id="org-1", user_id="user-1", months=6))

    point = next(item for item in trends.points if item.source_key == "statefox:telegram-bridge")
    assert point.processed_events == 1
    assert point.failed_events == 1
    assert point.created_entities == 1
