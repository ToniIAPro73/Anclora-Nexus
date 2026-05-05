# Agent A - DB Prompt (ANCLORA-MFO-001)

Objetivo:
- Verificar estado de migracion de persistencia MFO en Supabase.
- Confirmar disponibilidad de tablas `feed_channel_configs`, `feed_runs`, `feed_validation_issues`.
- Validar fallback legacy sobre `ingestion_events` cuando aplique.

Validaciones:
1) Migracion `034_multichannel_feed_orchestrator.sql` aplicada o plan de aplicacion.
2) Integridad de indices y constraints clave.
3) Reversibilidad y plan de rollback documentado.
