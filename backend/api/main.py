"""
Anclora Intelligence API v1
FastAPI application for Intelligence orchestrator
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone

# Create FastAPI app
app = FastAPI(
    title="Anclora Intelligence API",
    description="Strategic Intelligence orchestrator for Anclora Real Estate",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    # Dev mode: permissive CORS to avoid localhost origin drift issues.
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════
# ROUTES - Import AFTER app is created
# ═══════════════════════════════════════════════════════════════

from .routes.intelligence import router as intelligence_router
from .routes.ingestion import router as ingestion_router
from .routes.prospection import router as prospection_router
from .routes.sellers import router as sellers_router
from .routes.skills import router as skills_router

# Include Intelligence routes (+ NotebookLM territorial insights)
app.include_router(intelligence_router, prefix="/api/intelligence", tags=["Intelligence"])

# Include Prospection & Buyer Matching routes
app.include_router(prospection_router, prefix="/api/prospection", tags=["Prospection"])

# Include Nexus Sellers — Motor de Adquisición de Vendedores
app.include_router(sellers_router, prefix="/api/sellers", tags=["Sellers"])

# Include operational skill runner routes used by frontend cron jobs
app.include_router(skills_router, prefix="/api", tags=["Skills"])

# Include unified ingestion routes
app.include_router(ingestion_router, prefix="/api", tags=["Ingestion"])

# ═══════════════════════════════════════════════════════════════
# HEALTH CHECK
# ═══════════════════════════════════════════════════════════════

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "Anclora Intelligence API v1.0",
    }

# ═══════════════════════════════════════════════════════════════
# ROOT
# ═══════════════════════════════════════════════════════════════

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Anclora Intelligence API v2.0",
        "endpoints": {
            "health": "/health",
            "intelligence": "/api/intelligence/query",
            "territorial_insights": "/api/intelligence/territorial-insights",
            "runtime_profile": "/api/intelligence/runtime-profile",
            "skills": "/api/skills/run",
            "ingestion": "/api/ingestion/events",
            "sellers": "/api/sellers/",
            "sellers_stats": "/api/sellers/stats",
            "docs": "/docs",
            "redoc": "/redoc",
        },
    }

# ═══════════════════════════════════════════════════════════════
# STARTUP / SHUTDOWN
# ═══════════════════════════════════════════════════════════════

@app.on_event("startup")
async def startup_event():
    """Startup event."""
    print("🚀 Anclora Intelligence API starting up...")

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event."""
    print("🛑 Anclora Intelligence API shutting down...")

# ═══════════════════════════════════════════════════════════════
# ENTRY POINT
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )
