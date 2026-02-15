PROMPT: Implementa el bloque DB de `ANCLORA-CGF-001`.

CONTEXTO:
- Usa `.antigravity/prompts/features/cost-governance-foundation/feature-cost-governance-foundation-shared-context.md`.
- Respeta contrato de:
  - `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-v1.md`
  - `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-migration.md`

TAREAS:
1) Crear migracion SQL para:
- `org_cost_policies`
- `org_cost_usage_events`
- `org_cost_alerts`
2) Crear indices y checks de consistencia.
3) Backfill inicial de policy por org.
4) Crear rollback SQL.
5) Preparar script/query de verificacion post-migracion.

ALCANCE PERMITIDO:
- `supabase/migrations/*`
- `sdd/features/cost-governance-foundation/*` (solo ajustes DB si aplica)

PROHIBIDO:
- `backend/*`
- `frontend/*`

CRITERIO DE PARADA:
- Cuando migracion + rollback + validacion esten listos.
- No continuar con API/UI/QA.
