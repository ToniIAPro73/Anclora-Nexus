"""
Nexus Sellers Service

Business logic for the seller acquisition pipeline.
All queries enforce org_id isolation (single-tenant v0).
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .supabase_service import SupabaseService
from ..models.sellers import (
    NexusSellerCreate,
    NexusSellerUpdate,
    EstadoContactoEnum,
    ZonaEnum,
    FuenteEnum,
)

# Default org_id for single-tenant v0
DEFAULT_ORG_ID = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"


async def create_seller(
    db: SupabaseService,
    org_id: str,
    data: NexusSellerCreate,
) -> Dict[str, Any]:
    """
    Create a new Nexus Seller prospect.

    Args:
        db: SupabaseService instance
        org_id: Organization UUID
        data: NexusSellerCreate payload

    Returns:
        Created seller record
    """
    row = {
        "org_id": str(org_id),
        **data.model_dump(exclude_none=True),
        "zona": data.zona.value,
        "fuente": data.fuente.value,
        "estado_contacto": data.estado_contacto.value,
    }

    # Convert enums to strings if needed
    if "senales_motivacion" in row and row["senales_motivacion"] is None:
        row["senales_motivacion"] = []

    result = db.client.table("nexus_sellers").insert(row).execute()
    return result.data[0] if result.data else row


async def get_sellers(
    db: SupabaseService,
    org_id: str,
    zona: Optional[str] = None,
    estado: Optional[str] = None,
    fuente: Optional[str] = None,
    prioridad_min: Optional[int] = None,
    limit: int = 50,
    offset: int = 0,
) -> List[Dict[str, Any]]:
    """
    List Nexus Sellers with optional filters.

    Args:
        db: SupabaseService instance
        org_id: Organization UUID
        zona: Filter by zone (optional)
        estado: Filter by contact state (optional)
        fuente: Filter by source (optional)
        prioridad_min: Minimum priority level (optional)
        limit: Max results (default 50)
        offset: Pagination offset (default 0)

    Returns:
        List of seller records ordered by prioridad DESC, fecha_deteccion DESC
    """
    query = (
        db.client.table("nexus_sellers")
        .select("*")
        .eq("org_id", str(org_id))
        .order("prioridad", desc=True)
        .order("fecha_deteccion", desc=True)
        .range(offset, offset + limit - 1)
    )

    if zona:
        query = query.eq("zona", zona)
    if estado:
        query = query.eq("estado_contacto", estado)
    if fuente:
        query = query.eq("fuente", fuente)
    if prioridad_min is not None:
        query = query.gte("prioridad", prioridad_min)

    result = query.execute()
    return result.data or []


async def get_seller(
    db: SupabaseService,
    org_id: str,
    seller_id: str,
) -> Optional[Dict[str, Any]]:
    """Get a single seller by ID."""
    result = (
        db.client.table("nexus_sellers")
        .select("*")
        .eq("org_id", str(org_id))
        .eq("id", str(seller_id))
        .single()
        .execute()
    )
    return result.data


async def update_seller_estado(
    db: SupabaseService,
    org_id: str,
    seller_id: str,
    estado: str,
    notas: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """
    Update the contact state of a seller.
    Automatically sets timestamp fields based on state transition.

    Args:
        db: SupabaseService instance
        org_id: Organization UUID
        seller_id: Seller UUID
        estado: New EstadoContactoEnum value
        notas: Optional notes about the state change

    Returns:
        Updated seller record
    """
    now = datetime.now(timezone.utc).isoformat()
    update_data: Dict[str, Any] = {"estado_contacto": estado}

    # Set timeline timestamps based on state
    if estado == EstadoContactoEnum.primer_contacto.value:
        update_data["fecha_primer_contacto"] = now
        update_data["fecha_ultimo_contacto"] = now
    elif estado in (
        EstadoContactoEnum.en_seguimiento.value,
        EstadoContactoEnum.reunion_agendada.value,
        EstadoContactoEnum.propuesta_enviada.value,
        EstadoContactoEnum.descartado.value,
    ):
        update_data["fecha_ultimo_contacto"] = now
    elif estado == EstadoContactoEnum.mandato_exclusivo.value:
        update_data["fecha_ultimo_contacto"] = now
        update_data["fecha_mandato"] = now

    if notas:
        update_data["notas"] = notas

    result = (
        db.client.table("nexus_sellers")
        .update(update_data)
        .eq("org_id", str(org_id))
        .eq("id", str(seller_id))
        .execute()
    )
    return result.data[0] if result.data else None


async def get_seller_stats(
    db: SupabaseService,
    org_id: str,
) -> Dict[str, Any]:
    """
    Aggregated metrics for the Nexus Sellers pipeline.

    Returns counts by estado, zona, fuente, and conversion rates.
    """
    result = (
        db.client.table("nexus_sellers")
        .select("estado_contacto, zona, fuente, prioridad")
        .eq("org_id", str(org_id))
        .execute()
    )

    rows = result.data or []
    total = len(rows)

    por_estado: Dict[str, int] = {}
    por_zona: Dict[str, int] = {}
    por_fuente: Dict[str, int] = {}
    whales = 0
    alta_prioridad = 0

    for row in rows:
        estado = row.get("estado_contacto", "unknown")
        zona = row.get("zona", "unknown")
        fuente = row.get("fuente", "unknown")
        prioridad = row.get("prioridad", 3)

        por_estado[estado] = por_estado.get(estado, 0) + 1
        por_zona[zona] = por_zona.get(zona, 0) + 1
        por_fuente[fuente] = por_fuente.get(fuente, 0) + 1

        if prioridad >= 5:
            whales += 1
        if prioridad >= 4:
            alta_prioridad += 1

    mandatos = por_estado.get(EstadoContactoEnum.mandato_exclusivo.value, 0)
    tasa_mandatos = round((mandatos / total * 100) if total > 0 else 0.0, 1)

    return {
        "total": total,
        "por_estado": por_estado,
        "por_zona": por_zona,
        "por_fuente": por_fuente,
        "whales": whales,
        "alta_prioridad": alta_prioridad,
        "tasa_mandatos": tasa_mandatos,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ═══════════════════════════════════════════════════════════════
# INTERACTION MEMORY (Gravity Claw Phase 4)
# ═══════════════════════════════════════════════════════════════

async def add_interaction(
    db: SupabaseService,
    org_id: str,
    seller_id: str,
    tipo: str,
    contenido: str,
    estado: str = "realizado",
    resultado: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Log a seller interaction (call, email, WhatsApp, meeting, note, draft).

    Args:
        tipo: 'llamada' | 'email' | 'whatsapp' | 'reunion' | 'nota' | 'email_draft' | 'dossier'
        estado: 'realizado' | 'borrador' | 'programado'
    """
    row = {
        "org_id": str(org_id),
        "seller_id": str(seller_id),
        "tipo": tipo,
        "estado": estado,
        "contenido": contenido,
        "metadata": metadata or {},
    }
    if resultado:
        row["resultado"] = resultado

    result = db.client.table("seller_interactions").insert(row).execute()
    return result.data[0] if result.data else {}


async def get_interactions(
    db: SupabaseService,
    org_id: str,
    seller_id: str,
    limit: int = 20,
) -> List[Dict[str, Any]]:
    """
    Get interaction history for a seller, most recent first.
    """
    result = (
        db.client.table("seller_interactions")
        .select("*")
        .eq("org_id", str(org_id))
        .eq("seller_id", str(seller_id))
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []
