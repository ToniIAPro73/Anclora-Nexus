# SPEC - Guardrailed Automation and Alerting v1.1

## 0. Meta
- Feature: guardrailed-automation-and-alerting
- ID: ANCLORA-GAA-001
- Version: 1.1

## 1. Objective
Make important operational failures visible and actionable instead of leaving them silent.

## 2. Scope
- Includes:
  - operational alerts for territorial sync degradation
  - operational alerts for missing/failed/stale territorial pipeline
  - operational alerts for degraded source connectors
  - deduplicated alert persistence with severity, scope and metadata
- Excludes:
  - outbound email/WhatsApp notification delivery
  - synthetic cron heartbeats that do not exist in the platform

## 3. Data Changes
- Extend `automation_alerts` to support operational alerts without forced `rule_id`.
- Add `alert_scope`, `severity`, `dedupe_key`, `metadata_json`, `updated_at`.

## 4. Backend Changes
- Reconcile operational alerts before serving `/api/automation/alerts`.
- Preserve existing rule/execute behavior.
- Keep org-safe and role-safe visibility.

## 5. Frontend Changes
- `/automation-alerting` must distinguish rule alerts from operational alerts.
- UI must show severity and basic actionable metadata.

## 6. Acceptance
- A degraded sync/pipeline/source produces a visible alert.
- Duplicate operational alerts are not spammed on each refresh.
- Resolved conditions deactivate their previous operational alerts.
