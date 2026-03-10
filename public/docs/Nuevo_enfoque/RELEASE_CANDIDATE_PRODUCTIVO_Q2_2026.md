# Release Candidate Productivo Q2 2026

Fecha de evaluación: `2026-03-10`

## Decisión

`CONDITIONAL GO`

## Motivo

El perímetro `BL-001` a `BL-011` está cerrado en código, validado con tests backend, `lint` y `build` frontend, y empujado a `main`.

La salida a producción real queda condicionada a dos verificaciones operativas fuera de este workspace:

1. Ejecutar smoke test con datos reales o sandbox controlado.
2. Emitir validación final de compliance scraping/captura para fuentes activas.

Runbook de smoke test:
- `public/docs/Nuevo_enfoque/SMOKE_TEST_RC_PRODUCTIVO_Q2_2026.md`
  - incluye versión corta `15-20 min`
- acta:
  - `public/docs/Nuevo_enfoque/ACTA_SMOKE_TEST_RC_PRODUCTIVO_Q2_2026.md`

## Evidencia técnica

### Confirmación remota

- Migraciones `040`, `041`, `042` y `043` confirmadas como aplicadas en Supabase Cloud.

### Commits del tramo productivo

- `10850a8` `feat: completar BL-001 control plane territorial`
- `0c1d7e1` `feat: completar BL-002 sellers con inteligencia territorial real`
- `98f7f35` `feat: completar BL-003 unified ingestion operativo`
- `0a7ab3a` `feat: completar BL-004 supervised send hitl`
- `f76c924` `feat: completar BL-005 statefox bridge productivo`
- `b7453ce` `feat: completar BL-006 live capture statefox`
- `5a4b2df` `feat: completar BL-007 observabilidad de fuentes`
- `777eed3` `feat: completar BL-008 alertado operativo`
- `2cbc72b` `feat: completar BL-009 seller memory semantic recall`
- `b05fc66` `feat: completar BL-010 whale workbench contextual`
- `e4590e8` `feat: completar BL-011 command center productivo`

### Verificación local ejecutada

- backend:
  - `backend/tests/test_territorial_sync_routes.py`
  - `backend/tests/test_sellers_routes.py`
  - `backend/tests/test_unified_ingestion.py`
  - `backend/tests/test_ingestion_routes.py`
  - `backend/tests/test_statefox_bridge_routes.py`
  - `backend/tests/test_statefox_discovery_routes.py`
  - `backend/tests/test_statefox_bridge_service.py`
  - `backend/tests/test_statefox_live_capture_service.py`
  - `backend/tests/test_source_observatory_routes.py`
  - `backend/tests/test_source_observatory_service.py`
  - `backend/tests/test_automation_routes.py`
  - `backend/tests/test_automation_service.py`
  - `backend/tests/test_command_center_routes.py`
  - `backend/tests/test_command_center_service.py`
  - `backend/tests/test_seller_memory_service.py`
  - `backend/tests/test_sellers_service.py`
- frontend:
  - `npm run frontend:lint`
  - `npm run frontend:build`

## Perímetro aceptado

- Pipeline territorial operativo
- Sellers workspace sin hardcodes territoriales
- Unified ingestion seller-side
- Supervised send HITL
- StateFox bridge + live capture
- Source observatory
- Alertado operativo
- Seller memory semantic recall
- Whale workbench contextual
- Command center productivo

## Riesgos residuales

- No hay evidencia en este workspace de smoke test contra datos reales post-migración.
- Persiste deuda legacy menor en `FastAPI on_event` y modelos Pydantic antiguos; no bloquea RC.

## Checklist de salida

- [x] Código productivo en `main`
- [x] Tests backend relevantes en verde
- [x] `frontend:lint` en verde
- [x] `frontend:build` en verde
- [x] `progress.md` actualizado
- [x] `architecture.md` actualizado
- [x] `sdd/features/FEATURES.md` actualizado
- [x] Confirmación remota de migraciones `040-043`
- [ ] Smoke test real
- [ ] Revisión final compliance scraping/captura

## Recomendación

Promocionar a staging/producción solo tras cerrar las dos casillas pendientes. Hasta entonces el estado correcto no es `GO` pleno sino `CONDITIONAL GO`.
