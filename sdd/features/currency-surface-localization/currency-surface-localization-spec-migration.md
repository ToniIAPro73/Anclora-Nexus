# SPEC MIGRATION: CURRENCY & SURFACE LOCALIZATION V1

**Feature ID**: ANCLORA-CSL-001  
**Version**: 1.0  
**Status**: Draft for implementation

## 1. DB changes

Target table: `properties`

1. Add columns:
- `useful_area_m2 numeric(12,2) null`
- `built_area_m2 numeric(12,2) null`
- `plot_area_m2 numeric(12,2) null`

2. Add constraints:
- non-negative check for each area.
- logical check `useful_area_m2 <= built_area_m2` when both are non-null.

3. Keep legacy compatibility:
- maintain `surface_m2` for backward compatibility in v1.
- backfill:
  - `built_area_m2 = coalesce(built_area_m2, surface_m2)`
  - `useful_area_m2 = coalesce(useful_area_m2, surface_m2)`

## 2. Migration files

1. `supabase/migrations/025_currency_surface_localization.sql`
2. `supabase/migrations/026_currency_surface_localization_rollback.sql`

## 3. Backfill strategy

1. Run in one transactional migration where possible.
2. Update only rows where new columns are null.
3. Log count of updated rows.

## 4. Rollback strategy

1. Drop new constraints.
2. Drop new columns.
3. Keep legacy `surface_m2` untouched.

## 5. Post-migration verification SQL

1. Column presence check.
2. Constraint validation query.
3. Null-distribution report.
4. Sample select for conversion readiness.

## 6. Risk notes

1. Existing APIs assuming single `surface_m2`.
2. Form-level validation mismatches before frontend rollout.
3. Data quality issues for properties without any valid area.
