PROMPT: Implementa bloque DB de `ANCLORA-LSO-001`.

CONTEXTO:
- Usa `.antigravity/prompts/feature-lead-source-observability-shared-context.md`.
- Lee spec/migration de `sdd/features/lead-source-observability/`.

TAREAS:
1) Crear `023_lead_source_observability.sql`:
- columnas de origen en `leads`
- defaults + checks
- índices por org/source/captured_at
2) Crear `024_lead_source_observability_rollback.sql`.
3) Añadir script SQL de verificación post-migración.

ALCANCE:
- Solo `supabase/migrations/*` y ajustes mínimos de spec-migration.

STOP:
- No tocar backend/frontend.
- Entregar lista de archivos tocados y detenerse.

