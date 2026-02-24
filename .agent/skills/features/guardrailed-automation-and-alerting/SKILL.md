name: guardrailed-automation-and-alerting
description: Implements Guardrailed Automation and Alerting v1 following SDD governance, org-safe contracts and QA/Gate workflow.
---

# Skill - Guardrailed Automation and Alerting v1

## Mandatory Reading
1) sdd/core/constitution-canonical.md
2) sdd/features/guardrailed-automation-and-alerting/guardrailed-automation-and-alerting-INDEX.md
3) sdd/features/guardrailed-automation-and-alerting/guardrailed-automation-and-alerting-spec-v1.md
4) .agent/rules/feature-guardrailed-automation-and-alerting.md

## Instructions
- Implement minimum viable contract first (DB/API/UI in sequence A-B-C).
- Keep rollouts reversible and migration-safe.
- Produce complete prompt set A/B/C/D and Gate Final.
- Document QA result and gate decision before release status.

## Stop Rules
- Do not introduce out-of-scope integrations.
- Do not bypass org/role scope validation.
- Do not mark release without QA and Gate evidence.
