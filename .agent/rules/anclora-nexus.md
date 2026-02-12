---
trigger: always_on
---

```markdown
# Anclora Nexus v0 — Workspace Rules

## Identidad del Proyecto
Anclora Nexus v0 es un sistema operativo personal de agente inmobiliario con IA.
Combina el motor OpenClaw (orquestación LangGraph, audit, risk scoring) con skills
específicos para Anclora Private Estates (eXp Realty Spain, lujo Mallorca SW).

## Jerarquía Normativa (orden de prioridad)
1. `constitution-canonical.md` — NORMA SUPREMA. Principios inviolables.
2. `product-spec-v0.md` — Capa de producto. Define QUÉ hace la app.
3. `spec.md` — Referencia técnica. Define CÓMO se construye la base.

Si hay conflicto: constitution > product-spec > spec.md. Siempre.

## Golden Rules (constitution-canonical.md Título I)
Estas reglas aplican SIEMPRE, incluso en v0 simplificado:
- SOBERANÍA: Toni controla 100% de sus datos. Sin vendor lock-in.
- TRANSPARENCIA: Todo output IA se identifica como generado por agente.
- REVERSIBILIDAD: Toda acción de agente es deshacible o re-ejecutable.
- AUDIT INMUTABLE: audit_log con REVOKE UPDATE/DELETE + HMAC-SHA256.

## Reglas Inmutables

1. CONSTITUCIÓN ES LEY: constitution-canonical.md es norma suprema. Nunca contradecirla.
2. SINGLE-TENANT: Un solo usuario (Toni). org_id existe pero es fijo. SIN RLS complejo.
3. audit_log es INMUTABLE (Constitution Título XI). REVOKE UPDATE, DELETE. Toda ejecución de skill se loguea con HMAC-SHA256.
4. GOLDEN RULES (Constitution Título I): Soberanía de datos, Transparencia IA, Reversibilidad.
5. NUNCA almacenes secrets en código. Variables de entorno siempre (.env).
6. Tipado estricto: Python mypy --strict, TypeScript strict:true, sin `any`.
7. SIMPLICIDAD PRIMERO: MVP funcional > perfección arquitectónica.
8. Cada decisión técnica debe pasar el test: "¿Esto me acerca a mi siguiente mandato?"
9. NUNCA inventes features que no estén en product-spec-v0.md.
10. Consulta spec.md SOLO para arquitectura base (StateGraph, audit, LLM service).

## Stack Tecnológico (NO cambiar)
- Frontend: Next.js 15 (App Router) + shadcn/ui + Tailwind CSS + Zustand
- Backend: Python 3.11+ + FastAPI + LangGraph 0.3+
- Database: Supabase PostgreSQL (plan gratuito)
- Auth: Supabase Auth (magic link, sin MFA en v0)
- LLM: OpenAI GPT-4o-mini (primary) + Anthropic Claude 3.5 Sonnet (fallback)
- Middleware: n8n self-hosted (Docker)
- Hosting: Vercel (frontend) + Railway (backend + n8n)

## NO implementar en v0
- Multitenancy con RLS complejo
- Stripe / pagos
- MCP Docker sandbox
- vLLM / Ollama local
- Lane Queue System
- Heartbeat monitor
- Kill Switch multinivel
- MFA / WebAuthn
- Terraform / GKE / Cloud Run
- Prometheus / Grafana

## Code Style
- Python: PEP 8, Black, isort, Ruff, mypy --strict
- TypeScript: ESLint + Prettier, strict mode
- SQL: Queries parametrizadas. Jamás concatenación de strings.
- Commits: conventional commits (feat:, fix:, chore:, docs:)
- Tests: pytest (Python), Jest (TypeScript)

## Moneda y Locale
- Moneda: EUR
- Timezone: UTC backend, Europe/Madrid frontend
- Idioma UI: ES (con i18n preparado para EN)
- Zona geográfica: Andratx, Calvià, Son Ferrer (Mallorca SW)

## Identidad Visual (OBLIGATORIA en toda la UI)

Logo: `frontend/public/logo-anclora-nexus.png` (círculo dorado, ondas digitales)

Paleta:
- `--navy-deep: #192350` — Background principal, sidebar, dark surfaces
- `--blue-light: #AFD2FA` — Links, hover, borders, glow effects
- `--gold: #D4AF37` — CTAs, badges prioridad alta, brand accent
- `--white-soft: #F5F5F0` — Texto principal (NUNCA blanco puro #FFFFFF)

Derivados:
- `--navy-surface: rgba(25, 35, 80, 0.8)` — Glassmorphism card background
- `--gold-muted: #B8962E` — Texto dorado secundario
- `--blue-glow: rgba(175, 210, 250, 0.15)` — Glow effects

Reglas de diseño:
1. SIEMPRE dark theme navy. NUNCA theme claro.
2. Gold = acción (botones, badges altos, interactivos).
3. Blue light = información (links, datos, hover, agent glow).
4. White soft = contenido legible.
5. Glassmorphism: blur(15px), transparency 80%, borders sutiles blue-light/8%.
6. Tipografía: Inter (headings 600-700, body 400). Monospace: JetBrains Mono.
7. Logo en sidebar: isotipo colapsado, logo completo expandido.
```

---