from fastapi import APIRouter, HTTPException, Query, Request, status
from typing import Any, Dict
from backend.agents.graph import agent_executor
from backend.config import settings
from backend.models.partner_workspaces import (
    PublicPartnerOpportunityCreate,
    PublicPartnerWorkspaceProfileUpdate,
    PublicSharedOpportunityStatusUpdate,
)
from backend.services.partner_workspace_service import partner_workspace_service
from backend.services.captcha_verification_service import CaptchaVerificationError
from backend.models.valuation_requests import PublicValuationRequestCreate
from backend.services.valuation_request_service import valuation_request_service

router = APIRouter()


@router.get("/partner-workspace")
async def get_public_partner_workspace(token: str = Query(..., min_length=12)):
    try:
        result = await partner_workspace_service.get_workspace_by_token(token)
        if not result:
            raise HTTPException(status_code=404, detail="Partner workspace not found")
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/partner-workspace/opportunities", status_code=status.HTTP_201_CREATED)
async def create_public_partner_opportunity(data: PublicPartnerOpportunityCreate):
    try:
        result = await partner_workspace_service.create_opportunity_from_token(data)
        if not result:
            raise HTTPException(status_code=404, detail="Partner workspace not found")
        return {
            "status": "submitted",
            "opportunity_id": result.get("id"),
            "message": "Partner opportunity submitted",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/partner-workspace/profile")
async def update_public_partner_workspace_profile(data: PublicPartnerWorkspaceProfileUpdate):
    try:
        result = await partner_workspace_service.update_profile_from_token(data)
        if not result:
            raise HTTPException(status_code=404, detail="Partner workspace not found")
        return {"status": "updated", "workspace_id": result.get("id")}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/partner-workspace/shared-opportunities/{shared_opportunity_id}")
async def update_public_shared_opportunity_status(shared_opportunity_id: str, data: PublicSharedOpportunityStatusUpdate):
    try:
        result = await partner_workspace_service.update_shared_opportunity_status_from_token(shared_opportunity_id, data)
        if not result:
            raise HTTPException(status_code=404, detail="Shared opportunity not found")
        return {"status": "updated", "shared_opportunity_id": result.get("id")}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/valuation-requests", status_code=status.HTTP_201_CREATED)
async def create_public_valuation_request(data: PublicValuationRequestCreate, request: Request):
    try:
        result = await valuation_request_service.create_public_request(
            settings.PUBLIC_CTA_ORG_ID,
            data,
            request.client.host if request.client else None,
        )
        return {
            "status": "submitted",
            "request_id": result.get("id"),
            "message": "Valuation request submitted",
        }
    except HTTPException:
        raise
    except CaptchaVerificationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/cta/lead")
async def public_cta_lead_capture(data: Dict[str, Any]):
    """
    Public endpoint for external lead capture (e.g., from a website CTA).
    Performs minimal validation and triggers the lead_intake skill.
    """
    try:
        # Validate minimal fields required for intake
        if not data.get("name"):
             raise HTTPException(status_code=400, detail="Missing 'name' field")
             
        # Prepare state for LangGraph
        source_value = str(data.get("source", "")).strip() or "web-cta"
        source_system = str(data.get("source_system", "")).strip() or "cta_web"
        source_channel = str(data.get("source_channel", "")).strip() or "website"
        source_detail = data.get("source_detail") or "public_cta_form"

        # Hard rule: leads coming from Anclora Private Estates are always tagged as WEB.
        if source_detail == "private-estates-contact-form":
            source_value = "web"

        initial_state = {
            "input_data": {
                **data,
                "source": source_value,
                "source_system": source_system,
                "source_channel": source_channel,
                "source_detail": source_detail,
                "ingestion_mode": "realtime" # Force realtime for public CTAs
            },
            "skill_name": "lead_intake",
            "org_id": settings.PUBLIC_CTA_ORG_ID,
            "status": "pending"
        }
        
        # Run Graph
        result = await agent_executor.ainvoke(initial_state)
        
        if result.get("status") == "error":
            raise HTTPException(status_code=500, detail=result.get("error"))
        if result.get("status") == "blocked":
            raise HTTPException(
                status_code=429,
                detail=result.get("error") or "Lead intake blocked by constitutional limits",
            )

        final_result = result.get("final_result") or {}
        lead_id = final_result.get("lead_id")
        if not lead_id:
            raise HTTPException(
                status_code=500,
                detail="Lead intake completed without lead_id",
            )
            
        return {"status": "success", "lead_id": lead_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
