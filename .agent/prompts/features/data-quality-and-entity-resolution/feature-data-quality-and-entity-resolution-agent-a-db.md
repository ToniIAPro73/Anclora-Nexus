PROMPT: Implementa el bloque DB de `ANCLORA-DQER-001`.

CONTEXTO:
- Usa `.antigravity/prompts/features/data-quality-and-entity-resolution/feature-data-quality-and-entity-resolution-shared-context.md`.
- Respeta contrato de:
  - `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-v1.md`
  - `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-migration.md`

TAREAS:
1) Crear migraciones SQL para:
- `dq_quality_issues`
- `dq_entity_candidates`
- `dq_resolution_log`
2) Añadir checks, índices y uniques.
3) Preparar rollback.
4) Preparar SQL de verificación post-migración.

ALCANCE:
- `supabase/migrations/*`
- `sdd/features/data-quality-and-entity-resolution/*` (solo ajustes DB si aplica)

PROHIBIDO:
- `backend/*`
- `frontend/*`

CRITERIO DE PARADA:
- Detener tras DB + rollback + validación.
