"""
Nexus Sellers API Routes

CRUD endpoints for the seller acquisition pipeline.
Sellers are detected prospects (FSBOs, stagnant listings, STR enforcement victims)
before they appear on the open market.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from datetime import datetime, timezone

from ...models.sellers import (
    NexusSellerCreate,
    NexusSellerUpdate,
    NexusSellerResponse,
    SellerStatsResponse,
    EstadoUpdate,
    EstadoContactoEnum,
    ZonaEnum,
    FuenteEnum,
)
from ...services import sellers_service
from ...services.supabase_service import SupabaseService
from ..deps import check_budget_hard_stop

router = APIRouter()

# Default org_id for single-tenant v0
DEFAULT_ORG_ID = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"

_db_service = None

def get_db() -> SupabaseService:
    global _db_service
    if _db_service is None:
        _db_service = SupabaseService()
    return _db_service


# ═══════════════════════════════════════════════════════════════
# LIST & STATS
# ═══════════════════════════════════════════════════════════════

@router.get("/", response_model=List[dict])
async def list_sellers(
    zona: Optional[str] = Query(None, description="Filter by zone"),
    estado: Optional[str] = Query(None, description="Filter by contact state"),
    fuente: Optional[str] = Query(None, description="Filter by source"),
    prioridad_min: Optional[int] = Query(None, ge=1, le=5, description="Minimum priority"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """
    List Nexus Sellers with optional filters.

    Ordered by priority (descending) and detection date (most recent first).
    """
    try:
        db = get_db()
        sellers = await sellers_service.get_sellers(
            db=db,
            org_id=DEFAULT_ORG_ID,
            zona=zona,
            estado=estado,
            fuente=fuente,
            prioridad_min=prioridad_min,
            limit=limit,
            offset=offset,
        )
        return sellers
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing sellers: {str(e)}")


@router.get("/stats", response_model=dict)
async def seller_stats():
    """
    Aggregated pipeline metrics for Nexus Sellers.

    Returns counts by estado, zona, fuente, plus whale count and conversion rate.
    """
    try:
        db = get_db()
        stats = await sellers_service.get_seller_stats(
            db=db,
            org_id=DEFAULT_ORG_ID,
        )
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing stats: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# CREATE
# ═══════════════════════════════════════════════════════════════

@router.post("/", response_model=dict, status_code=201)
async def create_seller(
    data: NexusSellerCreate,
    _budget=Depends(check_budget_hard_stop),
):
    """
    Create a new Nexus Seller prospect.

    Used for manual entry or automated scraping pipelines.
    The prioridad field uses the same 1-5 scale as leads:
    - 5 = Whale (respond <15 min)
    - 4 = High value (respond <2h)
    - 3 = Potential (respond <24h)
    - 1-2 = Cold / follow-up
    """
    try:
        db = get_db()
        seller = await sellers_service.create_seller(
            db=db,
            org_id=DEFAULT_ORG_ID,
            data=data,
        )
        return seller
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating seller: {str(e)}")


# ═══════════════════════════════════════════════════════════════
# ENUMS (for frontend dropdowns) — must be before /{seller_id}
# ═══════════════════════════════════════════════════════════════

@router.get("/meta/enums")
async def get_enums():
    """Return valid enum values for all Nexus Seller fields."""
    return {
        "zonas": [z.value for z in ZonaEnum],
        "fuentes": [f.value for f in FuenteEnum],
        "estados_contacto": [e.value for e in EstadoContactoEnum],
        "prioridades": {
            "5": "Whale — respond <15 min",
            "4": "High value — respond <2h",
            "3": "Potential — respond <24h",
            "2": "Follow-up — respond <48h",
            "1": "Cold — long-term nurturing",
        },
    }


# ═══════════════════════════════════════════════════════════════
# GET / UPDATE / ESTADO
# ═══════════════════════════════════════════════════════════════

@router.get("/{seller_id}", response_model=dict)
async def get_seller(seller_id: str):
    """Get a single Nexus Seller by ID."""
    try:
        db = get_db()
        seller = await sellers_service.get_seller(
            db=db,
            org_id=DEFAULT_ORG_ID,
            seller_id=seller_id,
        )
        if not seller:
            raise HTTPException(status_code=404, detail="Seller not found")
        return seller
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving seller: {str(e)}")


@router.patch("/{seller_id}/estado", response_model=dict)
async def update_seller_estado(
    seller_id: str,
    data: EstadoUpdate,
):
    """
    Update the contact state of a Nexus Seller.

    Valid transitions (pipeline progression):
    sin_contacto → primer_contacto → en_seguimiento →
    reunion_agendada → propuesta_enviada → mandato_exclusivo

    Or at any point: → descartado

    Automatically sets fecha_primer_contacto / fecha_ultimo_contacto /
    fecha_mandato based on the new state.
    """
    try:
        db = get_db()
        seller = await sellers_service.update_seller_estado(
            db=db,
            org_id=DEFAULT_ORG_ID,
            seller_id=seller_id,
            estado=data.estado_contacto.value,
            notas=data.notas,
        )
        if not seller:
            raise HTTPException(status_code=404, detail="Seller not found")
        return seller
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating seller estado: {str(e)}")
