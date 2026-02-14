# ESPECIFICACIÓN TÉCNICA: PROSPECTION & BUYER MATCHING V1

**Feature ID**: ANCLORA-PBM-001  
**Versión**: 1.0  
**Status**: Specification Phase  
**Fase**: Growth Engine (captación + matching premium)

---

## 1. RESUMEN EJECUTIVO

La feature introduce un motor CRM de prospección inmobiliaria y vinculación comprador-propiedad orientado a alto ticket. El objetivo es aumentar probabilidad de cierre y comisión mediante:

1. Captación de inmuebles premium (fuentes autorizadas).
2. Captación de compradores potenciales con criterios estructurados.
3. Cálculo de `high_ticket_score` por propiedad.
4. Cálculo de `match_score` por par propiedad-comprador.
5. Persistencia de vínculos y actividad comercial para seguimiento.

---

## 2. ALCANCE V1

Incluye:
- Modelo de datos para propiedades prospectadas, compradores y matches.
- Endpoints CRUD y endpoints de scoring.
- Reglas de cálculo inicial de `high_ticket_score` y `match_score`.
- Dashboard widgets para priorización.
- Registro de actividad de enlace (llamada, visita, oferta, cierre).

Excluye:
- Scraping no autorizado.
- Automatización de contacto en canales prohibidos.
- Modelos predictivos complejos de cierre.

---

## 3. MODELO DE DATOS

## 3.1 Nuevas tablas

1. `prospected_properties`
2. `buyer_profiles`
3. `property_buyer_matches`
4. `match_activity_log`

## 3.2 Campos clave

`prospected_properties`:
- `source`, `source_url`, `zone`, `price`, `property_type`, `high_ticket_score`, `status`

`buyer_profiles`:
- `budget_min`, `budget_max`, `preferred_zones`, `preferred_types`, `required_features`, `purchase_horizon`, `motivation_score`

`property_buyer_matches`:
- `match_score`, `score_breakdown`, `match_status`, `commission_estimate`, `notes`

`match_activity_log`:
- `activity_type`, `outcome`, `details`, `created_by`

---

## 4. SCORING ENGINE

## 4.1 `high_ticket_score` (0-100)

Ponderación v1:
- 40% precio y precio/m2 en microzona objetivo
- 25% calidad de ubicación (zona premium)
- 20% liquidez estimada
- 15% calidad del activo (estado, singularidad)

## 4.2 `match_score` (0-100)

Ponderación v1:
- 35% ajuste de presupuesto
- 25% ajuste de zona
- 20% ajuste de tipología/características
- 10% ajuste de horizonte temporal
- 10% motivación/probabilidad de respuesta

Reglas:
- `80-100`: vínculo fuerte (prioridad inmediata)
- `60-79`: vínculo medio (seguimiento dirigido)
- `<60`: backlog / observación

---

## 5. API SPECIFICATION (V1)

## 5.1 Inmuebles prospectados
- `POST /api/prospection/properties`
- `GET /api/prospection/properties`
- `PATCH /api/prospection/properties/{id}`
- `POST /api/prospection/properties/{id}/score`

## 5.2 Compradores potenciales
- `POST /api/prospection/buyers`
- `GET /api/prospection/buyers`
- `PATCH /api/prospection/buyers/{id}`

## 5.3 Matching
- `POST /api/prospection/matches/recompute`
- `GET /api/prospection/matches`
- `PATCH /api/prospection/matches/{id}`
- `POST /api/prospection/matches/{id}/activity`

Todos los endpoints deben filtrar por `org_id` y respetar control por rol.

---

## 6. FRONTEND SCOPE

Nuevos bloques sugeridos:
- Página/segmento de “Prospección”.
- Vista de “Compradores potenciales”.
- Vista de “Matches” con orden por score.
- Widgets dashboard:
  - `HighTicketRadar`
  - `MatchEngine`
  - `CommissionPipeline` (opcional v1)

UX mínima:
- filtros por zona, ticket y score,
- acciones rápidas para crear actividad,
- resaltado visual de matches >80.

---

## 7. SEGURIDAD Y CUMPLIMIENTO

- No usar scraping fuera de términos de servicio.
- Guardar `source` y `source_url` para trazabilidad.
- Mantener auditoría de cambios de score y estado de match.
- Mantener límites operativos para evitar automatizaciones invasivas.

---

## 8. CRITERIOS DE ACEPTACIÓN

- Se puede registrar propiedad prospectada con score.
- Se puede registrar comprador con criterios.
- El sistema genera matches con score y desglose.
- Se puede registrar actividad comercial por match.
- Se puede consultar el top de oportunidades por score y comisión estimada.
- Todo aislado por organización y rol.

