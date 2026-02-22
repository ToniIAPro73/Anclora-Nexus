# Multichannel Feed Orchestrator v1 - Spec Migration

## Estrategia
v1 se despliega en modo compatible sin migraciones bloqueantes.

## Cambios de datos
- No requiere nuevas tablas obligatorias para funcionamiento base.
- Reutiliza `ingestion_events` para logging operativo de runs de feed cuando existe.

## Backfill
- No aplica.

## Rollout
1. Deploy backend con nuevos endpoints `/api/feeds/*`.
2. Deploy frontend con nueva pantalla `/feed-orchestrator`.
3. Activar monitorizacion de errores en publish/validate.

## Rollback
- Revert de ruta frontend y desregistro de router backend.
- No hay impacto irreversible de datos.

## Verificaciones post-deploy
- `GET /api/feeds/workspace` responde 200.
- Validacion por canal devuelve issues con severidad.
- Publish real/dry-run devuelve respuesta estructurada.
- Historial muestra runs recientes.
