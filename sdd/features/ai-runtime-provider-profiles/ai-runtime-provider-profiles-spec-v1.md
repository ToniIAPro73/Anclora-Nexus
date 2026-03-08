# SPEC - AI Runtime Provider Profiles v1

## 0. Meta
- Feature: ai-runtime-provider-profiles
- ID: ANCLORA-AIRP-001
- Version: 1.0
- Depends on:
  - sdd/core/constitution-canonical.md
  - sdd/core/product-spec-v0.md
  - .agent/rules/workspace-governance.md

## 1. Objective
Adopt a provider-runtime contract based on Groq + Cloudflare so Anclora Nexus no longer depends operationally on `OPENAI_API_KEY` and `ANTHROPIC_API_KEY` for core skill execution.

## 2. Scope
- Includes:
  - Provider profile resolution from env.
  - Task-to-model routing for `summarize`, `analyze`, `generate_copy`.
  - Runtime introspection endpoint for QA and operations.
  - Dedicated internal audit secret decoupled from LLM credentials.
  - Documentation and governance alignment.
- Excludes:
  - UI for switching providers at runtime.
  - Embedding generation execution in v1.
  - Provider-specific tools beyond chat-completions compatible calls.

## 3. Functional Requirements
### RF-01 Runtime profile
- `AI_RUNTIME_PROFILE` must support:
  - `groq-cloudflare`
  - `cloudflare`
- Unsupported values must normalize to `groq-cloudflare`.

### RF-02 Task routing
- `analyze()` uses Groq primary and Groq fallback.
- `summarize()` uses Groq fast and Groq fallback.
- `generate_copy()` uses Cloudflare primary and Cloudflare fallback.

### RF-03 Observable contract
- `GET /api/intelligence/runtime-profile` returns:
  - feature id/version
  - active profile
  - task routes
  - missing env vars
  - audit secret configured flag
  - deprecated env presence map

### RF-04 Safe degradation
- Missing provider credentials must not crash app import.
- Runtime failures must degrade deterministically inside `LLMService`.

### RF-05 Audit secret separation
- Audit signatures must never reuse LLM provider credentials.
- `INTERNAL_AUDIT_SECRET` becomes the primary secret for HMAC integrity.

## 4. Backend Changes
- New module: `backend/services/ai_runtime.py`
- Rewrite: `backend/services/llm_service.py`
- Update: `backend/services/supabase_service.py`
- Update: `backend/api/routes/intelligence.py`
- Update: `backend/api/main.py`
- Update: `backend/config.py`

## 5. Frontend Changes
- None required in v1.
- Consumer systems can inspect runtime through `/api/intelligence/runtime-profile`.

## 6. Security
- Provider keys remain server-side only.
- `INTERNAL_AUDIT_SECRET` must be independent from provider keys.
- Runtime summary must expose readiness, not secrets.

## 7. Acceptance Criteria
- [x] `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` no longer required for active runtime flow.
- [x] `GET /api/intelligence/runtime-profile` operational.
- [x] `.env.example` documents Groq + Cloudflare runtime.
- [x] `LLMService` routes `analyze`, `summarize`, `generate_copy` by task.
- [x] Audit signing secret decoupled from provider credentials.
- [x] Rules, skill, prompts, QA and gate artifacts created.
- [x] FEATURES.md and CHANGELOG.md updated.
