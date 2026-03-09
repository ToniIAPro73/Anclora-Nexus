"""
StateFox Telegram discovery service.

Reads the curated discovery evidence file and enriches it with the import
contract so operations can decide whether to proceed with a supervised adapter.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

from .statefox_adapter import get_statefox_import_contract


DISCOVERY_PATH = Path(__file__).resolve().parents[2] / "ops" / "statefox-telegram-discovery.json"


def get_statefox_discovery() -> Dict[str, Any]:
    if not DISCOVERY_PATH.exists():
        return {
            "feature_id": "ANCLORA-STFX-001.v1",
            "status": "error",
            "errors": [f"Missing discovery file: {DISCOVERY_PATH}"],
            "import_contract": get_statefox_import_contract(),
        }

    with DISCOVERY_PATH.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    payload["import_contract"] = get_statefox_import_contract()
    return payload
