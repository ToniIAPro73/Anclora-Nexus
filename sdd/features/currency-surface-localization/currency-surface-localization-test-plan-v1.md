# TEST PLAN: CURRENCY & SURFACE LOCALIZATION V1

**Feature ID**: ANCLORA-CSL-001  
**Version**: 1.0

## 1. DB tests

1. Migration applies cleanly on local and cloud.
2. Backfill populates `built_area_m2`/`useful_area_m2` from legacy rows.
3. Constraints reject negative and illogical area combinations.

## 2. Backend tests

1. Property create accepts surface trio.
2. Property update validates and persists surface trio.
3. Origin-based edit restrictions are enforced.

## 3. Frontend tests

1. Currency selector updates all property prices globally.
2. Format snapshots by currency:
- EUR / GBP / USD / DEM / RUB.
3. Unit conversion snapshots:
- `m2` and `sq ft`.
4. Property cards/forms render all area fields without overlap.

## 4. Regression tests

1. Existing property flows still work with legacy rows.
2. Prospection and matches screens do not regress.
3. No auth/multitenancy behavior changes.

## 5. Exit criteria

1. No P0/P1 defects.
2. All contract tests green.
3. SDD, changelog and features registry updated.
