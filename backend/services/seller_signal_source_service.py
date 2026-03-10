from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from backend.models.ingestion import SellerSignalIngestionPayload
from backend.services.ingestion_service import ingestion_service
from backend.services.statefox_live_capture_service import (
    get_statefox_live_capture,
    import_latest_statefox_capture,
)
from backend.skills.fsbo_scraper import DEFAULT_ZONES, run_fsbo_scraper


REPO_ROOT = Path(__file__).resolve().parents[2]
SNAPSHOT_PATH = REPO_ROOT / "public" / "data" / "seller-signals.snapshot.json"
STATUS_PATH = REPO_ROOT / "ops" / "seller-signal-source-status.json"
SNAPSHOT_CONNECTOR = "snapshot:seller-signals"

def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _firecrawl_available() -> bool:
    return bool(os.getenv("FIRECRAWL_API_KEY", "").strip())


def _snapshot_available() -> bool:
    return SNAPSHOT_PATH.exists()


def _load_snapshot_signals() -> List[Dict[str, Any]]:
    payload = json.loads(SNAPSHOT_PATH.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError("seller signal snapshot must contain a JSON array")
    return payload


def _persist_status(payload: Dict[str, Any]) -> None:
    STATUS_PATH.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def get_seller_signal_source_status() -> Dict[str, Any]:
    if not STATUS_PATH.exists():
        return {
            "feature_id": "ANCLORA-SCUI-001.v1_2.live",
            "status": "missing",
            "message": "No seller signal source execution recorded yet.",
            "updated_at": None,
            "source_selected": None,
            "attempts": [],
        }

    return json.loads(STATUS_PATH.read_text(encoding="utf-8"))


async def _run_firecrawl_source(org_id: str, zonas: Optional[List[str]], enrich_listings: bool) -> Dict[str, Any]:
    result = await run_fsbo_scraper(
        data={
            "org_id": org_id,
            "zonas": zonas or DEFAULT_ZONES,
            "enrich_listings": enrich_listings,
        },
        llm=None,  # not used by the skill
        db=None,   # not used by the skill
    )
    return {
        "source_key": "firecrawl:idealista-fsbo",
        "mode": "live",
        "status": "processed",
        "signals_received": int(result.get("total_signals_found", 0)),
        "created": int(result.get("created", result.get("sellers_created", 0))),
        "duplicates": int(result.get("duplicates", result.get("sellers_skipped_dedup", 0))),
        "rejected": int(result.get("rejected", 0)),
        "failed": int(result.get("failed", len(result.get("errors", [])))),
        "credits_used": int(result.get("total_credits_used", 0)),
        "snapshot_id": result.get("snapshot_id"),
        "zone_results": result.get("zone_results", []),
        "raw_result": result,
    }


async def _run_statefox_source(org_id: str, zone: Optional[str], city: str) -> Dict[str, Any]:
    result = await import_latest_statefox_capture(org_id=org_id, zone=zone, city=city)
    import_result = result.get("import_result", {})
    return {
        "source_key": "statefox:live-capture",
        "mode": "live_supervised",
        "status": "processed",
        "signals_received": int(import_result.get("seller_candidate_count", 0)),
        "created": int(import_result.get("sellers_imported_count", 0)),
        "duplicates": int(import_result.get("sellers_duplicates_count", 0)),
        "rejected": int(import_result.get("sellers_rejected_count", 0)),
        "failed": int(import_result.get("sellers_failed_count", 0)),
        "snapshot_id": import_result.get("snapshot_id"),
        "trace_id": import_result.get("trace_id"),
        "capture_metadata": result.get("capture_metadata"),
        "raw_result": result,
    }


async def _run_snapshot_fallback(org_id: str) -> Dict[str, Any]:
    signals = _load_snapshot_signals()
    result = await ingestion_service.ingest_seller_signals(
        SellerSignalIngestionPayload(
            org_id=org_id,
            connector_name=SNAPSHOT_CONNECTOR,
            snapshot_id=str(SNAPSHOT_PATH.relative_to(REPO_ROOT)),
            signals=signals,
        )
    )
    return {
        "source_key": SNAPSHOT_CONNECTOR,
        "mode": "snapshot_fallback",
        "status": result.get("status", "processed"),
        "signals_received": int(result.get("received", 0)),
        "created": int(result.get("created", 0)),
        "duplicates": int(result.get("duplicates", 0)),
        "rejected": int(result.get("rejected", 0)),
        "failed": int(result.get("failed", 0)),
        "snapshot_id": result.get("snapshot_id"),
        "trace_id": result.get("trace_id"),
        "raw_result": result,
    }


async def run_seller_signal_source_pipeline(
    *,
    org_id: str,
    zonas: Optional[List[str]] = None,
    zone: Optional[str] = None,
    city: str = "Mallorca",
    enrich_listings: bool = False,
    enable_snapshot_fallback: bool = True,
) -> Dict[str, Any]:
    started_at = _now()
    attempts: List[Dict[str, Any]] = []

    running_payload = {
        "feature_id": "ANCLORA-SCUI-001.v1_2.live",
        "status": "running",
        "message": "Seller signal source pipeline started.",
        "started_at": started_at,
        "finished_at": None,
        "updated_at": started_at,
        "source_selected": None,
        "attempts": [],
    }
    _persist_status(running_payload)

    try:
        if _firecrawl_available():
            try:
                firecrawl_result = await _run_firecrawl_source(org_id, zonas, enrich_listings)
                attempts.append(
                    {
                        "source_key": "firecrawl:idealista-fsbo",
                        "mode": "live",
                        "status": "processed",
                        "reason": None,
                        "signals_received": firecrawl_result["signals_received"],
                    }
                )
                finished_at = _now()
                payload = {
                    "feature_id": "ANCLORA-SCUI-001.v1_2.live",
                    "status": "success",
                    "message": "Seller signal source pipeline completed using Firecrawl.",
                    "started_at": started_at,
                    "finished_at": finished_at,
                    "updated_at": finished_at,
                    "source_selected": firecrawl_result["source_key"],
                    "attempts": attempts,
                    "result": firecrawl_result,
                }
                _persist_status(payload)
                return payload
            except Exception as exc:
                attempts.append(
                    {
                        "source_key": "firecrawl:idealista-fsbo",
                        "mode": "live",
                        "status": "failed",
                        "reason": str(exc),
                    }
                )
        else:
            attempts.append(
                {
                    "source_key": "firecrawl:idealista-fsbo",
                    "mode": "live",
                    "status": "skipped",
                    "reason": "FIRECRAWL_API_KEY missing",
                }
            )

        live_capture = get_statefox_live_capture()
        if live_capture.get("import_ready"):
            try:
                statefox_result = await _run_statefox_source(org_id, zone, city)
                attempts.append(
                    {
                        "source_key": "statefox:live-capture",
                        "mode": "live_supervised",
                        "status": "processed",
                        "reason": None,
                        "signals_received": statefox_result["signals_received"],
                    }
                )
                finished_at = _now()
                payload = {
                    "feature_id": "ANCLORA-SCUI-001.v1_2.live",
                    "status": "success",
                    "message": "Seller signal source pipeline completed using StateFox live capture.",
                    "started_at": started_at,
                    "finished_at": finished_at,
                    "updated_at": finished_at,
                    "source_selected": statefox_result["source_key"],
                    "attempts": attempts,
                    "result": statefox_result,
                }
                _persist_status(payload)
                return payload
            except Exception as exc:
                attempts.append(
                    {
                        "source_key": "statefox:live-capture",
                        "mode": "live_supervised",
                        "status": "failed",
                        "reason": str(exc),
                    }
                )
        else:
            attempts.append(
                {
                    "source_key": "statefox:live-capture",
                    "mode": "live_supervised",
                    "status": "skipped",
                    "reason": str(live_capture.get("message") or "StateFox live capture unavailable"),
                }
            )

        if enable_snapshot_fallback and _snapshot_available():
            snapshot_result = await _run_snapshot_fallback(org_id)
            attempts.append(
                {
                    "source_key": SNAPSHOT_CONNECTOR,
                    "mode": "snapshot_fallback",
                    "status": snapshot_result.get("status", "processed"),
                    "reason": None,
                    "signals_received": snapshot_result["signals_received"],
                }
            )
            finished_at = _now()
            payload = {
                "feature_id": "ANCLORA-SCUI-001.v1_2.live",
                "status": "warning",
                "message": "Seller signal source pipeline used snapshot fallback.",
                "started_at": started_at,
                "finished_at": finished_at,
                "updated_at": finished_at,
                "source_selected": snapshot_result["source_key"],
                "attempts": attempts,
                "result": snapshot_result,
            }
            _persist_status(payload)
            return payload

        finished_at = _now()
        payload = {
            "feature_id": "ANCLORA-SCUI-001.v1_2.live",
            "status": "error",
            "message": "No seller signal source available.",
            "started_at": started_at,
            "finished_at": finished_at,
            "updated_at": finished_at,
            "source_selected": None,
            "attempts": attempts,
        }
        _persist_status(payload)
        raise RuntimeError("No seller signal source available")
    except Exception:
        raise
