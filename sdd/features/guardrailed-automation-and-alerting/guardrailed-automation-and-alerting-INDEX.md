# Guardrailed Automation and Alerting v1 - INDEX

## Metadata
- Feature: guardrailed-automation-and-alerting
- ID: ANCLORA-GAA-001
- Version: 1.0
- Status: Implemented (Released)
- Date: 2026-02-24

## Objective
Enable useful commercial alerts and safe automations with strict guardrails by org, channel, schedule and cost.

## Artifacts
- Spec: sdd/features/guardrailed-automation-and-alerting/guardrailed-automation-and-alerting-spec-v1.md
- Migration: sdd/features/guardrailed-automation-and-alerting/guardrailed-automation-and-alerting-spec-migration.md
- Test plan: sdd/features/guardrailed-automation-and-alerting/guardrailed-automation-and-alerting-test-plan-v1.md
- QA Report: sdd/features/guardrailed-automation-and-alerting/QA_REPORT_ANCLORA_GAA_001.md
- Gate Final: sdd/features/guardrailed-automation-and-alerting/GATE_FINAL_ANCLORA_GAA_001.md
- Rules: .agent/rules/feature-guardrailed-automation-and-alerting.md
- Skill: .agent/skills/features/guardrailed-automation-and-alerting/SKILL.md
- Prompts: .antigravity/prompts/features/guardrailed-automation-and-alerting/

## Scope v1
- Smart alert rules, event queue, and execution guardrails with auditable decisions.
- Org and role scope enforcement in all contracts.
- i18n coverage required (es/en/de/ru) for any new UI.
- Migration aplicada: supabase/migrations/035_guardrailed_automation_and_alerting.sql
- Backend operativo: /api/automation/* (rules, dry-run, execute, executions, alerts).
- Frontend operativo: /automation-alerting + navegación en sidebar.
