# Agent B - Backend Prompt (ANCLORA-AIRP-001)

Objective:
- Implement runtime resolver, task routing and introspection endpoint.
- Preserve `LLMService.summarize`, `analyze`, `generate_copy`.

Minimum contract:
- `GET /api/intelligence/runtime-profile`
- `AI_RUNTIME_PROFILE=groq-cloudflare`
- task routing:
  - analyze -> Groq
  - summarize -> Groq fast
  - generate_copy -> Cloudflare
