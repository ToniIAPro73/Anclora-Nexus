from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from backend.services.ai_runtime import get_runtime_summary
from backend.services.seller_signal_source_service import get_seller_signal_source_status
from backend.services.territorial_sync_service import (
    get_territorial_pipeline_status,
    get_territorial_sync_status,
)


def _parse_iso(value: Any) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except Exception:
        return None


def _age_hours(value: Any) -> Optional[float]:
    parsed = _parse_iso(value)
    if parsed is None:
        return None
    delta = datetime.now(timezone.utc) - parsed.astimezone(timezone.utc)
    return round(delta.total_seconds() / 3600, 2)


def _duration_ms(started_at: Any, finished_at: Any) -> Optional[int]:
    start = _parse_iso(started_at)
    end = _parse_iso(finished_at)
    if start is None or end is None:
        return None
    delta = end - start
    return max(int(delta.total_seconds() * 1000), 0)


@dataclass(frozen=True)
class CloudOpsCheck:
    check_key: str
    label: str
    status: str
    message: str
    heartbeat_at: Optional[str]
    heartbeat_age_hours: Optional[float]
    latency_ms: Optional[int]
    retry_count: int
    metadata: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "check_key": self.check_key,
            "label": self.label,
            "status": self.status,
            "message": self.message,
            "heartbeat_at": self.heartbeat_at,
            "heartbeat_age_hours": self.heartbeat_age_hours,
            "latency_ms": self.latency_ms,
            "retry_count": self.retry_count,
            "metadata": self.metadata,
        }


def _normalize_status(raw: str, *, stale_after_hours: Optional[float] = None, heartbeat_at: Any = None) -> str:
    status = (raw or "unknown").strip().lower()
    age = _age_hours(heartbeat_at)
    if stale_after_hours is not None and age is not None and age >= stale_after_hours:
        return "critical" if age >= stale_after_hours * 2 else "warning"
    if status in {"ready", "success", "healthy"}:
        return "healthy"
    if status in {"warning", "idle", "missing", "degraded"}:
        return "warning"
    if status in {"error", "failed", "critical"}:
        return "critical"
    if status == "running":
        return "warning"
    return "warning"


def get_cloud_ops_checks() -> List[CloudOpsCheck]:
    sync_status = get_territorial_sync_status()
    pipeline_status = get_territorial_pipeline_status()
    seller_source_status = get_seller_signal_source_status()
    runtime_status = get_runtime_summary()

    sync_generated_at = sync_status.get("generated_at") or sync_status.get("updated_at")
    pipeline_heartbeat_at = (
        pipeline_status.get("finished_at")
        or pipeline_status.get("last_success_at")
        or pipeline_status.get("started_at")
    )
    seller_heartbeat_at = seller_source_status.get("finished_at") or seller_source_status.get("updated_at")

    sync_check = CloudOpsCheck(
        check_key="cloud:territorial-sync",
        label="Territorial sync",
        status=_normalize_status(
            str(sync_status.get("status") or "warning"),
            stale_after_hours=float(sync_status.get("freshness_hours") or 96),
            heartbeat_at=sync_generated_at,
        ),
        message=str(sync_status.get("next_action") or sync_status.get("status") or "Sync status unavailable."),
        heartbeat_at=sync_generated_at,
        heartbeat_age_hours=_age_hours(sync_generated_at),
        latency_ms=None,
        retry_count=0,
        metadata={
            "source_mode": sync_status.get("source_mode"),
            "freshness_state": sync_status.get("freshness_state"),
            "warnings": sync_status.get("warnings") or [],
        },
    )

    pipeline_check = CloudOpsCheck(
        check_key="cloud:territorial-pipeline",
        label="Territorial pipeline",
        status=_normalize_status(
            str(pipeline_status.get("status") or "idle"),
            stale_after_hours=72,
            heartbeat_at=pipeline_heartbeat_at,
        ),
        message=str(pipeline_status.get("message") or "Pipeline status unavailable."),
        heartbeat_at=pipeline_heartbeat_at,
        heartbeat_age_hours=_age_hours(pipeline_heartbeat_at),
        latency_ms=_duration_ms(pipeline_status.get("started_at"), pipeline_status.get("finished_at")),
        retry_count=int(pipeline_status.get("retry_count") or 0),
        metadata={
            "stats": pipeline_status.get("stats") or {},
            "last_error_at": pipeline_status.get("last_error_at"),
        },
    )

    attempts = seller_source_status.get("attempts") or []
    seller_source_check = CloudOpsCheck(
        check_key="cloud:seller-signal-source",
        label="Seller signal source",
        status=_normalize_status(
            str(seller_source_status.get("status") or "missing"),
            stale_after_hours=48,
            heartbeat_at=seller_heartbeat_at,
        ),
        message=str(seller_source_status.get("message") or "Seller source status unavailable."),
        heartbeat_at=seller_heartbeat_at,
        heartbeat_age_hours=_age_hours(seller_heartbeat_at),
        latency_ms=_duration_ms(seller_source_status.get("started_at"), seller_source_status.get("finished_at")),
        retry_count=sum(1 for item in attempts if str(item.get("status") or "") in {"failed", "skipped"}),
        metadata={
            "source_selected": seller_source_status.get("source_selected"),
            "attempts": attempts,
            "result": seller_source_status.get("result") or {},
        },
    )

    runtime_check = CloudOpsCheck(
        check_key="cloud:ai-runtime",
        label="AI runtime",
        status=_normalize_status(str(runtime_status.get("status") or "degraded")),
        message="AI runtime routes and embeddings health.",
        heartbeat_at=None,
        heartbeat_age_hours=None,
        latency_ms=None,
        retry_count=0,
        metadata={
            "profile": runtime_status.get("profile"),
            "missing_env": runtime_status.get("missing_env") or [],
            "embeddings_status": (runtime_status.get("embeddings") or {}).get("status"),
        },
    )

    return [sync_check, pipeline_check, seller_source_check, runtime_check]


def get_cloud_ops_summary() -> Dict[str, Any]:
    checks = get_cloud_ops_checks()
    return {
        "total_checks": len(checks),
        "healthy_checks": sum(1 for item in checks if item.status == "healthy"),
        "warning_checks": sum(1 for item in checks if item.status == "warning"),
        "critical_checks": sum(1 for item in checks if item.status == "critical"),
        "checks": [item.to_dict() for item in checks],
    }
