# SPEC - Deal Margin Simulator v1

## 0. Meta
- Feature: deal-margin-simulator
- ID: ANCLORA-DMS-001
- Version: 1.0
- Depends on:
  - sdd/core/constitution-canonical.md
  - sdd/core/product-spec-v0.md
  - sdd/core/spec.md

## 1. Objective
Estimate expected margin and commission per opportunity before allocating team effort.

## 2. Scope
- Includes:
  - Scenario simulation with configurable assumptions, sensitivity view and recommendation bands.
  - Mandatory org isolation and role-aware visibility.
  - Operational metrics for explainability and auditability.
- Excludes:
  - External scraping not explicitly authorized.
  - Irreversible automated actions without human checkpoint.
  - Changes to core architecture outside feature boundaries.

## 3. Data Changes
- Optional table for persisted simulation scenarios by org and user.
- Migration namespace: next available Supabase migration number.
- Backfill policy: additive and reversible.

## 4. Backend Changes
- Simulation endpoint with deterministic formula and explainable output drivers.
- Response contracts must include scope metadata and version.
- Error contract must be deterministic and machine-readable.

## 5. Frontend Changes
- Interactive simulator page with assumptions form and scenario comparison.
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
