# SPEC - FinOps and Commercial Command Center v1.1

## 0. Meta
- Feature: finops-and-commercial-command-center
- ID: ANCLORA-FCCC-001
- Version: 1.1

## 1. Objective
Turn the command center into the executive consolidation layer for cost, conversion and operational health.

## 2. Scope
- Includes:
  - operational overview inside snapshot
  - active/critical alerts
  - degraded/stale source counts
  - territorial sync and territorial pipeline status
  - monthly alert trends
- Excludes:
  - new persistence
  - separate alert-delivery channels

## 3. Data Strategy
- Reuse read-time aggregation from FinOps, automation alerts, territorial control plane and source observatory.
- No migration required in v1.1.

## 4. Backend Changes
- Extend `/snapshot` with `operational_overview`.
- Extend `/trends` with `active_alerts` and `critical_alerts`.

## 5. Frontend Changes
- Surface operational blocks and top alerts in `/command-center`.
- Preserve cost visibility restrictions by role.

## 6. Acceptance
- Management sees active alerts, degraded sources and territorial health in one place.
- Existing command-center routes remain compatible and role-safe.
