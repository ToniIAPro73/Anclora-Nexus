from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from backend.services.supabase_service import supabase_service
from backend.api.routes import router as api_router
from backend.api.routes.memberships import router as memberships_router
from backend.api.routes.prospection import router as prospection_router
from backend.api.routes.finops import router as finops_router
from backend.api.routes.ingestion import router as ingestion_router
from backend.api.routes.dq import router as dq_router
from backend.api.routes.feeds import router as feeds_router
from backend.api.routes.editability import router as editability_router
from backend.api.routes.automation import router as automation_router
from backend.api.routes.command_center import router as command_center_router

app = FastAPI(title="Anclora Nexus API", version="0.1.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    # Dev mode: permissive CORS to avoid localhost origin drift issues.
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(api_router, prefix="/api", tags=["Nexus API"])
app.include_router(memberships_router, prefix="/api", tags=["Memberships"])
app.include_router(prospection_router, prefix="/api/prospection", tags=["Prospection"])
app.include_router(finops_router, prefix="/api/finops", tags=["FinOps"])
app.include_router(ingestion_router, prefix="/api", tags=["Ingestion"])
app.include_router(dq_router, prefix="/api/dq", tags=["Data Quality"])
app.include_router(feeds_router, prefix="/api/feeds", tags=["Feeds"])
app.include_router(editability_router, prefix="/api", tags=["Editability"])
app.include_router(automation_router, prefix="/api/automation", tags=["Automation"])
app.include_router(command_center_router, prefix="/api/command-center", tags=["Command Center"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
