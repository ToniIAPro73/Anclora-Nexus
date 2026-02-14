# MIGRATION SPEC: PROPERTY ORIGIN UNIFICATION V1

**Feature ID**: ANCLORA-POU-001

## 1. Migración SQL propuesta

Archivo sugerido: `supabase/migrations/020_property_origin_unification.sql`

Cambios:

1. `ALTER TABLE properties ADD COLUMN IF NOT EXISTS source_system TEXT NOT NULL DEFAULT 'manual';`
2. `ALTER TABLE properties ADD COLUMN IF NOT EXISTS source_portal TEXT NULL;`
3. `CHECK` para `source_system`.
4. `CHECK` para `source_portal`.
5. Índice: `(org_id, source_system)` y `(org_id, source_portal)`.

## 2. Backfill

Reglas mínimas:

1. Si registro viene de flujo PBM identificado por linkage persistente, marcar `source_system='pbm'`.
2. Si registro viene de skill de prospección semanal (cuando exista marca), `source_system='widget'`.
3. Resto: `source_system='manual'`.

## 3. Rollback

Archivo sugerido: `supabase/migrations/021_property_origin_unification_rollback.sql`

1. Drop índices nuevos.
2. Drop constraints nuevas.
3. Drop columnas `source_portal`, `source_system`.

## 4. Validación post-migración

1. Conteo por origen:
- `SELECT source_system, count(*) FROM properties GROUP BY 1;`
2. Portales inválidos:
- `SELECT count(*) FROM properties WHERE source_portal NOT IN (...) AND source_portal IS NOT NULL;`
3. Smoke test API create/list properties.

