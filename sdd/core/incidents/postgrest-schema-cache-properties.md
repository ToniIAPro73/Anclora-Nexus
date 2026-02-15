# Incident: PostgREST schema cache inconsistency on `properties`

## Metadata
- **Status**: Open
- **Severity**: Medium
- **Affects environment**: `pyjuyaityvcrzfaetrdi`
- **Blocks release**: No
- **Related feature**: `ANCLORA-CSL-001`
- **Reported on**: 2026-02-15
- **Owner**: Platform/Backend

## Summary
During QA for `ANCLORA-CSL-001`, integration checks against `properties` failed only in the test environment `pyjuyaityvcrzfaetrdi` with a PostgREST schema-cache error.

## Observed Error
`PGRST204: Could not find 'properties' in schema cache`

## Expected Behavior
`properties` table should be visible and accessible via PostgREST after migrations and permission grants.

## Actual Behavior
1. Direct table access through PostgREST fails for `properties`.
2. A temporary debug view (`debug_properties_view`) is accessible.
3. Underlying data and permissions appear correct, but table visibility in schema cache is inconsistent.

## Evidence
1. QA report for `ANCLORA-CSL-001` (2026-02-15).
2. Unit tests passed for CSL model/service logic.
3. Backend fix confirmed in code review (`prospected_properties` -> `properties` in prospection service path).
4. Integration-only failure isolated to this environment.

## Impact
- Blocks integration validation on this test instance.
- Does **not** block release because:
  - DB migration/constraints validated.
  - Backend logic validated.
  - UI behavior validated.
  - Staging manual validation is required and sufficient for release decision.

## Hypotheses
1. PostgREST schema cache not refreshed correctly after DDL.
2. Exposed schema configuration mismatch in this environment.
3. Instance-specific PostgREST state inconsistency.

## Remediation Plan
1. Force PostgREST reload/restart in affected environment.
2. Validate exposed schemas include `public`.
3. Re-validate grants for API roles on `public.properties`.
4. Run smoke tests:
   - `select` on `properties`
   - minimal `insert`
   - minimal `update`
5. Document final root cause and prevention notes.

## Exit Criteria
1. `properties` is visible and queryable via PostgREST in `pyjuyaityvcrzfaetrdi`.
2. CRUD smoke tests pass.
3. No regression in related endpoints.

## Resolution Section (fill on close)
- **Status**: Resolved / Closed
- **Resolved on**:
- **Root cause**:
- **Fix applied**:
- **Validation evidence**:
