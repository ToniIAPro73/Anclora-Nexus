# Spec Migration - Source Connectors Unified Ingestion

Feature ID: `ANCLORA-SCUI-001`

## Objetivo DB
Crear soporte persistente para trazabilidad de ingestión por fuente, con idempotencia y diagnóstico de errores.

## Nuevas tablas

### 1) `ingestion_connectors`
- `id uuid pk`
- `org_id uuid not null` fk `organizations(id)`
- `connector_name text not null`
- `entity_type text not null` check in `('lead','property')`
- `source_system text not null`
- `source_channel text null`
- `is_enabled boolean not null default true`
- `config jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Unique:
- `(org_id, connector_name, entity_type)`

### 2) `ingestion_events`
- `id uuid pk`
- `org_id uuid not null` fk `organizations(id)`
- `connector_name text not null`
- `entity_type text not null` check in `('lead','property')`
- `external_id text not null`
- `dedupe_key text not null`
- `status text not null` check in `('received','validated','processed','rejected','failed')`
- `error_code text null`
- `error_message text null`
- `payload jsonb not null default '{}'::jsonb`
- `trace_id text null`
- `processed_entity_id uuid null`
- `created_at timestamptz not null default now()`
- `processed_at timestamptz null`

Unique:
- `(org_id, dedupe_key)`

Indices:
- `(org_id, created_at desc)`
- `(org_id, status, created_at desc)`
- `(org_id, connector_name, created_at desc)`
- `(trace_id)` parcial si no null

## Regla de dedupe key
`dedupe_key = sha256(org_id + connector_name + entity_type + external_id)`

## Backfill v1
- No requiere backfill obligatorio.
- Opcional: crear conectores por defecto desactivados para cada org.

## Rollback
Drop en orden:
1) `ingestion_events`
2) `ingestion_connectors`

## Verificación post-migración
1. Insert conector válido.
2. Insert evento válido con dedupe_key único.
3. Reinsert mismo dedupe_key -> conflicto esperado.
4. Query por org/status devuelve resultados.
