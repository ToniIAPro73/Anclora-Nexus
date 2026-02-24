# SPEC - Source Performance Observatory v1

## 0. Meta
- Feature: source-performance-observatory
- ID: ANCLORA-SPO-001
- Version: 1.0
- Depends on:
  - sdd/core/constitution-canonical.md
  - sdd/core/product-spec-v0.md
  - sdd/core/spec.md

## 1. Objective
Measure source and channel performance quality to optimize acquisition mix and reduce CAC.

## 2. Scope
- Includes:
  - Comparative source scorecards, quality metrics and periodic ranking of channels.
  - Mandatory org isolation and role-aware visibility.
  - Operational metrics for explainability and auditability.
- Excludes:
  - External scraping not explicitly authorized.
  - Irreversible automated actions without human checkpoint.
  - Changes to core architecture outside feature boundaries.

## 3. Data Changes
- Tables/views for source metrics snapshots, attribution counters and trend history.
- Migration namespace: next available Supabase migration number.
- Backfill policy: additive and reversible.

## 4. Backend Changes
- Endpoints for source scorecards, ranking and period-over-period deltas.
- Response contracts must include scope metadata and version.
- Error contract must be deterministic and machine-readable.

## 5. Frontend Changes
- Observatory page with source leaderboard, filters and trend visuals.
- Required states: loading, empty, error, success.
- UX minimum: clear actionability and role-safe visibility.

## 6. Security
- Enforce org_id and role scope in all read/write operations.
- Respect constitutional limits for privacy, compliance and reversibility.
- Audit trail mandatory for decisions and automated operations.

## 7. Acceptance Criteria
- [x] Spec, migration and test-plan approved.
- [x] Rules and skill aligned with spec.
- [x] Prompts A/B/C/D and Gate Final created.
- [x] QA report generated with no open P0/P1 blockers.
- [x] Gate Final checklist evaluated and documented.
- [x] sdd/features/FEATURES.md and sdd/core/CHANGELOG.md updated.
