# Spec Migration - Seller Memory Semantic Recall v1

## Decision

Se requiere migracion aditiva nueva.

## Migration file

- `supabase/migrations/043_seller_memory_semantic_recall.sql`

## Cambios

- nueva tabla `seller_memory_records`
- indice por seller y fecha fuente
- indice GIN sobre `keywords`
- RLS por `org_id`

## Rollout

1. Aplicar migracion `043`.
2. Ejecutar rebuild bajo demanda por seller o dejar que el workbench haga sync lazy-safe.
3. Validar que `/api/sellers/{seller_id}/memory` y `/workbench` responden con `memory.status = ready`.
