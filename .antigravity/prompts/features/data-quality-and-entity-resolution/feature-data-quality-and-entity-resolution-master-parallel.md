# MASTER PROMPT: Data Quality and Entity Resolution v1 (Agents A/B/C/D)

Feature ID: `ANCLORA-DQER-001`

Usar contexto común:
- `.antigravity/prompts/features/data-quality-and-entity-resolution/feature-data-quality-and-entity-resolution-shared-context.md`
- Baseline QA/Gate: `.antigravity/prompts/features/_qa-gate-baseline.md`

## Agent A - DB & Migrations
- Crear migraciones para issues/candidatos/log de resolución.
- Crear rollback y queries de verificación.
- No tocar backend/frontend.

## Agent B - Backend API & Services
- Endpoints `/api/dq/*`.
- Motor de recompute + resolución con trazabilidad.
- Aislamiento org y reglas de permisos.
- No tocar SQL ni frontend.

## Agent C - Frontend UX
- Pantalla/listado de issues y candidatos.
- Flujo de revisión (aprobar/rechazar) para owner/manager.
- i18n completo en `es/en/de/ru`.
- Sin romper layout actual.

## Agent D - Testing & QA
- Validar DB/API/UI + no-regresión.
- Aplicar baseline obligatorio (entorno `.env*` + i18n).
- Reportar P0/P1/P2.

## Orden de ejecución
1) Agent A.
2) Agent B + Agent C (paralelo, tras A).
3) Agent D.
4) Gate final.

## Política de parada
- 1 prompt = 1 commit.
- Cada agente debe detenerse al cumplir su bloque.
