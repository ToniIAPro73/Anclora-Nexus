---
trigger: always_on
---

# Feature Rules: Source Performance Observatory v1

## Normative Priority
1) sdd/core/constitution-canonical.md
2) .agent/rules/workspace-governance.md
3) .agent/rules/anclora-nexus.md
4) sdd/features/source-performance-observatory/source-performance-observatory-spec-v1.md

## Immutable Rules
- Strict scope by org_id and role on every operation.
- No irreversible automation without explicit human checkpoint.
- Explainability and auditability are mandatory outputs.
- Do not break compatibility with existing feature contracts.

## Implementation Rules
- Prefer additive schema changes and reversible rollout.
- Keep API contracts explicit and versioned.
- Enforce i18n discipline and avoid hardcoded UI strings.
