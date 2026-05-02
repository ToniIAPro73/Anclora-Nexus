# n8n Unified Lead Intake — Master Parallel v1.1

## Objetivo

Coordinar la entrega de la feature `n8n-unified-lead-intake` bajo el nuevo enfoque backend-first:

```txt
n8n → POST /api/ingestion/leads → Nexus backend → Supabase
```

No se debe implementar ni mantener ningún camino alternativo de escritura directa a Supabase.

## Prerrequisitos

Antes de empezar:

- `lead-ingestion-webhook` debe estar implementada.
- El endpoint `POST /api/ingestion/leads` debe responder.
- Debe conocerse el `org_id` por defecto que n8n usará para leads entrantes.
- Debe existir una URL estable del backend, por ejemplo:

```txt
https://anclora-nexus.onrender.com
```

## Workstream A — Revisión de contrato backend

Duración estimada: 1-2 horas.

Tareas:

- Revisar `backend/models/ingestion.py`.
- Revisar `backend/api/routes/ingestion.py`.
- Revisar `backend/services/ingestion_service.py`.
- Confirmar campos aceptados por `LeadIngestionPayload`.
- Confirmar valores permitidos de:
  - `source_system`
  - `source_channel`
  - `qualification_tier`
  - `hnwi_source_channel`
- Confirmar si el endpoint exige API key o autenticación interna.
- Documentar payload mínimo y payload completo.

Entregable:

```txt
Contrato de payload validado para n8n.
```

## Workstream B — Workflow n8n

Duración estimada: 4-6 horas.

Nodos mínimos:

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

Cambios respecto a la versión anterior:

- El nodo `Save to Supabase` queda eliminado.
- El destino pasa a ser `HTTP Request → POST /api/ingestion/leads`.
- El workflow debe generar `trace_id` si no viene informado.
- El workflow debe generar `external_id` estable si no viene informado.

Entregable:

```txt
sdd/features/n8n-unified-lead-intake/artifacts/n8n_unified_lead_intake_workflow_v1_1.json
```

## Workstream C — Integración HNWI Prospection v2

Duración estimada: 1-2 horas.

Workflow existente:

```txt
HNWI Prospection v2 - Anclora Nexus (Improved)
```

Opciones válidas:

### Opción A — HTTP Request final

Añadir al final del workflow HNWI:

```txt
HTTP Request → POST {{NEXUS_API_BASE_URL}}/api/ingestion/leads
```

### Opción B — Execute Workflow

Hacer que HNWI llame al subworkflow unificado:

```txt
HNWI Prospection v2
   ↓
Execute Workflow: n8n-unified-lead-intake
```

Criterio recomendado:

- Usar Opción A si se busca rapidez y menor complejidad.
- Usar Opción B si varias fuentes van a reutilizar el subworkflow.

Entregable:

```txt
RUNBOOK_N8N_UNIFIED_LEAD_INTAKE.md
```

con pasos exactos de conexión.

## Workstream D — Testing

Duración estimada: 2-3 horas.

Casos mínimos:

- Lead Hot desde landing.
- Lead Warm desde Facebook.
- Lead Cold desde Reddit/LinkedIn.
- Lead HNWI desde workflow HNWI.
- GDPR false.
- Duplicado/idempotencia.
- Backend 500/error controlado.
- Notificación interna para Hot.
- No contacto externo al lead.

Entregable:

```txt
n8n-unified-lead-intake-test-plan-v1.md actualizado
```

## Workstream E — Documentación y gate

Duración estimada: 1 hora.

Actualizar:

```txt
GATE_FINAL_N8N_UNIFIED_LEAD_INTAKE.md
n8n-unified-lead-intake-INDEX.md
n8n-unified-lead-intake-shared-context.md
n8n-unified-lead-intake-spec-migration.md
```

No marcar producción hasta tener smoke test.

## Orden recomendado

```txt
A. Validar contrato backend
B. Actualizar SDD
C. Crear JSON n8n
D. Documentar integración HNWI
E. Ejecutar smoke test
F. Actualizar gate
```

## Criterio de cierre

La feature se considera cerrada solo si:

```txt
lead de prueba
   ↓
n8n
   ↓
POST /api/ingestion/leads
   ↓
lead visible en Nexus/Supabase
   ↓
trace_id/source metadata verificables
```

---

**Fin del Master Parallel v1.1**
