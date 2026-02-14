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
        if "price" in record and record["price"] is not None:
            record["price"] = float(record["price"])

        # Compute initial high_ticket_score
        score_result = scoring_service.compute_high_ticket_score(
            price=float(data.price) if data.price else None,
            zone=data.zone,
            property_type=data.property_type,
            area_m2=float(data.area_m2) if data.area_m2 else None,
            bedrooms=data.bedrooms,
        )
        record["high_ticket_score"] = score_result.score
        record["score_breakdown"] = score_result.breakdown

        response = supabase_service.client.table("prospected_properties").insert(
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
        query = (
            supabase_service.client.table("prospected_properties")
            .select("*", count="exact")
            .eq("org_id", org_id)
            .order("high_ticket_score", desc=True)
        )

        if zone:
            query = query.eq("zone", zone)
        if status:
            query = query.eq("status", status)
        if min_score is not None:
            query = query.gte("high_ticket_score", min_score)

        query = query.range(offset, offset + limit - 1)
        response = query.execute()

        return {
            "items": response.data,
            "total": response.count or len(response.data),
            "limit": limit,
            "offset": offset,
        }

    async def get_property(self, org_id: str, property_id: str) -> Optional[Dict[str, Any]]:
        """Get a single property by ID with org isolation."""
        response = (
            supabase_service.client.table("prospected_properties")
            .select("*")
            .eq("id", property_id)
            .eq("org_id", org_id)
            .execute()
        )
        return response.data[0] if response.data else None

    async def update_property(
        self, org_id: str, property_id: str, data: PropertyUpdate
    ) -> Optional[Dict[str, Any]]:
        """Update a prospected property."""
        update_data: Dict[str, Any] = data.model_dump(exclude_none=True)

        # Normalize Enums to strings for Supabase
        if "source_system" in update_data:
            update_data["source_system"] = str(update_data["source_system"].value)
        if "source_portal" in update_data and update_data["source_portal"] is not None:
            update_data["source_portal"] = str(update_data["source_portal"].value)

        if "price" in update_data and update_data["price"] is not None:
            update_data["price"] = float(update_data["price"])

        response = (
            supabase_service.client.table("prospected_properties")
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
            supabase_service.client.table("prospected_properties")
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
        # Fetch properties
        prop_query = (
            supabase_service.client.table("prospected_properties")
            .select("*")
            .eq("org_id", org_id)
            .neq("status", "discarded")
        )
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

        # Fetch property titles
        props = (
            supabase_service.client.table("prospected_properties")
            .select("id, title")
            .eq("org_id", org_id)
            .in_("id", property_ids)
            .execute()
        )
        prop_map: Dict[str, str] = {
            p["id"]: p.get("title", "Sin título") for p in props.data
        }

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
