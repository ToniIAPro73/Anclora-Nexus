# Feature Prompt v1 — ANCLORA-PUW-001

Objetivo: implementar `prospection-unified-workspace` siguiendo SDD y reglas de scope por rol.

## Inputs obligatorios
- `sdd/features/prospection-unified-workspace/prospection-unified-workspace-spec-v1.md`
- `sdd/features/prospection-unified-workspace/prospection-unified-workspace-spec-migration.md`
- `sdd/features/prospection-unified-workspace/prospection-unified-workspace-test-plan-v1.md`
- `.agent/rules/feature-prospection-unified-workspace.md`

## Entregables
1) Backend endpoint agregador de workspace.
2) Frontend ruta unificada con filtros compartidos.
3) Acciones rapidas (task follow-up, mark reviewed).
4) Pruebas minimas unit + integracion.
5) Actualizacion de `FEATURES.md` y `CHANGELOG.md`.

## Restricciones
- No romper `/prospection` actual.
- Cumplir aislamiento por `org_id` y `assigned_user_id`.

