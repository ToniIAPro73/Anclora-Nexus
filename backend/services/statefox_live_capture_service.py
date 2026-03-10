"""
Services for supervised local StateFox Telegram Web live capture.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

from backend.services.statefox_bridge_service import import_statefox_listings


REPO_ROOT = Path(__file__).resolve().parents[2]
CAPTURE_PATH = REPO_ROOT / "ops" / "statefox-live-capture.json"
RUNBOOK_PATH = REPO_ROOT / "public" / "docs" / "Nuevo_enfoque" / "STATEFOX_LIVE_CAPTURE_RUNBOOK.md"


def _capture_validation(capture: Dict[str, Any]) -> Dict[str, Any]:
    raw_text = str(capture.get("raw_text") or "")
    statefox_links = capture.get("statefox_links") or []
    public_links = capture.get("public_property_links") or []
    validation = {
        "raw_text_present": bool(raw_text.strip()),
        "raw_text_chars": len(raw_text.strip()),
        "statefox_links_count": len(statefox_links),
        "public_property_links_count": len(public_links),
        "has_page_url": bool(capture.get("page_url")),
        "has_target_url": bool(capture.get("target_url")),
    }
    validation["import_ready"] = bool(
        validation["raw_text_present"]
        and (validation["statefox_links_count"] > 0 or validation["public_property_links_count"] > 0)
    )
    return validation


def _handoff_contract() -> Dict[str, Any]:
    return {
        "runbook_path": str(RUNBOOK_PATH),
        "capture_command": "npm run ops:statefox:capture",
        "bridge_page": "/intelligence/statefox-bridge",
        "import_endpoint": "/api/intelligence/statefox-bridge/live-capture/import",
        "operation_mode": "supervised_local_playwright",
    }


def get_statefox_live_capture() -> Dict[str, Any]:
    if not CAPTURE_PATH.exists():
        return {
            "available": False,
            "path": str(CAPTURE_PATH),
            "status": "missing",
            "message": "No supervised StateFox live capture found yet.",
            "import_ready": False,
            "handoff": _handoff_contract(),
        }

    data = json.loads(CAPTURE_PATH.read_text(encoding="utf-8"))
    validation = _capture_validation(data)
    return {
        "available": True,
        "path": str(CAPTURE_PATH),
        "status": "ready" if validation["import_ready"] else "invalid",
        "message": "Capture ready for supervised import." if validation["import_ready"] else "Capture found but it is not import-ready yet.",
        "import_ready": validation["import_ready"],
        "validation": validation,
        "handoff": _handoff_contract(),
        "capture": data,
    }


async def import_latest_statefox_capture(
    org_id: str,
    zone: str | None = None,
    city: str | None = "Mallorca",
) -> Dict[str, Any]:
    live_capture = get_statefox_live_capture()
    if not live_capture.get("available"):
        raise FileNotFoundError("StateFox live capture file not found")
    if not live_capture.get("import_ready"):
        raise ValueError("StateFox live capture is not import-ready")

    capture = live_capture["capture"]
    raw_text = capture.get("raw_text", "")
    if not raw_text.strip():
        raise ValueError("StateFox live capture is empty")

    result = await import_statefox_listings(
        org_id=org_id,
        raw_text=raw_text,
        zone=zone,
        city=city,
    )
    return {
        "capture_metadata": {
            "captured_at": capture.get("captured_at"),
            "page_url": capture.get("page_url"),
            "statefox_links": len(capture.get("statefox_links") or []),
            "public_property_links": len(capture.get("public_property_links") or []),
            "validation": live_capture.get("validation"),
            "handoff": live_capture.get("handoff"),
        },
        "import_result": result,
    }
