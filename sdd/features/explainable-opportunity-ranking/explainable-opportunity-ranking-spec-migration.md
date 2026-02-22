# Explainable Opportunity Ranking v1 - Spec Migration

## Estrategia
v1 se despliega en modo compatible sin migraciones bloqueantes.

## Cambios de datos
- No requiere nuevas tablas obligatorias para funcionamiento base.
- Reutiliza datos existentes de `property_buyer_matches`, `prospected_properties` y `buyer_profiles`.
- El score de oportunidad se calcula en tiempo de lectura en backend.

## Backfill
- No aplica en v1.

## Rollout
1. Deploy backend con endpoint `GET /api/prospection/opportunities/ranking`.
2. Deploy frontend con ruta `/opportunity-ranking`.
3. Validar comportamiento por rol (`owner/manager` global, `agent` acotado).

## Rollback
- Revert del endpoint y de la ruta frontend.
- No hay impacto irreversible de datos.

## Verificaciones post-deploy
- `GET /api/prospection/opportunities/ranking` responde 200.
- El payload incluye `opportunity_score`, `priority_band`, `drivers`, `next_action`.
- La UI renderiza ranking sin errores y respeta i18n `es/en/de/ru`.
