# Migration - ANCLORA-MTIP-001 v1.0

Migración asociada:

- `supabase/migrations/045_multi_tenant_intelligence_packs.sql`

## Cambios

- creación de tabla `intelligence_packs`
- índices por `org_id`, `is_default` y `status`
- restricción de único pack default por tenant
- política RLS por `org_id`
- trigger `updated_at`

## Rollout

1. aplicar migración `045`
2. verificar existencia de la tabla
3. validar `GET /api/intelligence/packs`
4. crear primer pack real por tenant cuando se quiera salir del fallback legacy
