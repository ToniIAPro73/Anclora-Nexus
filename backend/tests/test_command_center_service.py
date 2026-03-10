import asyncio
from unittest.mock import AsyncMock, patch

from backend.models.automation import AlertItem, AlertListResponse, ScopeMetadata as AutomationScopeMetadata
from backend.models.command_center import (
    CommandCenterSnapshotResponse,
    OperationalOverview,
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
         ))):
        snapshot = asyncio.run(service.get_snapshot(org_id="org-1", user_id="user-1"))

    assert isinstance(snapshot, CommandCenterSnapshotResponse)
    assert snapshot.operational_overview.active_alerts == 3
    assert snapshot.operational_overview.degraded_sources == 2


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
