PROMPT: Implementa el bloque DB de `ANCLORA-SCUI-001`.

CONTEXTO:
- Usa `feature-source-connectors-unified-ingestion-shared-context.md`.
- Respeta `source-connectors-unified-ingestion-spec-migration.md`.

TAREAS:
1) Crear migraciones para:
- `ingestion_connectors`
- `ingestion_events`
2) Añadir checks, índices y unique de idempotencia.
3) Crear rollback.
4) Preparar SQL de verificación post-migración.

ALCANCE:
- `supabase/migrations/*`
- `sdd/features/source-connectors-unified-ingestion/*` (solo ajustes DB)

PARADA:
- Detener tras DB + rollback + validación.
