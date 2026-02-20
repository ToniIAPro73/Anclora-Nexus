from fastapi import APIRouter, HTTPException
from typing import Any, Dict
from backend.agents.graph import agent_executor
from backend.config import settings

router = APIRouter()

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
            
        return {"status": "success", "lead_id": result.get("final_result", {}).get("lead_id")}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
