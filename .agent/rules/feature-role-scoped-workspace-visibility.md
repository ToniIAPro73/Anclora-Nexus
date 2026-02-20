---
trigger: always_on
---

# Feature Rules: Role Scoped Workspace Visibility v1

## Jerarquía normativa
1) `sdd/core/constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-spec-v1.md`

## Reglas inmutables

- Toda query de datos operativos debe respetar `org_id`.
- Para rol `agent`, el alcance es exclusivamente `assigned_user_id = user_id`.
- `owner` y `manager` conservan visibilidad total de su organización.
- No usar `notes.routing` como única fuente de asignación en nuevo código.
- Mantener compatibilidad transitoria leyendo `notes.routing` solo para backfill/fallback.

## Reglas de seguridad

- Activar RLS en `leads`, `tasks`, `properties`.
- Definir policies separadas para `owner/manager` y `agent`.
- Evitar bypass de scope en frontend (filtrado explícito por rol).
