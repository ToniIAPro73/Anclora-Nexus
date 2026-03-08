---
name: ai-runtime-provider-profiles
description: Implements the Groq + Cloudflare runtime profile for Nexus, including task routing, runtime observability and governance artifacts.
---

# Skill - AI Runtime Provider Profiles v1

## Mandatory Reading
1) sdd/core/constitution-canonical.md
2) sdd/features/ai-runtime-provider-profiles/ai-runtime-provider-profiles-INDEX.md
3) sdd/features/ai-runtime-provider-profiles/ai-runtime-provider-profiles-spec-v1.md
4) .agent/rules/feature-ai-runtime-provider-profiles.md

## Instructions
- Implement provider routing as infrastructure, not as prompt-level branching.
- Preserve the existing `LLMService` public methods.
- Prefer explicit runtime contracts over hidden env assumptions.
- Decouple audit integrity from provider secrets.
- Complete prompt set, QA and gate artifacts before marking release.

## Stop Rules
- Do not leak provider secrets via API or logs.
- Do not introduce UI scope in v1 without explicit spec change.
- Do not mark migration required when no DB change exists.
