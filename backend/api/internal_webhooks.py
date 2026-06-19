from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from backend.config import settings
from backend.services.supabase_service import supabase_service

router = APIRouter(prefix="/api/internal/webhooks", tags=["Internal Webhooks"])

api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

def get_api_key(api_key: str = Security(api_key_header)):
    if not api_key:
        raise HTTPException(status_code=403, detail="Missing API Key")
    token = api_key.replace("Bearer ", "").strip()
    expected = settings.NEXUS_INTERNAL_API_KEY
    if not expected or token != expected:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return token


@router.post("/dms-retention-sweep")
async def dms_retention_sweep(api_key: str = Depends(get_api_key)):
    """Trigger retention enforcement for all active orgs.

    Called by an external cron (Vercel Cron, GitHub Actions schedule, etc.)
    with the NEXUS_INTERNAL_API_KEY as Bearer token.
    """
    from backend.services.document_retention_service import enforce_retention_for_org

    # Fetch all distinct org IDs that have generated documents
    try:
        orgs_response = (
            supabase_service.client
            .table("generated_documents")
            .select("org_id")
            .neq("status", "archived")
            .execute()
        )
        org_ids = list({row["org_id"] for row in (orgs_response.data or [])})
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to list orgs: {exc}") from exc

    results = []
    errors = []
    for org_id in org_ids:
        try:
            result = await enforce_retention_for_org(org_id)
            results.append(result)
        except Exception as exc:
            errors.append({"org_id": org_id, "error": str(exc)})

    return {
        "orgs_processed": len(results),
        "errors": errors,
        "summary": results,
    }
