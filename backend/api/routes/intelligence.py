"""
Anclora Intelligence API Routes
Endpoints for Intelligence orchestrator and NotebookLM territorial insights cache.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

# Import Intelligence
from ...intelligence import create_orchestrator
from ...services.notebooklm_service import (
    NOTEBOOK_ID,
    NOTEBOOK_NAME,
    get_latest_insights,
    get_territorial_summary,
    get_vulnerabilidades,
    save_insight,
)
from ...services.ai_runtime import get_runtime_summary
from ...services.supabase_service import SupabaseService
from ...services.territorial_sync_service import get_territorial_sync_status
from ...services.statefox_discovery_service import get_statefox_discovery
from ...services.statefox_bridge_service import parse_statefox_raw, import_statefox_listings
from ..deps import check_budget_hard_stop
from ..deps import get_org_id

# Create router
router = APIRouter()

# ═══════════════════════════════════════════════════════════════
# SCHEMAS (Pydantic models for request/response)
# ═══════════════════════════════════════════════════════════════

class QueryRequest(BaseModel):
    """Request model for Intelligence query."""
    message: str
    user_id: Optional[str] = "anonymous"
    
    class Config:
        example = {
            "message": "¿Es buen momento para solicitar excedencia en CGI?",
            "user_id": "toni"
        }


class QueryResponse(BaseModel):
    """Response model for Intelligence query."""
    correlation_id: str
    status: str
    query_plan: Optional[Dict[str, Any]]
    governor_decision: Optional[Dict[str, Any]]
    synthesizer_output: Optional[Dict[str, Any]]
    execution_times: Optional[Dict[str, float]]
    error: Optional[str] = None
    timestamp: str


class StatefoxParseRequest(BaseModel):
    raw_text: str
    zone: Optional[str] = None
    city: Optional[str] = "Mallorca"


# ═══════════════════════════════════════════════════════════════
# GLOBAL ORCHESTRATOR INSTANCE
# ═══════════════════════════════════════════════════════════════

_orchestrator = None

def get_orchestrator():
    """Get or create orchestrator instance."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = create_orchestrator()
    return _orchestrator


# ═══════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.post("/query", response_model=QueryResponse)
async def process_query(
    request: QueryRequest,
    _budget = Depends(check_budget_hard_stop)
):
    """
    Process a query through Intelligence pipeline.
    
    Takes a user message, routes it through Router → Governor → Synthesizer,
    and returns a structured decision with reasoning.
    
    Args:
        request: QueryRequest with message and optional user_id
    
    Returns:
        QueryResponse with full Intelligence output
    """
    
    try:
        # Get orchestrator
        orchestrator = get_orchestrator()
        
        # Process query
        result, error = orchestrator.process_query(
            message=request.message,
            user_id=request.user_id
        )
        
        if error:
            raise HTTPException(status_code=400, detail=f"Intelligence error: {error}")
        
        if not result:
            raise HTTPException(status_code=500, detail="Intelligence returned empty result")
        
        # Map result to response
        response = QueryResponse(
            correlation_id=result.get("correlation_id"),
            status=result.get("processing_status", "unknown"),
            query_plan=result.get("query_plan"),
            governor_decision=result.get("governor_decision"),
            synthesizer_output=result.get("synthesizer_output"),
            execution_times=result.get("execution_times"),
            error=result.get("error"),
            timestamp=result.get("timestamp", datetime.now(timezone.utc).isoformat()),
        )
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@router.get("/status")
async def intelligence_status():
    """
    Get Intelligence system status.
    
    Returns:
        Status information about the Intelligence system
    """
    
    return {
        "service": "Anclora Intelligence",
        "version": "1.0.0",
        "status": "ready",
        "components": {
            "router": "ready",
            "governor": "ready",
            "synthesizer": "ready",
            "orchestrator": "ready",
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/info")
async def intelligence_info():
    """
    Get Intelligence system information.
    
    Returns:
        Information about Intelligence capabilities and limits
    """
    
    return {
        "name": "Anclora Intelligence v1.0",
        "description": "Strategic Intelligence orchestrator for Anclora Real Estate",
        "phase": "1",
        "capabilities": {
            "query_processing": True,
            "strategic_mode": "2.0-notebooklm-integration",
            "domains_enabled": ["market", "brand", "tax", "transition", "system", "territorial"],
            "domains_disabled": ["growth", "lab"],
            "max_domains_per_query": 3,
            "retrieval_enabled": True,
            "notebooklm_notebook": NOTEBOOK_NAME,
            "notebooklm_notebook_id": NOTEBOOK_ID,
            "ai_runtime_profile": get_runtime_summary().get("profile"),
        },
        "limits": {
            "max_message_length": 5000,
            "max_response_time_ms": 120000,
            "rate_limit": "unlimited (dev)",
        },
        "endpoints": {
            "query": "POST /api/intelligence/query",
            "status": "GET /api/intelligence/status",
            "info": "GET /api/intelligence/info",
            "runtime_profile": "GET /api/intelligence/runtime-profile",
        },
    }


@router.get("/runtime-profile")
async def intelligence_runtime_profile():
    """
    Return the active AI runtime profile and task-to-model routing.

    This contract is part of ANCLORA-AIRP-001 and exists so QA/operations
    can verify that Groq + Cloudflare routing is correctly configured
    without relying on hidden environment variables.
    """
    return {
        "runtime": get_runtime_summary(),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ═══════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════════════════════════

@router.get("/health")
async def intelligence_health():
    """
    Health check for Intelligence service.

    Returns:
        Health status
    """

    return {
        "service": "Anclora Intelligence",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ═══════════════════════════════════════════════════════════════
# NOTEBOOKLM TERRITORIAL INSIGHTS ENDPOINTS
# ═══════════════════════════════════════════════════════════════

_db_service = None

def get_db() -> SupabaseService:
    global _db_service
    if _db_service is None:
        _db_service = SupabaseService()
    return _db_service


@router.get("/territorial-insights")
async def get_territorial_insights(
    insight_type: Optional[str] = Query(None, description="Filter by type: territorial, cma, competitive, whale_audit, buyer_profile, market_signal"),
    zona: Optional[str] = Query(None, description="Filter by zone: andratx, calvia, son_ferrer, santa_ponca, paguera, portals_nous, bendinat, punta_negra, costa_den_blanes, general"),
    limit: int = Query(10, ge=1, le=50),
):
    """
    Retrieve territorial intelligence insights cached from NotebookLM.

    These insights are generated by Claude Code querying the configured
    NotebookLM territorial notebook via MCP, then stored in Supabase for
    the frontend dashboard to consume.

    Returns:
        List of intelligence insights, ordered by most recent first.
    """
    try:
        db = get_db()
        # Use hardcoded org_id for v0 single-tenant
        ORG_ID = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"
        insights = await get_latest_insights(
            db=db,
            org_id=ORG_ID,
            insight_type=insight_type,
            zona=zona,
            limit=limit,
        )
        return {
            "insights": insights,
            "count": len(insights),
            "notebook": NOTEBOOK_NAME,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving insights: {str(e)}")


@router.get("/territorial-summary")
async def get_territorial_summary_endpoint():
    """
    Retrieve the latest territorial insight per zone for the Radar Territorial
    dashboard widget. Returns a dict with zone names as keys.
    """
    try:
        db = get_db()
        ORG_ID = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"
        summary = await get_territorial_summary(db=db, org_id=ORG_ID)
        return {
            "summary": summary,
            "zones_with_data": list(summary.keys()),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving summary: {str(e)}")


@router.get("/vulnerabilidades")
async def get_vulnerabilidades_endpoint():
    """
    Retrieve the most recent territorial vulnerabilities/opportunities insight.
    Corresponds to the content of public/docs/vulnerabilidades.md but served via API.
    """
    try:
        db = get_db()
        ORG_ID = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"
        vuln = await get_vulnerabilidades(db=db, org_id=ORG_ID)
        if not vuln:
            return {
                "message": "No territorial vulnerability analysis available yet. "
                           "Run NotebookLM sync to generate insights.",
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        return {
            "insight": vuln,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving vulnerabilities: {str(e)}")


@router.get("/territorial-sync-status")
async def get_territorial_sync_status_endpoint():
    """
    Return the control-plane status of the territorial NotebookLM sync pack.

    This exposes validation, freshness, coverage and source references so the
    frontend and operations can verify that the sync pack remains the primary
    territorial source without manually inspecting repo files.
    """
    try:
        status = get_territorial_sync_status()
        return {
            "sync_status": status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving territorial sync status: {str(e)}")


@router.get("/statefox-discovery")
async def get_statefox_discovery_endpoint():
    """
    Return discovery evidence and import strategy for the StateFox Telegram
    surface observed by operations.
    """
    try:
        return {
            "discovery": get_statefox_discovery(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving StateFox discovery: {str(e)}")


@router.post("/statefox-bridge/parse")
async def parse_statefox_bridge(payload: StatefoxParseRequest):
    try:
        parsed = parse_statefox_raw(payload.raw_text)
        return {
            "parsed": parsed,
            "zone": payload.zone,
            "city": payload.city,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing StateFox payload: {str(e)}")


@router.post("/statefox-bridge/import")
async def import_statefox_bridge(
    payload: StatefoxParseRequest,
    org_id: str = Depends(get_org_id),
    _budget=Depends(check_budget_hard_stop),
):
    try:
        result = await import_statefox_listings(
            org_id=org_id,
            raw_text=payload.raw_text,
            zone=payload.zone,
            city=payload.city,
        )
        return {
            "result": result,
            "org_id": org_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error importing StateFox payload: {str(e)}")
