# PROMPT MAESTRO — Feature: `n8n-unified-lead-intake` v6.1

## Proyecto

Repositorio objetivo:

```txt
https://github.com/ToniIAPro73/Anclora-Nexus.git
```

Feature objetivo:

```txt
n8n-unified-lead-intake
```

Ruta SDD existente:

```txt
sdd/features/n8n-unified-lead-intake/
```

## Cambio importante v6.1

Esta versión actualiza el modo de trabajo del agente:

```txt
1. Cada feature debe implementarse en una rama nueva propia sobre el repo de trabajo.
2. Los 7 archivos SDD de la feature ya existen en sdd/features/<feature>/.
3. El agente NO debe crear la carpeta SDD ni recrear los 7 archivos desde cero.
4. El agente debe leer los SDD existentes, comprobar coherencia y modificarlos solo si la implementación lo exige.
5. El agente debe crear artefactos derivados, como JSON n8n, README de artifacts o runbook, solo cuando falten o sean necesarios.
```

---

# 1. Rama obligatoria por feature

Antes de modificar cualquier archivo, crear una rama específica desde `main`.

## Rama recomendada para esta feature

```bash
git checkout main
git pull origin main
git checkout -b feature/n8n-unified-lead-intake
```

Si la rama ya existe:

```bash
git checkout feature/n8n-unified-lead-intake
git pull origin feature/n8n-unified-lead-intake
```

## Regla general para futuras features

Para cada nueva feature usar:

```txt
feature/<feature-slug>
```

Ejemplos:

```txt
feature/n8n-unified-lead-intake
feature/nexus-matching-engine
feature/n8n-nurturing-sequences
feature/synergi-partner-onboarding
```

No trabajar directamente sobre `main`.

No mezclar varias features en la misma rama.

---

# 2. Contexto operativo actualizado

Esta feature no se implementa desde cero.

Ya existen dos features previas que deben considerarse prerequisitos implementados:

```txt
1. landing-hero-optimization
   Función: captura comercial inicial desde la landing.

2. lead-ingestion-webhook
   Función: endpoint backend de ingesta de leads.
```

La feature `n8n-unified-lead-intake` debe actuar como **orquestador y normalizador de entrada**, no como capa de persistencia directa.

La persistencia canónica de leads debe pasar por el backend de Anclora Nexus:

```txt
POST /api/ingestion/leads
```

No se debe insertar directamente en Supabase desde n8n.

---

# 3. SDD existentes: leer, validar y actualizar

Los 7 SDD ya existen en:

```txt
sdd/features/n8n-unified-lead-intake/
```

El agente debe leer como mínimo:

```txt
sdd/features/n8n-unified-lead-intake/GATE_FINAL_N8N_UNIFIED_LEAD_INTAKE.md
sdd/features/n8n-unified-lead-intake/n8n-unified-lead-intake-INDEX.md
sdd/features/n8n-unified-lead-intake/n8n-unified-lead-intake-master-parallel.md
sdd/features/n8n-unified-lead-intake/n8n-unified-lead-intake-shared-context.md
sdd/features/n8n-unified-lead-intake/n8n-unified-lead-intake-spec-migration.md
sdd/features/n8n-unified-lead-intake/n8n-unified-lead-intake-spec-v1.md
sdd/features/n8n-unified-lead-intake/n8n-unified-lead-intake-test-plan-v1.md
```

## Regla

No crear de nuevo estos 7 archivos.

Actualizar solo si:

```txt
- Hay referencias antiguas a n8n → Supabase directo.
- Hay referencias a nexus_leads como tabla destino.
- Falta la integración con POST /api/ingestion/leads.
- Falta la integración con HNWI Prospection v2.
- Falta el estado correcto READY_FOR_N8N_IMPORT / READY_FOR_SMOKE_TEST / PRODUCTION_READY.
- Los criterios de aceptación no coinciden con el enfoque backend-first.
```

Si los SDD ya están alineados, dejarlos intactos y limitarse a implementar artefactos y runbook.

---

# 4. Objetivo de la feature

Implementar y documentar un workflow n8n unificado que reciba leads desde varias fuentes, normalice el payload al contrato backend existente, calcule clasificación/scoring operativo cuando aplique, y envíe el lead al endpoint canónico de Nexus.

Fuentes iniciales esperadas:

```txt
- Landing Anclora Private Estates
- Workflow existente: HNWI Prospection v2 - Anclora Nexus (Improved)
- Dux-Soup / PhantomBuster / LinkedIn automation
- Facebook / Instagram / formularios manuales
- Referidos futuros de partners / Synergi
```

Flujo objetivo:

```txt
Fuente externa
   ↓
n8n Unified Lead Intake
   ↓
POST /api/ingestion/leads
   ↓
Anclora Nexus backend
   ↓
Supabase: leads + ingestion_events + trazabilidad
```

---

# 5. Restricciones duras

## 5.1 No escribir directo en Supabase

Prohibido:

```txt
n8n → Supabase node → nexus_leads
n8n → Supabase node → leads
```

Correcto:

```txt
n8n → HTTP Request → POST /api/ingestion/leads
```

Motivo: el backend ya concentra validación Pydantic, deduplicación, GDPR, scoring HNWI, `ingestion_events`, `trace_id`, `dedupe_key` y escritura final.

## 5.2 No crear tabla `nexus_leads`

Si algún SDD o artefacto menciona `nexus_leads`, debe corregirse.

Tabla canónica actual:

```txt
leads
```

Evento operativo:

```txt
ingestion_events
```

## 5.3 No duplicar la feature `lead-ingestion-webhook`

No recrear el endpoint backend si ya existe.

Solo tocar backend si al revisar el código se detecta un fallo real que impida la integración n8n.

## 5.4 No contactar leads automáticamente

Permitido:

```txt
- Notificación interna a Toni
- Registro del lead
- Marcado de lead Hot/Warm/Cold
- Preparación de metadata para futuras nurturing sequences
```

Prohibido en esta feature:

```txt
- Enviar email al lead
- Enviar WhatsApp al lead
- Ejecutar outreach automático
```

Eso pertenece a la feature posterior:

```txt
n8n-nurturing-sequences
```

## 5.5 Human Approval Gate

En esta feature significa:

```txt
Lead Hot detectado
   ↓
Notificación interna a Toni
   ↓
Lead queda registrado para revisión
```

No significa contacto automático con el lead.

---

# 6. Contrato de payload hacia Nexus

El nodo HTTP Request de n8n debe enviar JSON compatible con `LeadIngestionPayload`.

Campos mínimos recomendados:

```json
{
  "org_id": "00000000-0000-0000-0000-000000000000",
  "external_id": "source-specific-id",
  "connector_name": "hnwi-prospection:linkedin",
  "trace_id": "optional-trace-id",
  "source_system": "social",
  "source_channel": "linkedin",
  "source_detail": "HNWI Prospection v2 - Anclora Nexus (Improved)",
  "source_url": "https://example.com/source",
  "source_referrer": "optional",
  "gdpr_consent": true,
  "gdpr_consent_at": "2026-05-02T10:00:00.000Z",
  "gdpr_consent_text_version": "v1",
  "captured_at": "2026-05-02T10:00:00.000Z",
  "name": "Test HNWI Lead",
  "email": "test@example.com",
  "phone": "+34600000000",
  "budget": 1500000,
  "property_interest": "Villa premium en Calvià",
  "notes": "Lead de prueba desde n8n unified intake",
  "nationality": "DE",
  "zone_interest": "Calvià",
  "qualification_score": 78,
  "qualification_tier": "hot",
  "hnwi_intent_signal": "premium_property_interest",
  "email_verified": false,
  "email_verification_source": null,
  "hnwi_source_channel": "linkedin",
  "metadata": {
    "workflow": "n8n-unified-lead-intake",
    "origin_workflow": "HNWI Prospection v2 - Anclora Nexus (Improved)",
    "test": true
  }
}
```

Valores permitidos esperados:

```txt
source_system:
manual | cta_web | import | referral | partner | social

source_channel:
website | linkedin | instagram | facebook | email | phone | other

qualification_tier:
hot | warm | cold

hnwi_source_channel:
linkedin | facebook | reddit | google-alert | other
```

---

# 7. Mapeo de fuentes

## 7.1 Landing

```txt
source_system: cta_web
source_channel: website
connector_name: cta_web:website
source_detail: private_estates_landing
```

## 7.2 HNWI Prospection v2

```txt
source_system: social
source_channel: linkedin / facebook / other
connector_name: hnwi-prospection:<channel>
source_detail: HNWI Prospection v2 - Anclora Nexus (Improved)
```

## 7.3 Dux-Soup / PhantomBuster

```txt
source_system: social
source_channel: linkedin
connector_name: linkedin-automation:dux-soup
connector_name: linkedin-automation:phantombuster
source_detail: dux_soup_free_trial / phantombuster_free_trial
```

## 7.4 Partner / Synergi futuro

```txt
source_system: partner
source_channel: other
connector_name: synergi-partner-referral
source_detail: synergi_partner_onboarding
```

---

# 8. Workflow n8n objetivo

Crear o actualizar el artefacto:

```txt
sdd/features/n8n-unified-lead-intake/artifacts/n8n_unified_lead_intake_workflow_v1_1.json
```

Si existe un artefacto anterior, usarlo como base y migrarlo al enfoque backend-first.

## Nodos recomendados

```txt
1. Webhook Trigger
2. Parse & Normalize
3. Validate Required Fields
4. Classify Seller/Buyer/HNWI
5. Calculate Lead Score
6. Build Nexus Payload
7. Save to Nexus API
8. IF Hot Lead?
9. Notify Toni
10. Respond to Webhook
11. Error Handler
```

Debe cubrir:

```txt
- recibir lead
- normalizar
- validar GDPR cuando aplique
- calcular external_id estable
- llamar a Nexus API
- responder al origen
- registrar errores
```

---

# 9. Integración con workflow existente HNWI

Workflow existente:

```txt
HNWI Prospection v2 - Anclora Nexus (Improved)
```

Debe integrarse de una de estas formas:

## Opción preferida: HTTP Request final

Añadir un nodo final:

```txt
HTTP Request → POST {{NEXUS_API_BASE_URL}}/api/ingestion/leads
```

## Opción alternativa: Execute Workflow

```txt
HNWI Prospection v2
   ↓
Execute Workflow: n8n-unified-lead-intake
```

Si el agente no tiene acceso a n8n, debe entregar:

```txt
- JSON importable actualizado
- guía manual de modificación del workflow HNWI
- payload de prueba
```

---

# 10. Testing obligatorio

Actualizar o respetar el test plan existente para cubrir:

```txt
1. Landing lead → n8n → Nexus API → leads.
2. HNWI LinkedIn lead → HNWI workflow / n8n → Nexus API → leads.
3. Warm lead → guardado sin notificación Hot.
4. Hot lead → guardado + notificación interna a Toni.
5. GDPR false → rechazo controlado.
6. Duplicado con mismo external_id → respuesta duplicate o idempotente.
7. Error 500 backend → error handler n8n + respuesta controlada.
```

## Smoke test mínimo

```bash
curl -i -X POST "$NEXUS_API_BASE_URL/api/ingestion/leads"   -H "Content-Type: application/json"   -d '{
    "org_id": "'"$NEXUS_DEFAULT_ORG_ID"'",
    "external_id": "smoke-hnwi-001",
    "connector_name": "hnwi-prospection:linkedin",
    "source_system": "social",
    "source_channel": "linkedin",
    "source_detail": "HNWI Prospection v2 - n8n smoke test",
    "gdpr_consent": true,
    "gdpr_consent_text_version": "v1",
    "name": "Smoke HNWI Lead",
    "email": "smoke.hnwi@example.com",
    "phone": "+34600000000",
    "budget": 1500000,
    "property_interest": "Villa premium en Calvià",
    "notes": "Smoke test desde n8n-unified-lead-intake",
    "nationality": "DE",
    "zone_interest": "Calvià",
    "hnwi_intent_signal": "premium_property_interest",
    "hnwi_source_channel": "linkedin",
    "metadata": {
      "test": true,
      "workflow": "n8n-unified-lead-intake"
    }
  }'
```

---

# 11. Cambios esperados en archivos

## 11.1 SDD

Leer y actualizar solo si es necesario:

```txt
sdd/features/n8n-unified-lead-intake/*.md
```

No crear de nuevo los 7 SDD.

## 11.2 Artefactos

Crear si falta:

```txt
sdd/features/n8n-unified-lead-intake/artifacts/
```

Crear o actualizar:

```txt
sdd/features/n8n-unified-lead-intake/artifacts/n8n_unified_lead_intake_workflow_v1_1.json
sdd/features/n8n-unified-lead-intake/artifacts/README.md
```

## 11.3 Runbook operativo

Crear si falta:

```txt
sdd/features/n8n-unified-lead-intake/RUNBOOK_N8N_UNIFIED_LEAD_INTAKE.md
```

Debe incluir:

```txt
- Cómo importar el JSON en n8n.
- Variables necesarias.
- Cómo conectar HNWI Prospection v2.
- Cómo ejecutar smoke test.
- Cómo verificar en Nexus.
```

## 11.4 No tocar salvo necesidad

No modificar:

```txt
backend/api/routes/ingestion.py
backend/models/ingestion.py
backend/services/ingestion_service.py
```

salvo que una prueba demuestre un fallo real.

---

# 12. Procedimiento de ejecución para Codex/Gemini CLI

## Paso 1 — Crear rama

```bash
git checkout main
git pull origin main
git checkout -b feature/n8n-unified-lead-intake
```

## Paso 2 — Leer contexto

Leer como mínimo:

```txt
README.md
architecture.md
CLAUDE.md
backend/models/ingestion.py
backend/api/routes/ingestion.py
backend/services/ingestion_service.py
sdd/features/lead-ingestion-webhook/
sdd/features/n8n-unified-lead-intake/
```

## Paso 3 — Validar SDD existentes

No crearlos.

Comprobar si están alineados con:

```txt
n8n → Nexus API → Supabase
```

Si no lo están, modificarlos.

## Paso 4 — Crear artefacto n8n

Crear JSON importable compatible con n8n.

Debe incluir:

```txt
- Webhook Trigger
- Code nodes para normalize/validate/score/build payload
- HTTP Request a Nexus API
- IF Hot
- Notify Toni
- Respond
- Error branch
```

## Paso 5 — Crear runbook

Documentar integración con:

```txt
HNWI Prospection v2 - Anclora Nexus (Improved)
```

## Paso 6 — Validar

Ejecutar validaciones posibles.

Si no hay acceso a n8n, dejar validación manual reproducible.

## Paso 7 — Actualizar índices

Actualizar solo si procede:

```txt
sdd/features/FEATURES.md
sdd/core/CHANGELOG.md
```

No inventar `PRODUCTION_READY` si no se ha ejecutado smoke test real.

Usar estados honestos:

```txt
READY_FOR_N8N_IMPORT
READY_FOR_SMOKE_TEST
PRODUCTION_READY
```

## Paso 8 — Commit

Solo si la validación pasa:

```bash
git add .
git commit -m "feat(n8n): unify lead intake through Nexus ingestion API"
git push -u origin feature/n8n-unified-lead-intake
```

---

# 13. Resultado esperado para el usuario

Al terminar, devolver un resumen en este formato:

```txt
FEATURE: n8n-unified-lead-intake
RAMA: feature/n8n-unified-lead-intake
Estado: READY_FOR_N8N_IMPORT / READY_FOR_SMOKE_TEST / PRODUCTION_READY

Cambios realizados:
- SDD existentes revisados.
- SDD modificados: sí/no.
- Artefacto n8n v1.1 creado/actualizado.
- Runbook creado/actualizado.
- HNWI Prospection v2 documentado/conectado.
- Tests definidos/ejecutados.

Validación:
- Backend endpoint revisado: sí/no
- n8n JSON generado: sí/no
- Smoke test ejecutado: sí/no
- Lead visible en Nexus/Supabase: sí/no

Riesgos:
- ...

Próximo paso:
- ...
```

---

# 14. Regla final

No cerrar la feature solo porque el JSON exista.

La feature se considera válida únicamente cuando el workflow unificado o el workflow HNWI existente consigue enviar un lead real o de smoke test al endpoint:

```txt
POST /api/ingestion/leads
```

y el lead queda trazado en Nexus.

---

**Fin del prompt maestro v6.1**
