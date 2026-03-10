# Release Gate Operational QA v1 - INDEX

## Metadata
- Feature: release-gate-operational-qa
- ID: ANCLORA-RGQ-001
- Version: 1.0
- Status: Implemented (Released)
- Date: 2026-03-11

## Objective
Convertir el smoke puntual del RC en un gate recurrente con runner automatizado, acta y criterio de decisión reutilizable.

## Artifacts
- Spec: sdd/features/release-gate-operational-qa/release-gate-operational-qa-spec-v1.md
- Migration: sdd/features/release-gate-operational-qa/release-gate-operational-qa-spec-migration.md
- Test plan: sdd/features/release-gate-operational-qa/release-gate-operational-qa-test-plan-v1.md
- QA Report: sdd/features/release-gate-operational-qa/QA_REPORT_ANCLORA_RGQ_001.md
- Gate Final: sdd/features/release-gate-operational-qa/GATE_FINAL_ANCLORA_RGQ_001.md
- Rules: .agent/rules/feature-release-gate-operational-qa.md
- Skill: .agent/skills/features/release-gate-operational-qa/SKILL.md
- Prompts: .antigravity/prompts/features/release-gate-operational-qa/

## Scope
- runner `npm run ops:release-gate`
- artefacto `ops/release-gate-latest.json`
- acta genérica de decisión
- sin migración ni UI nueva
