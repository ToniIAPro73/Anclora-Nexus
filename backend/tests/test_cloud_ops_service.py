from backend.services.cloud_ops_service import get_cloud_ops_summary


def test_cloud_ops_summary_reports_runtime_and_heartbeats(monkeypatch) -> None:
    monkeypatch.setattr(
        "backend.services.cloud_ops_service.get_territorial_sync_status",
        lambda: {
            "status": "ready",
            "generated_at": "2026-06-03T08:00:00+00:00",
            "freshness_hours": 96,
            "freshness_state": "fresh",
            "warnings": [],
            "next_action": "maintain cadence",
            "source_mode": "live_notebook_sync_pack",
        },
    )
    monkeypatch.setattr(
        "backend.services.cloud_ops_service.get_territorial_pipeline_status",
        lambda: {
            "status": "success",
            "message": "ok",
            "started_at": "2026-06-03T08:10:00+00:00",
            "finished_at": "2026-06-03T08:12:00+00:00",
            "retry_count": 1,
            "stats": {"signals_received": 3},
        },
    )
    monkeypatch.setattr(
        "backend.services.cloud_ops_service.get_seller_signal_source_status",
        lambda: {
            "status": "warning",
            "message": "snapshot fallback",
            "started_at": "2026-06-03T08:15:00+00:00",
            "finished_at": "2026-06-03T08:16:00+00:00",
            "source_selected": "snapshot:seller-signals",
            "attempts": [
                {"status": "failed"},
                {"status": "processed"},
            ],
            "result": {"signals_received": 2},
        },
    )
    monkeypatch.setattr(
        "backend.services.cloud_ops_service.get_runtime_summary",
        lambda: {
            "status": "degraded",
            "profile": "groq-cloudflare",
            "missing_env": ["GROQ_API_KEY"],
            "embeddings": {"status": "ready"},
        },
    )

    summary = get_cloud_ops_summary()

    assert summary["total_checks"] == 4
    assert summary["warning_checks"] == 2
    pipeline_check = next(item for item in summary["checks"] if item["check_key"] == "cloud:territorial-pipeline")
    assert pipeline_check["latency_ms"] == 120000
    assert pipeline_check["retry_count"] == 1
