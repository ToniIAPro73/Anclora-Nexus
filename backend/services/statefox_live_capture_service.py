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


def get_statefox_live_capture() -> Dict[str, Any]:
    if not CAPTURE_PATH.exists():
        return {
            "available": False,
            "path": str(CAPTURE_PATH),
            "status": "missing",
            "message": "No supervised StateFox live capture found yet.",
        }

    data = json.loads(CAPTURE_PATH.read_text(encoding="utf-8"))
    return {
        "available": True,
        "path": str(CAPTURE_PATH),
        "status": "ready",
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
        },
        "import_result": result,
    }
