# Release Gate Operacional Recurrente

Fecha de activación: `2026-03-11`

Objetivo: convertir la validación de release en un gate repetible y breve antes de promocionar cambios relevantes a producción.

## Runner automatizado

- comando:
  - `npm run ops:release-gate`
- artefacto generado:
  - `ops/release-gate-latest.json`

## Qué valida automáticamente

1. `ops:notebooklm:validate-sync-pack`
2. suite backend mínima del perímetro productivo
3. `frontend:lint`
4. `frontend:build`
5. smoke seller-side opcional si existen `JWT` y `ORG_ID`

## Variables opcionales para smoke seller-side

- `JWT`
- `ORG_ID`
- `BACKEND_URL`
- `TRACE_ID`
- `SNAPSHOT_ID`

## Gate manual complementario

Usar junto con:
- `public/docs/nuevo-enfoque/ACTA_RELEASE_GATE_OPERACIONAL.md`

Checks manuales mínimos:
- `/sellers`
- workbench contextual
- `send-supervised`
- `/source-observatory`
- `/command-center`

## Decisión

- `GO`
  - runner automatizado en PASS
  - acta manual sin fallos bloqueantes

- `CONDITIONAL GO`
  - runner automatizado en PASS
  - un fallo menor manual con workaround documentado

- `NO-GO`
  - cualquier fallo automatizado
  - o fallo manual en workbench, HITL, observabilidad o command center
