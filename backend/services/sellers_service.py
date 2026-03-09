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


async def get_seller_workbench(
    db: SupabaseService,
    org_id: str,
    seller_id: str,
    interaction_limit: int = 20,
) -> Optional[Dict[str, Any]]:
    """
    Aggregate seller data, recent interactions and latest generated artifacts
    into a single payload for the Gravity Claw workbench.
    """
    seller = await get_seller(db=db, org_id=org_id, seller_id=seller_id)
    if not seller:
        return None

    interactions = await get_interactions(
        db=db,
        org_id=org_id,
        seller_id=seller_id,
        limit=interaction_limit,
    )

    latest_artifacts: Dict[str, Optional[Dict[str, Any]]] = {
        "dossier": None,
        "email_draft": None,
        "whatsapp_draft": None,
        "call_brief": None,
        "context_brief": None,
    }

    for item in interactions:
        metadata = item.get("metadata") or {}
        artifact = metadata.get("artifact")
        tipo = item.get("tipo")

        if not latest_artifacts["dossier"] and tipo == "dossier":
            latest_artifacts["dossier"] = item
        if not latest_artifacts["email_draft"] and tipo == "email_draft":
            latest_artifacts["email_draft"] = item
        if not latest_artifacts["whatsapp_draft"] and artifact == "whatsapp_draft":
            latest_artifacts["whatsapp_draft"] = item
        if not latest_artifacts["call_brief"] and artifact == "call_brief":
            latest_artifacts["call_brief"] = item
        if not latest_artifacts["context_brief"] and artifact == "context_brief":
            latest_artifacts["context_brief"] = item

    return {
        "seller": seller,
        "interactions": interactions,
        "latest_artifacts": latest_artifacts,
        "snapshot": {
            "has_argumentario": bool(seller.get("argumentario")),
            "has_email_draft": latest_artifacts["email_draft"] is not None,
            "has_whatsapp_draft": latest_artifacts["whatsapp_draft"] is not None,
            "has_call_brief": latest_artifacts["call_brief"] is not None,
            "has_context_brief": latest_artifacts["context_brief"] is not None,
            "interactions_count": len(interactions),
        },
    }


async def build_seller_dossier_export(
    db: SupabaseService,
    org_id: str,
    seller_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Build a normalized export payload for PDF/share workflows.
    """
    workbench = await get_seller_workbench(
        db=db,
        org_id=org_id,
        seller_id=seller_id,
        interaction_limit=30,
    )
    if not workbench:
        return None

    seller = workbench["seller"]
    artifacts = workbench["latest_artifacts"]

    nombre = seller.get("nombre_propietario") or "Vendedor"
    zona = seller.get("zona") or "general"
    prioridad = seller.get("prioridad") or 0
    estado = seller.get("estado_contacto") or "sin_contacto"

    email_draft = artifacts.get("email_draft")
    whatsapp_draft = artifacts.get("whatsapp_draft")
    call_brief = artifacts.get("call_brief")
    context_brief = artifacts.get("context_brief")
    dossier = artifacts.get("dossier")

    share_summary = (
        f"{nombre} · zona {zona} · prioridad P{prioridad} · estado {estado}\n\n"
        f"Dossier:\n{(dossier or {}).get('contenido', 'Pendiente de generar')[:500]}\n\n"
        f"Siguiente paso sugerido:\n{(context_brief or {}).get('contenido', 'Sin resumen de contexto')[:300]}"
    )

    return {
        "seller": seller,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "file_name": f"dossier-{str(nombre).strip().lower().replace(' ', '-')[:40] or 'seller'}-{str(seller_id)[:8]}.pdf",
        "sections": {
            "context_brief": (context_brief or {}).get("contenido", ""),
            "call_brief": (call_brief or {}).get("contenido", ""),
            "dossier": (dossier or {}).get("contenido", ""),
            "email_subject": ((email_draft or {}).get("metadata") or {}).get("subject", ""),
            "email_body": (email_draft or {}).get("contenido", ""),
            "whatsapp_body": (whatsapp_draft or {}).get("contenido", ""),
        },
        "share_summary": share_summary,
    }
