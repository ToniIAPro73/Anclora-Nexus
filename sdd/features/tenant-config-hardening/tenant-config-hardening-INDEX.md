# Tenant Config Hardening v1 - INDEX

## Metadata
- Feature: tenant-config-hardening
- ID: ANCLORA-TCH-001
- Version: 1.0
- Status: Implemented (Released)
- Date: 2026-03-11

## Objective
Eliminar `DEFAULT_ORG_ID` hardcoded en rutas críticas y encapsular el fallback legacy single-tenant en un único contrato explícito de configuración.

## Artifacts
- Spec: sdd/features/tenant-config-hardening/tenant-config-hardening-spec-v1.md
- Migration: sdd/features/tenant-config-hardening/tenant-config-hardening-spec-migration.md
- Test plan: sdd/features/tenant-config-hardening/tenant-config-hardening-test-plan-v1.md
- QA Report: sdd/features/tenant-config-hardening/QA_REPORT_ANCLORA_TCH_001.md
- Gate Final: sdd/features/tenant-config-hardening/GATE_FINAL_ANCLORA_TCH_001.md
- Rules: .agent/rules/feature-tenant-config-hardening.md
- Skill: .agent/skills/features/tenant-config-hardening/SKILL.md
- Prompts: .antigravity/prompts/features/tenant-config-hardening/

## Scope
- rutas `/sellers` e inteligencia territorial resuelven `org_id` vía dependencia
- skills legacy usan fallback centralizado `resolve_legacy_org_id`
- lecturas cross-tenant obvias en `prospection_weekly` quedan scopeadas por `org_id`
- sin migración nueva
