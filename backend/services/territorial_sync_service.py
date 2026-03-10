"""
Territorial Sync Control Plane Service

Reads the NotebookLM territorial sync pack and its validation status from the
repository filesystem so backend routes and operational tooling can expose a
stable health contract for Phase 2.
"""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict


REPO_ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = REPO_ROOT / "ops" / "notebooklm-territorial-sync-manifest.json"
SYNC_PACK_PATH = REPO_ROOT / "public" / "data" / "notebooklm-territorial.sync.json"
SYNC_STATUS_PATH = REPO_ROOT / "ops" / "notebooklm-territorial-sync-status.json"
PIPELINE_STATUS_PATH = REPO_ROOT / "ops" / "territorial-pipeline-status.json"

DEFAULT_OPERATIONAL_CONTRACT = {
    "owner_display": "Owner / Ops (Toni)",
    "owner_team": "Founder Office",
    "schedule": {
        "cadence": "twice_weekly",
        "recommended_days": ["monday", "thursday"],
        "timezone": "Europe/Madrid",
    },
    "recovery_slo_hours": 24,
    "runbook_refs": [
        "public/docs/nuevo-enfoque/SOP_NOTEBOOKLM_TERRITORIAL_SYNC_PACK.md",
        "public/docs/nuevo-enfoque/NOTEBOOKLM_SYNC_PACK_RUNBOOK.md",
    ],
    "fallback_policy": {
        "primary_source": "public/data/notebooklm-territorial.sync.json",
        "fallback_source": "public/docs/vulnerabilidades.md",
        "activation_rule": "use fallback only when sync pack status is error or the pack is unavailable",
        "manual_edit_forbidden": True,
    },
}


def _read_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def _parse_iso(value: Any) -> datetime | None:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def _compute_age_hours(generated_at: Any, now: datetime | None = None) -> float | None:
    parsed = _parse_iso(generated_at)
    if parsed is None:
        return None
    current = now or datetime.now(timezone.utc)
    diff = current - parsed
    return round(diff.total_seconds() / 3600, 1)


def _compute_next_refresh_due_at(generated_at: Any, freshness_hours: Any) -> str | None:
    parsed = _parse_iso(generated_at)
    if parsed is None:
        return None
    try:
        due_at = parsed + timedelta(hours=float(freshness_hours or 0))
    except (TypeError, ValueError):
        return None
    return due_at.isoformat().replace("+00:00", "Z")


def _compute_freshness_state(age_hours: float | None, freshness_hours: Any) -> str:
    try:
        threshold = float(freshness_hours or 0)
    except (TypeError, ValueError):
        threshold = 0
    if age_hours is None or threshold <= 0:
        return "unknown"
    if age_hours > threshold:
        return "stale"
    if age_hours >= threshold * 0.75:
        return "expiring"
    return "fresh"


def _manifest_contract() -> Dict[str, Any]:
    if MANIFEST_PATH.exists():
        manifest = _read_json(MANIFEST_PATH)
        contract = manifest.get("operational_contract")
        if isinstance(contract, dict) and contract:
            return contract
    return DEFAULT_OPERATIONAL_CONTRACT


def _runbook_status(operational_contract: Dict[str, Any]) -> Dict[str, Any]:
    refs = operational_contract.get("runbook_refs") or []
    checked = []
    missing = []
    for ref in refs:
        path = REPO_ROOT / ref
        exists = path.exists()
        checked.append({"path": ref, "exists": exists})
        if not exists:
            missing.append(ref)
    return {
        "refs": checked,
        "all_present": len(missing) == 0,
        "missing_refs": missing,
    }


def _build_next_action(status: str, freshness_state: str, runbook_status: Dict[str, Any]) -> str:
    if not runbook_status.get("all_present", False):
        return "Restaurar referencias de runbook antes del siguiente refresh territorial."
    if status == "error":
        return "Regenerar raw.json, ejecutar build + validate y no publicar hasta recuperar estado ready."
    if freshness_state == "stale":
        return "Ejecutar refresh territorial hoy siguiendo el SOP y validar el sync pack antes del próximo cron."
    if freshness_state == "expiring":
        return "Programar refresh territorial dentro de la ventana actual para evitar caer en fallback."
    return "Mantener la cadencia operativa y revalidar el sync pack en la siguiente ventana planificada."


def _enrich_status(payload: Dict[str, Any]) -> Dict[str, Any]:
    operational_contract = payload.get("operational_contract")
    if not isinstance(operational_contract, dict) or not operational_contract:
        operational_contract = _manifest_contract()

    freshness_hours = payload.get("freshness_hours", 96)
    age_hours = payload.get("age_hours")
    if age_hours is None:
        age_hours = _compute_age_hours(payload.get("generated_at"))
    freshness_state = payload.get("freshness_state") or _compute_freshness_state(age_hours, freshness_hours)
    next_refresh_due_at = payload.get("next_refresh_due_at") or _compute_next_refresh_due_at(
        payload.get("generated_at"),
        freshness_hours,
    )
    runbook_status = _runbook_status(operational_contract)
    warnings = list(payload.get("warnings") or [])
    if freshness_state == "expiring":
        warning = "El sync pack entra en ventana de refresco recomendada."
        if warning not in warnings:
            warnings.append(warning)
    if freshness_state == "stale":
        warning = "El sync pack excede la ventana de frescura recomendada."
        if warning not in warnings:
            warnings.append(warning)
    if not runbook_status["all_present"]:
        warnings.append("Faltan referencias de runbook para recuperación operativa.")

    enriched = dict(payload)
    enriched["age_hours"] = age_hours
    enriched["freshness_state"] = freshness_state
    enriched["next_refresh_due_at"] = next_refresh_due_at
    enriched["operational_contract"] = operational_contract
    enriched["runbook_status"] = runbook_status
    enriched["warnings"] = warnings
    enriched["next_action"] = payload.get("next_action") or _build_next_action(
        str(payload.get("status") or "warning"),
        freshness_state,
        runbook_status,
    )
    return enriched


def get_territorial_sync_status() -> Dict[str, Any]:
    """
    Return the current territorial sync control-plane status.

    If the explicit status file is missing, synthesize a minimal degraded status
    from the sync pack so API consumers still get an actionable payload.
    """

    if SYNC_STATUS_PATH.exists():
        return _enrich_status(_read_json(SYNC_STATUS_PATH))

    if not SYNC_PACK_PATH.exists():
        return _enrich_status({
            "feature_id": "ANCLORA-TSCP-001.v1",
            "status": "error",
            "errors": ["No territorial sync pack found on disk."],
            "control_plane": {
                "output_path": str(SYNC_PACK_PATH.relative_to(REPO_ROOT)),
                "status_path": str(SYNC_STATUS_PATH.relative_to(REPO_ROOT)),
            },
        })

    pack = _read_json(SYNC_PACK_PATH)
    coverage = pack.get("coverage", {})
    return _enrich_status({
        "feature_id": "ANCLORA-TSCP-001.v1",
        "status": "warning",
        "generated_at": pack.get("generated_at"),
        "notebook_id": pack.get("notebook_id"),
        "notebook_name": pack.get("notebook_name"),
        "source_mode": pack.get("source_mode"),
        "freshness_hours": pack.get("freshness_hours"),
        "coverage": coverage,
        "source_refs": pack.get("source_refs", []),
        "operational_contract": pack.get("operational_contract") or _manifest_contract(),
        "warnings": [
            "Validation status file missing; showing synthesized status from sync pack."
        ],
        "errors": [],
        "control_plane": pack.get("control_plane", {}),
        "summary": {
            "primary_source_locked": False,
            "pack_query_count": coverage.get("query_count", 0),
            "zones_covered": coverage.get("zones", []),
        },
    })


def get_territorial_pipeline_status() -> Dict[str, Any]:
    """
    Return the latest known execution status of the territorial pipeline.

    The file is written by the cron entrypoint as a lightweight operational
    heartbeat for UI and support. If the file is missing, return a degraded
    but actionable payload.
    """

    if PIPELINE_STATUS_PATH.exists():
        return _read_json(PIPELINE_STATUS_PATH)

    return {
        "feature_id": "ANCLORA-TSCP-001.pipeline.v1",
        "status": "idle",
        "message": "No territorial pipeline execution recorded yet.",
        "started_at": None,
        "finished_at": None,
        "last_success_at": None,
        "last_error_at": None,
        "stats": {
            "sellers_created": 0,
            "signals_received": 0,
            "queries_synced": 0,
            "outreach_processed": 0,
        },
    }
