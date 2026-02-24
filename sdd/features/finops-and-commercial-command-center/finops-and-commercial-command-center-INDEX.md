# FinOps and Commercial Command Center v1 - INDEX

## Metadata
- Feature: finops-and-commercial-command-center
- ID: ANCLORA-FCCC-001
- Version: 1.0
- Status: Implemented (Released)
- Date: 2026-02-24

## Objective
Provide an executive command center that combines cost, productivity and commercial conversion KPIs in one view.

## Artifacts
- Spec: sdd/features/finops-and-commercial-command-center/finops-and-commercial-command-center-spec-v1.md
- Migration: sdd/features/finops-and-commercial-command-center/finops-and-commercial-command-center-spec-migration.md
- Test plan: sdd/features/finops-and-commercial-command-center/finops-and-commercial-command-center-test-plan-v1.md
- QA Report: sdd/features/finops-and-commercial-command-center/QA_REPORT_ANCLORA_FCCC_001.md
- Gate Final: sdd/features/finops-and-commercial-command-center/GATE_FINAL_ANCLORA_FCCC_001.md
- Rules: .agent/rules/feature-finops-and-commercial-command-center.md
- Skill: .agent/skills/features/finops-and-commercial-command-center/SKILL.md
- Prompts: .antigravity/prompts/features/finops-and-commercial-command-center/

## Scope v1
- Unified KPI snapshot, trend panels, budget burn view and actionable drill-downs.
- Org and role scope enforcement in all contracts.
- i18n coverage required (es/en/de/ru) for any new UI.
- Backend operativo: `/api/command-center/snapshot` y `/api/command-center/trends`.
- Frontend operativo: `/command-center` con integración de sidebar e i18n.
- Agent A: migración DB no requerida en v1 (métricas agregadas en tiempo de lectura).
