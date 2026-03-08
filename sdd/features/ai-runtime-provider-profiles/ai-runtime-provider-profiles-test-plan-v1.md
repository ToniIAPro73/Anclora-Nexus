# Test Plan - AI Runtime Provider Profiles v1

## Objective
Validate provider routing, degradation behavior, introspection contract and documentation alignment.

## Test Layers
- Unit:
  - runtime summary resolution
  - route readiness / missing env handling
  - deterministic fallback behavior
- Integration:
  - `GET /api/intelligence/runtime-profile`
  - app import without OpenAI/Anthropic credentials
- Contract:
  - `.env.example` contains Groq + Cloudflare runtime variables
  - audit secret no longer depends on provider keys

## Mandatory Scenarios
1. Default profile resolves to `groq-cloudflare`.
2. `analyze` maps to Groq primary/fallback.
3. `generate_copy` maps to Cloudflare primary/fallback.
4. Runtime summary exposes missing env vars without leaking secrets.
5. Audit secret uses dedicated internal secret.
6. No open P0/P1 regressions in intelligence route contracts.

## Exit Criteria
- 0 open P0/P1 defects.
- Runtime profile endpoint returns 200.
- Focused backend tests pass.
