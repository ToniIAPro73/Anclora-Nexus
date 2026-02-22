import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from backend.models.feed_orchestrator import (
    FeedChannelSummary,
    FeedPublishResponse,
    FeedRunItem,
    FeedValidationIssue,
    FeedValidationResponse,
    FeedWorkspaceResponse,
)
from backend.services.supabase_service import supabase_service


class FeedOrchestratorService:
    CHANNELS: Dict[str, Dict[str, Any]] = {
        "idealista": {"format": "xml", "required_fields": ["title", "price", "zone", "property_type"]},
        "fotocasa": {"format": "xml", "required_fields": ["title", "price", "zone", "property_type"]},
        "rightmove": {"format": "json", "required_fields": ["title", "price", "city", "property_type"]},
        "kyero": {"format": "json", "required_fields": ["title", "price", "zone", "property_type"]},
    }

    def _table_exists(self, table: str) -> bool:
        try:
            supabase_service.client.table(table).select("id").limit(1).execute()
            return True
        except Exception:
            return False

    def _property_tables(self) -> List[str]:
        tables: List[str] = []
        for table in ("properties", "prospected_properties"):
            if self._table_exists(table):
                tables.append(table)
        return tables

    def _row_price(self, row: Dict[str, Any]) -> Optional[float]:
        raw = row.get("price")
        if raw is None:
            raw = row.get("price_eur")
        if raw is None:
            return None
        try:
            return float(raw)
        except Exception:
            return None

    def _normalize_property(self, row: Dict[str, Any], table: str) -> Dict[str, Any]:
        return {
            "id": str(row.get("id")),
            "org_id": row.get("org_id"),
            "title": row.get("title") or row.get("address"),
            "zone": row.get("zone"),
            "city": row.get("city"),
            "property_type": row.get("property_type"),
            "price": self._row_price(row),
            "status": (row.get("status") or "new").lower(),
            "source_url": row.get("source_url"),
            "source_portal": row.get("source_portal"),
            "_table": table,
            "_raw": row,
        }

    async def _list_properties(self, org_id: str, limit: int = 500) -> List[Dict[str, Any]]:
        merged: Dict[str, Dict[str, Any]] = {}
        for table in self._property_tables():
            try:
                rows = (
                    supabase_service.client.table(table)
                    .select("*")
                    .eq("org_id", org_id)
                    .order("created_at", desc=True)
                    .limit(limit)
                    .execute()
                ).data or []
                for row in rows:
                    row_id = str(row.get("id"))
                    if row_id and row_id not in merged:
                        merged[row_id] = self._normalize_property(row, table)
            except Exception:
                continue
        return list(merged.values())

    def _validate_record(self, record: Dict[str, Any], required_fields: List[str]) -> List[FeedValidationIssue]:
        issues: List[FeedValidationIssue] = []
        for field in required_fields:
            value = record.get(field)
            if value is None or (isinstance(value, str) and not value.strip()):
                issues.append(
                    FeedValidationIssue(
                        property_id=record["id"],
                        field=field,
                        severity="error",
                        message=f"Campo requerido ausente: {field}",
                    )
                )
        if record.get("price") is not None and float(record["price"]) <= 0:
            issues.append(
                FeedValidationIssue(
                    property_id=record["id"],
                    field="price",
                    severity="error",
                    message="El precio debe ser mayor que 0.",
                )
            )
        if record.get("source_url") in (None, ""):
            issues.append(
                FeedValidationIssue(
                    property_id=record["id"],
                    field="source_url",
                    severity="warning",
                    message="Sin URL de origen; recomendable para trazabilidad.",
                )
            )
        return issues

    async def _latest_runs_map(self, org_id: str) -> Dict[str, datetime]:
        latest: Dict[str, datetime] = {}
        if not self._table_exists("ingestion_events"):
            return latest

        try:
            rows = (
                supabase_service.client.table("ingestion_events")
                .select("connector_name, processed_at")
                .eq("org_id", org_id)
                .ilike("connector_name", "feed:%")
                .order("processed_at", desc=True)
                .limit(200)
                .execute()
            ).data or []
        except Exception:
            return latest

        for row in rows:
            connector = str(row.get("connector_name") or "")
            channel = connector.replace("feed:", "", 1)
            if channel in latest:
                continue
            processed_at = row.get("processed_at")
            if processed_at:
                try:
                    latest[channel] = datetime.fromisoformat(processed_at.replace("Z", "+00:00"))
                except Exception:
                    continue
        return latest

    async def get_workspace(self, org_id: str) -> FeedWorkspaceResponse:
        properties = await self._list_properties(org_id)
        latest_runs = await self._latest_runs_map(org_id)
        channel_summaries: List[FeedChannelSummary] = []

        for channel, cfg in self.CHANNELS.items():
            scoped = [
                p for p in properties
                if p.get("status") in {"new", "contacted", "negotiating", "listed"}
            ]
            issues: List[FeedValidationIssue] = []
            ready = 0
            for record in scoped:
                rec_issues = self._validate_record(record, cfg["required_fields"])
                errors = [i for i in rec_issues if i.severity == "error"]
                if not errors:
                    ready += 1
                issues.extend(rec_issues)
            error_count = len([i for i in issues if i.severity == "error"])
            warning_count = len([i for i in issues if i.severity == "warning"])
            status = "healthy" if error_count == 0 else ("warning" if ready > 0 else "blocked")
            channel_summaries.append(
                FeedChannelSummary(
                    channel=channel,
                    format=cfg["format"],
                    status=status,  # type: ignore[arg-type]
                    total_candidates=len(scoped),
                    ready_to_publish=ready,
                    warnings=warning_count,
                    errors=error_count,
                    latest_run_at=latest_runs.get(channel),
                )
            )

        totals = {
            "channels": len(channel_summaries),
            "candidates": sum(c.total_candidates for c in channel_summaries),
            "ready": sum(c.ready_to_publish for c in channel_summaries),
            "errors": sum(c.errors for c in channel_summaries),
            "warnings": sum(c.warnings for c in channel_summaries),
        }
        return FeedWorkspaceResponse(
            generated_at=datetime.now(timezone.utc),
            channels=channel_summaries,
            totals=totals,
        )

    async def validate_channel(self, org_id: str, channel: str, limit_issues: int = 50) -> FeedValidationResponse:
        cfg = self.CHANNELS[channel]
        properties = await self._list_properties(org_id)
        scoped = [p for p in properties if p.get("status") in {"new", "contacted", "negotiating", "listed"}]
        issues: List[FeedValidationIssue] = []
        ready = 0
        for record in scoped:
            rec_issues = self._validate_record(record, cfg["required_fields"])
            if not [i for i in rec_issues if i.severity == "error"]:
                ready += 1
            issues.extend(rec_issues)

        warnings = len([i for i in issues if i.severity == "warning"])
        errors = len([i for i in issues if i.severity == "error"])
        return FeedValidationResponse(
            channel=channel,
            generated_at=datetime.now(timezone.utc),
            total_candidates=len(scoped),
            ready_to_publish=ready,
            warnings=warnings,
            errors=errors,
            issues=issues[:limit_issues],
        )

    async def _log_run_event(self, org_id: str, channel: str, payload: Dict[str, Any], status: str) -> None:
        if not self._table_exists("ingestion_events"):
            return
        try:
            supabase_service.client.table("ingestion_events").insert(
                {
                    "org_id": org_id,
                    "entity_type": "property",
                    "external_id": payload.get("run_id"),
                    "connector_name": f"feed:{channel}",
                    "status": status,
                    "message": f"Feed run {status}",
                    "payload": payload,
                    "dedupe_key": f"feed:{channel}:{payload.get('run_id')}",
                    "processed_at": datetime.now(timezone.utc).isoformat(),
                }
            ).execute()
        except Exception:
            pass

    async def publish_channel(
        self,
        org_id: str,
        channel: str,
        dry_run: bool,
        max_items: int,
    ) -> FeedPublishResponse:
        validation = await self.validate_channel(org_id, channel, limit_issues=200)
        publishable = max(0, min(validation.ready_to_publish, max_items))
        rejected = max(0, min(validation.total_candidates, max_items) - publishable)
        error_count = len([i for i in validation.issues if i.severity == "error"])
        run_id = str(uuid.uuid4())
        status = "success" if error_count == 0 else ("partial" if publishable > 0 else "failed")

        sample_payload = {
            "channel": channel,
            "format": self.CHANNELS[channel]["format"],
            "properties_exported": publishable,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
        response = FeedPublishResponse(
            run_id=run_id,
            channel=channel,
            dry_run=dry_run,
            status=status,  # type: ignore[arg-type]
            published_count=publishable if not dry_run else 0,
            rejected_count=rejected,
            error_count=error_count,
            generated_at=datetime.now(timezone.utc),
            sample_payload=sample_payload,
            issues=validation.issues[:30],
        )
        await self._log_run_event(org_id, channel, response.model_dump(mode="json"), "success" if status != "failed" else "error")
        return response

    async def list_runs(self, org_id: str, limit: int = 20, channel: Optional[str] = None) -> Tuple[List[FeedRunItem], int]:
        if not self._table_exists("ingestion_events"):
            return [], 0
        query = (
            supabase_service.client.table("ingestion_events")
            .select("external_id, connector_name, status, payload, processed_at", count="exact")
            .eq("org_id", org_id)
            .ilike("connector_name", "feed:%")
            .order("processed_at", desc=True)
            .limit(limit)
        )
        if channel:
            query = query.eq("connector_name", f"feed:{channel}")
        try:
            resp = query.execute()
            rows = resp.data or []
        except Exception:
            return [], 0

        items: List[FeedRunItem] = []
        for row in rows:
            payload = row.get("payload") or {}
            connector = str(row.get("connector_name") or "")
            ch = connector.replace("feed:", "", 1)
            processed_raw = row.get("processed_at")
            try:
                generated = datetime.fromisoformat(str(processed_raw).replace("Z", "+00:00"))
            except Exception:
                generated = datetime.now(timezone.utc)
            items.append(
                FeedRunItem(
                    run_id=str(row.get("external_id") or uuid.uuid4()),
                    channel=ch,
                    status=str(row.get("status") or "unknown"),
                    dry_run=bool(payload.get("dry_run", False)),
                    published_count=int(payload.get("published_count", 0)),
                    rejected_count=int(payload.get("rejected_count", 0)),
                    generated_at=generated,
                )
            )
        return items, int(resp.count or len(items))


feed_orchestrator_service = FeedOrchestratorService()
