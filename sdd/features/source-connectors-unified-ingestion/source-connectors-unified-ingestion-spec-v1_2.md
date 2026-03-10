# Spec v1.2 - Source Connectors Unified Ingestion

Feature ID: `ANCLORA-SCUI-001`

## Objetivo v1.2

Cerrar `BL-next-01` convirtiendo seller-side ingestion en un conector operativo con prioridad live y fallback trazable.

## Alcance

### Incluye

- fuente primaria live `firecrawl:idealista-fsbo` cuando exista credencial válida
- fuente secundaria `statefox:live-capture` cuando exista artifact supervisado importable
- fallback `snapshot:seller-signals` cuando no haya live disponible
- skill operativa unificada para resolver la mejor fuente seller-side
- persistencia de estado operativo del source runner
- integración del cron territorial con la nueva resolución de fuente
- Firecrawl seller-side alineado con `ingestion_events`

### No incluye

- scheduler distribuido independiente del cron actual
- colas async dedicadas
- reconciliación multifuente avanzada
- autenticación externa por proveedor

## Contrato operativo

Orden de resolución:

1. `firecrawl:idealista-fsbo`
2. `statefox:live-capture`
3. `snapshot:seller-signals`

La fuente elegida debe dejar:

- `source_selected`
- `attempts`
- `status`
- `signals_received`
- `created`
- `duplicates`
- `rejected`
- `failed`

## Cambios backend

- `backend/services/seller_signal_source_service.py`
- `backend/skills/seller_signal_source_run.py`
- `backend/skills/fsbo_scraper.py`
- `backend/api/routes/skills.py`
- `backend/services/statefox_live_capture_service.py`

## Cambios frontend / cron

- `frontend/src/app/api/cron/territorial-pipeline/route.ts`

## Criterios de aceptación

1. El cron territorial deja de depender directamente de `seller-signals.snapshot.json`.
2. Firecrawl seller-side persiste eventos en `ingestion_events`.
3. Si Firecrawl no está disponible, el sistema intenta StateFox live capture.
4. Si no existe fuente live disponible, el sistema usa snapshot fallback con trazabilidad explícita.
5. El source runner deja estado operativo persistido y auditable.
