# Deal Margin Simulator v1 - INDEX

## Metadata
- Feature: deal-margin-simulator
- ID: ANCLORA-DMS-001
- Version: 1.0
- Status: Implemented (Released)
- Date: 2026-02-24

## Objective
Estimate expected margin and commission per opportunity before allocating team effort.

## Artifacts
- Spec: sdd/features/deal-margin-simulator/deal-margin-simulator-spec-v1.md
- Migration: sdd/features/deal-margin-simulator/deal-margin-simulator-spec-migration.md
- Test plan: sdd/features/deal-margin-simulator/deal-margin-simulator-test-plan-v1.md
- QA Report: sdd/features/deal-margin-simulator/QA_REPORT_ANCLORA_DMS_001.md
- Gate Final: sdd/features/deal-margin-simulator/GATE_FINAL_ANCLORA_DMS_001.md
- Rules: .agent/rules/feature-deal-margin-simulator.md
- Skill: .agent/skills/features/deal-margin-simulator/SKILL.md
- Prompts: .antigravity/prompts/features/deal-margin-simulator/

## Scope v1
- Scenario simulation with configurable assumptions, sensitivity view and recommendation bands.
- Org and role scope enforcement in all contracts.
- i18n coverage required (es/en/de/ru) for any new UI.
- Backend operativo: `/api/deal-margin/simulate` y `/api/deal-margin/compare`.
- Frontend operativo: `/deal-margin-simulator` + integración en sidebar.
- Agent A: migración DB no requerida en v1.
