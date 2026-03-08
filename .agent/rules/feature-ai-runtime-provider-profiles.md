---
trigger: always_on
---

# Feature Rules: AI Runtime Provider Profiles v1

## Normative Priority
1) sdd/core/constitution-canonical.md
2) .agent/rules/workspace-governance.md
3) .agent/rules/anclora-nexus.md
4) sdd/features/ai-runtime-provider-profiles/ai-runtime-provider-profiles-spec-v1.md

## Immutable Rules
- Provider credentials are server-side only.
- Audit integrity must not depend on provider credentials.
- Runtime summary must never expose secrets.
- Do not reintroduce hard dependency on OpenAI/Anthropic in v1 scope.

## Implementation Rules
- Keep runtime resolution additive and reversible.
- Normalize unsupported profiles to a supported safe default.
- Degrade deterministically when provider config is missing.
- Expose verifiable contracts for QA/operations.
