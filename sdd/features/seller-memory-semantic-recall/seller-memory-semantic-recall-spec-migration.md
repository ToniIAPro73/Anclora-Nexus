# Spec Migration - Seller Memory Semantic Recall v1

## Decision

Se requiere migracion aditiva nueva.

## Migration file

- `supabase/migrations/043_seller_memory_semantic_recall.sql`
- `supabase/migrations/044_seller_memory_vector_embeddings.sql`

## Cambios

- nueva tabla `seller_memory_records`
- indice por seller y fecha fuente
- indice GIN sobre `keywords`
- RLS por `org_id`
- columnas de embeddings reales:
  - `embedding`
  - `embedding_dimensions`
  - `embedding_provider`
  - `embedding_model`
  - `embedding_status`
  - `embedding_generated_at`

## Rollout

1. Aplicar migracion `043`.
2. Aplicar migracion `044`.
3. Ejecutar rebuild bajo demanda por seller o dejar que el workbench haga sync lazy-safe.
4. Validar que `/api/sellers/{seller_id}/memory` y `/workbench` responden con `memory.status = ready`.
5. Si Cloudflare embeddings está configurado, validar `retrieval_mode = vector_hybrid`.
