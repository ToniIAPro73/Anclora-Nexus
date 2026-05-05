# Agent A - DB Prompt (ANCLORA-OAEP-001)

Objetivo:
- Confirmar si OAEP requiere migracion de Supabase.
- Validar que columnas requeridas ya existen (`source_system`, `source_portal`, `match_score`).
- Emitir decision explicita: `NO_MIGRATION_REQUIRED` o `MIGRATION_REQUIRED`.

Validaciones:
1) Compatibilidad de schema para enforcement por origen.
2) Riesgo de ruptura en datos legacy.
3) Plan de rollback si se detecta necesidad de migracion.
