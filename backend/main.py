from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from backend.services.supabase_service import supabase_service
from backend.api.routes import router as api_router
from backend.api.routes.memberships import router as memberships_router

app = FastAPI(title="Anclora Nexus API", version="0.1.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Register Routes
app.include_router(api_router, prefix="/api", tags=["Nexus API"])
app.include_router(memberships_router, prefix="/api", tags=["Memberships"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
