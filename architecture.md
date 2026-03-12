# Arquitectura de Anclora Nexus

Documento marco de ecosistema:
- `public/docs/nuevo-enfoque/Arquitectura-Ecosistema-Anclora-Group.md`

Estado actualizado a `2026-03-12` con `ANCLORA-PAA-001`, `ANCLORA-SPA-001`, `ANCLORA-SPW-001`, `ANCLORA-BPNM-001` y `ANCLORA-DLAB-001`.

## 1. Perímetro productivo actual

El sistema ya opera sobre tres planos conectados:

1. Captura y normalización seller-side
   - `StateFox discovery/bridge/live capture`
   - unified ingestion con `seller_signal`
   - derivación a `nexus_sellers`

2. Inteligencia y activación comercial
   - sync territorial NotebookLM
   - Gravity Claw workbench
   - dossier, drafts, supervised send HITL
   - memoria semántica seller-side

3. Observabilidad y gobierno
   - source observatory
   - automation alerting
   - command center ejecutivo

## 2. Runtime

### Frontend
- Next.js App Router en `frontend/src/app`
- dashboards operativos:
  - `/sellers`
  - `/intelligence/statefox-bridge`
  - `/source-observatory`
  - `/automation-alerting`
  - `/command-center`
- control de acceso en `frontend/src/proxy.ts`

### Backend
- FastAPI principal en `backend/api/main.py`
- routers productivos relevantes:
  - `backend/api/routes/sellers.py`
  - `backend/api/routes/ingestion.py`
  - `backend/api/routes/skills.py`
  - `backend/api/routes/source_observatory.py`
  - `backend/api/routes/automation.py`
  - `backend/api/routes/command_center.py`

### Persistencia
- Supabase PostgreSQL con RLS por `org_id`
- migraciones productivas recientes:
  - `040_seller_contact_channels_and_supervised_send.sql`
  - `041_ingestion_entity_type_seller_signal.sql`
  - `042_operational_automation_alerts.sql`
  - `043_seller_memory_semantic_recall.sql`

## 3. Flujos principales

### Seller pipeline

`StateFox/live capture -> ingestion_events -> nexus_sellers -> seller_interactions -> seller_memory_records -> workbench -> supervised send`

Artefactos clave:
- `backend/services/ingestion_service.py`
- `backend/services/statefox_bridge_service.py`
- `backend/services/statefox_live_capture_service.py`
- `backend/services/sellers_service.py`
- `backend/services/seller_memory_service.py`

### Territorial intelligence

`sync pack NotebookLM -> cron territorial -> notebooklm_insights -> territorial-summary -> sellers/dashboard`

Artefactos clave:
- `backend/services/territorial_sync_service.py`
- `frontend/src/app/api/cron/territorial-pipeline/route.ts`

### Control plane y dirección

`source observatory + automation alerts + finops + seller pipeline metrics -> command center`

Artefactos clave:
- `backend/services/source_observatory_service.py`
- `backend/services/automation_service.py`
- `backend/services/command_center_service.py`

## 4. Capas de datos del seller-side

### Source of truth transaccional
- `nexus_sellers`
- `seller_interactions`
- `ingestion_events`

### Capa derivada
- `seller_memory_records`
- `notebooklm_insights`
- `automation_alerts`

### Capa de lectura ejecutiva
- `seller workbench`
- `source observatory`
- `command center`

## 5. Riesgos abiertos

- La salida a producción real depende de verificar en Supabase Cloud las migraciones `040-043`.
- Sigue faltando smoke test formal con datos reales controlados.
- Hay warnings legacy fuera de este bloque en FastAPI `on_event` y modelos Pydantic antiguos.

## 6. Acceso privado del ecosistema

La entrada privada del ecosistema queda repartida asi:

1. `Anclora Private Estates`
   - puerta publica de marca
   - `Area Privada` como gateway externo

2. `Anclora Nexus`
   - login y workspace del `Portal de Agente`
   - gateway publico `/private-area`
   - superficies publicas iniciales para `Partner` y `Data Lab`

3. `Synergi`
   - admision publica operativa en `/private-area/partner`
   - cola interna de revision en `/partner-admissions`
   - workspace colaborativo controlado por token en `/private-area/partner/workspace`
   - workspace v2 con perfil operativo y actividad trazable
   - consola interna de red partner en `/partner-network`

4. `Data Lab`
   - reservado para acceso analitico controlado apoyado en `intelligence_packs`
   - acceso selectivo por `request -> review -> workspace`

La regla actual es:
- `agent` usa auth de Nexus y membership activa
- `partner` y `data_lab` quedan expuestos como portales publicos o de acceso controlado, sin mezclarse con el dashboard interno
