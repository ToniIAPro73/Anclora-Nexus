# ANÁLISIS Y REENFOQUE: ANCLORA NEXUS v0

## 1. DIAGNÓSTICO DEL PROBLEMA

### 1.1 Lo que teníamos (OpenClaw puro)

El trabajo previo produjo 3 documentos sólidos:
- `constitution-canonical.md` — Marco de gobernanza y seguridad (925 líneas)
- `spec.md` — Especificación técnica canónica (1.852 líneas, 30 secciones)
- `antigravity-prompt-openclaw.md` — Prompt para construir con Antigravity

**Problema:** Todo esto define un **motor** (orquestación, HITL, audit, risk scoring), pero no define **para qué se usa el motor**. Es como tener un manual de un coche de F1 sin circuito donde correr.

### 1.2 Lo que necesitas (Anclora Nexus v0)

El documento de Perplexity identifica correctamente:

- **Fase 1 = uso personal exclusivo.** No SaaS, no multitenancy, no terceros.
- **Usuario:** Toni, agente inmobiliario de lujo en eXp Spain, trabajando en CGI a jornada completa.
- **Objetivo:** Multiplicar productividad con 3 agentes IA (Lead Intake, Prospección, Recap).
- **Principio:** "Cada hora invertida debe acortar el camino al siguiente mandato."

### 1.3 Evaluación del documento de Perplexity

| Aspecto | Valoración | Comentario |
|---|---|---|
| Diagnóstico estratégico | 9/10 | Excelente análisis del ecosistema Anclora, riesgos y secuenciación |
| Propuesta Nexus v0 standalone | 7/10 | Buenos casos de uso, pero **descarta OpenClaw innecesariamente** |
| Propuesta OpenClaw + Skills | 8/10 | Sección final correcta, pero incompleta y sin resolver conflictos con spec.md |
| Estructura de carpetas | 6/10 | Demasiadas variantes propuestas, genera confusión |
| Prompt Antigravity | 5/10 | Largo, repetitivo, mezcla 2 estrategias incompatibles |
| Viabilidad de ejecución one-shot | 4/10 | No es ejecutable en un prompt. Demasiadas decisiones abiertas |

### 1.4 Problema fundamental del documento Perplexity

El documento oscila entre **tres propuestas incompatibles**:

1. **"Descartar OpenClaw, construir Nexus v0 simple"** (Secciones 1-3)
2. **"OpenClaw como core + Skills Anclora encima"** (Sección final)
3. **"Hacer ambas cosas a la vez"** (estructura de carpetas con core/ + apps/ + skills/)

La opción 2 es la correcta, pero requiere un **trabajo de adaptación** que Perplexity no hizo: recortar spec.md para eliminar lo que NO necesitas en v0, y definir qué del core se mantiene vs. qué se simplifica.

---

## 2. JERARQUÍA NORMATIVA

Los 3 documentos fuente del proyecto mantienen una jerarquía estricta:

```
┌─────────────────────────────────────────┐
│ 1. constitution-canonical.md            │  ← NORMA SUPREMA
│    Principios inviolables:              │
│    - Golden Rules (soberanía, reversi-  │
│      bilidad, transparencia)            │
│    - Audit log inmutable                │
│    - Gobernanza de agentes IA           │
│    - Protocolo HITL (reactivable)       │
│    - Risk scoring                       │
│    Aplica SIEMPRE, incluso en v0.       │
└──────────────────┬──────────────────────┘
                   │ no puede contradecir
┌──────────────────▼──────────────────────┐
│ 2. product-spec-v0.md (este documento)  │  ← CAPA DE PRODUCTO
│    Define QUÉ HACE la aplicación:       │
│    - User stories, skills, widgets      │
│    - Modelo de datos Anclora            │
│    - Scope v0 (qué se implementa/no)   │
│    Prevalece sobre spec.md en scope.    │
└──────────────────┬──────────────────────┘
                   │ no puede contradecir
┌──────────────────▼──────────────────────┐
│ 3. spec.md                              │  ← REFERENCIA TÉCNICA
│    Arquitectura base OpenClaw:          │
│    - StateGraph, nodos, servicios       │
│    - Schema DB core                     │
│    - API patterns, frontend base        │
│    Consultar para implementación.       │
└─────────────────────────────────────────┘
```

### Principios de la Constitución que siguen vigentes en v0

| Título Constitución | Principio | Aplicación en v0 |
|---|---|---|
| Título I — Golden Rules | Soberanía financiera | Toni controla 100% de sus datos. Sin vendor lock-in. |
| Título I — Golden Rules | Transparencia de identidad | Todo output IA se identifica como generado por agente. |
| Título I — Golden Rules | Reversibilidad | Toda acción del agente es deshacer o re-ejecutable. |
| Título III — Límites | Constitutional limits | Tabla `constitutional_limits` con max_daily_leads, max_tokens/día. |
| Título V — Risk Scoring | Fórmula ponderada | Adaptada a priorización de leads (budget × urgency × fit × source). |
| Título IV — HITL | Aprobación humana | Desactivado en v0 single-user, pero arquitectura preparada para reactivar. |
| Título X — Audit | Log inmutable | audit_log con REVOKE UPDATE/DELETE + HMAC-SHA256 activo desde día 1. |

### Principios de la Constitución aplazados (no eliminados) en v0

| Título | Principio | Razón del aplazamiento |
|---|---|---|
| Título VI-VII | Compliance GDPR/PCI-DSS avanzado | Single-user, no hay datos de terceros sensibles aún. |
| Título VIII | Kill Switch multinivel | Single-user, cancel simple suficiente. |
| Título IX | Sandboxing Docker | Skills son módulos Python internos, sin ejecución de código no confiable. |
| (Arts. dispersos) | Multi-org governance | Sin multitenancy en v0. |

---

## 3. DECISIÓN ARQUITECTÓNICA: ESTRATEGIA "KERNEL + DISTRO"

### Concepto

```
OpenClaw (Kernel)          Anclora Nexus v0 (Distro)
─────────────────          ──────────────────────────
LangGraph StateGraph   →   Skills inmobiliarios
HITL Protocol          →   Aprobación acciones masivas
Risk Scoring           →   Priorización de leads
Audit Log inmutable    →   Trazabilidad de agentes
Constitutional Checks  →   Límites operativos (tokens/día, leads/día)
LLM Fallback Chain     →   GPT-4o-mini + Claude 3.5 Sonnet
Checkpointing          →   Recuperación de estado de agentes
```

### Qué SE MANTIENE de OpenClaw spec.md

| Sección spec.md | Se mantiene | Adaptación |
|---|---|---|
| 6. Arquitectura del Sistema | SÍ (simplificada) | Eliminar capa MCP sandbox Docker |
| 7. Stack Tecnológico | SÍ (recortado) | Eliminar vLLM/Ollama, GKE, Terraform |
| 8. Modelo de Datos | PARCIAL | Mantener core (orgs, users, agents, tasks, audit_log, agent_memory). Añadir leads, properties |
| 9. Orquestación Agéntica | SÍ (reducido) | 7 nodos en vez de 11. Sin payment_processor ni emergency_stop en v0 |
| 10. Protocolo HITL | OPCIONAL | Solo para acciones masivas (>10 contactos) |
| 11. MCP, Skills y Sandboxing | SIMPLIFICADO | Skills como módulos Python, sin Docker sandbox |
| 12. Sistema de Colas | NO | Single-user, no necesita lanes |
| 13. Heartbeat | NO | Agentes son invocaciones cortas |
| 14. Persistencia y RAG | PARCIAL | agent_memory sin HNSW en v0 |
| 15. Integración de Pagos | NO | No hay pagos en v0 |
| 16. n8n Workflows | SÍ | 3 workflows específicos Anclora |
| 17. API Specification | SIMPLIFICADO | REST básico, WebSocket solo para dashboard |
| 18. Frontend Bento Grid | SÍ (adaptado) | Widgets inmobiliarios, no genéricos |
| 19. Catálogo de Skills | REEMPLAZADO | 4 skills Anclora en vez de genéricos |
| 20. Seguridad y Compliance | REDUCIDO | GDPR básico, sin PCI-DSS |
| 21-30 | DIFERIDO | Infra enterprise, CI/CD avanzado → Fase 2+ |

### Qué SE DESCARTA de OpenClaw spec.md (v0)

- Multitenancy (org_id RLS complejo) → single-tenant con org_id fijo
- Stripe / Payment processing → no hay monetización
- MCP Docker sandbox → skills son módulos Python internos
- vLLM / Ollama / GKE → API providers (OpenAI + Anthropic)
- Lane Queue System → single-user, sin concurrencia
- Heartbeat monitor → invocaciones síncronas cortas
- Kill Switch multinivel → simple cancel de tarea
- Constitutional limits financieros → límites operativos simples
- Terraform / GKE / Cloud Run → Vercel + Railway
- MFA/WebAuthn → Supabase Auth simple (magic link)

---

## 4. SPEC ANCLORA NEXUS v0: DEFINICIÓN DE PRODUCTO

### 4.1 User Stories (lo que faltaba)

**US-01: Lead Intake Inteligente**
Como agente inmobiliario, quiero que cuando un lead llene el formulario de mi web, un agente IA lo cualifique automáticamente, calcule prioridad, genere draft de email/WhatsApp de respuesta y cree una tarea de follow-up, para responder en < 15 minutos sin estar pendiente.

**US-02: Prospección Semanal Automatizada**
Como agente inmobiliario, quiero recibir cada domingo un dossier PDF con 10-20 propiedades priorizadas en mis zonas target (Andratx, Calvià, Son Ferrer) con copy de captación listo para usar, para dedicar mis horas disponibles a contacto directo en vez de investigación.

**US-03: Recap Semanal Ejecutivo**
Como agente inmobiliario a jornada parcial, quiero recibir cada domingo un email con métricas de la semana (leads, tareas, pipeline), gaps detectados y top 3 acciones para la semana siguiente, para planificar mi tiempo de forma óptima.

**US-04: Dashboard Personal**
Como agente inmobiliario, quiero un panel de control donde ver mis leads, tareas pendientes, propiedades en pipeline y métricas clave, actualizado en tiempo real, para tener visibilidad total sin abrir 5 herramientas distintas.

### 4.2 Design System Anclora Nexus

**Paleta oficial** (extraída de brand identity Anclora Cognitive Solutions):

| Token | Hex | Uso |
|---|---|---|
| Navy Deep | `#192350` | Fondo principal |
| Navy Darker | `#0F1629` | Gradientes profundos |
| Blue Light | `#AFD2FA` | Acentos tech, glows |
| Gold | `#D4AF37` | Acento premium, CTAs, badges |
| White Soft | `#F5F5F0` | Texto principal |

**Tipografía:** Playfair Display (headings, lujo editorial) + Inter (body, datos técnicos).
**Iconos:** Lucide React exclusivamente.
**Estética:** Dark mode, glassmorphism, Bloomberg Terminal meets luxury yacht cockpit.

**Efectos premium del dashboard:**
- Gold shimmer en top-edge de widgets al hover
- CountUp animado para métricas (conteo easeOutCubic)
- TypeWriter con cursor gold para stream de agentes IA
- PulseOrb con glow animado para indicadores de status
- Stagger animation al cargar (widgets entran secuencialmente)
- Partículas flotantes sutiles en login page
- Ripple dorado en botones de QuickActions

La especificación visual completa está en el Skill 3 (frontend-dashboard) del prompt Antigravity.

### 4.3 Widgets del Dashboard (Bento Grid adaptado)

| Widget | Tamaño Grid | Datos | Actualización |
|---|---|---|---|
| **LeadsPulse** | 4x2 | Leads recientes + prioridad + status | Supabase Realtime |
| **TasksToday** | 2x2 | Tareas pendientes con due_date ≤ hoy | Supabase Realtime |
| **PropertyPipeline** | 2x2 | Kanban: prospect → listed → sold | REST poll 60s |
| **QuickStats** | 2x1 | Leads/semana, tasa respuesta, mandatos activos | REST poll 5min |
| **AgentStream** | 2x1 | Últimas ejecuciones de agentes IA con reasoning | Supabase Realtime (agent_logs) |
| **QuickActions** | 2x1 | Botones: "Nuevo Lead Manual", "Run Prospection", "Force Recap" | Acciones directas |

### 4.4 Skills Anclora (reemplazo del catálogo genérico)

**Skill 1: lead_intake**
- Trigger: webhook desde formulario web
- Input: {name, email, phone, property_interest, budget_range, source}
- Output: {ai_summary, priority 1-5, priority_score 0.0-1.0, next_action, copy_email, copy_whatsapp}
- LLM: GPT-4o-mini (resumen) + Claude 3.5 Sonnet (copy)
- Tiempo: < 30 segundos
- Risk scoring adaptado: budget × urgencia × fit × calidad fuente

**Skill 2: prospection_weekly**
- Trigger: cron (domingos 18h) o manual
- Input: {zones: ["07157","07160","07180"], criteria: {min_price: 500000, type: "villa"}}
- Output: {ranked_properties: list, dossier_pdf_url, tasks_created: int}
- Data source v0: CSV manual → v1: pycatastro + INE
- LLM: GPT-4o para copy de carta captación
- Tiempo: < 5 minutos

**Skill 3: recap_weekly**
- Trigger: cron (domingos 20h) o manual
- Input: {date_range: "last_7_days"}
- Output: {metrics, gaps, top_actions, email_html}
- LLM: Claude 3.5 Sonnet para insights cualitativos
- Tiempo: < 30 segundos

**Skill 4: dossier_generator** (Fase Q2)
- Trigger: manual desde dashboard
- Input: {property_id} o {zone, criteria}
- Output: PDF profesional con datos, fotos, análisis de zona
- Diferido a Q2 2026

### 4.5 Modelo de Datos v0

**Tablas core (de OpenClaw, simplificadas):**

```sql
-- organizations: single-tenant pero mantiene estructura
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_profiles: link a Supabase Auth
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  org_id UUID NOT NULL REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- agents: registro de agentes IA disponibles
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  skill_name TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- tasks: tareas generadas por agentes o manuales
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT, -- follow_up, prospection, dossier, admin
  status TEXT DEFAULT 'pending', -- pending, done, cancelled
  due_date TIMESTAMPTZ,
  related_lead_id UUID,
  related_property_id UUID,
  ai_generated BOOLEAN DEFAULT false,
  agent_id UUID REFERENCES agents(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- audit_log: inmutable (REVOKE UPDATE, DELETE)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_type TEXT NOT NULL, -- 'user', 'agent', 'system'
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  signature TEXT -- HMAC-SHA256
);

REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;
REVOKE UPDATE, DELETE ON audit_log FROM authenticated;

-- agent_logs: trazabilidad de ejecuciones IA
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  agent_name TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  input JSONB,
  output JSONB,
  llm_model TEXT,
  tokens_used INTEGER,
  duration_ms INTEGER,
  status TEXT DEFAULT 'success' -- success, error, timeout
);

-- constitutional_limits: límites operativos (no financieros)
CREATE TABLE constitutional_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  limit_type TEXT NOT NULL,
  limit_value NUMERIC NOT NULL,
  description TEXT,
  UNIQUE(org_id, limit_type)
);
```

**Tablas Anclora (específicas inmobiliaria):**

```sql
-- leads: contactos entrantes
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Datos del contacto
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT NOT NULL, -- web, exp, referral, linkedin, cold
  property_interest TEXT,
  budget_range TEXT,
  urgency TEXT DEFAULT 'medium', -- low, medium, high, immediate

  -- Campos IA (generados por lead_intake skill)
  ai_summary TEXT,
  ai_priority INTEGER CHECK (ai_priority BETWEEN 1 AND 5),
  priority_score NUMERIC(3,2) CHECK (priority_score BETWEEN 0.0 AND 1.0),
  next_action TEXT,
  copy_email TEXT,
  copy_whatsapp TEXT,

  -- Pipeline
  status TEXT DEFAULT 'new', -- new, contacted, qualified, negotiating, won, lost
  last_contact_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,

  notes JSONB
);

CREATE INDEX idx_leads_status ON leads(org_id, status);
CREATE INDEX idx_leads_priority ON leads(priority_score DESC);

-- properties: propiedades captadas o prospectadas
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ubicación
  address TEXT NOT NULL,
  city TEXT,
  postal_code TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),

  -- Características
  property_type TEXT, -- villa, apartment, penthouse, land, finca
  price NUMERIC,
  surface_m2 NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  features JSONB, -- {sea_view, pool, garden, garage, etc.}

  -- Estado pipeline
  status TEXT DEFAULT 'prospect', -- prospect, contacted, listed, under_offer, sold
  owner_contact JSONB,
  catastro_ref TEXT,

  -- IA
  ai_valuation NUMERIC,
  ai_valuation_confidence NUMERIC(3,2),
  prospection_score NUMERIC(3,2),

  notes JSONB,
  dossier_pdf_url TEXT
);

CREATE INDEX idx_properties_postal ON properties(postal_code);
CREATE INDEX idx_properties_status ON properties(org_id, status);

-- weekly_recaps: histórico de recaps
CREATE TABLE weekly_recaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  metrics JSONB NOT NULL,
  gaps JSONB,
  top_actions JSONB,
  insights TEXT,
  email_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.6 Identidad Visual y Brand Guidelines

**Logo:** Anclora Cognitive Solutions — círculo dorado con ondas digitales (olas + circuitos).
**Archivo:** `frontend/public/logo-anclora-nexus.png`

**Paleta de colores (obligatoria en toda la UI):**

| Token CSS | Hex | RGB | Uso |
|---|---|---|---|
| `--navy-deep` | `#192350` | 25, 35, 80 | Background principal, sidebar, navbar, dark surfaces |
| `--blue-light` | `#AFD2FA` | 175, 210, 250 | Links, hover states, borders secundarios, glow effects, AgentStream |
| `--gold` | `#D4AF37` | 212, 175, 55 | CTAs primarios, badges prioridad alta, border activo, brand accent |
| `--white-soft` | `#F5F5F0` | 245, 245, 240 | Texto principal, headings, contenido de cards |

**Colores derivados (generados desde la paleta base):**

| Token CSS | Valor | Uso |
|---|---|---|
| `--navy-surface` | `rgba(25, 35, 80, 0.8)` | Glassmorphism card background |
| `--navy-hover` | `rgba(25, 35, 80, 0.95)` | Card hover state |
| `--gold-muted` | `#B8962E` | Texto dorado secundario, labels |
| `--blue-glow` | `rgba(175, 210, 250, 0.15)` | Glow effects, ring focus |
| `--danger` | `#E53E3E` | Status 'lost', errores, badges prioridad 1 |
| `--success` | `#38A169` | Status 'won'/'sold', tareas completadas |
| `--warning` | `#D69E2E` | Status 'negotiating', tareas próximas a vencer |

**Glassmorphism actualizado (reemplaza colores genéricos):**

```css
:root {
  --navy-deep: #192350;
  --blue-light: #AFD2FA;
  --gold: #D4AF37;
  --white-soft: #F5F5F0;
  --navy-surface: rgba(25, 35, 80, 0.8);
  --navy-hover: rgba(25, 35, 80, 0.95);
  --gold-muted: #B8962E;
  --blue-glow: rgba(175, 210, 250, 0.15);
}

body {
  background: linear-gradient(135deg, #0F1629 0%, #192350 50%, #1A2A5C 100%);
  color: var(--white-soft);
  font-family: 'Inter', system-ui, sans-serif;
}

.widget-card {
  background: var(--navy-surface);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(175, 210, 250, 0.08);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.widget-card:hover {
  border-color: rgba(175, 210, 250, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.btn-primary {
  background: linear-gradient(135deg, var(--gold), var(--gold-muted));
  color: var(--navy-deep);
  font-weight: 600;
  border-radius: 8px;
}

.btn-primary:hover {
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
}

.badge-priority-5 { background: var(--gold); color: var(--navy-deep); }
.badge-priority-4 { background: var(--blue-light); color: var(--navy-deep); }
.badge-priority-3 { background: rgba(175, 210, 250, 0.3); color: var(--white-soft); }
.badge-priority-2 { background: rgba(245, 245, 240, 0.15); color: var(--white-soft); }
.badge-priority-1 { background: rgba(245, 245, 240, 0.08); color: rgba(245, 245, 240, 0.5); }

.sidebar {
  background: rgba(15, 22, 41, 0.95);
  border-right: 1px solid rgba(175, 210, 250, 0.08);
}

.agent-stream-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 5px var(--blue-glow); }
  50% { box-shadow: 0 0 15px var(--blue-glow), 0 0 30px rgba(175, 210, 250, 0.08); }
}
```

**Tipografía:**
- Headings: `Inter` (weight 600-700)
- Body: `Inter` (weight 400)
- Monospace (agent logs, code): `JetBrains Mono` o `Fira Code`
- Fallback: `system-ui, -apple-system, sans-serif`

**Principios de diseño:**
1. Dark-first: NUNCA theme claro. Todo fondo oscuro navy.
2. Gold = acción: Botones primarios, badges de alta prioridad, acentos interactivos.
3. Blue light = información: Links, datos, hover, glow de agentes activos.
4. White soft = contenido: Texto legible, nunca blanco puro (#FFFFFF).
5. Glassmorphism sutil: blur(15px), transparencia 80%, bordes apenas visibles.
6. Logo visible: En sidebar (colapsado = isotipo, expandido = logo completo).

### 4.7 Stack v0 (simplificado de spec.md)

| Capa | Tecnología | Justificación |
|---|---|---|
| Frontend | Next.js 15 (App Router) + shadcn/ui + Tailwind + Zustand | Mismo que spec.md, sin cambio |
| Backend | Python 3.11 + FastAPI + LangGraph 0.3 | Mismo que spec.md, sin cambio |
| Database | Supabase PostgreSQL (plan gratuito) | Simplificado: sin pgvector en v0 |
| Auth | Supabase Auth (magic link) | Simplificado: sin MFA en v0 |
| LLM | OpenAI GPT-4o-mini + Anthropic Claude 3.5 Sonnet | Sustituye vLLM/Ollama local |
| Middleware | n8n self-hosted (Docker) | Mismo que spec.md |
| Hosting Frontend | Vercel (plan hobby) | Simplificado de spec.md |
| Hosting Backend | Railway (plan gratuito) | Sustituye GCP Cloud Run |
| Monitoring | Supabase Dashboard + logs Railway | Sustituye Prometheus/Grafana en v0 |

### 4.8 LangGraph StateGraph v0 (7 nodos en vez de 11)

```
START
  │
  ▼
┌─────────────────┐
│ process_input   │  ← Parsea y valida input del skill
└────────┬────────┘
         ▼
┌─────────────────┐
│ planner         │  ← Decide qué skill ejecutar
└────────┬────────┘
         ▼
┌─────────────────┐
│ limit_check     │  ← Verifica constitutional_limits (tokens/día, leads/día)
└────────┬────────┘
         │
    ┌────┴────┐
    │ blocked │──► STOP (límite alcanzado, log + notificar)
    └─────────┘
         │ ok
         ▼
┌─────────────────┐
│ executor        │  ← Ejecuta el skill Python directamente
└────────┬────────┘
         ▼
┌─────────────────┐
│ result_handler  │  ← Valida output, guarda en DB, crea tasks
└────────┬────────┘
         ▼
┌─────────────────┐
│ audit_logger    │  ← Escribe en audit_log + agent_logs
└────────┬────────┘
         ▼
┌─────────────────┐
│ finalize        │  ← Retorna resultado al caller
└─────────────────┘
         │
         ▼
        END
```

**Nodos eliminados vs. spec.md:**
- `constitutional_check` → fusionado con `limit_check` (versión simple)
- `tool_selector` → fusionado con `planner` (pocos skills, decisión trivial)
- `transaction_detector` → eliminado (no hay transacciones monetarias)
- `human_approval` → eliminado en v0 (single-user, apruebas en UI)
- `payment_processor` → eliminado (no hay pagos)
- `emergency_stop` → eliminado (cancel simple desde UI)

**Nodo `human_approval` disponible para reactivar** cuando se añadan acciones masivas (>10 contactos simultáneos).

---

## 5. ROADMAP REVISADO

### Q1 2026: Foundation + Lead Intake MVP (Feb-Abr)

**Semana 1-2:** Foundation
- Setup repo, Supabase migrations, estructura backend/frontend
- LangGraph StateGraph base con 7 nodos
- LLM Service con fallback chain

**Semana 3-4:** Lead Intake funcional
- Skill lead_intake completo
- n8n workflow lead-intake-form
- Formulario web Next.js conectado
- Dashboard widget LeadsPulse

**Semana 5-8:** Estabilización
- Tests (pytest skills, pgTAP DB)
- Web Anclora Private Estates live con formulario
- Probar con leads reales
- Iterar prompts LLM basado en resultados

### Q2 2026: Prospección + Recap (May-Jul)

**Mes 4:** Skill prospection_weekly + cron n8n
**Mes 5:** Skill recap_weekly + cron n8n
**Mes 6:** Dashboard completo (6 widgets), WhatsApp integration

### Q3-Q4 2026: Validación + Decisión B2B

- Documentar ROI personal (mandatos atribuibles a IA)
- Si hay tracción: empaquetar lead_intake como producto B2B
- Reactivar multitenancy de OpenClaw spec.md
- Evaluar Anclora Cognitive Solutions

---

## 6. LO QUE DEBE HACER EL PROMPT DE ANTIGRAVITY

Con todo esto definido, el prompt de Antigravity debe:

1. **Leer** los documentos fuente (spec.md para arquitectura base, este documento para producto)
2. **Construir** en orden: DB → Backend (StateGraph + Skills) → API → Frontend → n8n → Tests
3. **NO construir** lo descartado (multitenancy complejo, Stripe, MCP Docker, vLLM)
4. **Respetar** audit_log inmutable, tipado estricto, sin secrets en código
5. **Entregar** un sistema funcional donde un lead del formulario web llega al dashboard en < 30s con resumen IA

El prompt actualizado se genera a continuación.
