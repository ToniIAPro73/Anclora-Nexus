# SPEC - Source Performance Observatory v1.1

## 0. Meta
- Feature: source-performance-observatory
- ID: ANCLORA-SPO-001
- Version: 1.1

## 1. Objective
Convert the observatory from a basic scorecard into an operational control surface for acquisition sources.

## 2. Scope
- Includes:
  - freshness by source
  - operational degradation (`healthy`, `warning`, `critical`)
  - created entities and failure counts
  - coverage by entity (`lead`, `property`, `seller`)
  - summary block for management visibility
- Excludes:
  - new autonomous automation
  - external integrations outside existing ingestion perimeter

## 3. Data Strategy
- Reuse live read aggregation from `ingestion_events`, `leads`, `properties` and `nexus_sellers`.
- Support both unified-ingestion statuses and legacy fallback statuses.
- No migration required in v1.1.

## 4. Backend Changes
- Extend `/overview` with summary and richer scorecards.
- Extend `/ranking` with freshness and degradation context.
- Extend `/trends` with processed vs failed vs created counts.

## 5. Frontend Changes
- Observatory page must surface healthy/degraded/stale counts.
- Scorecards must expose status, coverage and freshness.
- Trend block must show processed/failures/created entities.

## 6. Acceptance
- Management can identify producing vs degraded sources without SQL.
- The contract remains org-safe and role-safe.
- Build no longer emits the Next middleware deprecation warning.
