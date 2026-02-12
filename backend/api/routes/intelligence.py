"""
Anclora Intelligence API Routes
Endpoints for Intelligence orchestrator
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime, timezone

# Import Intelligence
from ...intelligence import create_orchestrator

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
async def process_query(request: QueryRequest):
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
            "strategic_mode": "1.0-validation-phase",
            "domains_enabled": ["market", "brand", "tax", "transition", "system"],
            "domains_disabled": ["growth", "lab"],
            "max_domains_per_query": 3,
            "retrieval_enabled": False,  # Phase 1
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
        },
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
