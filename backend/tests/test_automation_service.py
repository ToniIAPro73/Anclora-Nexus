import asyncio
from unittest.mock import AsyncMock, patch

from backend.models.source_observatory import (
    ObservatoryOverviewResponse,
    ObservatorySummary,
    ScopeMetadata,
    SourceScorecard,
)
from backend.services.automation_service import AutomationService


def test_build_operational_alert_candidates_surfaces_pipeline_and_connector_issues() -> None:
    service = AutomationService()
    candidates = service._build_operational_alert_candidates(
        sync_status={"status": "ready"},
        pipeline_status={"status": "idle", "last_success_at": None},
        observatory_items=[
            SourceScorecard(
                source_key="statefox:telegram-bridge",
                total_events=12,
                success_events=6,
                duplicate_events=0,
                error_events=6,
                success_rate_pct=50.0,
                lead_count=0,
                property_count=3,
                seller_count=2,
                processed_events=6,
                rejected_events=2,
                failed_events=4,
                created_entities=5,
                freshness_hours=96.0,
                latest_event_at="2026-03-06T10:00:00+00:00",
                operational_status="critical",
                entity_types=["property", "seller_signal"],
            )
        ],
        cloud_checks=[
            {
                "check_key": "cloud:ai-runtime",
                "status": "warning",
                "metadata": {"missing_env": ["GROQ_API_KEY"]},
            },
            {
                "check_key": "cloud:seller-signal-source",
                "status": "critical",
                "heartbeat_age_hours": 96.0,
                "retry_count": 2,
                "metadata": {"source_selected": "snapshot:seller-signals"},
            },
        ],
    )

    alert_types = {item["alert_type"] for item in candidates}
    assert "territorial_pipeline_missing" in alert_types
    assert "source_connector_degraded" in alert_types
    assert "ai_runtime_degraded" in alert_types
    assert "seller_signal_source_degraded" in alert_types


def test_reconcile_operational_alerts_resolves_missing_candidates() -> None:
    service = AutomationService()
    existing = [
        {
            "id": "alert-1",
            "dedupe_key": "territorial-sync:warning",
            "alert_scope": "territorial_sync",
        }
    ]

    with patch.object(service, "_table_exists", return_value=True), \
         patch("backend.services.automation_service.get_territorial_sync_status", return_value={"status": "ready"}), \
         patch("backend.services.automation_service.get_territorial_pipeline_status", return_value={"status": "ready", "last_success_at": "2026-06-03T09:00:00+00:00"}), \
         patch("backend.services.automation_service.source_observatory_service.get_overview", new=AsyncMock(return_value=ObservatoryOverviewResponse(
             scope=ScopeMetadata(org_id="org-1", role="owner"),
             summary=ObservatorySummary(
                 total_sources=0,
                 healthy_sources=0,
                 warning_sources=0,
                 critical_sources=0,
                 stale_sources=0,
                 total_events=0,
                 total_created_entities=0,
                 total_failures=0,
             ),
             items=[],
             total=0,
         ))), \
         patch("backend.services.automation_service.get_cloud_ops_checks", return_value=[]), \
         patch.object(service, "_list_active_alerts_by_scope", return_value=existing), \
         patch.object(service, "_resolve_alert") as mock_resolve, \
         patch.object(service, "_activate_or_refresh_alert") as mock_activate:
        asyncio.run(service.reconcile_operational_alerts(org_id="org-1", user_id="user-1"))

    mock_resolve.assert_called_once_with("org-1", "alert-1")
    mock_activate.assert_not_called()
