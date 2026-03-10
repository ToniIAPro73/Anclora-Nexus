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
  - pipeline overview for seller-side acquisition
  - monthly throughput trends for seller signals, sellers created and supervised sends
- Excludes:
  - new persistence
  - separate alert-delivery channels

## 3. Data Strategy
- Reuse read-time aggregation from FinOps, automation alerts, territorial control plane and source observatory.
- No migration required in v1.1.

## 4. Backend Changes
- Extend `/snapshot` with `operational_overview`.
- Extend `/snapshot` with `pipeline_overview`.
- Extend `/trends` with `active_alerts`, `critical_alerts`, `seller_signals_processed`, `sellers_created` and `supervised_sends_confirmed`.

## 5. Frontend Changes
- Surface operational blocks and top alerts in `/command-center`.
- Surface seller-side throughput and conversion blocks in `/command-center`.
- Preserve cost visibility restrictions by role.

## 6. Acceptance
- Management sees active alerts, degraded sources and territorial health in one place.
- Management also sees seller pipeline throughput and confirmed outreach without opening technical consoles.
- Existing command-center routes remain compatible and role-safe.
