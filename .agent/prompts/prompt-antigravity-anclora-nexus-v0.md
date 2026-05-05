# PROMPT MAESTRO PARA GOOGLE ANTIGRAVITY — ANCLORA NEXUS v0

## INSTRUCCIONES DE USO

Este documento contiene todo lo necesario para que Google Antigravity construya **Anclora Nexus v0**: tu sistema operativo personal de agente inmobiliario de lujo, utilizando el motor OpenClaw como arquitectura base.

### Archivos previos (2 minutos):

```bash
# 1. Crear workspace
mkdir anclora-nexus && cd anclora-nexus
git init

# 2. Copiar los 3 documentos fuente al root
#    - constitution-canonical.md  (Norma suprema — Golden Rules, gobernanza)
#    - spec.md                    (Spec técnica OpenClaw — arquitectura base)
#    - product-spec-v0.md         (Producto Anclora — casos de uso, skills, datos)

# 3. Crear estructura Antigravity
mkdir -p .agent/rules .agent/skills/supabase-anclora .agent/skills/langgraph-core .agent/skills/frontend-dashboard .agent/skills/lead-intake .agent/skills/prospection

# 4. Copiar los archivos de Secciones A y B a sus ubicaciones
# 5. Abrir directorio en Google Antigravity
# 6. Modelo: Gemini 3 Pro (Plan Mode)
# 7. Pegar el prompt de Sección C en el Agent Manager
```

---

## SECCIÓN A — WORKSPACE RULES

**Archivo:** `.agent/rules/anclora-nexus.md`

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
3. audit_log es INMUTABLE (Constitution Título X). REVOKE UPDATE, DELETE. Toda ejecución de skill se loguea con HMAC-SHA256.
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

## SECCIÓN B — ANTIGRAVITY SKILLS

### Skill 1: Supabase Anclora

**Archivo:** `.agent/skills/supabase-anclora/SKILL.md`

```markdown
---
name: supabase-anclora
description: "Inicializar Supabase para Anclora Nexus v0: schema core (orgs, users, agents, tasks, audit_log, agent_logs, constitutional_limits) + tablas Anclora (leads, properties, weekly_recaps). Usar cuando se pida configurar base de datos o migrations."
---

# Supabase Anclora Setup

## Contexto
Lee product-spec-v0.md Sección 3.4 (Modelo de Datos v0) completa.

## Instrucciones

### Paso 1: Inicializar
```bash
npx supabase init
npx supabase link --project-ref $SUPABASE_PROJECT_REF
```

### Paso 2: Crear migraciones en orden
Directorio: `database/migrations/`

1. `001_extensions.sql` — uuid-ossp, pgcrypto
2. `002_organizations.sql` — Tabla organizations
3. `003_user_profiles.sql` — Tabla user_profiles (FK auth.users)
4. `004_agents.sql` — Tabla agents
5. `005_tasks.sql` — Tabla tasks
6. `006_audit_log.sql` — Tabla audit_log INMUTABLE (REVOKE UPDATE, DELETE)
7. `007_agent_logs.sql` — Tabla agent_logs
8. `008_constitutional_limits.sql` — Tabla constitutional_limits
9. `010_leads.sql` — Tabla leads (Anclora específica)
10. `011_properties.sql` — Tabla properties (Anclora específica)
11. `012_weekly_recaps.sql` — Tabla weekly_recaps
12. `020_seed.sql` — Seed data: org "Anclora Private Estates", usuario Toni, agentes (lead_intake, prospection, recap), constitutional_limits (max_daily_leads=50, max_llm_tokens_per_day=100000)

### Paso 3: Copiar DDL exacto de product-spec-v0.md Sección 3.4. NO inventar columnas.

### Paso 4: Verificar
```bash
npx supabase db push --linked
```

## Criterios de Aceptación
- Todas las tablas creadas con tipos exactos de product-spec-v0.md
- audit_log bloquea UPDATE y DELETE
- Seed data insertado correctamente
- Supabase Auth configurado (magic link provider habilitado)
```

### Skill 2: LangGraph Core

**Archivo:** `.agent/skills/langgraph-core/SKILL.md`

```markdown
---
name: langgraph-core
description: "Construir el StateGraph LangGraph con 7 nodos (process_input, planner, limit_check, executor, result_handler, audit_logger, finalize), LLM service con fallback, y risk scoring adaptado para leads. Usar cuando se pida implementar agentes, LangGraph, orquestación, o backend core."
---

# LangGraph Core — Anclora Nexus v0

## Contexto
Lee spec.md Sección 9 para arquitectura base StateGraph.
Lee product-spec-v0.md Sección 3.6 para el grafo simplificado de 7 nodos.

## Instrucciones

### Paso 1: Estructura
```
backend/
├── agents/
│   ├── __init__.py
│   ├── state.py              # AgentState TypedDict (simplificado)
│   ├── graph.py               # StateGraph 7 nodos
│   └── nodes/
│       ├── __init__.py
│       ├── process_input.py
│       ├── planner.py
│       ├── limit_check.py
│       ├── executor.py
│       ├── result_handler.py
│       ├── audit_logger.py
│       └── finalize.py
├── skills/
│   ├── __init__.py
│   ├── lead_intake.py         # Skill 1
│   ├── prospection.py         # Skill 2
│   └── recap.py               # Skill 3
├── services/
│   ├── __init__.py
│   ├── llm_service.py         # OpenAI + Anthropic fallback
│   ├── supabase_service.py    # CRUD Supabase
│   ├── audit_service.py       # HMAC-SHA256 audit logging
│   └── risk_scoring.py        # Priorización de leads
├── api/
│   ├── __init__.py
│   ├── agents.py              # POST /agents/{skill_name}
│   ├── leads.py               # CRUD leads
│   ├── properties.py          # CRUD properties
│   └── tasks.py               # CRUD tasks
├── models/
│   ├── __init__.py
│   ├── lead.py                # Pydantic models
│   ├── property.py
│   └── task.py
├── requirements.txt
└── main.py                    # FastAPI app
```

### Paso 2: AgentState simplificado
```python
from typing import TypedDict

class AgentState(TypedDict):
    # Input
    input_data: dict
    skill_name: str
    org_id: str
    user_id: str

    # Planning
    plan: str
    selected_skill: str

    # Limits
    limits_ok: bool
    limit_violation: str | None

    # Execution
    skill_output: dict | None
    error: str | None

    # Audit
    audit_logged: bool
    agent_log_id: str | None

    # Result
    final_result: dict | None
    status: str  # success, error, blocked
```

### Paso 3: Implementar 7 nodos
Seguir product-spec-v0.md Sección 3.6 para el flujo.
El nodo `executor` invoca directamente la función Python del skill (sin Docker sandbox).

### Paso 4: Risk Scoring para Leads
```python
def calculate_lead_priority(lead: dict) -> tuple[float, int]:
    """
    Retorna (priority_score 0.0-1.0, priority_scale 1-5).
    Factores: budget (0.35), urgency (0.25), fit (0.25), source_quality (0.15).
    """
    budget_score = normalize_budget(lead.get('budget_range', ''), min_target=500_000)
    urgency_score = {'low': 0.2, 'medium': 0.5, 'high': 0.8, 'immediate': 1.0}.get(
        lead.get('urgency', 'medium'), 0.5
    )
    fit_score = calculate_property_fit(lead.get('property_interest', ''))
    source_score = {'referral': 1.0, 'web': 0.7, 'exp': 0.8, 'linkedin': 0.5, 'cold': 0.3}.get(
        lead.get('source', 'web'), 0.5
    )

    priority_score = round(
        0.35 * budget_score + 0.25 * urgency_score + 0.25 * fit_score + 0.15 * source_score, 2
    )

    if priority_score >= 0.8: scale = 5
    elif priority_score >= 0.6: scale = 4
    elif priority_score >= 0.4: scale = 3
    elif priority_score >= 0.2: scale = 2
    else: scale = 1

    return priority_score, scale
```

### Paso 5: LLM Service con Fallback
```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

class LLMService:
    def __init__(self):
        self.primary = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
        self.creative = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0.7)

    async def summarize(self, text: str) -> str:
        """Primary model para resúmenes rápidos."""
        return (await self.primary.ainvoke(text)).content

    async def generate_copy(self, context: str) -> str:
        """Creative model para copy persuasivo."""
        return (await self.creative.ainvoke(context)).content

    async def analyze(self, data: str) -> str:
        """Primary con fallback a creative."""
        try:
            return (await self.primary.ainvoke(data)).content
        except Exception:
            return (await self.creative.ainvoke(data)).content
```

### Paso 6: Tests
- `tests/test_graph.py` — StateGraph compila y ejecuta con mock skill
- `tests/test_lead_intake.py` — Skill produce output válido con datos de prueba
- `tests/test_risk_scoring.py` — 10 escenarios parametrizados

## Criterios de Aceptación
- StateGraph compila con 7 nodos y edges correctos
- Skill lead_intake procesa un lead de prueba en < 30s
- Risk scoring produce valores correctos para todos los escenarios
- limit_check bloquea cuando se excede max_daily_leads
- audit_logger escribe en audit_log y agent_logs
- LLM fallback funciona cuando primary falla
```

### Skill 3: Frontend Dashboard

**Archivo:** `.agent/skills/frontend-dashboard/SKILL.md`

**Assets de marca:** Copiar las imágenes del directorio `brand/` al proyecto:
- `public/brand/logo-nexus.png` — Logo circular (ondas gold/blue con circuitos, fondo transparente)
- `public/brand/favicon.png` — Favicon del logo

```markdown
---
name: frontend-dashboard
description: "Construir dashboard Bento Grid premium con Next.js 15, design system Anclora Nexus (navy/gold/blue), glassmorphism avanzado, animaciones Framer Motion, y efectos visuales de lujo. Usar cuando se pida implementar frontend, dashboard, widgets, UI, Bento Grid, o diseño visual."
---

# Frontend Dashboard — Anclora Nexus v0

## Contexto
Lee spec.md Sección 18 para la base Bento Grid.
Lee product-spec-v0.md Sección 3.2 para los 6 widgets específicos Anclora.
Lee ESTE SKILL COMPLETO para el design system obligatorio y efectos premium.

## DESIGN SYSTEM ANCLORA NEXUS (OBLIGATORIO)

### Identidad Visual
Anclora Nexus es la capa tecnológica de Anclora Cognitive Solutions.
El dashboard debe transmitir: LUJO TECNOLÓGICO — la intersección entre
sofisticación inmobiliaria ultra-high-end y potencia de IA.

Inspiración visual: Bloomberg Terminal meets luxury yacht cockpit.
Estética: dark, limpia, con acentos gold y blue que recuerdan al mar
Mediterráneo y la exclusividad.

### Paleta de Colores (EXACTA — no modificar hexadecimales)

| Token | Hex | Uso |
|-------|-----|-----|
| Navy Deep | `#192350` | Fondo principal, superficies base |
| Navy Darker | `#0F1629` | Fondo extremo, gradientes profundos |
| Navy Mid | `#1A2A5C` | Superficies elevadas, sidebar |
| Blue Light | `#AFD2FA` | Acentos tecnológicos, glows, links |
| Blue Glow | `rgba(175,210,250,0.15)` | Halos, efectos de resplandor |
| Blue Muted | `#7BA3D4` | Texto secundario, iconos inactivos |
| Gold | `#D4AF37` | Acento premium, CTAs, bordes highlight, badges |
| Gold Muted | `#B8962E` | Gold en hover/active |
| Gold Glow | `rgba(212,175,55,0.20)` | Halo gold para elementos premium |
| White Soft | `#F5F5F0` | Texto principal |
| White Muted | `rgba(245,245,240,0.6)` | Texto secundario |
| White Subtle | `rgba(245,245,240,0.08)` | Bordes de widgets, separadores |
| Success | `#38A169` | Estados positivos, leads ganados |
| Warning | `#D69E2E` | Alertas, tareas próximas a vencer |
| Danger | `#E53E3E` | Errores, leads perdidos, urgencia máxima |

### Tipografía

```bash
npm install @fontsource/inter @fontsource/playfair-display
```

| Uso | Font | Weight | Tracking |
|-----|------|--------|----------|
| Headings de página | Playfair Display | 600 | -0.02em |
| Títulos de widgets | Inter | 600 | -0.01em |
| Body / datos | Inter | 400 | 0 |
| Números / métricas | Inter | 700 tabular-nums | -0.02em |
| Labels / captions | Inter | 500 uppercase | 0.05em |

Playfair Display aporta el toque de lujo editorial (serif elegante).
Inter aporta la legibilidad técnica (sans-serif, tabular figures para datos).

### Iconos

```bash
npm install lucide-react
```

Usar exclusivamente Lucide React (línea fina, consistente con estética minimal).
NO usar emojis como iconos en el dashboard. Usar emojis SOLO en mensajes de
notificación o contextos informales.

## Instrucciones

### Paso 1: Scaffolding

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app
npx shadcn@latest init
npm install zustand @supabase/supabase-js framer-motion
npm install @fontsource/inter @fontsource/playfair-display lucide-react
npm install clsx tailwind-merge tailwindcss-animate
```

### Paso 2: Estructura

```
frontend/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx            # Login premium con logo animado
│   ├── dashboard/
│   │   └── page.tsx                  # Bento Grid 6 widgets
│   ├── leads/
│   │   ├── page.tsx                  # Lista leads
│   │   └── [id]/page.tsx             # Detalle lead
│   ├── properties/
│   │   └── page.tsx                  # Lista propiedades
│   ├── tasks/
│   │   └── page.tsx                  # Lista tareas
│   ├── globals.css                   # Estilos globales + design tokens
│   ├── layout.tsx                    # Root layout con fonts
│   └── page.tsx                      # Redirect a /dashboard
├── components/
│   ├── widgets/
│   │   ├── LeadsPulse.tsx            # 4x2 — leads con prioridad
│   │   ├── TasksToday.tsx            # 2x2 — tareas pendientes hoy
│   │   ├── PropertyPipeline.tsx      # 2x2 — kanban propiedades
│   │   ├── QuickStats.tsx            # 2x1 — métricas animadas
│   │   ├── AgentStream.tsx           # 2x1 — stream IA con typing effect
│   │   └── QuickActions.tsx          # 2x1 — botones con ripple
│   ├── ui/                           # shadcn components (dark theme override)
│   ├── layout/
│   │   ├── Sidebar.tsx               # Nav lateral con logo
│   │   ├── Header.tsx                # Top bar con greeting + status
│   │   └── BentoGrid.tsx             # Grid container reutilizable
│   ├── effects/
│   │   ├── GoldShimmer.tsx           # Efecto shimmer gold en bordes
│   │   ├── PulseOrb.tsx              # Orbe animado para status
│   │   ├── CountUp.tsx               # Contador animado para métricas
│   │   ├── TypeWriter.tsx            # Efecto máquina de escribir IA
│   │   └── StaggerList.tsx           # Entrada secuencial de listas
│   └── brand/
│       ├── Logo.tsx                  # Logo SVG/PNG responsive
│       └── Badge.tsx                 # Badge de prioridad con glow
├── lib/
│   ├── supabase.ts                   # Client + Realtime subscriptions
│   ├── store.ts                      # Zustand slices
│   ├── types.ts                      # TypeScript interfaces
│   ├── api.ts                        # Fetch wrappers a backend
│   └── cn.ts                         # clsx + tailwind-merge helper
├── public/
│   ├── brand/
│   │   ├── logo-nexus.png            # Logo principal
│   │   └── favicon.png               # Favicon
│   └── og-image.png                  # Open Graph (optional)
└── tailwind.config.ts                # Extended con design tokens
```

### Paso 3: Tailwind Config con Design Tokens

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: '#192350',
          darker: '#0F1629',
          mid: '#1A2A5C',
          surface: 'rgba(25, 35, 80, 0.8)',
          hover: 'rgba(25, 35, 80, 0.95)',
        },
        blue: {
          light: '#AFD2FA',
          glow: 'rgba(175, 210, 250, 0.15)',
          muted: '#7BA3D4',
        },
        gold: {
          DEFAULT: '#D4AF37',
          muted: '#B8962E',
          glow: 'rgba(212, 175, 55, 0.20)',
        },
        soft: {
          white: '#F5F5F0',
          muted: 'rgba(245, 245, 240, 0.6)',
          subtle: 'rgba(245, 245, 240, 0.08)',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        widget: '16px',
        'widget-inner': '12px',
      },
      backdropBlur: {
        widget: '20px',
      },
      boxShadow: {
        widget: '0 4px 24px rgba(0, 0, 0, 0.2)',
        'widget-hover': '0 8px 40px rgba(0, 0, 0, 0.35)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.15)',
        'blue-glow': '0 0 20px rgba(175, 210, 250, 0.12)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(212, 175, 55, 0.10)' },
          '50%': { boxShadow: '0 0 25px rgba(212, 175, 55, 0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

### Paso 4: Globals CSS

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/playfair-display/600.css';

@layer base {
  body {
    @apply bg-navy-darker text-soft-white antialiased;
    background: linear-gradient(135deg, #0F1629 0%, #192350 50%, #1A2A5C 100%);
    background-attachment: fixed;
  }

  /* Scrollbar premium */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: rgba(175, 210, 250, 0.2);
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover { background: rgba(175, 210, 250, 0.35); }

  /* Selection */
  ::selection { background: rgba(212, 175, 55, 0.3); color: #F5F5F0; }
}

@layer components {
  /* ─── Widget Card Base ─── */
  .widget-card {
    @apply relative overflow-hidden;
    background: rgba(25, 35, 80, 0.6);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(245, 245, 240, 0.06);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .widget-card:hover {
    border-color: rgba(245, 245, 240, 0.12);
    box-shadow:
      0 8px 40px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.06);
    transform: translateY(-2px);
  }

  /* ─── Gold Shimmer Border (top edge on hover) ─── */
  .widget-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(
      90deg, transparent 0%, rgba(212,175,55,0.0) 20%,
      rgba(212,175,55,0.4) 50%, rgba(212,175,55,0.0) 80%, transparent 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
  }
  .widget-card:hover::before { opacity: 1; }

  /* ─── Widget con acento Gold ─── */
  .widget-card-gold {
    @apply widget-card;
    border-color: rgba(212, 175, 55, 0.15);
  }
  .widget-card-gold:hover {
    border-color: rgba(212, 175, 55, 0.35);
    box-shadow: 0 8px 40px rgba(0,0,0,0.35), 0 0 20px rgba(212,175,55,0.10);
  }

  /* ─── Typography ─── */
  .widget-title {
    @apply text-sm font-semibold uppercase tracking-widest;
    color: rgba(175, 210, 250, 0.7);
    letter-spacing: 0.08em;
    margin-bottom: 1rem;
  }
  .metric-value {
    @apply font-sans font-bold tabular-nums;
    font-size: 2.25rem; line-height: 1;
    color: #F5F5F0; letter-spacing: -0.02em;
  }

  /* ─── Priority Badges ─── */
  .priority-badge {
    @apply inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold;
  }
  .priority-5 { @apply bg-red-500/20 text-red-400; box-shadow: 0 0 8px rgba(239,68,68,0.25); }
  .priority-4 { @apply bg-gold/20 text-gold; box-shadow: 0 0 8px rgba(212,175,55,0.2); }
  .priority-3 { @apply bg-blue-light/20 text-blue-light; }
  .priority-2 { @apply bg-soft-muted/20 text-soft-muted; }
  .priority-1 { @apply bg-soft-subtle text-soft-muted; }

  /* ─── Status Dots ─── */
  .status-dot-active {
    @apply w-2 h-2 rounded-full bg-emerald-400;
    box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
  }

  /* ─── Sidebar ─── */
  .sidebar {
    background: rgba(15, 22, 41, 0.95);
    backdrop-filter: blur(20px);
    border-right: 1px solid rgba(245, 245, 240, 0.04);
  }
  .sidebar-link {
    @apply flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium
           text-soft-muted transition-all duration-200;
  }
  .sidebar-link:hover { @apply text-soft-white bg-navy-surface; }
  .sidebar-link-active { @apply text-gold bg-gold-glow; }
}
```

### Paso 5: Componentes de Efectos Premium

#### 5.1 GoldShimmer — borde shimmer dorado en hover
```tsx
// components/effects/GoldShimmer.tsx
'use client'
import { motion } from 'framer-motion'

export function GoldShimmer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={`relative group ${className}`}
      whileHover={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="absolute -inset-[1px] rounded-widget opacity-0 group-hover:opacity-100
                      transition-opacity duration-700 pointer-events-none"
           style={{
             background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)',
             backgroundSize: '200% 100%',
             animation: 'shimmer 3s ease-in-out infinite',
           }} />
      {children}
    </motion.div>
  )
}
```

#### 5.2 CountUp — métricas con conteo animado
```tsx
// components/effects/CountUp.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export function CountUp({
  target, duration = 1200, prefix = '', suffix = '', className = 'metric-value',
}: {
  target: number; duration?: number; prefix?: string; suffix?: string; className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, target, duration])

  return <span ref={ref} className={className}>{prefix}{value.toLocaleString('es-ES')}{suffix}</span>
}
```

#### 5.3 TypeWriter — efecto escritura IA para AgentStream
```tsx
// components/effects/TypeWriter.tsx
'use client'
import { useEffect, useState } from 'react'

export function TypeWriter({
  text, speed = 25, className = '', onComplete,
}: {
  text: string; speed?: number; className?: string; onComplete?: () => void
}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed(''); setDone(false)
    let i = 0
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1)); i++
      if (i >= text.length) { clearInterval(interval); setDone(true); onComplete?.() }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed, onComplete])

  return (
    <span className={className}>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[1em] bg-gold ml-0.5 animate-pulse align-middle" />}
    </span>
  )
}
```

#### 5.4 PulseOrb — indicador de estado con glow
```tsx
// components/effects/PulseOrb.tsx
'use client'
import { motion } from 'framer-motion'

export function PulseOrb({ status = 'active', size = 8 }: {
  status?: 'active' | 'processing' | 'error' | 'idle'; size?: number
}) {
  const colors = {
    active:     { bg: '#34D399', glow: 'rgba(52,211,153,0.4)' },
    processing: { bg: '#D4AF37', glow: 'rgba(212,175,55,0.4)' },
    error:      { bg: '#E53E3E', glow: 'rgba(229,62,62,0.4)' },
    idle:       { bg: 'rgba(245,245,240,0.3)', glow: 'transparent' },
  }
  const { bg, glow } = colors[status]

  return (
    <span className="relative inline-flex" style={{ width: size * 2, height: size * 2 }}>
      {status !== 'idle' && (
        <motion.span className="absolute inset-0 rounded-full" style={{ background: glow }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
      )}
      <span className="relative inline-flex rounded-full"
            style={{ width: size, height: size, background: bg, margin: 'auto' }} />
    </span>
  )
}
```

#### 5.5 StaggerList — entrada secuencial de elementos
```tsx
// components/effects/StaggerList.tsx
'use client'
import { motion } from 'framer-motion'

export function StaggerList({ children, delay = 0.06, className = '' }: {
  children: React.ReactNode; delay?: number; className?: string
}) {
  return (
    <motion.div className={className} initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: delay } } }}>
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{
      hidden: { opacity: 0, y: 8 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    }}>
      {children}
    </motion.div>
  )
}
```

### Paso 6: Bento Grid Layout

Grid 6 columnas responsive:
- Mobile (<768px): 1 columna
- Tablet (768-1024px): 2 columnas
- Desktop (>1024px): 6 columnas

```
┌────────────────────────┬────────────┐
│   LeadsPulse           │ TasksToday │
│   (col-span-4, row-2) │ (span-2,2) │
│                        │            │
├────────────┬───────────┼────────────┤
│ Property   │ QuickStats│ AgentStream│
│ Pipeline   │ (span-2,1)│ (span-2,1) │
│ (span-2,2) ├───────────┴────────────┤
│            │ QuickActions (span-4,1) │
└────────────┴─────────────────────────┘
```

```tsx
// components/layout/BentoGrid.tsx
'use client'
import { motion } from 'framer-motion'

export function BentoGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4 p-4 xl:p-6"
      initial="hidden" animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>
      {children}
    </motion.div>
  )
}

export function BentoCell({ children, colSpan = 1, rowSpan = 1, className = '' }: {
  children: React.ReactNode; colSpan?: number; rowSpan?: number; className?: string
}) {
  const colClass = { 1: 'xl:col-span-1', 2: 'xl:col-span-2', 3: 'xl:col-span-3', 4: 'xl:col-span-4' }
  const rowClass = { 1: '', 2: 'xl:row-span-2' }
  return (
    <motion.div
      className={`col-span-1 md:col-span-${Math.min(colSpan, 2)} ${colClass[colSpan as keyof typeof colClass] || ''} ${rowClass[rowSpan as keyof typeof rowClass] || ''} ${className}`}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
      }}>
      {children}
    </motion.div>
  )
}
```

### Paso 7: Widget Specifications (comportamiento visual por widget)

Cada widget aplica `.widget-card` + efectos específicos:

**LeadsPulse (4×2):**
- Tabla: Nombre, Presupuesto, Prioridad, Fuente, Status, Fecha
- Priority badge con glow por nivel (5=rojo pulsante, 4=gold shimmer, 3=blue)
- Nuevos leads entran con `slideUp` animation (Framer Motion)
- Header: PulseOrb verde + "LIVE" para indicar Realtime activo
- Row hover: borde izquierdo ilumina con color de prioridad del lead

**TasksToday (2×2):**
- Lista checkbox + título + due_time
- Checkbox: transición suave, gold tick al completar
- Tareas vencidas: text-danger + PulseOrb rojo
- Al completar: strikethrough animado + fade a soft-muted

**PropertyPipeline (2×2):**
- Mini kanban horizontal: 4 columnas (prospect, listed, offer, sold)
- Cada propiedad: card mínima con precio (CountUp) y tipo
- Columna "sold": badge gold con shimmer
- Transición entre columnas: Framer Motion layoutId

**QuickStats (2×1):**
- 3 métricas en fila: Leads/semana, Tasa respuesta, Mandatos activos
- Valores: CountUp animation al entrar en viewport
- Trend: flecha verde ↑ / roja ↓ con delta % vs semana anterior
- Números: metric-value class (Inter 700, 2.25rem, tabular-nums)

**AgentStream (2×1):**
- Últimas 5 ejecuciones IA cronológicas
- Última entrada: TypeWriter effect activo (simulando razonamiento IA)
- Previas: texto completo sin animación
- Cada entrada: PulseOrb(status) + agent name + summary
- Timestamps en text-xs text-soft-muted

**QuickActions (4×1 desktop, full mobile):**
- 3 botones: "Nuevo Lead", "Ejecutar Prospección", "Generar Recap"
- Estilo: widget-card-gold con icono Lucide + label
- Hover: gold-glow shadow + scale(1.02) con spring animation
- Click: ripple dorado (CSS radial-gradient animado desde punto de click)
- Loading: spinner gold rotativo reemplaza icono durante ejecución

### Paso 8: Login Page

Especificación visual de `app/(auth)/login/page.tsx`:

- Fondo: gradiente navy-darker → navy-deep con background-attachment fixed
- Centro: Card glassmorphism (widget-card, max-w-md) conteniendo:
  - Logo `public/brand/logo-nexus.png` a 80×80px con float animation sutil
  - "Anclora Nexus" en font-display text-2xl text-soft-white
  - "Private Estate Intelligence" en text-xs uppercase tracking-[0.2em] text-soft-muted
  - Separator: línea 1px gradiente gold (transparent→gold→transparent) 60% width
  - Input email: bg-navy-surface, border soft-subtle, focus border-gold shadow-gold-glow
  - Botón "Acceder": bg-gold text-navy-darker font-semibold rounded-widget-inner, hover bg-gold-muted
  - "Powered by OpenClaw" en text-xs text-soft-muted mt-8
- Fondo sutil: 12-15 partículas flotantes (divs 2-4px, blue-light opacity 0.04)
  con float animation (distintas duraciones 5-8s). Solo framer-motion divs, NO canvas/WebGL.

### Paso 9: Supabase Realtime

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function subscribeToLeads(cb: (p: any) => void) {
  return supabase.channel('leads-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, cb)
    .subscribe()
}

export function subscribeToAgentLogs(cb: (p: any) => void) {
  return supabase.channel('logs-rt')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'agent_logs' }, cb)
    .subscribe()
}

export function subscribeToTasks(cb: (p: any) => void) {
  return supabase.channel('tasks-rt')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, cb)
    .subscribe()
}

export default supabase
```

### Paso 10: Zustand Store

```typescript
// lib/store.ts
import { create } from 'zustand'
import type { Lead, Task, Property, AgentLog, DashboardStats } from './types'

interface AppState {
  leads: Lead[]; tasks: Task[]; properties: Property[]
  agentLogs: AgentLog[]; stats: DashboardStats
  sidebarOpen: boolean

  setLeads: (l: Lead[]) => void
  addLead: (l: Lead) => void
  updateLead: (id: string, d: Partial<Lead>) => void
  setTasks: (t: Task[]) => void
  toggleTask: (id: string) => void
  setProperties: (p: Property[]) => void
  addAgentLog: (l: AgentLog) => void
  setStats: (s: DashboardStats) => void
  toggleSidebar: () => void
}

export const useStore = create<AppState>((set) => ({
  leads: [], tasks: [], properties: [], agentLogs: [],
  stats: { leadsThisWeek: 0, responseRate: 0, activeMandates: 0 },
  sidebarOpen: true,

  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((s) => ({ leads: [lead, ...s.leads] })),
  updateLead: (id, data) => set((s) => ({
    leads: s.leads.map((l) => l.id === id ? { ...l, ...data } : l)
  })),
  setTasks: (tasks) => set({ tasks }),
  toggleTask: (id) => set((s) => ({
    tasks: s.tasks.map((t) => t.id === id
      ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t)
  })),
  setProperties: (properties) => set({ properties }),
  addAgentLog: (log) => set((s) => ({ agentLogs: [log, ...s.agentLogs].slice(0, 20) })),
  setStats: (stats) => set({ stats }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
```

### Paso 11: Auth Supabase
- Login magic link (email) en /login
- Middleware protege todas las rutas excepto /login y /contact
- Redirect a /dashboard post-login
- Session persistence con Supabase auth helpers para Next.js

## Criterios de Aceptación Visual

- [ ] Paleta EXACTA: #192350, #AFD2FA, #D4AF37, #F5F5F0 (verificar con color picker)
- [ ] Glassmorphism: backdrop-filter blur(20px), bordes sutiles, visible en Chrome/Firefox/Safari
- [ ] Gold shimmer: aparece en top-edge de widgets al hover
- [ ] CountUp: métricas animan de 0 a valor al entrar en viewport
- [ ] TypeWriter: cursor gold parpadeante en AgentStream última entrada
- [ ] PulseOrb: glow pulse correcto por status (verde/gold/rojo/gris)
- [ ] Priority badges: glow de color por nivel (5=red, 4=gold, 3=blue)
- [ ] Stagger: widgets entran secuencialmente al cargar dashboard (0.08s delay)
- [ ] Login: logo con float, partículas sutiles, input focus gold
- [ ] Scrollbar: thin 6px, blue-muted, transparente al idle
- [ ] Dark theme 100% — CERO elementos blancos por defecto de shadcn sin override
- [ ] Font Playfair Display en headings de página, Inter en todo lo demás
- [ ] Responsive: mobile 1col, tablet 2col, desktop 6col grid
- [ ] Realtime: leads nuevos entran con slideUp animation
- [ ] QuickActions: ripple gold al click, spinner gold durante ejecución
- [ ] 60fps en todas las animaciones (verificar Chrome DevTools Performance)

## Anti-Patterns (NO hacer)

- NO usar colores default de shadcn/Tailwind sin override (grises genéricos).
- NO bordes blancos sólidos. Siempre soft-subtle (opacity 0.04-0.12).
- NO sombras negras duras. Siempre difuminadas con spread amplio.
- NO más de 2 animaciones simultáneas por widget (sobrecarga visual).
- NO gradientes de colores fuera de la paleta.
- NO border-radius < 12px en cards ni > 20px.
- NO font-weight < 400 en dark theme.
- NO emojis como iconos en UI. Solo Lucide React.
- NO background-color sólido en widgets. Siempre rgba con backdrop-filter.
```

### Skill 4: Lead Intake

**Archivo:** `.agent/skills/lead-intake/SKILL.md`

```markdown
---
name: lead-intake
description: "Implementar el skill lead_intake end-to-end: formulario web → n8n webhook → backend skill → Supabase → dashboard realtime. Usar cuando se pida implementar lead intake, formulario de contacto, o procesamiento de leads."
---

# Skill Lead Intake — End-to-End

## Contexto
Lee product-spec-v0.md Sección 3.3 (Skill 1: lead_intake) y Sección 3.1 (US-01).

## Instrucciones

### Paso 1: Formulario Web
Crear `frontend/app/contact/page.tsx`:
- Campos: nombre, email, teléfono, interés (select: villa, apartment, land, investment), rango presupuesto (select: <300k, 300-500k, 500k-1M, 1-3M, >3M), urgencia (select: browsing, 3-6 meses, <3 meses, inmediato), mensaje
- OnSubmit: POST a n8n webhook URL (env var N8N_WEBHOOK_URL)
- Feedback: toast de confirmación "Gracias, te contactaremos en breve"

### Paso 2: Skill Python
Crear `backend/skills/lead_intake.py`:
```python
async def run_lead_intake(data: dict, llm: LLMService, db: SupabaseService) -> dict:
    # 1. Insertar lead en DB con status='new'
    lead = await db.insert_lead(data)

    # 2. Calcular prioridad
    priority_score, priority_scale = calculate_lead_priority(data)

    # 3. Generar resumen IA
    ai_summary = await llm.summarize(
        f"Resume este lead inmobiliario en 3 líneas: {json.dumps(data, ensure_ascii=False)}"
    )

    # 4. Generar copy email
    copy_email = await llm.generate_copy(
        f"""Genera un email de primer contacto para un lead inmobiliario de lujo.
        Datos: {json.dumps(data, ensure_ascii=False)}
        Tono: sofisticado, discreto, personalizado. Firma: Toni Amengual, Anclora Private Estates."""
    )

    # 5. Generar copy WhatsApp (más corto)
    copy_whatsapp = await llm.generate_copy(
        f"""Genera un WhatsApp breve de primer contacto para este lead de lujo.
        Datos: {json.dumps(data, ensure_ascii=False)}
        Máximo 3 líneas. Tono cercano pero profesional."""
    )

    # 6. Definir next_action
    if priority_scale >= 4:
        next_action = "call_24h"
    elif priority_scale >= 3:
        next_action = "email_48h"
    else:
        next_action = "email_weekly"

    # 7. Actualizar lead en DB
    await db.update_lead(lead['id'], {
        'ai_summary': ai_summary,
        'ai_priority': priority_scale,
        'priority_score': priority_score,
        'next_action': next_action,
        'copy_email': copy_email,
        'copy_whatsapp': copy_whatsapp,
        'status': 'new',
        'processed_at': datetime.utcnow().isoformat()
    })

    # 8. Crear task de follow-up
    due_date = calculate_due_date(next_action)
    await db.insert_task({
        'title': f"Follow-up: {data['name']}",
        'description': f"Prioridad {priority_scale}/5. Acción: {next_action}. Resumen: {ai_summary}",
        'type': 'follow_up',
        'related_lead_id': lead['id'],
        'due_date': due_date.isoformat(),
        'ai_generated': True
    })

    return {
        'lead_id': lead['id'],
        'ai_summary': ai_summary,
        'priority': priority_scale,
        'priority_score': priority_score,
        'next_action': next_action,
        'copy_email': copy_email,
        'copy_whatsapp': copy_whatsapp,
        'task_due_date': due_date.isoformat()
    }
```

### Paso 3: n8n Workflow
Crear `n8n/workflows/lead-intake-form.json`:
1. Trigger: Webhook (POST)
2. Nodo: Supabase Insert (tabla leads, datos raw)
3. Nodo: HTTP Request → POST backend /agents/lead_intake
4. Nodo: Parse response
5. Nodo: (Opcional) Send WhatsApp notification vía Twilio

### Paso 4: Test E2E
```bash
# Simular envío de formulario
curl -X POST http://localhost:8000/agents/lead_intake \
  -H "Content-Type: application/json" \
  -d '{
    "name": "María García",
    "email": "maria@example.com",
    "phone": "+34612345678",
    "property_interest": "villa",
    "budget_range": "1-3M",
    "urgency": "high",
    "source": "web"
  }'

# Verificar en Supabase:
# 1. leads tiene registro con ai_summary, priority, copy
# 2. tasks tiene follow-up creado
# 3. agent_logs tiene registro de ejecución
# 4. audit_log tiene entrada
```

## Criterios de Aceptación
- Formulario web envía datos a n8n en < 1s
- Skill procesa lead completo en < 30s
- ai_summary tiene 3 líneas útiles
- copy_email tiene tono lujo, personalizado, < 150 palabras
- copy_whatsapp tiene < 3 líneas
- priority_score en rango [0.0, 1.0] y escala 1-5 coherente
- Task creada con due_date correcta según next_action
- Dashboard muestra lead nuevo en < 3s (Realtime)
```

### Skill 5: Prospection

**Archivo:** `.agent/skills/prospection/SKILL.md`

```markdown
---
name: prospection
description: "Implementar el skill prospection_weekly: generación semanal de lista de propiedades priorizadas con copy de captación y PDF dossier. Usar cuando se pida implementar prospección, captación, dossier, o búsqueda de propiedades."
---

# Skill Prospection Weekly

## Contexto
Lee product-spec-v0.md Sección 3.3 (Skill 2) y Sección 3.1 (US-02).
Zonas target: Andratx (07150, 07157), Calvià (07180, 07181), Son Ferrer (07160).

## Instrucciones

### Paso 1: Skill Python
Crear `backend/skills/prospection.py`:
- Input: zones, criteria (min_price, property_type), exclude_contacted
- V0: cargar datos desde CSV en `backend/data/properties_seed.csv`
- Filtrar propiedades ya en tabla `properties` (evitar duplicados por catastro_ref)
- Rankear por score: ubicación × precio × tipo × novedad
- Generar copy de carta captación para cada propiedad (LLM)
- Generar PDF dossier con reportlab
- Subir PDF a Supabase Storage bucket `dossiers/`
- Crear tasks en tabla `tasks` tipo 'prospection'

### Paso 2: CSV Seed
Crear `backend/data/properties_seed.csv` con 30 propiedades ficticias de Mallorca SW:
- Columnas: address, city, postal_code, property_type, estimated_price, surface_m2, bedrooms, catastro_ref
- Mezcla de villas, apartments, fincas en las zonas target

### Paso 3: n8n Workflow Cron
Crear `n8n/workflows/prospection-weekly.json`:
1. Trigger: Cron (domingos 18:00 Europe/Madrid)
2. HTTP Request → POST backend /agents/prospection_weekly
3. Download PDF desde URL en response
4. Send Email (SMTP o SendGrid) con PDF adjunto a toni@anclora.com

### Paso 4: Dashboard Widget
Widget PropertyPipeline muestra propiedades del último ciclo de prospección con status.

## Criterios de Aceptación
- Genera lista de 10-20 propiedades rankeadas
- PDF legible con dirección, precio estimado, score, copy captación
- Filtra 100% de propiedades ya contactadas
- Cron n8n se ejecuta semanalmente sin intervención
- Tasks creadas correctamente en Supabase
```

---

## SECCIÓN C — PROMPT DE EJECUCIÓN PRINCIPAL

**Pegar en Agent Manager de Antigravity (Plan Mode).**

---

```
Eres el arquitecto de Anclora Nexus v0, un sistema operativo personal de agente
inmobiliario de lujo que combina el motor OpenClaw (LangGraph, audit, risk scoring)
con skills específicos para Anclora Private Estates (eXp Realty Spain, Mallorca SW).

DOCUMENTOS FUENTE (leer los 3 completos ANTES de escribir código):

1. `constitution-canonical.md` — NORMA SUPREMA. Extraer:
   - Título I: Golden Rules (soberanía, transparencia, reversibilidad)
   - Título III: Constitutional limits (tabla de límites operativos)
   - Título V: Risk Scoring (fórmula base, adaptarla a leads)
   - Título X: Audit inmutable (HMAC-SHA256)

2. `product-spec-v0.md` — PRODUCTO ANCLORA. Documento principal para v0.
   Define casos de uso, modelo de datos, skills, widgets y roadmap.

3. `spec.md` — REFERENCIA TÉCNICA OpenClaw. Consultar:
   - Sección 7: Stack tecnológico (referencia, adaptar a v0)
   - Sección 9: Orquestación agéntica (base para StateGraph simplificado)
   - Sección 18: Frontend Bento Grid (base para dashboard)

JERARQUÍA: constitution > product-spec > spec.md. Siempre.
EN CASO DE CONFLICTO DE SCOPE: prevalece product-spec-v0.md sobre spec.md.
EN CASO DE CONFLICTO DE PRINCIPIOS: prevalece constitution-canonical.md sobre todo.

LEE LOS TRES DOCUMENTOS AHORA. No escribas código hasta haberlos leído.

═══════════════════════════════════════════════════════════
PLAN DE EJECUCIÓN
═══════════════════════════════════════════════════════════

FASE 1: Foundation (ejecutar completa antes de Fase 2)
──────────────────────────────────────────────────────

1.1. Inicializar proyecto:
   - package.json (root)
   - backend/requirements.txt:
     fastapi, uvicorn[standard], langgraph>=0.3, langchain-openai,
     langchain-anthropic, supabase, pydantic>=2.0, python-dotenv,
     httpx, jinja2, reportlab
   - frontend/: npx create-next-app + shadcn + zustand + supabase-js
   - .env.example (product-spec-v0.md lista las variables)
   - .gitignore (node_modules, .env, __pycache__, .next, venv)
   - docker/docker-compose.dev.yml (n8n + postgres local)

1.2. Supabase migrations:
   - Crear TODAS las tablas de product-spec-v0.md Sección 3.4
   - DDL EXACTO del documento. No inventar columnas ni tipos.
   - audit_log: REVOKE UPDATE, DELETE
   - Seed data: org Anclora, usuario Toni, 3 agentes, limits

1.3. Backend estructura:
   - backend/agents/state.py (AgentState TypedDict, product-spec-v0.md 3.6)
   - backend/agents/graph.py (StateGraph 7 nodos)
   - backend/agents/nodes/*.py (7 archivos)
   - backend/services/llm_service.py (OpenAI + Anthropic fallback)
   - backend/services/supabase_service.py (CRUD)
   - backend/services/audit_service.py (HMAC-SHA256 logging)
   - backend/services/risk_scoring.py (priorización leads)
   - backend/main.py (FastAPI app)

1.4. Verificar:
   - pytest backend/tests/test_graph.py (StateGraph compila)
   - npx supabase db push (migrations pasan)

FASE 2: Lead Intake End-to-End
──────────────────────────────

2.1. Skill lead_intake (backend/skills/lead_intake.py):
   - Implementar run_lead_intake() según product-spec-v0.md
   - Input: datos formulario
   - Output: ai_summary, priority, copy_email, copy_whatsapp, next_action

2.2. Risk scoring (backend/services/risk_scoring.py):
   - calculate_lead_priority() con fórmula ponderada
   - 4 factores: budget (0.35), urgency (0.25), fit (0.25), source (0.15)

2.3. FastAPI endpoint:
   - POST /agents/lead_intake → ejecuta StateGraph con skill

2.4. Formulario web:
   - frontend/app/contact/page.tsx
   - Campos: nombre, email, teléfono, interés, presupuesto, urgencia, mensaje
   - POST a N8N_WEBHOOK_URL (variable de entorno)
   - Diseño: tono lujo, fondo oscuro, glassmorphism

2.5. n8n workflow:
   - Webhook trigger → Insert Supabase → HTTP Request backend → Update lead

2.6. Tests:
   - test_lead_intake.py: skill produce output válido
   - test_risk_scoring.py: 10 escenarios parametrizados
   - Test manual E2E: formulario → skill → DB → dashboard

FASE 3: Dashboard Bento Grid
──────────────────────────────

3.1. Layout Bento Grid (frontend/app/dashboard/page.tsx):
   - CSS Grid 6 columnas responsive
   - Glassmorphism CSS (product-spec-v0.md)

3.2. 6 Widgets (frontend/components/widgets/):
   - LeadsPulse (4x2): tabla leads con priority color-coded, status badges
   - TasksToday (2x2): lista tareas due_date ≤ hoy con checkbox
   - PropertyPipeline (2x2): mini-kanban (prospect → listed → sold)
   - QuickStats (2x1): leads/semana, tasa respuesta, mandatos activos
   - AgentStream (2x1): últimas 5 ejecuciones de agent_logs
   - QuickActions (2x1): botones "Nuevo Lead Manual", "Run Prospection", "Force Recap"

3.3. Supabase Realtime:
   - Suscripción a tabla leads (LeadsPulse actualiza en real-time)
   - Suscripción a tabla agent_logs (AgentStream actualiza)

3.4. Auth Supabase:
   - Login con magic link en /login
   - Middleware de protección de rutas
   - Redirect a /dashboard post-login

3.5. Zustand store con slices: leads, tasks, properties, agentLogs, stats

FASE 4: Prospección + Recap
──────────────────────────────

4.1. Skill prospection_weekly (backend/skills/prospection.py):
   - Input: zones, criteria
   - CSV loader para datos v0
   - Ranking algorithm
   - Copy de captación por propiedad (LLM)
   - PDF generation con reportlab
   - Upload a Supabase Storage

4.2. Skill recap_weekly (backend/skills/recap.py):
   - Query métricas semanales desde Supabase
   - Insights con LLM (Claude)
   - Email HTML template con Jinja2
   - Envío vía SMTP/SendGrid

4.3. n8n workflows cron:
   - prospection-weekly: domingos 18h → backend → email con PDF
   - recap-semanal: domingos 20h → backend → email HTML

4.4. Dashboard:
   - QuickActions conectados: botón "Run Prospection" y "Force Recap"
     llaman directamente al endpoint backend

FASE 5: Testing + Polish
──────────────────────────

5.1. Tests backend:
   - pytest para los 3 skills
   - pytest para risk_scoring (10 escenarios)
   - pytest para StateGraph (compila y ejecuta mock)

5.2. Tests frontend:
   - Jest para widgets críticos (LeadsPulse, TasksToday)
   - Smoke test manual completo (formulario → dashboard)

5.3. Polish:
   - Responsive testing (Chrome DevTools: mobile, tablet, desktop)
   - Error handling en todos los endpoints
   - Loading states en widgets
   - Toast notifications para acciones exitosas

═══════════════════════════════════════════════════════════
REGLAS CRÍTICAS
═══════════════════════════════════════════════════════════

- SINGLE-TENANT: org_id = 'anclora-private-estates' hardcoded en v0. No RLS.
- audit_log es INMUTABLE. REVOKE UPDATE, DELETE. Loguear toda ejecución de skill.
- NUNCA secrets en código. Todo en .env. Verificar con grep.
- Tipado estricto: Python mypy, TypeScript strict:true, sin `any`.
- LLM calls: GPT-4o-mini para resúmenes, Claude 3.5 Sonnet para copy de lujo.
- Moneda: EUR. Zona: Mallorca SW. Idioma UI: ES.
- Formulario de contacto: tono ultra-lujo (sofisticado, discreto, exclusivo).
- Dashboard: dark theme con glassmorphism. NO themes claros.
- priority_score: NUMERIC(3,2) en rango [0.0, 1.0]. priority: INTEGER 1-5.
- NO implementar: multitenancy, Stripe, MCP Docker, vLLM, Kill Switch, MFA.

═══════════════════════════════════════════════════════════
FORMATO DE ENTREGA
═══════════════════════════════════════════════════════════

Al completar cada Fase, genera un ARTIFACT walkthrough con:
1. Lista de archivos creados/modificados
2. Comando de verificación (pytest, npm run build, curl test)
3. Screenshot del estado funcional (usar browser si aplica)
4. Siguiente Fase lista

Si encuentras ambigüedad, busca primero en product-spec-v0.md. Si no se resuelve,
busca en spec.md. Si sigue sin resolverse, pregúntame ANTES de asumir.

Comienza por FASE 1. Usa Plan Mode. Lee los documentos AHORA.
```

---

## NOTAS PARA EL OPERADOR (Toni)

### Configuración Antigravity

| Setting | Valor |
|---|---|
| Mode | Agent-Driven Development |
| Terminal Policy | Auto |
| Review Policy | Agent Decides |
| Model | Gemini 3 Pro (Plan Mode) |
| Browser | Habilitado |

### Deny List de Terminal
```
rm -rf /
DROP DATABASE
DROP SCHEMA
TRUNCATE audit_log
DELETE FROM audit_log
```

### Preparar antes de ejecutar

1. **Crear proyecto Supabase** en supabase.com (plan gratuito, región eu-central-1)
2. **Obtener API keys**: OpenAI (GPT-4o-mini) y Anthropic (Claude 3.5 Sonnet)
3. **Crear cuenta Railway** para backend hosting
4. **Preparar .env** con todas las variables reales

### Si el agente se atasca

1. Si pide decisiones de principios/gobernanza: "Consulta constitution-canonical.md, Título X."
2. Si pide decisiones de producto/scope: "Consulta product-spec-v0.md, Sección X."
3. Si pide decisiones de arquitectura/código: "Consulta spec.md, Sección X."
4. Si genera multitenancy complejo: "v0 es single-tenant. org_id fijo. Sin RLS."
5. Si propone vLLM/Ollama: "v0 usa API providers. OpenAI + Anthropic."
6. Si genera Stripe/pagos: "No hay monetización en v0."
7. Si el dashboard no se ve lujo: "Dark theme, glassmorphism, tono Anclora Private Estates."
8. Si intenta modificar audit_log: "INMUTABLE. Constitution Título X. Rechazar."
9. Si no identifica output IA como tal: "Constitution Golden Rule: Transparencia. Corregir."

### Estrategia de agentes paralelos (Antigravity Manager View)

Si deseas acelerar:
- **Agent A:** Fase 1.2 (Supabase migrations)
- **Agent B:** Fase 1.1 + 1.3 (scaffolding backend/frontend)
- **Agent C:** Fase 3 (dashboard) — puede arrancar en paralelo al backend

NO paralelizar Fases 4-5 hasta que Fases 1-3 estén completas.

### Documento que falta: product-spec-v0.md

El archivo `product-spec-v0.md` es la Sección 3 del análisis adjunto (`analisis-nuevo-enfoque.md`).
Contiene: user stories, widgets, skills, modelo de datos, stack v0, StateGraph 7 nodos y roadmap.
Extraerlo como archivo independiente y colocarlo en el root del workspace junto a spec.md.
