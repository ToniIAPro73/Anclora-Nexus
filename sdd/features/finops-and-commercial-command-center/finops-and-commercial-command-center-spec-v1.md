# SPEC - FinOps and Commercial Command Center v1

## 0. Meta
- Feature: finops-and-commercial-command-center
- ID: ANCLORA-FCCC-001
- Version: 1.0
- Depends on:
  - sdd/core/constitution-canonical.md
  - sdd/core/product-spec-v0.md
  - sdd/core/spec.md

## 1. Objective
Provide an executive command center that combines cost, productivity and commercial conversion KPIs in one view.

## 2. Scope
- Includes:
  - Unified KPI snapshot, trend panels, budget burn view and actionable drill-downs.
  - Mandatory org isolation and role-aware visibility.
  - Operational metrics for explainability and auditability.
- Excludes:
  - External scraping not explicitly authorized.
  - Irreversible automated actions without human checkpoint.
  - Changes to core architecture outside feature boundaries.

## 3. Data Changes
- Materialized KPI views or summary tables by org and period; optional indexes for dashboard latency.
- Migration namespace: next available Supabase migration number.
- Backfill policy: additive and reversible.

## 4. Backend Changes
- Read-only endpoints for KPI aggregates, trends and operational slices.
- Response contracts must include scope metadata and version.
- Error contract must be deterministic and machine-readable.

## 5. Frontend Changes
- Executive dashboard page with KPI cards, trend charts and conversion breakdowns.
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
