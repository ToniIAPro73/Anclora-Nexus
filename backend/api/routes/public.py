from fastapi import APIRouter, HTTPException
from typing import Any, Dict
from backend.agents.graph import agent_executor

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
        initial_state = {
            "input_data": {
                **data,
                "ingestion_mode": "realtime" # Force realtime for public CTAs
            },
            "skill_name": "lead_intake",
            "org_id": "00000000-0000-0000-0000-000000000000", # Fixed Org ID for v0 public leads
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
