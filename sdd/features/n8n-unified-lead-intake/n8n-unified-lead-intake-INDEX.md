# n8n Unified Lead Intake — INDEX v1.1

## Feature SDD

Feature:

```txt
n8n-unified-lead-intake
```

Repositorio:

```txt
Anclora-Nexus
```

Ruta:

```txt
sdd/features/n8n-unified-lead-intake/
```

## Descripción general

Esta feature implementa el workflow n8n de **ingesta unificada de leads** para Anclora Nexus.

Su función no es guardar datos directamente en Supabase. Su función es recibir leads desde múltiples fuentes, normalizarlos y enviarlos al endpoint backend canónico creado por la feature `lead-ingestion-webhook`.

## Arquitectura canónica v1.1

```txt
Landing / HNWI / Dux-Soup / PhantomBuster / Partner referral
        ↓
n8n Unified Lead Intake
        ↓
Normalize + classify + score + trace
        ↓
POST /api/ingestion/leads
        ↓
Anclora Nexus backend
        ↓
leads + ingestion_events + dedupe + observabilidad
```

## Lo que esta feature hace

- Recibe leads desde un webhook n8n.
- Normaliza payloads heterogéneos.
- Clasifica el lead como Seller/Buyer/HNWI/Unknown si hay señales suficientes.
- Calcula score operativo Hot/Warm/Cold.
- Construye payload compatible con `LeadIngestionPayload`.
- Envía el lead a `POST /api/ingestion/leads`.
- Notifica internamente a Toni si el lead es Hot.
- Conserva trazabilidad con `trace_id`, `external_id`, `connector_name` y metadatos de origen.
- Documenta cómo integrar el workflow existente `HNWI Prospection v2 - Anclora Nexus (Improved)`.

## Lo que esta feature no hace

- No inserta directamente en Supabase.
- No usa tabla `nexus_leads`.
- No envía emails al lead.
- No envía WhatsApps al lead.
- No ejecuta nurturing.
- No reemplaza el backend `lead-ingestion-webhook`.
- No modifica la landing salvo que sea necesario para ajustar el payload de entrada.

## Fuentes objetivo

| Fuente | `source_system` | `source_channel` | `connector_name` sugerido |
|---|---|---|---|
| Landing Private Estates | `cta_web` | `website` | `cta_web:website` |
| HNWI Prospection v2 | `social` | `linkedin` / `facebook` / `other` | `hnwi-prospection:<channel>` |
| Dux-Soup | `social` | `linkedin` | `linkedin-automation:dux-soup` |
| PhantomBuster | `social` | `linkedin` | `linkedin-automation:phantombuster` |
| Referido partner | `partner` | `other` | `synergi-partner-referral` |
| Alta manual | `manual` | `other` | `manual:intake` |

## Estructura de archivos

```txt
sdd/features/n8n-unified-lead-intake/
├── GATE_FINAL_N8N_UNIFIED_LEAD_INTAKE.md
├── n8n-unified-lead-intake-INDEX.md
├── n8n-unified-lead-intake-master-parallel.md
├── n8n-unified-lead-intake-shared-context.md
├── n8n-unified-lead-intake-spec-migration.md
├── n8n-unified-lead-intake-spec-v1.md
├── n8n-unified-lead-intake-test-plan-v1.md
├── RUNBOOK_N8N_UNIFIED_LEAD_INTAKE.md
└── artifacts/
    ├── n8n_unified_lead_intake_workflow_v1_1.json
    └── README.md
```

## Dependencias previas

Esta feature depende de:

```txt
lead-ingestion-webhook
```

Endpoint esperado:

```txt
POST /api/ingestion/leads
```

## Variables necesarias en n8n

```txt
NEXUS_API_BASE_URL=https://anclora-nexus.onrender.com
NEXUS_DEFAULT_ORG_ID=9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf
TONI_EMAIL=<email-interno>
NEXUS_INGESTION_API_KEY=<solo-si-el-backend-lo-exige>
```

No usar:

```txt
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_KEY
SUPABASE_URL como destino de escritura desde n8n
```

## Estado esperado tras implementación

```txt
PRODUCTION_READY
```

solo si el smoke test real confirma que el lead llega a Nexus.

---

**Fin del INDEX v1.1**
