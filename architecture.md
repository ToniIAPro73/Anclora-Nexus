# Arquitectura de Anclora Nexus

Sistema Operativo de Inteligencia Territorial para Toni Amengual (Anclora Private Estates / eXp Realty Spain).

---

## 1. Stack Tecnológico

### Frontend
- **Next.js 16.1.6** (App Router) + React 19.2.3
- **Tailwind CSS 4** + Radix UI + shadcn/ui
- **Zustand 5.0.11** (state management)
- **Framer Motion 12** (animaciones)
- **Supabase Auth Helpers** (`@supabase/auth-helpers-nextjs`)
- Testing: Vitest 4 + Testing Library

### Backend
- **Python 3.11+** + FastAPI + Uvicorn
- **LangGraph 0.3+** (orquestación de agentes)
- **LangChain** + OpenAI + Anthropic (LLM providers)
- **Supabase SDK** + SQLAlchemy + Pydantic

### Database
- **Supabase PostgreSQL** (auth + realtime + storage)
- RLS (Row Level Security) por `org_id`
- 35 migraciones aplicadas (`supabase/migrations/001` → `035`)

### LLM
- Primario: **OpenAI GPT-4o-mini** (resúmenes rápidos)
- Fallback: **Anthropic Claude Sonnet** (copy, insights cualitativos)

### Infraestructura
- Frontend: Vercel | Backend: Railway | Middleware: n8n (Docker)

---

## 2. Arquitectura de Capas

```
┌──────────────────────────────────┐
│  Frontend (Next.js 16 / React 19)│
│  App Router · Tailwind · Zustand │
└──────────────┬───────────────────┘
               │ HTTP REST / WebSocket
┌──────────────▼───────────────────┐
│  FastAPI (backend/api/main.py)   │
│  12 Routers · CORS · Deps        │
└──┬───────┬──────────┬────────────┘
   │       │          │
   ▼       ▼          ▼
Models  Services  LangGraph
Pydantic Supabase  StateGraph
         SDK       (7 nodos)
   │       │          │
   └───────┴──────────┘
               │
┌──────────────▼───────────────────┐
│  Supabase PostgreSQL             │
│  Auth · Realtime · Storage · RLS │
└──────────────────────────────────┘
```

---

## 3. Flujo de Ejecución LangGraph

**Entry point:** `backend/agents/graph.py` → `create_graph()`

```
START
  ▼
process_input   ← Parsea {input_data, skill_name, org_id, user_id}
  ▼
planner         ← Selecciona skill de .agent/skills/
  ▼
limit_check     ← Verifica constitutional_limits (tokens/día, leads/día)
  │
  ├─ [blocked] → finalize → END
  │
  ▼ [ok]
executor        ← Ejecuta skill Python
  ▼
result_handler  ← Procesa resultado, guarda en DB
  ▼
audit_logger    ← Escribe audit_log con HMAC-SHA256 (INMUTABLE)
  ▼
finalize        ← Retorna {final_result, status, agent_log_id}
  ▼
END
```

**Estado compartido** (`backend/agents/state.py`):
```python
class AgentState(TypedDict):
    input_data: dict        # Input del skill
    skill_name: str         # Skill a ejecutar
    org_id: str             # Tenant (single en v0)
    user_id: str
    plan: Optional[str]
    limits_ok: bool
    skill_output: Optional[dict]
    audit_logged: bool
    final_result: Optional[dict]
    status: str
```

---

## 4. API FastAPI — Routers Registrados

| Prefix | Router | Feature |
|--------|--------|---------|
| `/api` | `api_router` | Core |
| `/api` | `memberships_router` | Roles y membresías |
| `/api/prospection` | `prospection_router` | Matching buyer-property |
| `/api/finops` | `finops_router` | Budget y alertas |
| `/api` | `ingestion_router` | Ingesta unificada leads/propiedades |
| `/api/dq` | `dq_router` | Data quality & entity resolution |
| `/api/feeds` | `feeds_router` | Multichannel feed orchestrator |
| `/api` | `editability_router` | Origin-aware editability |
| `/api/automation` | `automation_router` | Reglas y ejecución automática |
| `/api/command-center` | `command_center_router` | Dashboard KPIs |
| `/api/deal-margin` | `deal_margin_router` | Simulador de márgenes |
| `/api/source-observatory` | `source_observatory_router` | Performance de fuentes |

**Health check:** `GET /health`

---

## 5. Features por Dominio

Definidos en `.agent/rules/`:

| Feature ID | Nombre | Archivo |
|------------|--------|---------|
| Core | Reglas maestras del workspace | `anclora-nexus.md` |
| Core | Gobernanza de workspace | `workspace-governance.md` |
| ANCLORA-LIR-001 | Lead Ingestion & Routing | `feature-lead-ingestion-and-routing.md` |
| ANCLORA-PBM-001 | Prospection & Buyer Matching | `feature-prospection-matching.md` |
| — | Prospection Unified Workspace | `feature-prospection-unified-workspace.md` |
| ANCLORA-LSO-002 | Lead Source Observability | `feature-lead-source-observability.md` |
| ANCLORA-SPO-009 | Source Performance Observatory | `feature-source-performance-observatory.md` |
| ANCLORA-MCF-004 | Multichannel Feed Orchestrator | `feature-multichannel-feed-orchestrator.md` |
| ANCLORA-OEP-005 | Origin-Aware Editability Policy | `feature-origin-aware-editability-policy.md` |
| — | Property Surface Breakdown | `feature-property-surface-breakdown.md` |
| ANCLORA-FCC-007 | FinOps & Command Center | `feature-finops-and-commercial-command-center.md` |
| ANCLORA-CSL-011 | Currency Surface Localization | `feature-currency-surface-localization.md` |
| ANCLORA-DMS-008 | Deal Margin Simulator | `feature-deal-margin-simulator.md` |
| — | Cost Governance Foundation | `feature-cost-governance-foundation.md` |
| ANCLORA-STI-010 | Strategic Intelligence | `feature-intelligence.md` |
| — | Explainable Opportunity Ranking | `feature-explainable-opportunity-ranking.md` |
| ANCLORA-GAA-006 | Guardrailed Automation & Alerting | `feature-guardrailed-automation-and-alerting.md` |
| — | Role-Scoped Workspace Visibility | `feature-role-scoped-workspace-visibility.md` |

---

## 6. Skills Disponibles

Definidos en `.agent/skills/`:

| Skill | Propósito |
|-------|-----------|
| `features` | Gestión de features y conocimiento de producto |
| `frontend-dashboard` | Componentes UI, Next.js, animaciones |
| `langgraph-core` | Orquestación LangGraph, nodos, audit |
| `lead-intake` | Parsing, cualificación y routeo de leads |
| `prospection` | Matching buyers-properties, scoring |
| `supabase-anclora` | Queries tipadas con RLS enforcement |

**Skills Anclora v0 en producción:**

| Skill | Trigger | Output |
|-------|---------|--------|
| `lead_intake` | Webhook formulario web | Resumen IA + prioridad 1-5 + copy email/WA |
| `prospection_weekly` | Cron domingos 18h | Dossier propiedades priorizadas + CMA |
| `recap_weekly` | Cron domingos 20h | Métricas semana + gaps + top 3 acciones |
| `dossier_generator` | Manual dashboard | PDF profesional (diferido Q2 2026) |

---

## 7. Esquema de Base de Datos

### Tablas Core

| Tabla | Descripción |
|-------|-------------|
| `organizations` | Single-tenant (Anclora Private Estates) |
| `user_profiles` | Perfil de Toni + rol owner |
| `agents` | Registro de agentes IA |
| `tasks` | Tareas manuales y generadas por agentes |
| `audit_log` | **INMUTABLE** — REVOKE UPDATE/DELETE + HMAC-SHA256 |
| `agent_logs` | Trazabilidad de ejecuciones IA |
| `constitutional_limits` | `max_daily_leads` (50), `max_llm_tokens_per_day` (100k) |

### Tablas Anclora

| Tabla | Descripción |
|-------|-------------|
| `leads` | Contactos con campos IA (resumen, prioridad, copy) |
| `properties` | Propiedades con valoración IA y scoring |
| `buyers` | Compradores con criterios en JSONB |
| `matches` | Relación buyer ↔ property con score |
| `weekly_recaps` | Histórico de recaps semanales |

### Historial de Migraciones (35 migraciones)

`001` Extensions → `002` Core schema → `003` Audit+limits → `004` Anclora schema → `005` Seed → `006` Realtime → `007` Storage → `008-016` Memberships/Auth → `017-019` Prospection matching → `020-025` Property/Currency/Localization → `027` Cost governance → `029` Unified ingestion → `032` Data quality → `033` Role-scoped visibility → `034` Feed orchestrator → `035` Automation

---

## 8. Agentes LangGraph

**Ubicación:** `backend/agents/`

| Archivo | Rol |
|---------|-----|
| `graph.py` | `create_graph()` → StateGraph compilado |
| `state.py` | `AgentState` TypedDict compartido |
| `nodes/all_nodes.py` | 7 nodos implementados |

---

## 9. Variables de Entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PUBLIC_CTA_ORG_ID=  # org UUID de Anclora Private Estates

# AI Runtime
AI_RUNTIME_PROFILE=groq-cloudflare
GROQ_API_KEY=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
INTERNAL_AUDIT_SECRET=
```

> IMPORTANTE: `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, `CLOUDFLARE_API_TOKEN` e `INTERNAL_AUDIT_SECRET` son **solo server-side**. Nunca en cliente.

---

## 10. Dashboard (Frontend)

**6 widgets en Bento Grid** (`frontend/src/`):

| Widget | Datos | Actualización |
|--------|-------|---------------|
| LeadsPulse | Leads recientes + prioridad | Supabase Realtime |
| TasksToday | Tareas pendientes hoy | Supabase Realtime |
| PropertyPipeline | Kanban prospect→listed→sold | REST 60s |
| QuickStats | Leads/semana, tasa respuesta, mandatos | REST 5min |
| AgentStream | Últimas ejecuciones IA | Supabase Realtime |
| QuickActions | "Nuevo Lead", "Run Prospection", "Force Recap" | Acciones directas |

**Design System:** Navy Deep `#192350` + Gold `#D4AF37` + Blue Light `#AFD2FA` + White Soft `#F5F5F0`. Dark-first, glassmorphism blur(15px).

---

## 11. Principios Arquitectónicos

1. **Audit inmutable**: `audit_log` con `REVOKE UPDATE/DELETE` + HMAC-SHA256 desde día 1
2. **Single-tenant v0**: `org_id` fijo (Anclora Private Estates). RLS preparada para multitenancy
3. **Budget hard stop**: bloquea ejecución LLM si `constitutional_limits` alcanzado
4. **Fail-safe**: fallos transicionan a estado seguro (nunca fail-open)
5. **Transparencia**: todo output IA marcado como `[Generado por Anclora Nexus Agent]`
6. **Data First**: modelo de datos antes que UI. Sin divergencias DB ↔ UI

---

## 12. Inicio del Sistema

```bash
# Frontend
cd frontend && npm run dev          # http://localhost:3000

# Backend
cd backend
pip install -r requirements.txt
python -m uvicorn api.main:app --reload --port 8000

# Supabase local (opcional)
supabase start
```

---

## 13. Referencias Clave

| Archivo | Descripción |
|---------|-------------|
| `constitution-canonical.md` | Norma suprema — gobernanza y seguridad |
| `product-spec-v0.md` | Especificación de producto v0 |
| `spec.md` | Referencia técnica OpenClaw base |
| `backend/agents/graph.py` | LangGraph orchestrator |
| `backend/api/main.py` | FastAPI entry point |
| `supabase/migrations/` | Historia completa del schema |
| `.agent/rules/` | Reglas por feature (17 features) |
| `.agent/skills/` | Skills del sistema (6 skills) |
| `.antigravity/prompts/` | Prompts del framework AntiGravity |
