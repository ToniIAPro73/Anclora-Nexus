# n8n Unified Lead Intake — Test Plan v1.1

## Objetivo

Validar que el workflow `n8n-unified-lead-intake` recibe leads, los normaliza y los envía correctamente al backend de Anclora Nexus mediante:

```txt
POST /api/ingestion/leads
```

El test plan elimina la validación antigua basada en `Save to Supabase`.

## Prerrequisitos

- Endpoint `POST /api/ingestion/leads` disponible.
- Workflow n8n importado.
- Variables n8n configuradas:

```txt
NEXUS_API_BASE_URL
NEXUS_DEFAULT_ORG_ID
TONI_EMAIL
NEXUS_INGESTION_API_KEY   # solo si aplica
```

- Acceso para verificar resultado en Nexus/Supabase.
- Workflow `HNWI Prospection v2 - Anclora Nexus (Improved)` localizado en n8n.

## Matriz de pruebas

| ID | Caso | Resultado esperado |
|---|---|---|
| T01 | Lead Hot de Landing | Guardado en Nexus + notificación interna |
| T02 | Lead Warm de Facebook | Guardado en Nexus sin notificación Hot |
| T03 | Lead Cold de LinkedIn/Reddit | Guardado o marcado como baja prioridad |
| T04 | Lead HNWI desde HNWI Prospection v2 | Guardado con fuente HNWI trazada |
| T05 | GDPR false desde landing | Rechazo controlado |
| T06 | Payload sin identidad | Rechazo controlado |
| T07 | Duplicado con mismo `external_id` | Respuesta duplicate/idempotente |
| T08 | Backend 500 | Error handler controlado |
| T09 | Hot lead no contacta al lead | Solo notificación interna |
| T10 | Source metadata completa | `source_system`, `source_channel`, `source_detail`, `connector_name` informados |

## T01 — Lead Hot de Landing

Payload:

```json
{
  "name": "Anna Müller",
  "email": "anna.mueller@example.com",
  "phone": "+491701234567",
  "budget": 2500000,
  "property_interest": "Villa con vistas al mar en Puerto Andratx",
  "source_system": "cta_web",
  "source_channel": "website",
  "source_detail": "private_estates_landing",
  "gdpr_consent": true,
  "gdpr_consent_text_version": "v1",
  "zone_interest": "Andratx",
  "nationality": "DE"
}
```

Resultado esperado:

```txt
HTTP 200/201 desde n8n.
POST enviado a Nexus API.
qualification_tier = hot.
Lead guardado.
ingestion_event creado.
Email/notificación interna enviada a Toni.
Ningún contacto enviado al lead.
```

## T02 — Lead Warm de Facebook

Payload:

```json
{
  "name": "Carlos Test",
  "email": "carlos.test@example.com",
  "budget": 1200000,
  "property_interest": "Apartamento premium en Calvià",
  "source_system": "social",
  "source_channel": "facebook",
  "source_detail": "facebook_lead_form",
  "gdpr_consent": true,
  "gdpr_consent_text_version": "v1",
  "zone_interest": "Calvià"
}
```

Resultado esperado:

```txt
qualification_tier = warm.
Guardado en Nexus.
Sin notificación Hot.
```

## T03 — Lead Cold

Payload:

```json
{
  "name": "Cold Buyer Test",
  "email": "cold.buyer@example.com",
  "budget": 350000,
  "property_interest": "Busco piso económico",
  "source_system": "social",
  "source_channel": "other",
  "source_detail": "reddit_test",
  "gdpr_consent": true,
  "gdpr_consent_text_version": "v1",
  "zone_interest": "Palma"
}
```

Resultado esperado:

```txt
qualification_tier = cold.
Guardado o marcado como baja prioridad según reglas backend.
Sin notificación Hot.
```

## T04 — Lead HNWI desde workflow existente

Origen:

```txt
HNWI Prospection v2 - Anclora Nexus (Improved)
```

Payload mínimo esperado hacia Nexus:

```json
{
  "name": "HNWI Smoke Lead",
  "email": "hnwi.smoke@example.com",
  "phone": "+34600000000",
  "budget": 3000000,
  "property_interest": "Off-market villa in Southwest Mallorca",
  "source_system": "social",
  "source_channel": "linkedin",
  "source_detail": "HNWI Prospection v2 - Anclora Nexus (Improved)",
  "connector_name": "hnwi-prospection:linkedin",
  "gdpr_consent": true,
  "gdpr_consent_text_version": "v1",
  "hnwi_source_channel": "linkedin",
  "hnwi_intent_signal": "off_market_luxury_property_interest",
  "metadata": {
    "origin_workflow": "HNWI Prospection v2 - Anclora Nexus (Improved)",
    "test": true
  }
}
```

Resultado esperado:

```txt
Lead creado o respuesta duplicate.
source_detail conserva referencia al workflow HNWI.
connector_name = hnwi-prospection:linkedin.
hnwi_source_channel = linkedin.
trace_id informado.
```

## T05 — GDPR false desde landing

Payload:

```json
{
  "name": "GDPR False Test",
  "email": "gdpr.false@example.com",
  "source_system": "cta_web",
  "source_channel": "website",
  "source_detail": "private_estates_landing",
  "gdpr_consent": false
}
```

Resultado esperado:

```txt
Rechazo controlado.
No se guarda como lead válido.
Respuesta con error gdpr_consent_required.
No se notifica como Hot.
```

## T06 — Payload sin identidad

Payload:

```json
{
  "source_system": "social",
  "source_channel": "linkedin",
  "source_detail": "missing_identity_test",
  "gdpr_consent": true
}
```

Resultado esperado:

```txt
Rechazo controlado.
Error missing_identity o invalid_payload.
No se llama al backend o backend rechaza con 4xx controlado.
```

## T07 — Duplicado/idempotencia

Ejecutar dos veces el mismo payload:

```json
{
  "external_id": "duplicate-smoke-001",
  "name": "Duplicate Smoke",
  "email": "duplicate.smoke@example.com",
  "source_system": "social",
  "source_channel": "linkedin",
  "source_detail": "duplicate_test",
  "connector_name": "hnwi-prospection:linkedin",
  "gdpr_consent": true,
  "gdpr_consent_text_version": "v1"
}
```

Resultado esperado:

```txt
Primera ejecución: processed/created.
Segunda ejecución: duplicate/idempotent.
No se crean duplicados no controlados.
```

## T08 — Backend 500/error

Simular URL incorrecta:

```txt
NEXUS_API_BASE_URL=https://invalid-test-url.local
```

Resultado esperado:

```txt
Error handler captura fallo.
n8n devuelve respuesta controlada.
Notificación interna opcional de error técnico.
No queda ejecución colgada.
```

## T09 — No contacto externo

Verificar en n8n:

```txt
No existe nodo Email/WhatsApp dirigido al lead.
Solo existe notificación interna a TONI_EMAIL.
```

Resultado esperado:

```txt
0 mensajes externos enviados.
```

## T10 — Source metadata completa

Validar en Nexus/Supabase:

```txt
source_system no nulo.
source_channel no nulo.
source_detail no nulo.
connector_name no nulo.
trace_id presente o deducible.
metadata.workflow presente.
```

## Smoke test curl directo contra backend

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

## Criterio de cierre del test plan

La feature pasa QA si:

```txt
[ ] T01 pasa.
[ ] T02 pasa.
[ ] T03 pasa.
[ ] T04 pasa.
[ ] T05 pasa.
[ ] T06 pasa.
[ ] T07 pasa.
[ ] T08 pasa o queda documentado como error handler pendiente.
[ ] T09 pasa.
[ ] T10 pasa.
```

## Estado tras pruebas

- Si solo existe JSON importable:

```txt
READY_FOR_N8N_IMPORT
```

- Si el JSON está importado y variables configuradas:

```txt
READY_FOR_SMOKE_TEST
```

- Si los tests T01, T04, T05, T07, T09 y T10 pasan:

```txt
PRODUCTION_READY
```

---

**Fin del Test Plan v1.1**
