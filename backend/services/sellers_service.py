"""
Nexus Sellers Service

Business logic for the seller acquisition pipeline.
All queries enforce org_id isolation (single-tenant v0).
"""

from datetime import datetime, timezone
import re
from typing import Any, Dict, List, Optional
from urllib.parse import quote

from .email_delivery_service import get_email_transport_summary, send_email_native
from .supabase_service import SupabaseService
from .seller_memory_service import seller_memory_service
from ..models.sellers import (
    NexusSellerCreate,
    NexusSellerUpdate,
    EstadoContactoEnum,
    ZonaEnum,
    FuenteEnum,
)

# Default org_id for single-tenant v0
DEFAULT_ORG_ID = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"


def _latest_touch_timestamp(interactions: List[Dict[str, Any]]) -> Optional[str]:
    for item in interactions:
        created_at = item.get("created_at")
        if created_at:
            return str(created_at)
    return None


def _memory_focus_terms(memory_matches: List[Dict[str, Any]]) -> List[str]:
    terms: List[str] = []
    for match in memory_matches[:3]:
        for keyword in match.get("matched_keywords") or []:
            if keyword not in terms:
                terms.append(str(keyword))
    return terms[:6]


def _build_workbench_console(
    seller: Dict[str, Any],
    latest_artifacts: Dict[str, Optional[Dict[str, Any]]],
    interactions: List[Dict[str, Any]],
    memory_payload: Dict[str, Any],
) -> Dict[str, Any]:
    estado = str(seller.get("estado_contacto") or "sin_contacto")
    has_dossier = latest_artifacts.get("dossier") is not None
    has_email = latest_artifacts.get("email_draft") is not None
    has_whatsapp = latest_artifacts.get("whatsapp_draft") is not None
    has_call_brief = latest_artifacts.get("call_brief") is not None
    email_contact = bool(_extract_email(seller))
    whatsapp_contact = bool(_extract_whatsapp(seller))
    memory_matches = memory_payload.get("matches") or []
    focus_terms = _memory_focus_terms(memory_matches)

    readiness = "ready_to_send"
    next_action = "Launch supervised outreach"
    recommended_channel = "call"
    reasons: List[str] = []

    if not has_dossier or not has_call_brief:
        readiness = "needs_dossier"
        next_action = "Generate dossier and seller briefs"
        recommended_channel = "review"
        reasons.append("Workbench still lacks core artifacts for a context-rich approach.")
    elif estado == EstadoContactoEnum.sin_contacto.value:
        if whatsapp_contact and has_whatsapp:
            recommended_channel = "whatsapp"
            next_action = "Open the first WhatsApp touchpoint"
            reasons.append("Seller is still cold and WhatsApp is the fastest warm intro channel.")
        elif email_contact and has_email:
            recommended_channel = "email"
            next_action = "Send the first supervised email"
            reasons.append("Seller is still cold and email is ready with contact channel persisted.")
        else:
            readiness = "needs_contact_channel"
            recommended_channel = "review"
            next_action = "Persist seller contact channels before outreach"
            reasons.append("No valid supervised outreach channel is persisted yet.")
    elif estado in {
        EstadoContactoEnum.primer_contacto.value,
        EstadoContactoEnum.en_seguimiento.value,
        EstadoContactoEnum.reunion_agendada.value,
    }:
        recommended_channel = "call" if has_call_brief else "email"
        next_action = "Resume the conversation using recovered context"
        reasons.append("There is already interaction history, so context-led follow-up is higher value.")
    elif estado == EstadoContactoEnum.propuesta_enviada.value:
        recommended_channel = "call"
        next_action = "Call to unblock objections and exclusivity decision"
        reasons.append("Proposal already sent; the next step is objection handling, not another draft.")
    elif estado == EstadoContactoEnum.mandato_exclusivo.value:
        recommended_channel = "review"
        next_action = "Maintain relationship and capture referral signals"
        reasons.append("Seller is already converted; use the workbench for account stewardship.")

    if focus_terms:
        reasons.append(f"Memory focus: {', '.join(focus_terms[:4])}")

    return {
        "readiness": readiness,
        "recommended_channel": recommended_channel,
        "next_action": next_action,
        "reasons": reasons,
        "last_touch_at": _latest_touch_timestamp(interactions),
        "memory_focus_terms": focus_terms,
        "memory_highlights": [
            {
                "summary": ((match.get("record") or {}).get("summary") or ""),
                "score": match.get("score") or 0,
            }
            for match in memory_matches[:3]
        ],
    }


def _latest_supervised_delivery(interactions: List[Dict[str, Any]], channel: str) -> Optional[Dict[str, Any]]:
    artifact = f"supervised_send_{channel}"
    for item in interactions:
        metadata = item.get("metadata") or {}
        if str(metadata.get("artifact") or "") == artifact:
            return item
    return None


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


async def update_seller(
    db: SupabaseService,
    org_id: str,
    seller_id: str,
    data: NexusSellerUpdate,
) -> Optional[Dict[str, Any]]:
    """
    Update general seller fields, including supervised outreach channels.
    """
    payload = data.model_dump(exclude_none=True)
    if not payload:
        return await get_seller(db=db, org_id=org_id, seller_id=seller_id)

    if "zona" in payload and data.zona is not None:
        payload["zona"] = data.zona.value
    if "estado_contacto" in payload and data.estado_contacto is not None:
        payload["estado_contacto"] = data.estado_contacto.value

    result = (
        db.client.table("nexus_sellers")
        .update(payload)
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

    memory = await seller_memory_service.search(
        db=db,
        org_id=org_id,
        seller_id=seller_id,
        query="seguimiento captacion objeciones siguiente paso",
        limit=5,
    )
    memory_payload = memory.model_dump()
    console = _build_workbench_console(
        seller=seller,
        latest_artifacts=latest_artifacts,
        interactions=interactions,
        memory_payload=memory_payload,
    )
    email_transport = get_email_transport_summary()
    latest_email_delivery = _latest_supervised_delivery(interactions, "email")
    latest_whatsapp_delivery = _latest_supervised_delivery(interactions, "whatsapp")

    return {
        "seller": seller,
        "interactions": interactions,
        "latest_artifacts": latest_artifacts,
        "memory": memory_payload,
        "console": console,
        "snapshot": {
            "has_argumentario": bool(seller.get("argumentario")),
            "has_email_draft": latest_artifacts["email_draft"] is not None,
            "has_whatsapp_draft": latest_artifacts["whatsapp_draft"] is not None,
            "has_call_brief": latest_artifacts["call_brief"] is not None,
            "has_context_brief": latest_artifacts["context_brief"] is not None,
            "interactions_count": len(interactions),
            "semantic_memory_count": memory.total_records,
            "semantic_memory_ready": memory.status == "ready",
            "recommended_channel": console["recommended_channel"],
            "readiness": console["readiness"],
            "email_native_available": bool(email_transport["native_email_enabled"]),
            "latest_email_delivery": latest_email_delivery,
            "latest_whatsapp_delivery": latest_whatsapp_delivery,
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


def _extract_email(seller: Dict[str, Any]) -> Optional[str]:
    datos = seller.get("datos_extraidos") or {}
    return (
        seller.get("email_contacto")
        or datos.get("email_contacto")
        or datos.get("contact_email")
        or datos.get("email")
    )


def _extract_phone(seller: Dict[str, Any]) -> Optional[str]:
    datos = seller.get("datos_extraidos") or {}
    return (
        seller.get("telefono_contacto")
        or datos.get("telefono_contacto")
        or datos.get("phone")
        or datos.get("telefono")
    )


def _extract_whatsapp(seller: Dict[str, Any]) -> Optional[str]:
    datos = seller.get("datos_extraidos") or {}
    return (
        seller.get("whatsapp_contacto")
        or datos.get("whatsapp_contacto")
        or datos.get("whatsapp")
        or _extract_phone(seller)
    )


async def build_supervised_send_payload(
    db: SupabaseService,
    org_id: str,
    seller_id: str,
    channel: str,
    transport: str = "auto",
) -> Dict[str, Any]:
    """
    Build a HITL delivery payload and register the intent as a scheduled interaction.
    """
    if channel not in {"email", "whatsapp"}:
        raise ValueError("channel must be email or whatsapp")

    export_payload = await build_seller_dossier_export(db=db, org_id=org_id, seller_id=seller_id)
    if not export_payload:
        raise ValueError("Seller not found")

    seller = export_payload["seller"]
    sections = export_payload["sections"]

    resolved_transport = transport

    if channel == "email":
        target = _extract_email(seller)
        if not target:
            raise ValueError("Seller email_contacto is required for supervised email send")
        subject = sections.get("email_subject", "").strip() or "Seguimiento de propiedad"
        body = sections.get("email_body", "").strip()
        email_transport = get_email_transport_summary()
        if transport == "auto":
            resolved_transport = "native_email" if email_transport["native_email_enabled"] else "mailto"

        if resolved_transport == "native_email":
            delivery = send_email_native(
                to_email=str(target),
                subject=subject,
                body=body,
            )
            interaction = await add_interaction(
                db=db,
                org_id=org_id,
                seller_id=seller_id,
                tipo=channel,
                contenido=body,
                estado="realizado",
                resultado="sent_native_supervised",
                metadata={
                    "artifact": "supervised_send_email",
                    "target": target,
                    "subject": subject,
                    "transport": "native_email",
                    "delivery_provider": delivery.get("provider"),
                    "provider_message_id": delivery.get("message_id"),
                    "from_email": delivery.get("from_email"),
                    "reply_to": delivery.get("reply_to"),
                    "sent_at": datetime.now(timezone.utc).isoformat(),
                },
            )

            seller = await get_seller(db=db, org_id=org_id, seller_id=seller_id)
            if seller and seller.get("estado_contacto") == EstadoContactoEnum.sin_contacto.value:
                await update_seller_estado(
                    db=db,
                    org_id=org_id,
                    seller_id=seller_id,
                    estado=EstadoContactoEnum.primer_contacto.value,
                )

            return {
                "channel": channel,
                "seller_id": seller_id,
                "interaction_id": interaction.get("id"),
                "target": target,
                "subject": subject,
                "body": body,
                "launch_url": None,
                "status": "sent_natively",
                "transport": "native_email",
                "delivery": delivery,
            }

        if resolved_transport != "mailto":
            raise ValueError("email transport must be auto, native_email or mailto")

        launch_url = (
            f"mailto:{quote(str(target))}"
            f"?subject={quote(subject)}"
            f"&body={quote(body)}"
        )
    else:
        target = _extract_whatsapp(seller)
        if not target:
            raise ValueError("Seller whatsapp_contacto or telefono_contacto is required for supervised WhatsApp send")
        digits = re.sub(r"\D", "", str(target))
        body = sections.get("whatsapp_body", "").strip()
        subject = ""
        resolved_transport = "wa_me"
        launch_url = f"https://wa.me/{digits}?text={quote(body)}"

    interaction = await add_interaction(
        db=db,
        org_id=org_id,
        seller_id=seller_id,
        tipo=channel,
        contenido=body,
        estado="programado",
        resultado="launch_intent_created",
        metadata={
            "artifact": f"supervised_send_{channel}",
            "target": target,
            "subject": subject,
            "launch_url": launch_url,
            "transport": resolved_transport,
        },
    )

    return {
        "channel": channel,
        "seller_id": seller_id,
        "interaction_id": interaction.get("id"),
        "target": target,
        "subject": subject,
        "body": body,
        "launch_url": launch_url,
        "status": "ready_for_human_send",
        "transport": resolved_transport,
        "delivery": None,
    }


async def confirm_supervised_send(
    db: SupabaseService,
    org_id: str,
    seller_id: str,
    interaction_id: str,
) -> Optional[Dict[str, Any]]:
    """
    Mark a supervised send intent as confirmed by the human operator.
    """
    current = (
        db.client.table("seller_interactions")
        .select("metadata")
        .eq("org_id", str(org_id))
        .eq("seller_id", str(seller_id))
        .eq("id", str(interaction_id))
        .maybe_single()
        .execute()
    )
    current_metadata = (current.data or {}).get("metadata") or {}

    result = (
        db.client.table("seller_interactions")
        .update({
            "estado": "realizado",
            "resultado": "sent_confirmed_human",
            "metadata": {
                **current_metadata,
                "confirmed_at": datetime.now(timezone.utc).isoformat(),
            },
        })
        .eq("org_id", str(org_id))
        .eq("seller_id", str(seller_id))
        .eq("id", str(interaction_id))
        .execute()
    )
    if not result.data:
        return None

    seller = await get_seller(db=db, org_id=org_id, seller_id=seller_id)
    if seller and seller.get("estado_contacto") == EstadoContactoEnum.sin_contacto.value:
        await update_seller_estado(
            db=db,
            org_id=org_id,
            seller_id=seller_id,
            estado=EstadoContactoEnum.primer_contacto.value,
        )

    return result.data[0]
