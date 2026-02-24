# Multichannel Feed Orchestrator v1 - Spec Migration

## Estrategia
v1 se despliega con persistencia dedicada cuando esta disponible, manteniendo compatibilidad con fallback legacy.

## Cambios de datos
- Migracion aplicada: `supabase/migrations/034_multichannel_feed_orchestrator.sql`.
- Tablas de feature:
  - `feed_channel_configs`
  - `feed_runs`
  - `feed_validation_issues`
- Fallback legacy: reutiliza `ingestion_events` cuando la persistencia dedicada no esta disponible.

## Backfill
- No aplica.

## Rollout
1. Aplicar migracion 034 en Supabase.
2. Deploy backend con endpoints `/api/feeds/*`.
3. Deploy frontend con pantalla `/feed-orchestrator`.
4. Activar monitorizacion de errores en validate/publish.

## Rollback
- Revert de ruta frontend y desregistro de router backend.
- Si aplica rollback DB: usar helper de rollback de la migracion 034.
- Mantener logging en `ingestion_events` como degradacion controlada.

## Verificaciones post-deploy
- `GET /api/feeds/workspace` responde 200.
- Validacion por canal devuelve issues con severidad.
- Publish real/dry-run devuelve respuesta estructurada.
- Historial muestra runs recientes.
