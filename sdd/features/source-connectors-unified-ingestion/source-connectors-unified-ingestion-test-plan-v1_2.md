# Test Plan v1.2 - Source Connectors Unified Ingestion

Feature ID: `ANCLORA-SCUI-001`

## Objetivo

Validar que el source runner seller-side selecciona correctamente fuente live, aplica fallback y deja trazabilidad operativa consistente.

## Cobertura mínima

1. Firecrawl tiene prioridad cuando está disponible.
2. StateFox live capture actúa como fallback live.
3. Snapshot fallback entra solo cuando live no está disponible.
4. Error explícito cuando no existe ninguna fuente.
5. Firecrawl seller-side usa unified ingestion y `connector_name` trazable.
6. Build/lint frontend siguen verdes tras integrar el cron.

## Suites

### Backend unit

- `backend/tests/test_seller_signal_source_service.py`
- `backend/tests/test_fsbo_scraper.py`
- regresión:
  - `backend/tests/test_unified_ingestion.py`
  - `backend/tests/test_statefox_live_capture_service.py`
  - `backend/tests/test_statefox_bridge_service.py`

### Frontend / integration

- `npm run frontend:lint`
- `npm run frontend:build`

## Criterio de salida

- prioridad y fallback verificados
- cron territorial compila
- ninguna regresión en ingestión seller-side existente
