# SHARED CONTEXT: HNWI Prospection v1 (ANCLORA-HNWI-001)

## Contexto general
Anclora Private Estates necesita un sistema profesional y escalable de prospección de compradores y vendedores de alto poder adquisitivo (HNWIs) interesados en propiedades de lujo en Mallorca, maximizando el uso de métodos zero/low-cost y open source.

## Objetivo principal
Construir un pipeline completo de generación, cualificación y nurturing de leads HNWI que se integre nativamente con Anclora Nexus, respetando estrictamente el cumplimiento GDPR y priorizando la calidad sobre la cantidad.

## Reglas estrictas
- Prioridad absoluta: Zero / Low-Cost + Open Source.
- Funcionar **sin** acceso a StateFox, Inmovila ni Idealista (situación actual).
- Enfoque ético y GDPR-first (value-first, consentimiento implícito, opción de baja clara).
- Integración nativa con:
  - `/api/ingestion/leads`
  - WhatsApp Cloud API + Qualification Flow (WA-001)
  - FinOps (`capability=hnwi-prospection`)
  - Source Observatory
- Automatización ligera y segura (n8n + Dux-Soup conservador).
- Scoring HNWI propio (presupuesto + zona + timeline + nacionalidad prioritaria + intención).

## Buyer Persona Principal
**“El Inversor Lifestyle Premium”** (45-68 años, patrimonio €1.8M–€12M+)
- Nacionalidades prioritarias: Alemana (35-40%), Británica (20-25%), Nórdica (15%), Americana (10-12%), Francesa/Suiza (8-10%), Española Elite (5-8%).
- Zonas clave: Andratx, Calvià, Son Vida, Bendinat, Illetas, Deià, Valldemossa.
- Motivaciones principales: Lifestyle mediterráneo, yield ETV (6-9%), legado familiar, diversificación patrimonial y privacidad.

## Alcance por fase
- Fase 0 (Semanas 1-2): Setup + prospección manual + ingestión básica
- Fase 1 (Semanas 3-6): Automatización n8n + scoring + outreach WhatsApp
- Fase 2 (Semanas 7-12): Optimización por canal + dashboard de métricas + escalabilidad

Cada agente de implementación **no invade** el alcance del siguiente.