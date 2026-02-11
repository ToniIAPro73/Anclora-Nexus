---
trigger: always_on
---

```markdown
# OpenClaw — Workspace Rules

## Identidad del Proyecto
Este proyecto es OpenClaw, un Agentic Operating System (AOS) que orquesta agentes de IA autonomos con supervision humana obligatoria (HITL). Los documentos fuente son:
- `constitution.md` — Norma suprema. PREVALECE sobre todo en caso de conflicto.
- `spec.md` — Especificacion tecnica canonica. Define arquitectura, schema, stack y flujos.

## Reglas Inmutables

1. NUNCA generes codigo que ejecute transacciones monetarias sin pasar por el protocolo HITL definido en spec.md Seccion 10.
2. NUNCA generes codigo que permita UPDATE o DELETE sobre la tabla `audit_log`. Es inmutable por diseno constitucional.
3. NUNCA almacenes secrets, API keys o tokens en codigo fuente. Usa siempre variables de entorno (spec.md Seccion 29).
4. NUNCA generes codigo que comparta datos entre organizaciones. Todo dato esta aislado por `org_id` con RLS.
5. SIEMPRE genera tipado estricto: Python con mypy, TypeScript con strict:true y sin `any`.
6. SIEMPRE aplica Row-Level Security (RLS) a cada tabla nueva que crees. Usa `get_user_org_id()`.
7. SIEMPRE incluye audit logging en operaciones criticas usando HMAC-SHA256.
8. SIEMPRE consulta spec.md y constitution.md ANTES de tomar decisiones arquitectonicas.

## Stack Tecnologico (NO cambiar sin aprobacion)
- Frontend: Next.js 15 (App Router) + shadcn/ui + Tailwind CSS 3.x + Zustand 5.x
- Backend: Python 3.11+ con LangGraph 0.3+
- Database: Supabase PostgreSQL 15+ con pgvector 0.7+
- Auth: Supabase Auth con MFA (TOTP/WebAuthn)
- Payments: Stripe (idempotency obligatorio)
- LLM Serving: vLLM con Llama 3.3 70B (primary)
- MCP: Model Context Protocol v2025-11-25
- Containers: Docker 24+
- Workflows: n8n 1.x self-hosted
- Monitoring: Prometheus + Grafana

## Code Style
- Python: PEP 8, Black, isort, Ruff, mypy --strict
- TypeScript: ESLint + Prettier, strict mode, no `any`
- SQL: Queries SIEMPRE parametrizadas. JAMAS concatenacion de strings.
- Commits: conventional commits (feat:, fix:, chore:, docs:)
- Tests: pytest (Python), Jest (TypeScript), pgTAP (SQL)

## Estructura de Directorios
Respetar la estructura definida en spec.md Seccion 24.1. No crear carpetas fuera de esa estructura.

## Moneda y Locale
- Moneda base: EUR
- Timezone: UTC para backend, configurable para frontend
- Idioma UI: ES/EN (i18n preparado)
```

---