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
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════════════════
# ROUTES - Import AFTER app is created
# ═══════════════════════════════════════════════════════════════

from .routes.intelligence import router as intelligence_router

# Include Intelligence routes
app.include_router(intelligence_router, prefix="/api/intelligence", tags=["Intelligence"])

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
        "message": "Anclora Intelligence API v1.0",
        "endpoints": {
            "health": "/health",
            "intelligence": "/api/intelligence/query",
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
