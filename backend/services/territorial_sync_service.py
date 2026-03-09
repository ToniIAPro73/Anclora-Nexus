"""
Territorial Sync Control Plane Service

Reads the NotebookLM territorial sync pack and its validation status from the
repository filesystem so backend routes and operational tooling can expose a
stable health contract for Phase 2.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


REPO_ROOT = Path(__file__).resolve().parents[2]
SYNC_PACK_PATH = REPO_ROOT / "public" / "data" / "notebooklm-territorial.sync.json"
SYNC_STATUS_PATH = REPO_ROOT / "ops" / "notebooklm-territorial-sync-status.json"


def _read_json(path: Path) -> Dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def get_territorial_sync_status() -> Dict[str, Any]:
    """
    Return the current territorial sync control-plane status.

    If the explicit status file is missing, synthesize a minimal degraded status
    from the sync pack so API consumers still get an actionable payload.
    """

    if SYNC_STATUS_PATH.exists():
        return _read_json(SYNC_STATUS_PATH)

    if not SYNC_PACK_PATH.exists():
        return {
            "feature_id": "ANCLORA-TSCP-001.v1",
            "status": "error",
            "errors": ["No territorial sync pack found on disk."],
            "control_plane": {
                "output_path": str(SYNC_PACK_PATH.relative_to(REPO_ROOT)),
                "status_path": str(SYNC_STATUS_PATH.relative_to(REPO_ROOT)),
            },
        }

    pack = _read_json(SYNC_PACK_PATH)
    coverage = pack.get("coverage", {})
    return {
        "feature_id": "ANCLORA-TSCP-001.v1",
        "status": "warning",
        "generated_at": pack.get("generated_at"),
        "notebook_id": pack.get("notebook_id"),
        "notebook_name": pack.get("notebook_name"),
        "source_mode": pack.get("source_mode"),
        "freshness_hours": pack.get("freshness_hours"),
        "coverage": coverage,
        "source_refs": pack.get("source_refs", []),
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
    }
