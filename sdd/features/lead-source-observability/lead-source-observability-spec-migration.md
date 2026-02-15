# MIGRATION SPEC: LEAD SOURCE OBSERVABILITY V1

**Feature ID**: ANCLORA-LSO-001

## 1. Migración SQL propuesta

Archivo sugerido: `supabase/migrations/023_lead_source_observability.sql`

Cambios:

1. Añadir columnas nuevas en `leads`:
- `source_system`
- `source_channel`
- `source_campaign`
- `source_detail`
- `source_url`
- `source_referrer`
- `source_event_id`
- `captured_at`
- `ingestion_mode`

2. Defaults v1:
- `source_system='manual'`
- `source_channel='other'`
- `ingestion_mode='manual'`

3. Checks de dominio para `source_system`, `source_channel`, `ingestion_mode`.

4. Índices:
- `(org_id, source_system)`
- `(org_id, source_channel)`
- `(org_id, captured_at DESC)`

## 2. Backfill mínimo

1. Si `source` legacy contiene `linkedin`, mapear `source_channel='linkedin'`.
2. Si `source` legacy contiene `web`, mapear `source_channel='website'`.
3. Resto -> `other`.

## 3. Rollback

Archivo sugerido: `supabase/migrations/024_lead_source_observability_rollback.sql`

1. Drop índices.
2. Drop constraints.
3. Drop columnas nuevas.

## 4. Validación post-migración

1. `SELECT source_system, count(*) FROM leads GROUP BY 1;`
2. `SELECT source_channel, count(*) FROM leads GROUP BY 1;`
3. `SELECT count(*) FROM leads WHERE captured_at IS NULL AND source_system <> 'manual';`

