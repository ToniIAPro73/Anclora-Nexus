"""Lead pipeline reporting and staleness detection routes.

Exposes pipeline metrics (by temperature, owner, conversion funnel)
and staleness detection/flagging endpoints.

Requirements: 14.1, 14.2, 14.3, 14.4
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from backend.api.deps import get_org_id
from backend.models.lead_pipeline import PipelineMetricsResponse, StaleLeadInfo
from backend.services.lead_pipeline_service import lead_pipeline_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/leads/metrics",
    response_model=PipelineMetricsResponse,
    responses={
        200: {"description": "Pipeline metrics including temperature, owner, funnel, and stale leads"},
    },
)
async def get_pipeline_metrics(
    org_id: str = Depends(get_org_id),
) -> PipelineMetricsResponse:
    """Return pipeline metrics: leads by temperature, owner, conversion funnel, and stale leads.

    All queries are scoped by org_id. Stale leads are identified but not
    automatically flagged — use POST /leads/detect-stale to flag them.
    """
    try:
        return await lead_pipeline_service.get_pipeline_metrics(org_id)
    except Exception as exc:
        logger.error("Failed to get pipeline metrics for org %s: %s", org_id, exc)
        raise HTTPException(status_code=500, detail="Failed to retrieve pipeline metrics")


@router.post(
    "/leads/detect-stale",
    response_model=list[StaleLeadInfo],
    responses={
        200: {"description": "List of leads newly flagged as stale"},
    },
)
async def detect_stale_leads(
    org_id: str = Depends(get_org_id),
) -> list[StaleLeadInfo]:
    """Detect and flag stale leads.

    Flags leads with no next_action_due and created_at > 48h as 'stale'.
    Emits alerts to Command Center for the assigned owners.
    """
    try:
        return await lead_pipeline_service.detect_and_flag_stale_leads(org_id)
    except Exception as exc:
        logger.error("Failed to detect stale leads for org %s: %s", org_id, exc)
        raise HTTPException(status_code=500, detail="Failed to detect stale leads")


@router.post(
    "/leads/{lead_id}/temperature",
    responses={
        200: {"description": "Temperature updated and event emitted"},
        404: {"description": "Lead not found"},
    },
)
async def update_lead_temperature(
    lead_id: str,
    payload: dict[str, Any],
    org_id: str = Depends(get_org_id),
) -> dict[str, str]:
    """Update a lead's temperature and emit event to Command Center.

    Request body: { "temperature": "cold" | "warm" | "hot" }
    """
    new_temperature = payload.get("temperature")
    if new_temperature not in ("cold", "warm", "hot"):
        raise HTTPException(status_code=400, detail="Invalid temperature. Must be cold, warm, or hot.")

    try:
        # Fetch current lead
        response = (
            lead_pipeline_service.client.table("leads_pipeline")
            .select("id, temperature, assigned_owner")
            .eq("id", lead_id)
            .eq("org_id", org_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Lead not found")

        lead = response.data[0]
        old_temperature = lead.get("temperature", "cold")

        if old_temperature == new_temperature:
            return {"status": "unchanged", "temperature": new_temperature}

        # Update temperature
        from datetime import datetime, timezone

        lead_pipeline_service.client.table("leads_pipeline").update(
            {"temperature": new_temperature, "updated_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", lead_id).eq("org_id", org_id).execute()

        # Emit event to Command Center
        await lead_pipeline_service.emit_temperature_change_event(
            org_id=org_id,
            lead_id=lead_id,
            old_temperature=old_temperature,
            new_temperature=new_temperature,
        )

        return {"status": "updated", "temperature": new_temperature}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update temperature for lead %s: %s", lead_id, exc)
        raise HTTPException(status_code=500, detail="Failed to update lead temperature")


@router.post(
    "/leads/{lead_id}/owner",
    responses={
        200: {"description": "Owner updated and event emitted"},
        404: {"description": "Lead not found"},
    },
)
async def update_lead_owner(
    lead_id: str,
    payload: dict[str, Any],
    org_id: str = Depends(get_org_id),
) -> dict[str, str | None]:
    """Update a lead's assigned owner and emit event to Command Center.

    Request body: { "assigned_owner": "<uuid>" | null }
    """
    new_owner = payload.get("assigned_owner")

    try:
        # Fetch current lead
        response = (
            lead_pipeline_service.client.table("leads_pipeline")
            .select("id, assigned_owner")
            .eq("id", lead_id)
            .eq("org_id", org_id)
            .limit(1)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Lead not found")

        lead = response.data[0]
        old_owner = str(lead["assigned_owner"]) if lead.get("assigned_owner") else None

        if old_owner == new_owner:
            return {"status": "unchanged", "assigned_owner": new_owner}

        # Update owner
        from datetime import datetime, timezone

        lead_pipeline_service.client.table("leads_pipeline").update(
            {"assigned_owner": new_owner, "updated_at": datetime.now(timezone.utc).isoformat()}
        ).eq("id", lead_id).eq("org_id", org_id).execute()

        # Emit event to Command Center
        await lead_pipeline_service.emit_owner_change_event(
            org_id=org_id,
            lead_id=lead_id,
            old_owner=old_owner,
            new_owner=new_owner,
        )

        return {"status": "updated", "assigned_owner": new_owner}
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update owner for lead %s: %s", lead_id, exc)
        raise HTTPException(status_code=500, detail="Failed to update lead owner")
