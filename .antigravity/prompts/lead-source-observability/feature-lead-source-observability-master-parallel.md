# MASTER PROMPT: Lead Source Observability v1 (Agents A/B/C/D)

Feature ID: `ANCLORA-LSO-001`

Contexto común:
- `.antigravity/prompts/feature-lead-source-observability-shared-context.md`

## Agent A — DB & Migration
- Crear migraciones de source observability en leads.
- Backfill desde `source` legacy.
- Rollback + verificación.
- No tocar backend/frontend.

## Agent B — Backend
- Adaptar endpoints leads y lead-intake.
- Validaciones de dominio.
- Endpoint público de captura (si aplica en alcance acordado).
- No tocar migraciones/frontend.

## Agent C — Frontend
- Mostrar origen compuesto en Leads.
- Soporte de filtros/badges de origen.
- No tocar backend/migraciones.

## Agent D — QA
- Validar DB/API/UI + no-regresión + org isolation.

## Commit Policy
- 1 prompt = 1 commit.
- El agente se detiene al cerrar su bloque.

