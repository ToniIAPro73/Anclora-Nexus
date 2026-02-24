# Source Performance Observatory v1 - INDEX

## Metadata
- Feature: source-performance-observatory
- ID: ANCLORA-SPO-001
- Version: 1.0
- Status: Implemented (Released)
- Date: 2026-02-24

## Objective
Measure source and channel performance quality to optimize acquisition mix and reduce CAC.

## Artifacts
- Spec: sdd/features/source-performance-observatory/source-performance-observatory-spec-v1.md
- Migration: sdd/features/source-performance-observatory/source-performance-observatory-spec-migration.md
- Test plan: sdd/features/source-performance-observatory/source-performance-observatory-test-plan-v1.md
- QA Report: sdd/features/source-performance-observatory/QA_REPORT_ANCLORA_SPO_001.md
- Gate Final: sdd/features/source-performance-observatory/GATE_FINAL_ANCLORA_SPO_001.md
- Rules: .agent/rules/feature-source-performance-observatory.md
- Skill: .agent/skills/features/source-performance-observatory/SKILL.md
- Prompts: .antigravity/prompts/features/source-performance-observatory/

## Scope v1
- Comparative source scorecards, quality metrics and periodic ranking of channels.
- Org and role scope enforcement in all contracts.
- i18n coverage required (es/en/de/ru) for any new UI.
- Backend operativo: `/api/source-observatory/overview`, `/ranking`, `/trends`.
- Frontend operativo: `/source-observatory` + integración en sidebar.
- Agent A: migración DB no requerida en v1.
