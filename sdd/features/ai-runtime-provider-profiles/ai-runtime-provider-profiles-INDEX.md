# AI Runtime Provider Profiles v1 - INDEX

## Metadata
- Feature: ai-runtime-provider-profiles
- ID: ANCLORA-AIRP-001
- Version: 1.0
- Status: Implemented (Released)
- Date: 2026-03-08

## Objective
Replace the legacy OpenAI/Anthropic runtime dependency with Groq + Cloudflare provider profiles, task-level model routing and verifiable runtime contracts.

## Artifacts
- Spec: sdd/features/ai-runtime-provider-profiles/ai-runtime-provider-profiles-spec-v1.md
- Migration: sdd/features/ai-runtime-provider-profiles/ai-runtime-provider-profiles-spec-migration.md
- Test plan: sdd/features/ai-runtime-provider-profiles/ai-runtime-provider-profiles-test-plan-v1.md
- QA Report: sdd/features/ai-runtime-provider-profiles/QA_REPORT_ANCLORA_AIRP_001.md
- Gate Final: sdd/features/ai-runtime-provider-profiles/GATE_FINAL_ANCLORA_AIRP_001.md
- Rules: .agent/rules/feature-ai-runtime-provider-profiles.md
- Skill: .agent/skills/features/ai-runtime-provider-profiles/SKILL.md
- Prompts: .antigravity/prompts/features/ai-runtime-provider-profiles/

## Scope v1
- Runtime profile `groq-cloudflare` enabled by default.
- Task routing:
  - `analyze` -> Groq primary/fallback
  - `summarize` -> Groq fast/fallback
  - `generate_copy` -> Cloudflare primary/fallback
- New observable contract: `GET /api/intelligence/runtime-profile`
- Legacy env references removed from operational docs and `.env.example`.
- Database migration skipped in v1 (config/runtime feature only).
