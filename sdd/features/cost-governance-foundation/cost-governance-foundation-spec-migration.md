# Spec Migration - Cost Governance Foundation

Feature ID: `ANCLORA-CGF-001`

## Objetivo DB
Agregar esquema minimo FinOps para presupuesto, consumo y alertas por organizacion, manteniendo aislamiento multi-tenant.

## Nuevas tablas

### 1) `org_cost_policies`
- `id uuid pk`
- `org_id uuid not null unique` fk `organizations(id)`
- `monthly_budget_eur numeric(14,2) not null default 0`
- `warning_threshold_pct numeric(5,2) not null default 80`
- `hard_stop_threshold_pct numeric(5,2) not null default 100`
- `hard_stop_enabled boolean not null default true`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Checks:
- `monthly_budget_eur >= 0`
- `warning_threshold_pct between 1 and 100`
- `hard_stop_threshold_pct between warning_threshold_pct and 200`

### 2) `org_cost_usage_events`
- `id uuid pk`
- `org_id uuid not null` fk `organizations(id)`
- `capability_code text not null`
- `provider text null`
- `units numeric(14,4) not null default 0`
- `cost_eur numeric(14,6) not null default 0`
- `trace_id text null`
- `metadata jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`

Checks:
- `units >= 0`
- `cost_eur >= 0`
- `capability_code in (...)`

Indices:
- `(org_id, created_at desc)`
- `(org_id, capability_code, created_at desc)`
- `(trace_id)` parcial cuando no null

### 3) `org_cost_alerts`
- `id uuid pk`
- `org_id uuid not null` fk `organizations(id)`
- `alert_type text not null` check in `('warning','hard_stop','recovered')`
- `month_key text not null` (YYYY-MM)
- `threshold_pct numeric(5,2) not null`
- `current_pct numeric(8,2) not null`
- `is_active boolean not null default true`
- `created_at timestamptz not null default now()`
- `resolved_at timestamptz null`

Unique sugerido:
- `(org_id, alert_type, month_key, is_active)` parcial para `is_active=true`

## Backfill v1
1. Crear policy por cada organizacion existente si no existe.
2. Presupuesto default inicial:
   - `monthly_budget_eur = 250.00`
   - thresholds por defecto.

## Rollback
- Drop de tablas nuevas en orden:
  1. `org_cost_alerts`
  2. `org_cost_usage_events`
  3. `org_cost_policies`

## Idempotencia
- `create table if not exists`
- `create index if not exists`
- `alter table ... add column if not exists` (si aplica ajustes)

## Verificacion post-migracion
1. Conteo policies = conteo orgs (al menos para orgs activas).
2. Insercion de evento de consumo valida.
3. Query agregada mensual por org valida.
4. Sin violaciones de check/fk.
