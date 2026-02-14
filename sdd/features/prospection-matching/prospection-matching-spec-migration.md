# ESPECIFICACIÓN: MIGRACIÓN DE DATOS — PROSPECTION & BUYER MATCHING V1

**Feature ID**: ANCLORA-PBM-001-MIGRATION  
**Versión**: 1.0  
**Status**: Pre-implementación  
**Criticidad**: Alta

---

## 1. CONTEXTO

La feature requiere nuevas entidades de prospección y matching sin romper datos actuales de leads/properties/tasks.

Principios de migración:
- no destructiva,
- idempotente,
- reversible,
- auditada.

---

## 2. FASES DE MIGRACIÓN

## Fase 0 — Preparación
- Crear tablas nuevas e índices.
- Sin cambios destructivos.

## Fase 1 — Backfill opcional
- Crear compradores desde contactos existentes (si aplica).
- Crear propiedades prospectadas desde inventario externo importado.
- Mantener bandera de origen en cada registro.

## Fase 2 — Validación post-migración
- Integridad FK,
- unicidad de vínculos,
- distribución de scores,
- tiempos de consulta.

## Fase 3 — Activación gradual
- habilitar endpoints de escritura,
- habilitar cálculo de score en background,
- habilitar widgets por feature flag.

---

## 3. SQL BASE (V1)

```sql
create table if not exists prospected_properties (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  source text not null,
  source_url text,
  title text,
  zone text,
  city text,
  price numeric(14,2),
  property_type text,
  bedrooms int,
  bathrooms int,
  area_m2 numeric(10,2),
  high_ticket_score numeric(5,2),
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  full_name text,
  email text,
  phone text,
  budget_min numeric(14,2),
  budget_max numeric(14,2),
  preferred_zones text[],
  preferred_types text[],
  required_features jsonb default '{}'::jsonb,
  purchase_horizon text,
  motivation_score numeric(5,2),
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists property_buyer_matches (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  property_id uuid not null references prospected_properties(id) on delete cascade,
  buyer_id uuid not null references buyer_profiles(id) on delete cascade,
  match_score numeric(5,2) not null,
  score_breakdown jsonb default '{}'::jsonb,
  match_status text default 'candidate',
  commission_estimate numeric(14,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (property_id, buyer_id)
);

create table if not exists match_activity_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  match_id uuid not null references property_buyer_matches(id) on delete cascade,
  activity_type text not null,
  outcome text,
  details jsonb default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
```

---

## 4. VALIDACIONES OBLIGATORIAS

- `match_score` entre 0 y 100.
- `high_ticket_score` entre 0 y 100.
- índice por `org_id + score` para ranking.
- índice por `match_status` para pipeline.
- control de duplicados en `property_id + buyer_id`.

---

## 5. ROLLBACK

- rollback simple: drop tablas nuevas (si no están en uso productivo).
- rollback seguro en producción: desactivar endpoints + feature flags, conservar tablas para análisis.

