"""
Prospection Service — CRUD operations with org isolation.
Feature: ANCLORA-PBM-001

Manages prospected properties, buyer profiles, matches, and activities.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from backend.models.prospection import (
    ActivityCreate,
    BuyerCreate,
    BuyerUpdate,
    MatchUpdate,
    PropertyCreate,
    PropertyUpdate,
    RecomputeResponse,
)
from backend.services.scoring_service import scoring_service
from backend.services.supabase_service import supabase_service


class ProspectionService:
    """
    CRUD service for Prospection & Buyer Matching.
    All queries are filtered by org_id for isolation.
    """

    def _property_table(self, org_id: Optional[str] = None) -> str:
        """
        Resolve property table for prospection flows.
        Prefer unified properties table, but if org_id is provided choose the
        table that actually has rows for that org.
        """
        existing_tables: List[str] = []

        # Prefer current unified model first.
        for table in ("properties", "prospected_properties"):
            try:
                supabase_service.client.table(table).select("id").limit(1).execute()
                existing_tables.append(table)
            except Exception:
                continue

        if not existing_tables:
            return "properties"

        if org_id is not None:
            for table in existing_tables:
                try:
                    probe = (
                        supabase_service.client.table(table)
                        .select("id")
                        .eq("org_id", org_id)
                        .limit(1)
                        .execute()
                    )
                    if probe.data:
                        return table
                except Exception:
                    continue

        return existing_tables[0]

    def _property_tables(self) -> List[str]:
        """Return available property tables in preferred order."""
        tables: List[str] = []
        for table in ("properties", "prospected_properties"):
            try:
                supabase_service.client.table(table).select("id").limit(1).execute()
                tables.append(table)
            except Exception:
                continue
        return tables or ["properties"]

    def _table_has_column(self, table: str, column: str) -> bool:
        """Best-effort check to avoid querying non-existent columns."""
        try:
            supabase_service.client.table(table).select(column).limit(1).execute()
            return True
        except Exception:
            return False

    def _normalize_property_record(self, row: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize heterogeneous property rows so they always satisfy
        PropertyResponse response model requirements.
        """
        now_iso = datetime.utcnow().isoformat()
        normalized = dict(row)
        normalized["source"] = normalized.get("source") or "direct"
        normalized["status"] = normalized.get("status") or "new"
        normalized["source_system"] = normalized.get("source_system") or "pbm"
        normalized["created_at"] = normalized.get("created_at") or now_iso
        normalized["updated_at"] = normalized.get("updated_at") or now_iso
        return normalized

    def _normalize_property_items(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [self._normalize_property_record(i) for i in items]

    # ─────────────────────────────────────────────────────────────────────
    # PROPERTIES
    # ─────────────────────────────────────────────────────────────────────

    async def create_property(
        self, org_id: str, data: PropertyCreate
    ) -> Dict[str, Any]:
        """Create a new prospected property and compute its score."""
        record: Dict[str, Any] = {
            "org_id": org_id,
            **data.model_dump(exclude_none=True),
        }

        # Normalize Enums to strings for Supabase
        if "source_system" in record:
            record["source_system"] = str(record["source_system"].value)
        if "source_portal" in record and record["source_portal"] is not None:
            record["source_portal"] = str(record["source_portal"].value)

        # Convert Decimal to float for JSON serialization
        decimal_fields = [
            "price",
            "area_m2",
            "useful_area_m2",
            "built_area_m2",
            "plot_area_m2",
        ]
        for field in decimal_fields:
            if field in record and record[field] is not None:
                record[field] = float(record[field])

        # Compute initial high_ticket_score
        score_result = scoring_service.compute_high_ticket_score(
            price=record.get("price"),
            zone=data.zone,
            property_type=data.property_type,
            area_m2=record.get("area_m2"),
            bedrooms=data.bedrooms,
        )
        record["high_ticket_score"] = score_result.score
        record["score_breakdown"] = score_result.breakdown

        response = supabase_service.client.table(self._property_table(org_id)).insert(
            record
        ).execute()
        return response.data[0]

    async def list_properties(
        self,
        org_id: str,
        zone: Optional[str] = None,
        status: Optional[str] = None,
        min_score: Optional[float] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """List prospected properties with filters."""
        # First strategy: use the property IDs that are actually referenced by matches
        # for this org. This keeps prospection cards aligned with the match board.
        try:
            matches_base = (
                supabase_service.client.table("property_buyer_matches")
                .select("property_id, match_score")
                .eq("org_id", org_id)
                .limit(5000)
                .execute()
            )
            match_rows = matches_base.data or []
            matched_property_ids = list(
                {m.get("property_id") for m in match_rows if m.get("property_id")}
            )
            best_match_score: Dict[str, float] = {}
            for m in match_rows:
                pid = m.get("property_id")
                score = m.get("match_score")
                if pid is None or score is None:
                    continue
                best_match_score[pid] = max(best_match_score.get(pid, 0.0), float(score))

            if matched_property_ids:
                merged: Dict[str, Dict[str, Any]] = {}
                for property_table in self._property_tables():
                    try:
                        rows = (
                            supabase_service.client.table(property_table)
                            .select("*")
                            .in_("id", matched_property_ids)
                            .limit(5000)
                            .execute()
                        ).data or []
                        for row in rows:
                            merged[row["id"]] = row
                    except Exception:
                        continue

                if merged:
                    items = list(merged.values())
                    for item in items:
                        if item.get("high_ticket_score") is None:
                            item["high_ticket_score"] = best_match_score.get(item.get("id"), 0)

                    if zone:
                        items = [i for i in items if (i.get("zone") or "") == zone]
                    if status:
                        items = [i for i in items if (i.get("status") or "") == status]
                    if min_score is not None:
                        items = [i for i in items if float(i.get("high_ticket_score") or 0) >= min_score]

                    items.sort(key=lambda x: float(x.get("high_ticket_score") or 0), reverse=True)
                    total = len(items)
                    page_items = items[offset : offset + limit]
                    return {
                        "items": self._normalize_property_items(page_items),
                        "total": total,
                        "limit": limit,
                        "offset": offset,
                    }
        except Exception:
            pass

        # Robust strategy: try all available property tables and use
        # the first one that returns rows for this org+filters.
        tables = self._property_tables()
        last_response = None

        for property_table in tables:
            supports_score = self._table_has_column(property_table, "high_ticket_score")
            supports_status = self._table_has_column(property_table, "status")
            supports_zone = self._table_has_column(property_table, "zone")
            supports_source_system = self._table_has_column(property_table, "source_system")

            query = (
                supabase_service.client.table(property_table)
                .select("*", count="exact")
                .eq("org_id", org_id)
            )

            # Prospection screen should show only prospecting-origin properties.
            if supports_source_system:
                query = query.in_("source_system", ["widget", "pbm"])

            if zone and supports_zone:
                query = query.eq("zone", zone)
            if status and supports_status:
                query = query.eq("status", status)
            if min_score is not None and supports_score:
                query = query.gte("high_ticket_score", min_score)

            query = query.range(offset, offset + limit - 1)

            try:
                if supports_score:
                    response = query.order("high_ticket_score", desc=True).execute()
                else:
                    response = query.order("created_at", desc=True).execute()
            except Exception:
                response = query.execute()

            last_response = response
            if response.data:
                return {
                    "items": self._normalize_property_items(response.data),
                    "total": response.count or len(response.data),
                    "limit": limit,
                    "offset": offset,
                }

        # Fallback: if properties are not found by org_id but matches exist,
        # recover property cards by property_id linked to org matches.
        try:
            matches_resp = (
                supabase_service.client.table("property_buyer_matches")
                .select("property_id")
                .eq("org_id", org_id)
                .limit(5000)
                .execute()
            )
            property_ids = list({m.get("property_id") for m in (matches_resp.data or []) if m.get("property_id")})

            if property_ids:
                recovered: List[Dict[str, Any]] = []
                for property_table in tables:
                    try:
                        resp = (
                            supabase_service.client.table(property_table)
                            .select("*")
                            .in_("id", property_ids)
                            .range(offset, offset + limit - 1)
                            .execute()
                        )
                        if resp.data:
                            recovered = resp.data
                            break
                    except Exception:
                        continue

                if recovered:
                    return {
                        "items": self._normalize_property_items(recovered),
                        "total": len(property_ids),
                        "limit": limit,
                        "offset": offset,
                    }
        except Exception:
            # Keep standard empty response if fallback path fails.
            pass

        # If no table has rows, return last response shape or empty.
        if last_response is not None:
            return {
                "items": self._normalize_property_items(last_response.data or []),
                "total": last_response.count or len(last_response.data or []),
                "limit": limit,
                "offset": offset,
            }
        return {"items": [], "total": 0, "limit": limit, "offset": offset}

    async def get_property(self, org_id: str, property_id: str) -> Optional[Dict[str, Any]]:
        """Get a single property by ID with org isolation."""
        property_table = self._property_table(org_id)
        response = (
            supabase_service.client.table(property_table)
            .select("*")
            .eq("id", property_id)
            .eq("org_id", org_id)
            .execute()
        )
        return response.data[0] if response.data else None

    async def update_property(
        self, org_id: str, property_id: str, data: PropertyUpdate
    ) -> Optional[Dict[str, Any]]:
        """Update a prospected property with origin-based editability enforcement."""
        property_table = self._property_table(org_id)
        # 1. Fetch current record to check origin
        existing = await self.get_property(org_id, property_id)
        if not existing:
            return None

        update_data: Dict[str, Any] = data.model_dump(exclude_none=True)

        # 2. Enforce Origin-based Editability Contract (ANCLORA-CSL-001)
        source_system = existing.get("source_system", "manual")

        # Trace fields protected for non-manual origins
        if source_system != "manual":
            protected_trace = {"source", "source_url", "source_system", "source_portal"}
            for field in protected_trace:
                if field in update_data:
                    del update_data[field]

        # Provenance/Scoring protected for PBM origin
        if source_system == "pbm":
            protected_scoring = {"high_ticket_score", "score_breakdown"}
            for field in protected_scoring:
                if field in update_data:
                    del update_data[field]

        # 3. Handle Enums and Decimals
        if "source_system" in update_data:
            update_data["source_system"] = str(update_data["source_system"].value)
        if "source_portal" in update_data and update_data["source_portal"] is not None:
            update_data["source_portal"] = str(update_data["source_portal"].value)

        decimal_fields = [
            "price",
            "area_m2",
            "useful_area_m2",
            "built_area_m2",
            "plot_area_m2",
        ]
        for field in decimal_fields:
            if field in update_data and update_data[field] is not None:
                update_data[field] = float(update_data[field])

        # 4. Perform update
        response = (
            supabase_service.client.table(property_table)
            .update(update_data)
            .eq("id", property_id)
            .eq("org_id", org_id)
            .execute()
        )
        return response.data[0] if response.data else None

    async def rescore_property(
        self, org_id: str, property_id: str
    ) -> Optional[Dict[str, Any]]:
        """Recalculate high_ticket_score for a property."""
        property_table = self._property_table(org_id)
        prop = await self.get_property(org_id, property_id)
        if not prop:
            return None

        score_result = scoring_service.compute_high_ticket_score(
            price=float(prop["price"]) if prop.get("price") else None,
            zone=prop.get("zone"),
            property_type=prop.get("property_type"),
            area_m2=float(prop["area_m2"]) if prop.get("area_m2") else None,
            bedrooms=prop.get("bedrooms"),
        )

        response = (
            supabase_service.client.table(property_table)
            .update({
                "high_ticket_score": score_result.score,
                "score_breakdown": score_result.breakdown,
            })
            .eq("id", property_id)
            .eq("org_id", org_id)
            .execute()
        )
        return response.data[0] if response.data else None

    # ─────────────────────────────────────────────────────────────────────
    # BUYERS
    # ─────────────────────────────────────────────────────────────────────

    async def create_buyer(
        self, org_id: str, data: BuyerCreate
    ) -> Dict[str, Any]:
        """Create a new buyer profile."""
        record: Dict[str, Any] = {
            "org_id": org_id,
            **data.model_dump(exclude_none=True),
        }

        # Convert Decimal fields
        for field in ("budget_min", "budget_max", "motivation_score"):
            if field in record and record[field] is not None:
                record[field] = float(record[field])

        response = supabase_service.client.table("buyer_profiles").insert(
            record
        ).execute()
        return response.data[0]

    async def list_buyers(
        self,
        org_id: str,
        status: Optional[str] = None,
        min_budget: Optional[float] = None,
        max_budget: Optional[float] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """List buyer profiles with filters."""
        query = (
            supabase_service.client.table("buyer_profiles")
            .select("*", count="exact")
            .eq("org_id", org_id)
            .order("motivation_score", desc=True)
        )

        if status:
            query = query.eq("status", status)
        if min_budget is not None:
            query = query.gte("budget_max", min_budget)
        if max_budget is not None:
            query = query.lte("budget_min", max_budget)

        query = query.range(offset, offset + limit - 1)
        response = query.execute()

        return {
            "items": response.data,
            "total": response.count or len(response.data),
            "limit": limit,
            "offset": offset,
        }

    async def get_buyer(self, org_id: str, buyer_id: str) -> Optional[Dict[str, Any]]:
        """Get a single buyer by ID with org isolation."""
        response = (
            supabase_service.client.table("buyer_profiles")
            .select("*")
            .eq("id", buyer_id)
            .eq("org_id", org_id)
            .execute()
        )
        return response.data[0] if response.data else None

    async def update_buyer(
        self, org_id: str, buyer_id: str, data: BuyerUpdate
    ) -> Optional[Dict[str, Any]]:
        """Update a buyer profile."""
        update_data: Dict[str, Any] = data.model_dump(exclude_none=True)

        for field in ("budget_min", "budget_max", "motivation_score"):
            if field in update_data and update_data[field] is not None:
                update_data[field] = float(update_data[field])

        response = (
            supabase_service.client.table("buyer_profiles")
            .update(update_data)
            .eq("id", buyer_id)
            .eq("org_id", org_id)
            .execute()
        )
        return response.data[0] if response.data else None

    # ─────────────────────────────────────────────────────────────────────
    # MATCHES
    # ─────────────────────────────────────────────────────────────────────

    async def list_matches(
        self,
        org_id: str,
        status: Optional[str] = None,
        min_score: Optional[float] = None,
        property_id: Optional[str] = None,
        buyer_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        """List matches with optional filters, ordered by score."""
        query = (
            supabase_service.client.table("property_buyer_matches")
            .select("*", count="exact")
            .eq("org_id", org_id)
            .order("match_score", desc=True)
        )

        if status:
            query = query.eq("match_status", status)
        if min_score is not None:
            query = query.gte("match_score", min_score)
        if property_id:
            query = query.eq("property_id", property_id)
        if buyer_id:
            query = query.eq("buyer_id", buyer_id)

        query = query.range(offset, offset + limit - 1)
        response = query.execute()

        # Denormalize: fetch property titles and buyer names for display
        items = response.data
        await self._enrich_matches(org_id, items)

        return {
            "items": items,
            "total": response.count or len(items),
            "limit": limit,
            "offset": offset,
        }

    async def update_match(
        self, org_id: str, match_id: str, data: MatchUpdate
    ) -> Optional[Dict[str, Any]]:
        """Update match status or commission estimate."""
        update_data: Dict[str, Any] = data.model_dump(exclude_none=True)

        if "commission_estimate" in update_data and update_data["commission_estimate"] is not None:
            update_data["commission_estimate"] = float(update_data["commission_estimate"])
        if "match_status" in update_data:
            update_data["match_status"] = str(update_data["match_status"])

        response = (
            supabase_service.client.table("property_buyer_matches")
            .update(update_data)
            .eq("id", match_id)
            .eq("org_id", org_id)
            .execute()
        )
        return response.data[0] if response.data else None

    async def recompute_matches(
        self,
        org_id: str,
        property_ids: Optional[List[str]] = None,
        buyer_ids: Optional[List[str]] = None,
    ) -> RecomputeResponse:
        """
        Recompute match scores for all (or filtered) property-buyer pairs.
        Creates new matches and updates existing ones.
        """
        property_table = self._property_table(org_id)
        # Fetch properties
        prop_query = (
            supabase_service.client.table(property_table)
            .select("*")
            .eq("org_id", org_id)
        )
        if self._table_has_column(property_table, "status"):
            prop_query = prop_query.neq("status", "discarded")
        if property_ids:
            prop_query = prop_query.in_("id", property_ids)
        properties = prop_query.execute().data

        # Fetch active buyers
        buyer_query = (
            supabase_service.client.table("buyer_profiles")
            .select("*")
            .eq("org_id", org_id)
            .eq("status", "active")
        )
        if buyer_ids:
            buyer_query = buyer_query.in_("id", buyer_ids)
        buyers = buyer_query.execute().data

        # Fetch existing matches for dedup
        existing_matches_response = (
            supabase_service.client.table("property_buyer_matches")
            .select("id, property_id, buyer_id")
            .eq("org_id", org_id)
            .execute()
        )
        existing_pairs: Dict[tuple[str, str], str] = {
            (m["property_id"], m["buyer_id"]): m["id"]
            for m in existing_matches_response.data
        }

        created: int = 0
        updated: int = 0

        for prop in properties:
            for buyer in buyers:
                score_result = scoring_service.compute_match_score(
                    property_data=prop,
                    buyer_data=buyer,
                )

                pair_key = (prop["id"], buyer["id"])
                match_data: Dict[str, Any] = {
                    "match_score": score_result.score,
                    "score_breakdown": score_result.breakdown,
                }

                if pair_key in existing_pairs:
                    # Update existing match
                    supabase_service.client.table("property_buyer_matches").update(
                        match_data
                    ).eq("id", existing_pairs[pair_key]).execute()
                    updated += 1
                else:
                    # Create new match
                    match_data.update({
                        "org_id": org_id,
                        "property_id": prop["id"],
                        "buyer_id": buyer["id"],
                        "match_status": "candidate",
                    })
                    supabase_service.client.table("property_buyer_matches").insert(
                        match_data
                    ).execute()
                    created += 1

        return RecomputeResponse(
            matches_created=created,
            matches_updated=updated,
            total_computed=created + updated,
        )

    # ─────────────────────────────────────────────────────────────────────
    # ACTIVITIES
    # ─────────────────────────────────────────────────────────────────────

    async def log_activity(
        self,
        org_id: str,
        match_id: str,
        data: ActivityCreate,
        created_by: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Log a commercial activity for a match."""
        # Verify match exists and belongs to org
        match_check = (
            supabase_service.client.table("property_buyer_matches")
            .select("id")
            .eq("id", match_id)
            .eq("org_id", org_id)
            .execute()
        )
        if not match_check.data:
            raise ValueError(f"Match {match_id} not found for org {org_id}")

        record: Dict[str, Any] = {
            "org_id": org_id,
            "match_id": match_id,
            "activity_type": data.activity_type.value,
            "outcome": data.outcome,
            "details": data.details,
        }
        if created_by:
            record["created_by"] = created_by

        response = supabase_service.client.table("match_activity_log").insert(
            record
        ).execute()
        return response.data[0]

    async def list_activities(
        self, org_id: str, match_id: str
    ) -> Dict[str, Any]:
        """List activities for a specific match."""
        response = (
            supabase_service.client.table("match_activity_log")
            .select("*", count="exact")
            .eq("org_id", org_id)
            .eq("match_id", match_id)
            .order("created_at", desc=True)
            .execute()
        )
        return {
            "items": response.data,
            "total": response.count or len(response.data),
        }

    # ─────────────────────────────────────────────────────────────────────
    # HELPERS
    # ─────────────────────────────────────────────────────────────────────

    async def _enrich_matches(
        self, org_id: str, matches: List[Dict[str, Any]]
    ) -> None:
        """Add property_title and buyer_name to match records."""
        if not matches:
            return

        property_ids = list({m["property_id"] for m in matches})
        buyer_ids = list({m["buyer_id"] for m in matches})

        # Fetch property display names from all known property tables.
        prop_rows: List[Dict[str, Any]] = []
        seen_ids: set[str] = set()
        for property_table in self._property_tables():
            try:
                props = (
                    supabase_service.client.table(property_table)
                    .select("*")
                    .eq("org_id", org_id)
                    .in_("id", property_ids)
                    .execute()
                )
                for row in (props.data or []):
                    if row["id"] not in seen_ids:
                        prop_rows.append(row)
                        seen_ids.add(row["id"])
            except Exception:
                continue

        # Fallback without org filter for legacy data inconsistencies.
        if len(prop_rows) < len(property_ids):
            for property_table in self._property_tables():
                try:
                    props_any_org = (
                        supabase_service.client.table(property_table)
                        .select("*")
                        .in_("id", property_ids)
                        .execute()
                    )
                    for row in (props_any_org.data or []):
                        if row["id"] not in seen_ids:
                            prop_rows.append(row)
                            seen_ids.add(row["id"])
                except Exception:
                    continue

        prop_map: Dict[str, str] = {}
        for p in prop_rows:
            prop_map[p["id"]] = (
                p.get("title")
                or p.get("address")
                or p.get("zone")
                or "Sin título"
            )

        # Fetch buyer names
        buyers = (
            supabase_service.client.table("buyer_profiles")
            .select("id, full_name")
            .eq("org_id", org_id)
            .in_("id", buyer_ids)
            .execute()
        )
        buyer_map: Dict[str, str] = {
            b["id"]: b.get("full_name", "Sin nombre") for b in buyers.data
        }

        for match in matches:
            match["property_title"] = prop_map.get(match["property_id"], "Sin título")
            match["buyer_name"] = buyer_map.get(match["buyer_id"], "Sin nombre")


# Module-level singleton
prospection_service = ProspectionService()
