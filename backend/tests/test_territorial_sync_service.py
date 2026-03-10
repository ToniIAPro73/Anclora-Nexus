from pathlib import Path

import pytest

from backend.services import territorial_sync_service


def test_get_territorial_sync_status_enriches_operational_contract(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    manifest_path = tmp_path / "notebooklm-territorial-sync-manifest.json"
    sync_status_path = tmp_path / "notebooklm-territorial-sync-status.json"

    manifest_path.write_text(
        """
{
  "operational_contract": {
    "owner_display": "Owner / Ops (Toni)",
    "owner_team": "Founder Office",
    "schedule": {
      "cadence": "twice_weekly",
      "recommended_days": ["monday", "thursday"],
      "timezone": "Europe/Madrid"
    },
    "recovery_slo_hours": 24,
    "runbook_refs": ["public/docs/nuevo-enfoque/SOP_NOTEBOOKLM_TERRITORIAL_SYNC_PACK.md"],
    "fallback_policy": {
      "primary_source": "public/data/notebooklm-territorial.sync.json",
      "fallback_source": "public/docs/vulnerabilidades.md",
      "activation_rule": "use fallback only when sync pack status is error or the pack is unavailable",
      "manual_edit_forbidden": true
    }
  }
}
        """.strip(),
        encoding="utf-8",
    )
    sync_status_path.write_text(
        """
{
  "feature_id": "ANCLORA-TSCP-001.v1",
  "status": "ready",
  "generated_at": "2026-03-09T00:00:00Z",
  "freshness_hours": 96,
  "warnings": [],
  "errors": []
}
        """.strip(),
        encoding="utf-8",
    )

    monkeypatch.setattr(territorial_sync_service, "MANIFEST_PATH", manifest_path)
    monkeypatch.setattr(territorial_sync_service, "SYNC_STATUS_PATH", sync_status_path)
    monkeypatch.setattr(territorial_sync_service, "REPO_ROOT", tmp_path)

    status = territorial_sync_service.get_territorial_sync_status()

    assert status["operational_contract"]["owner_display"] == "Owner / Ops (Toni)"
    assert status["freshness_state"] in {"fresh", "expiring", "stale"}
    assert status["next_refresh_due_at"] is not None
    assert "next_action" in status
    assert status["runbook_status"]["all_present"] is False
