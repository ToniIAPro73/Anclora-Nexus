import asyncio
from unittest.mock import AsyncMock, patch

from backend.models.automation import AlertItem, AlertListResponse, ScopeMetadata as AutomationScopeMetadata
from backend.models.command_center import (
    CommandCenterSnapshotResponse,
    OperationalOverview,
    PipelineOverview,
)
from backend.models.source_observatory import (
    ObservatoryOverviewResponse,
    ObservatorySummary,
    ScopeMetadata,
)
from backend.services.command_center_service import CommandCenterService


def test_command_center_snapshot_includes_operational_overview() -> None:
    service = CommandCenterService()

    with patch.object(service, "_get_role", new=AsyncMock(return_value="owner")), \
         patch.object(service, "_count_entities", new=AsyncMock(side_effect=[10, 4, 8, 2, 12, 9])), \
         patch("backend.services.command_center_service.finops_service.get_budget_status", new=AsyncMock(return_value=type("Budget", (), {
             "status": "ok",
             "current_usage_pct": 32.0,
             "monthly_budget_eur": 1000.0,
             "current_usage_eur": 320.0,
         })())), \
         patch.object(service, "_build_operational_overview", new=AsyncMock(return_value=OperationalOverview(
             active_alerts=3,
             critical_alerts=1,
             degraded_sources=2,
             stale_sources=1,
             territorial_sync_status="ready",
             territorial_pipeline_status="warning",
             top_alerts=[],
         ))), \
         patch.object(service, "_build_pipeline_overview", return_value=PipelineOverview(
             seller_signals_processed=9,
             sellers_total=6,
             sellers_high_priority=4,
             sellers_converted=1,
             seller_conversion_rate=16.7,
             supervised_sends_confirmed=2,
             active_workbench_ready=5,
         )):
        snapshot = asyncio.run(service.get_snapshot(org_id="org-1", user_id="user-1"))

    assert isinstance(snapshot, CommandCenterSnapshotResponse)
    assert snapshot.operational_overview.active_alerts == 3
    assert snapshot.operational_overview.degraded_sources == 2
    assert snapshot.pipeline_overview.seller_signals_processed == 9


def test_build_pipeline_overview_aggregates_sellers_ingestion_and_sends() -> None:
    store = {
        "ingestion_events": [
            {"org_id": "org-1", "entity_type": "seller_signal", "status": "processed"},
            {"org_id": "org-1", "entity_type": "seller_signal", "status": "processed"},
            {"org_id": "org-1", "entity_type": "seller_signal", "status": "failed"},
        ],
        "nexus_sellers": [
            {"org_id": "org-1", "prioridad": 5, "estado_contacto": "sin_contacto"},
            {"org_id": "org-1", "prioridad": 4, "estado_contacto": "mandato_exclusivo"},
            {"org_id": "org-1", "prioridad": 2, "estado_contacto": "en_seguimiento"},
        ],
        "seller_interactions": [
            {"org_id": "org-1", "seller_id": "seller-1", "resultado": "sent_confirmed_human", "metadata": {"artifact": "email_draft"}},
            {"org_id": "org-1", "seller_id": "seller-3", "resultado": "sent_native_supervised", "metadata": {"artifact": "supervised_send_email"}},
            {"org_id": "org-1", "seller_id": "seller-2", "resultado": None, "metadata": {"artifact": "captation_dossier"}},
        ],
    }
    service = CommandCenterService()
    service.client = type(
        "MockClient",
        (),
        {
            "table": lambda _self, table_name: type(
                "MockQuery",
                (),
                {
                    "__init__": lambda self: setattr(self, "rows", list(store.get(table_name, []))),
                    "select": lambda self, *_args, **_kwargs: self,
                    "eq": lambda self, key, value: (setattr(self, "rows", [row for row in self.rows if row.get(key) == value]) or self),
                    "execute": lambda self: type("Resp", (), {"data": self.rows})(),
                    "limit": lambda self, _value: self,
                },
            )()
        },
    )()

    overview = service._build_pipeline_overview("org-1")

    assert overview.seller_signals_processed == 2
    assert overview.sellers_total == 3
    assert overview.sellers_high_priority == 2
    assert overview.sellers_converted == 1
    assert overview.supervised_sends_confirmed == 2


def test_build_operational_overview_aggregates_alerts_and_observatory() -> None:
    service = CommandCenterService()
    alerts = AlertListResponse(
        scope=AutomationScopeMetadata(org_id="org-1", role="owner"),
        items=[
            AlertItem(
                id="a1",
                org_id="org-1",
                rule_id=None,
                alert_scope="source_connector",
                severity="critical",
                alert_type="source_connector_degraded",
                message="connector degraded",
                dedupe_key="x",
                metadata_json={"source_key": "statefox:telegram-bridge"},
                is_active=True,
                created_at="2026-03-10T10:00:00Z",
                updated_at="2026-03-10T10:00:00Z",
                resolved_at=None,
            )
        ],
        total=1,
    )
    observatory = ObservatoryOverviewResponse(
        scope=ScopeMetadata(org_id="org-1", role="owner"),
        summary=ObservatorySummary(
            total_sources=3,
            healthy_sources=1,
            warning_sources=1,
            critical_sources=1,
            stale_sources=1,
            total_events=10,
            total_created_entities=5,
            total_failures=2,
        ),
        items=[],
        total=3,
    )

    with patch("backend.services.command_center_service.automation_service.list_alerts", new=AsyncMock(return_value=alerts)), \
         patch("backend.services.command_center_service.source_observatory_service.get_overview", new=AsyncMock(return_value=observatory)), \
         patch("backend.services.command_center_service.get_territorial_sync_status", return_value={"status": "ready"}), \
         patch("backend.services.command_center_service.get_territorial_pipeline_status", return_value={"status": "idle"}):
        overview = asyncio.run(service._build_operational_overview(org_id="org-1", user_id="user-1"))

    assert overview.active_alerts == 1
    assert overview.critical_alerts == 1
    assert overview.degraded_sources == 2
    assert overview.territorial_pipeline_status == "idle"
