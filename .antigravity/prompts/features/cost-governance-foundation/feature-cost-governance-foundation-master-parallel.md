# MASTER PROMPT: Cost Governance Foundation v1 (Agents A/B/C/D)

Feature ID: `ANCLORA-CGF-001`

Usar contexto comun:
- `.antigravity/prompts/features/cost-governance-foundation/feature-cost-governance-foundation-shared-context.md`

## Agent A - DB & Migrations
- Crear migraciones de presupuesto/consumo/alertas.
- Crear rollback.
- Entregar queries de verificacion.
- No tocar backend/frontend.

## Agent B - Backend API & Services
- Endpoints `/api/finops/*`.
- Guardrails warning/hard-stop.
- Logging de consumo por capability.
- No tocar SQL ni frontend.

## Agent C - Frontend UX
- Integrar estado de coste en dashboard/settings.
- Mostrar alertas y consumo agregado.
- Sin romper layout actual.

## Agent D - Testing & QA
- Validar DB/API/UI + no-regresion.
- Reportar P0/P1/P2.
- Emitir decision previa al gate.

## Orden de ejecucion
1) Agent A.
2) Agent B + Agent C (paralelo, tras A).
3) Agent D.
4) Gate final.

## Politica de parada
- 1 prompt = 1 commit.
- Cada agente debe detenerse al cumplir su bloque.
