"""
Operational skill runner routes.

These routes expose the small set of skills needed by frontend cron jobs and
manual ops without going through the legacy graph dispatcher.
"""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Header, HTTPException

from ...config import settings
from ...services.finops import finops_service
from ...services.llm_service import llm_service
from ...services.supabase_service import supabase_service
from ...skills.notebooklm_sync import run_notebooklm_sync
from ...skills.prospection_weekly import run_prospection_weekly
from ...skills.recap_weekly import run_recap_weekly
from ...skills.seller_outreach_batch import run_seller_outreach_batch
from ...skills.seller_signal_ingest import run_seller_signal_ingest


router = APIRouter()


async def _resolve_org_id(
    authorization: Optional[str],
    x_cron_secret: Optional[str],
    requested_org_id: Optional[str],
) -> str:
    # Internal cron path: shared secret instead of Supabase JWT
    if settings.CRON_SECRET and x_cron_secret == settings.CRON_SECRET:
        return requested_org_id or supabase_service.fixed_org_id

    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        token = authorization.split(" ", 1)[1] if " " in authorization else authorization
        user_response = supabase_service.client.auth.get_user(token)
        user = user_response.user
        if not user:
            raise HTTPException(status_code=401, detail="Invalid session")
        response = (
            supabase_service.client.table("user_profiles")
            .select("org_id")
            .eq("id", user.id)
            .single()
            .execute()
        )
        profile = response.data or {}
        return str(profile.get("org_id") or requested_org_id or supabase_service.fixed_org_id)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Auth error: {str(exc)}")


@router.post("/skills/run")
async def run_skill(
    payload: Dict[str, Any],
    authorization: Optional[str] = Header(None),
    x_cron_secret: Optional[str] = Header(None),
):
    skill_name = payload.get("skill")
    skill_data = payload.get("data", {})

    if not skill_name:
        raise HTTPException(status_code=400, detail="Missing 'skill' field in payload")

    org_id = await _resolve_org_id(
        authorization=authorization,
        x_cron_secret=x_cron_secret,
        requested_org_id=skill_data.get("org_id"),
    )
    budget_status = await finops_service.get_budget_status(org_id)
    if budget_status.status == "hard_stop":
        raise HTTPException(
            status_code=402,
            detail="Monthly budget exceeded. Critical operations only (402 Payment Required).",
        )

    merged_data = {**skill_data, "org_id": skill_data.get("org_id", org_id)}

    skill_map = {
        "prospection_weekly": run_prospection_weekly,
        "recap_weekly": run_recap_weekly,
        "notebooklm_sync": run_notebooklm_sync,
        "seller_signal_ingest": run_seller_signal_ingest,
        "seller_outreach_batch": run_seller_outreach_batch,
    }

    runner = skill_map.get(skill_name)
    if not runner:
        raise HTTPException(status_code=404, detail=f"Unsupported skill: {skill_name}")

    try:
        return await runner(merged_data, llm_service, supabase_service)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
