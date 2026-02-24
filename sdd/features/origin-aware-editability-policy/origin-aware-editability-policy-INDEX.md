# Origin Aware Editability Policy v1 - INDEX

## Metadata
- Feature: `origin-aware-editability-policy`
- ID: `ANCLORA-OAEP-001`
- Version: `1.0`
- Status: `Implemented`
- Date: `2026-02-24`

## Objetivo
Definir y aplicar una política de editabilidad por origen para leads y propiedades, evitando sobrescrituras indebidas de datos capturados automáticamente.

## Artefactos
- Spec: `sdd/features/origin-aware-editability-policy/origin-aware-editability-policy-spec-v1.md`
- Migration: `sdd/features/origin-aware-editability-policy/origin-aware-editability-policy-spec-migration.md`
- Test Plan: `sdd/features/origin-aware-editability-policy/origin-aware-editability-policy-test-plan-v1.md`
- QA Report: `sdd/features/origin-aware-editability-policy/QA_REPORT_ANCLORA_OAEP_001.md`
- Gate Final: `sdd/features/origin-aware-editability-policy/GATE_FINAL_ANCLORA_OAEP_001.md`
- Rules: `.agent/rules/feature-origin-aware-editability-policy.md`
- Skill: `.agent/skills/features/origin-aware-editability-policy/SKILL.md`
- Prompts: `.antigravity/prompts/features/origin-aware-editability-policy/`

## Scope v1
- Contrato centralizado de campos bloqueados por origen.
- Aplicación en formulario de leads.
- Aplicación en formulario de propiedades.
- Enforcement server-side en actualización de leads y propiedades.
- Endpoints de contrato de policy (`/api/policy*`).
- Mensajería UX clara para campos protegidos.
- i18n completa `es/en/de/ru`.

## Out of scope v1
- Persistencia server-side de auditoría de intentos bloqueados.
