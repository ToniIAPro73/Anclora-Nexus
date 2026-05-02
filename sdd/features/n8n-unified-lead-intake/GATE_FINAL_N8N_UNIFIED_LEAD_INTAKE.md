# GATE FINAL — n8n Unified Lead Intake v1.1

## Estado del gate

**Estado actual:** `READY_FOR_N8N_IMPORT`

Esta feature **no debe marcarse como `PRODUCTION_READY`** hasta que se haya ejecutado un smoke test real desde n8n contra el endpoint canónico de Anclora Nexus:

```txt
POST /api/ingestion/leads
```

## Cambio de enfoque v1.1

La versión anterior asumía:

```txt
n8n → Supabase directo → nexus_leads
```

Ese enfoque queda sustituido por:

```txt
n8n → Nexus API → backend FastAPI → leads + ingestion_events
```

Motivo: la feature previa `lead-ingestion-webhook` ya concentra validación, trazabilidad, deduplicación, GDPR, scoring HNWI y persistencia final.

## Criterios de aceptación

La feature solo puede darse por completada cuando se cumplan todos estos criterios:

- [ ] Los 7 SDD de `n8n-unified-lead-intake` están actualizados al enfoque backend-first.
- [ ] No queda ningún destino operativo `n8n → Supabase`.
- [ ] No queda ninguna referencia a `nexus_leads` como tabla destino.
- [ ] Existe un artefacto JSON importable para n8n.
- [ ] El artefacto usa un nodo HTTP Request hacia `POST /api/ingestion/leads`.
- [ ] El workflow genera o conserva `trace_id`.
- [ ] El workflow genera o conserva `external_id`.
- [ ] El workflow informa `source_system`, `source_channel`, `source_detail` y `connector_name`.
- [ ] El workflow valida consentimiento GDPR cuando el lead procede de formulario/landing.
- [ ] El workflow rechaza o marca para revisión los leads sin base legal clara.
- [ ] Los leads Hot generan notificación interna a Toni.
- [ ] Ningún email, WhatsApp o mensaje externo se envía al lead desde esta feature.
- [ ] El workflow existente `HNWI Prospection v2 - Anclora Nexus (Improved)` queda conectado o documentado con pasos exactos de integración.
- [ ] Se ejecuta smoke test con lead de prueba.
- [ ] Se verifica creación o respuesta idempotente en Nexus.
- [ ] Se verifica que `leads` e `ingestion_events` reciben trazabilidad correcta.
- [ ] Se documentan errores conocidos y pasos de rollback.

## Métricas objetivo

Durante la primera semana de uso controlado:

- 5-10 leads procesados automáticamente.
- 2-3 leads Hot identificados y notificados internamente.
- 0 contactos externos enviados sin aprobación humana.
- 0 escrituras directas a Supabase desde n8n.
- 100% de leads con `source_system`, `source_channel` y `source_detail`.
- 100% de ejecuciones con `trace_id` o identificador equivalente.

## Estados permitidos

Usar solo estos estados:

```txt
READY_FOR_N8N_IMPORT
READY_FOR_SMOKE_TEST
PRODUCTION_READY
BLOCKED
```

## Criterio para `PRODUCTION_READY`

Solo se puede marcar `PRODUCTION_READY` si:

```txt
n8n workflow real
   ↓
POST /api/ingestion/leads
   ↓
Nexus backend
   ↓
lead visible en Nexus/Supabase
   ↓
ingestion_event creado o actualizado
```

## Resultado esperado del gate final

```txt
Feature: n8n-unified-lead-intake
Versión: v1.1
Estado: READY_FOR_N8N_IMPORT / READY_FOR_SMOKE_TEST / PRODUCTION_READY
Endpoint canónico: POST /api/ingestion/leads
Persistencia: gestionada por backend Nexus
Contacto externo: no permitido en esta feature
```

---

**Fin del GATE FINAL v1.1**
