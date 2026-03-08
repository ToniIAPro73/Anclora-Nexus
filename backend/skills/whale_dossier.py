"""
Whale Dossier Skill — Gravity Claw Phase 4

Generates a hyper-personalized captation dossier for a high-priority seller (Whale).

Pipeline:
  1. Load seller data from nexus_sellers
  2. Load zone territorial intelligence from notebooklm_insights
  3. Generate argumentario (captation pitch) via Claude Sonnet
  4. Generate email draft (first outreach) via Claude Sonnet
  5. Update seller.argumentario in Supabase
  6. Save dossier + email_draft to seller_interactions table

Usage (from backend endpoint):
    from backend.skills.whale_dossier import run_whale_dossier
    result = await run_whale_dossier(
        data={"seller_id": "uuid"},
        llm=llm_service,
        db=db_service
    )

Output tag: [Generado por Anclora Nexus Agent — whale_dossier]
"""

import json
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from backend.services.llm_service import LLMService
from backend.services.supabase_service import SupabaseService
from backend.services.notebooklm_service import get_latest_insights

DEFAULT_ORG_ID = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"

ZONA_LABELS = {
    "andratx": "Andratx",
    "calvia": "Calvià",
    "son_ferrer": "Son Ferrer",
    "santa_ponca": "Santa Ponça",
    "paguera": "Paguera",
    "portals_nous": "Portals Nous",
    "bendinat": "Bendinat",
    "punta_negra": "Punta Negra",
    "costa_den_blanes": "Costa d'en Blanes",
    "port_adriano": "Port Adriano",
    "palma": "Palma",
    "otra": "Zona exclusiva",
}


async def run_whale_dossier(
    data: Dict[str, Any],
    llm: LLMService,
    db: SupabaseService,
) -> Dict[str, Any]:
    """
    Generate a captation dossier + email draft for a Whale seller.

    Args:
        data: {"seller_id": "uuid", "org_id": "uuid" (optional)}
        llm: LLMService instance
        db: SupabaseService instance

    Returns:
        {
          "seller_id": "...",
          "argumentario": "...",
          "email_subject": "...",
          "email_body": "...",
          "zona_insight_used": True/False,
          "processed_at": "...",
        }
    """
    seller_id = data.get("seller_id")
    org_id = data.get("org_id", DEFAULT_ORG_ID)

    if not seller_id:
        return {"status": "error", "reason": "Missing seller_id"}

    # ── 1. Load seller ────────────────────────────────────────────────────────
    seller_resp = (
        db.client.table("nexus_sellers")
        .select("*")
        .eq("org_id", org_id)
        .eq("id", seller_id)
        .maybe_single()
        .execute()
    )
    seller = seller_resp.data if seller_resp else None
    if not seller:
        return {"status": "error", "reason": f"Seller {seller_id} not found"}

    zona = seller.get("zona", "general")
    zona_label = ZONA_LABELS.get(zona, zona)
    nombre = seller.get("nombre_propietario") or "Propietario"
    precio = seller.get("precio_publicado")
    precio_str = f"€{precio:,.0f}".replace(",", ".") if precio else "precio no especificado"
    dom = seller.get("dias_en_mercado")
    dom_str = f"{dom} días en mercado" if dom else "tiempo en mercado no disponible"
    tipo = seller.get("tipo_propiedad") or "propiedad"
    senales = seller.get("senales_motivacion") or []
    senales_str = ", ".join(senales) if senales else "FSBO / estancamiento de mercado"

    # ── 2. Load zone intelligence ─────────────────────────────────────────────
    insights = await get_latest_insights(
        db=db,
        org_id=org_id,
        insight_type="territorial",
        zona=zona,
        limit=1,
    )
    # Fallback to general if no zone-specific insight
    if not insights:
        insights = await get_latest_insights(
            db=db, org_id=org_id, insight_type="territorial", zona="general", limit=1
        )

    zona_intel = insights[0]["response"] if insights else (
        f"Zona {zona_label} en el Suroeste de Mallorca. "
        "Alta demanda de compradores internacionales alemanes y suizos."
    )
    zona_intel_snippet = zona_intel[:600]
    zona_insight_used = bool(insights)

    # ── 3. Generate argumentario ──────────────────────────────────────────────
    argumentario_prompt = f"""Eres Toni Amengual, agente inmobiliario de eXp Global Spain \
especializado en el Suroeste de Mallorca (Andratx, Calvià, Santa Ponça, Portals, Punta Negra).

Genera un argumentario de captación personalizado y sofisticado para este propietario.

DATOS DEL PROPIETARIO:
- Nombre: {nombre}
- Zona: {zona_label}
- Tipo de propiedad: {tipo}
- Precio publicado: {precio_str}
- Días en mercado: {dom_str}
- Señales de motivación detectadas: {senales_str}

INTELIGENCIA TERRITORIAL DE {zona_label.upper()}:
{zona_intel_snippet}

REGLAS:
- 3 párrafos máximo, cada uno con un argumento concreto
- Mencionar datos reales del mercado (usa los datos de inteligencia territorial)
- Posicionar el acceso a compradores internacionales de eXp como diferencial clave
- Tono sofisticado, no agresivo — como un asesor de confianza, no un vendedor
- Finalizar con una propuesta de valor clara

[Generado por Anclora Nexus Agent — whale_dossier]"""

    argumentario = await llm.generate_copy(argumentario_prompt)

    # ── 4. Generate email draft ───────────────────────────────────────────────
    email_prompt = f"""Eres Toni Amengual, agente inmobiliario de eXp Global Spain en Mallorca.

Escribe un email de primer contacto para este propietario. Debe ser conciso y abrir la puerta \
a una conversación, no vender directamente.

ARGUMENTARIO BASE:
{argumentario[:400]}

DATOS:
- Propietario: {nombre}
- Zona: {zona_label}
- Propiedad: {tipo} a {precio_str}

INSTRUCCIONES:
- Asunto: breve, personal, menciona la zona — NUNCA suene a spam
- Cuerpo: 4-5 líneas máximo
- Sin presión de ventas — proponer una llamada corta de 15 minutos
- Firma: Toni Amengual | Agente Inmobiliario eXp Global Spain | Suroeste Mallorca

Responde ÚNICAMENTE con JSON válido:
{{"subject": "...", "body": "..."}}"""

    email_raw = await llm.analyze(email_prompt)

    email_subject = "Consulta sobre su propiedad en " + zona_label
    email_body = email_raw

    try:
        clean = email_raw.strip()
        if "```json" in clean:
            clean = clean.split("```json")[1].split("```")[0].strip()
        elif "```" in clean:
            clean = clean.split("```")[1].split("```")[0].strip()
        parsed = json.loads(clean)
        email_subject = parsed.get("subject", email_subject)
        email_body = parsed.get("body", email_raw)
    except Exception:
        pass  # Keep raw text as body

    # ── 5. Save argumentario to seller record ─────────────────────────────────
    db.client.table("nexus_sellers").update({
        "argumentario": argumentario,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }).eq("org_id", org_id).eq("id", seller_id).execute()

    # ── 6. Save interactions ──────────────────────────────────────────────────
    now = datetime.now(timezone.utc).isoformat()

    db.client.table("seller_interactions").insert([
        {
            "org_id": org_id,
            "seller_id": seller_id,
            "tipo": "dossier",
            "estado": "realizado",
            "contenido": argumentario,
            "metadata": {"zona_insight_used": zona_insight_used, "zona": zona},
        },
        {
            "org_id": org_id,
            "seller_id": seller_id,
            "tipo": "email_draft",
            "estado": "borrador",
            "contenido": email_body,
            "metadata": {"subject": email_subject, "zona": zona},
        },
    ]).execute()

    return {
        "seller_id": seller_id,
        "nombre": nombre,
        "zona": zona_label,
        "argumentario": argumentario,
        "email_subject": email_subject,
        "email_body": email_body,
        "zona_insight_used": zona_insight_used,
        "processed_at": now,
    }
