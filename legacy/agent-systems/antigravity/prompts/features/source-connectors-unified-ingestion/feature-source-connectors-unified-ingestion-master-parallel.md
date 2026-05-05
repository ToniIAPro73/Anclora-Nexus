# MASTER PROMPT: Source Connectors Unified Ingestion v1 (Agents A/B/C/D)

Feature ID: `ANCLORA-SCUI-001`

Usar contexto:
- `.antigravity/prompts/features/source-connectors-unified-ingestion/feature-source-connectors-unified-ingestion-shared-context.md`
- Baseline QA/Gate: `.antigravity/prompts/features/_qa-gate-baseline.md`

## Agent A - DB
- Migraciones de `ingestion_connectors` y `ingestion_events`.
- Rollback + queries de verificación.
- No tocar backend/frontend.

## Agent B - Backend
- Endpoints de ingestión y consulta de eventos.
- Validador canónico + dedupe.
- No tocar SQL/frontend.

## Agent C - Frontend
- Vista operativa de eventos de ingestión y estado por fuente.
- Filtros por fuente/estado.
- No tocar SQL/backend.

## Agent D - QA
- QA de DB/API/UI + regresión.
- Reporte de defectos P0/P1/P2.

## Orden
1) A
2) B + C en paralelo
3) D
4) Gate final
