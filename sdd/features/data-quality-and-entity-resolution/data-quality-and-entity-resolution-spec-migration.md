# Spec Migration - Data Quality and Entity Resolution

Feature ID: `ANCLORA-DQER-001`

## Objetivo DB
Introducir almacenamiento de issues de calidad, candidatos de deduplicación y decisiones de resolución con trazabilidad completa por organización.

## Nuevas tablas

### 1) `dq_quality_issues`
- `id uuid pk`
- `org_id uuid not null` fk `organizations(id)`
- `entity_type text not null` check in `('lead','property')`
- `entity_id uuid not null`
- `issue_type text not null` check in `('missing_field','invalid_format','inconsistent_value','duplicate_candidate')`
- `severity text not null` check in `('low','medium','high','critical')`
- `issue_payload jsonb not null default '{}'::jsonb`
- `status text not null` check in `('open','in_review','resolved','ignored')`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indices:
- `(org_id, entity_type, status, created_at desc)`
- `(org_id, severity, status, created_at desc)`
- `(entity_type, entity_id)`

### 2) `dq_entity_candidates`
- `id uuid pk`
- `org_id uuid not null` fk `organizations(id)`
- `entity_type text not null` check in `('lead','property')`
- `left_entity_id uuid not null`
- `right_entity_id uuid not null`
- `similarity_score numeric(5,2) not null` check (`similarity_score >= 0 and similarity_score <= 100`)
- `signals jsonb not null default '{}'::jsonb`
- `status text not null` check in `('auto_link','suggested_merge','approved_merge','rejected_merge')`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Checks:
- `left_entity_id <> right_entity_id`

Unique:
- `(org_id, entity_type, left_entity_id, right_entity_id)`

Indices:
- `(org_id, entity_type, status, similarity_score desc)`

### 3) `dq_resolution_log`
- `id uuid pk`
- `org_id uuid not null` fk `organizations(id)`
- `entity_type text not null` check in `('lead','property')`
- `candidate_id uuid null` fk `dq_entity_candidates(id)`
- `action text not null` check in `('approve_merge','reject_merge','mark_duplicate','undo_merge')`
- `actor_user_id uuid null`
- `details jsonb not null default '{}'::jsonb`
- `created_at timestamptz not null default now()`

Indices:
- `(org_id, entity_type, created_at desc)`
- `(candidate_id)`

## Backfill v1
- No backfill destructivo.
- Inicializar detección por lote sobre registros recientes (ventana configurable), creando candidatos e issues.

## Rollback
Drop en orden:
1) `dq_resolution_log`
2) `dq_entity_candidates`
3) `dq_quality_issues`

## Verificación post-migración
1. Insert issue válido por org.
2. Insert candidate válido con score dentro de rango.
3. Insert resolution log asociado.
4. Confirmar aislamiento por org en queries base.
