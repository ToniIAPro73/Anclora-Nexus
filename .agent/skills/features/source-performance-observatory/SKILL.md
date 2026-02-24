name: source-performance-observatory
description: Implements Source Performance Observatory v1 following SDD governance, org-safe contracts and QA/Gate workflow.
---

# Skill - Source Performance Observatory v1

## Mandatory Reading
1) sdd/core/constitution-canonical.md
2) sdd/features/source-performance-observatory/source-performance-observatory-INDEX.md
3) sdd/features/source-performance-observatory/source-performance-observatory-spec-v1.md
4) .agent/rules/feature-source-performance-observatory.md

## Instructions
- Implement minimum viable contract first (DB/API/UI in sequence A-B-C).
- Keep rollouts reversible and migration-safe.
- Produce complete prompt set A/B/C/D and Gate Final.
- Document QA result and gate decision before release status.

## Stop Rules
- Do not introduce out-of-scope integrations.
- Do not bypass org/role scope validation.
- Do not mark release without QA and Gate evidence.
