# ESPECIFICACION TECNICA DE OPENCLAW — CANONICA

**Version:** 1.0.0
**Estado:** VIGENTE — Production Ready (Beta)
**Fecha:** Febrero 2026
**Clasificacion:** Internal / Confidential
**Owner:** System Architect & Engineering Team
**Mantenido por:** Toni (CTO, Anclora)
**Frecuencia de revision:** Bi-semanal (features), Mensual (arquitectura)
**Procedimiento de enmienda:** PR review + CTO approval
**Compliance:** GDPR + PCI-DSS + SOC 2 Type II readiness
**Documentos relacionados:**
- `constitution.md` — Constitucion Tecnica (norma suprema)
- API Reference Documentation
- Deployment Runbook
- Security Audit Reports

---

## INDICE

1. Resumen Ejecutivo
2. Vision, Alcance y No-Alcance
3. Glosario Tecnico
4. Actores y Roles
5. Principios Arquitectonicos
6. Arquitectura del Sistema (por Capas)
7. Stack Tecnologico (Versiones Fijadas)
8. Modelo de Datos (Entidades Clave y Relaciones)
9. Orquestacion Agentica (LangGraph)
10. Protocolo HITL y Flujos Monetarios
11. MCP, Skills y Sandboxing
12. Sistema de Colas y Concurrencia (Lanes)
13. Heartbeat y Monitorizacion de Agentes
14. Persistencia, Memoria Vectorial y RAG
15. Integracion de Pagos
16. n8n — Orquestacion de Workflows
17. Especificacion de API
18. Frontend — Dashboard Bento Grid
19. Catalogo de Skills Monetizables
20. Seguridad, Auditoria y Compliance
21. Infraestructura, Despliegue y CI/CD
22. Observabilidad, Metricas y Alertas
23. Backup, Disaster Recovery y SLA
24. Guia de Desarrollo
25. Roadmap de Implementacion
26. Requisitos No Funcionales
27. Checklist de Aceptacion / QA
28. Supuestos, Decisiones y Trade-Offs
29. Variables de Entorno
30. Metadatos del Documento

---

## 1. RESUMEN EJECUTIVO

### 1.1 Definicion del Producto

OpenClaw es un Sistema Operativo de Agentes Autonomos (Agentic Operating System) que orquesta inteligencias artificiales especializadas capaces de ejecutar tareas monetizables con supervision humana obligatoria (HITL — Human-in-the-Loop). Combina la autonomia de agentes cognitivos avanzados con controles de seguridad de nivel bancario para automatizar procesos complejos en multiples verticales: Real Estate, Ventas B2B, Legal, Supply Chain y Wealth Management.

### 1.2 Propuesta de Valor

| Dimension | Valor Entregado |
|---|---|
| Autonomia Controlada | Agentes que razonan, planifican y ejecutan tareas sin intervencion humana en operaciones de bajo riesgo, con aprobacion explicita obligatoria en transacciones monetarias |
| Monetizacion Verificable | Skills pre-configurados que generan ROI medible: 15-40% retorno en Real Estate, +45% pipeline en Ventas, 40h/operacion ahorro en Legal |
| Seguridad Nivel Bancario | Protocolo HITL de 6 pasos, RLS multi-tenant, sandboxing MCP, auditoria inmutable, cumplimiento OWASP Top 10 LLM 2025 |
| Open-Source First | Stack 100% open-source en nucleo. LLMs Llama 3.3 70B / Mistral Large 3 via vLLM. Fallback a cloud sin vendor lock-in |
| Transparencia Total | Dashboard Bento Grid con Thought-Stream en tiempo real, visibilidad completa del razonamiento del agente, logs inmutables |

### 1.3 Diferenciadores Clave

- HITL Nativo: El protocolo de aprobacion humana esta integrado en el nucleo del grafo LangGraph via `interrupt()`, no es un add-on.
- Constitutional AI: Validador constitucional como nodo obligatorio del grafo, evaluando CADA accion contra `constitution.md`.
- Multi-Tenant desde Dia 1: Aislamiento total por `org_id` con Row-Level Security en PostgreSQL.
- Skills Monetizables: Marketplace de agentes verticales con comision y revenue tracking integrado.

---

## 2. VISION, ALCANCE Y NO-ALCANCE

### 2.1 Vision

Construir la plataforma de referencia para agentes autonomos empresariales que opera bajo principios de supervision humana total durante la fase beta, evolucionando hacia autonomia calibrada conforme al historial verificado de rendimiento, sin vulnerar jamas las Reglas de Oro constitucionales.

### 2.2 Alcance (In-Scope)

- Plataforma SaaS multi-tenant con dashboard Bento Grid
- Orquestacion agentica con LangGraph (state machines, checkpointing, HITL gates)
- Protocolo HITL completo de 6 pasos conforme a Constitution Titulo IV
- Skills monetizables en verticales: Real Estate, B2B SDR, Legal, Supply Chain, Wealth
- Integracion de pagos (Stripe primary, Wise/SEPA secundario)
- Memoria vectorial RAG con pgvector
- MCP servers con sandboxing Docker
- Monitoring (Prometheus + Grafana) y alertas
- CI/CD con GitHub Actions
- n8n como orquestador de workflows complejos

### 2.3 No-Alcance (Out-of-Scope)

- Aplicacion movil nativa (MVP es web-first, responsive)
- Fine-tuning de modelos LLM con datos propios
- Soporte de idiomas mas alla de ES/EN en MVP
- Integraciones con sistemas legacy on-premise
- Funcionalidad offline
- Trading algoritmico o gestion automatica de inversiones
- Marketplace publico abierto (Phase 4+)

---

## 3. GLOSARIO TECNICO

| Termino | Definicion |
|---|---|
| **AOS** | Agentic Operating System — el concepto central de OpenClaw |
| **Bento Grid** | Layout de dashboard basado en CSS Grid 6x4 con widgets glassmorphism |
| **Constitutional Validator** | Nodo del grafo LangGraph que valida cada accion contra `constitution.md` |
| **Gateway** | Servidor WebSocket Node.js separado que enruta mensajes entre frontend y agent core |
| **HITL** | Human-in-the-Loop — protocolo de aprobacion humana de 6 pasos (Constitution Titulo IV) |
| **Kill Switch** | Mecanismo de detencion de emergencia con 4 niveles L1-L4. No admite desactivacion programatica (Constitution Titulo VII) |
| **Lane** | Canal de concurrencia con semaforo. 4 tipos: Session (serial), Global (4), Cron (2), Subagent (8) |
| **MCP** | Model Context Protocol (v2025-11-25) — estandar de comunicacion agente-herramienta |
| **Risk Score** | Valor numerico [0.0, 1.0] NUMERIC(3,2) calculado por algoritmo de Constitution Titulo V |
| **RLS** | Row-Level Security — politicas PostgreSQL que aislan datos por `org_id` |
| **Skill** | Agente vertical monetizable que se ejecuta en sandbox Docker via MCP |
| **Subagent** | Agente hijo delegado por el agente principal para tareas paralelas |
| **Ticket HITL** | Registro en `approval_tickets` que contiene una transaccion pendiente de aprobacion humana |

---

## 4. ACTORES Y ROLES

| Rol | Permisos | Aprobar TX | Kill Switch | Audit Logs |
|---|---|---|---|---|
| End User | CRUD sobre datos propios | Propias (bajo riesgo) | Solo propios agentes | Propios |
| Manager | Datos de su equipo | Equipo | Escalar | Equipo |
| Admin | Datos de la organizacion | Todas dentro de org | Si | Organizacion |
| Owner | Todos los datos | Todas + desbloqueo emergencia | Si (total) | Todos |
| CFO/Ejecutivo | Company-wide financiero | TX > EUR 5K | Escalar | Company |
| CTO | Todos los datos tecnicos | Todas | Si (total) | Todos |
| SOC/Security | Audit trail completo | No | Si | Todos |
| Auditor Externo | Compliance (read-only limitado) | No | No | Compliance |

Solo usuarios con rol `admin` u `owner` pueden aprobar tickets HITL (Constitution Art. 4.9). La asignacion de roles se gestiona via tabla `org_memberships` con politicas RLS.

---

## 5. PRINCIPIOS ARQUITECTONICOS

Estos principios derivan de la Constitucion Tecnica y son vinculantes para toda decision de implementacion:

1. **Supervision Humana Primero (Constitution Art. 2.2):** Toda transaccion monetaria requiere aprobacion humana explicita con MFA durante beta.
2. **Auditoria Inmutable (Constitution Art. 2.3):** Cada accion genera registro append-only con firma HMAC-SHA256.
3. **Degradacion Segura / Fail-Safe (Constitution Art. 2.4):** Ante anomalia, el sistema transita a estado seguro. Prohibido fail-open.
4. **Transparencia Radical (Constitution Art. 2.5):** El usuario tiene acceso en todo momento a la justificacion de cada decision agentica.
5. **Aislamiento Multi-Tenant (Constitution Art. 1.4):** Datos segregados por `org_id` con RLS. Cero contaminacion cross-tenant.
6. **Independencia Tecnologica (Constitution Art. 2.8):** Nucleo operativo en componentes open-source. Sin dependencia de APIs propietarias.
7. **Reversibilidad (Constitution Art. 1.3):** Priorizar acciones reversibles. Acciones irreversibles requieren HITL siempre.
8. **Minimo Privilegio:** Cada componente opera con los permisos minimos necesarios. MCP servers sin acceso a red por defecto.

---

## 6. ARQUITECTURA DEL SISTEMA (POR CAPAS)

### 6.1 Diagrama de Capas

```
+-------------------------------------------------------------------+
|                    CAPA DE PRESENTACION                            |
|        Next.js 15 (App Router) + Bento Grid Dashboard             |
|     Glassmorphism UI . WebSocket Realtime . shadcn/ui             |
+----------------------------+--------------------------------------+
                             | (WebSocket + REST API)
+----------------------------v--------------------------------------+
|                    CAPA DE AUTENTICACION                           |
|       Supabase Auth + RLS + MFA (TOTP/WebAuthn)                   |
|  OAuth Providers (Google, GitHub) . JWT (30min + 7day refresh)    |
+----------------------------+--------------------------------------+
                             | (Supabase Realtime + REST)
+----------------------------v--------------------------------------+
|                    CAPA DE ORQUESTACION                            |
|  +------------------------------------------------------------+  |
|  |  Gateway WebSocket Server (Node.js + TypeScript)            |  |
|  |  . Lane-based FIFO Queue (Session + Global)                 |  |
|  |  . Heartbeat Monitoring (60s interval, 5min timeout)        |  |
|  +------------------------------------------------------------+  |
|  +------------------------------------------------------------+  |
|  |  Agent Core (LangGraph + Python)                            |  |
|  |  . StateGraph (Planning > Validation > Execution)           |  |
|  |  . Constitutional Validator (limites + riesgo)              |  |
|  |  . HITL Gates (interrupt() + Command routing)               |  |
|  +------------------------------------------------------------+  |
|  +------------------------------------------------------------+  |
|  |  MCP Servers (Tool Registry + Skills)                       |  |
|  |  . Skill validation + sandboxing Docker                     |  |
|  +------------------------------------------------------------+  |
|  +------------------------------------------------------------+  |
|  |  n8n Workflow Engine (Self-Hosted)                           |  |
|  |  . HITL notifications + Payment post-processing + Cron      |  |
|  +------------------------------------------------------------+  |
+----------------------------+--------------------------------------+
                             | (LLM API calls)
+----------------------------v--------------------------------------+
|                    CAPA DE INTELIGENCIA                            |
|  +-------------------+  +-------------------+                     |
|  | Llama 3.3 70B     |  | Mistral Large 3   |                     |
|  | (vLLM primary)    |  | (vLLM secondary)  |                     |
|  +-------------------+  +-------------------+                     |
|  +-------------------+  +-------------------+                     |
|  | Ministral 3-14B   |  | text-emb-3-small  |                     |
|  | Triage rapido     |  | Vector embeddings |                     |
|  +-------------------+  +-------------------+                     |
+----------------------------+--------------------------------------+
                             | (PostgreSQL + Edge Functions)
+----------------------------v--------------------------------------+
|                    CAPA DE PERSISTENCIA                            |
|  Supabase PostgreSQL 15+ (RLS, pgvector, Realtime)                |
|  Supabase Edge Functions (Deno) — Payments, Audit, MFA            |
|  Supabase Storage + S3 — Documents, cold audit logs, backups      |
+-------------------------------------------------------------------+

```

### 6.2 Flujo de Ejecucion End-to-End

1. **Ingesta:** Usuario envia objetivo via Bento Grid Dashboard al WebSocket Gateway.
2. **Parsing:** Agent Router clasifica intent con Ministral 3-14B y selecciona StateGraph.
3. **Planificacion (Planner Node):** LangGraph descompone objetivo en sub-tareas.
4. **Validacion Constitucional (Constitutional Check Node):** Cada sub-tarea se valida contra Constitution + calculo de `risk_score` (Titulo V).
5. **Resolucion de Herramientas (Tool Selector Node):** MCP resuelve skills desde tabla `skills`.
6. **Evaluacion de Riesgo (Transaction Detector Node):** Ruteo condicional segun risk score. Beta: TODA transaccion pasa por HITL completo (Art. 1.1.1).
7. **HITL Gate:** `interrupt()` pausa ejecucion. Ticket en `approval_tickets`. Notificacion realtime.
8. **Ejecucion (Executor Node):** Skill ejecuta en sandbox Docker segun `sandbox_level`.
9. **Procesamiento de Pago:** Edge Function valida APPROVED + MFA. Stripe con idempotency.
10. **Persistencia:** Resultados en `tasks.output`, embeddings en `agent_memory`, logs en `audit_log`.
11. **Evaluacion (Result Evaluator):** SUCCESS (finaliza), PARTIAL (itera), FAILURE (replantea/escala).
12. **Feedback Loop:** Metricas actualizadas. Dashboard refresca widgets.

---

## 7. STACK TECNOLOGICO (VERSIONES FIJADAS)

| Componente | Tecnologia | Version | Justificacion |
|---|---|---|---|
| Frontend | Next.js (App Router) | 15.x | SSR, RSC, streaming, ecosystem React |
| UI Components | shadcn/ui + Tailwind CSS | latest + 3.x | Composable, accesible, customizable |
| Animaciones | Framer Motion | 11.x | Glassmorphism transitions |
| State Management | Zustand | 5.x | Lightweight, TypeScript-first |
| Runtime Frontend | Node.js | 20 LTS | Soporte ES2024, estabilidad |
| Agent Framework | LangGraph | 0.3+ | State machines, checkpointing, interrupt() |
| Agent Language | Python | 3.11+ | Type hints, asyncio, ecosystem ML |
| LLM Primary | Llama 3.3 70B Instruct | 3.3 | 128K context, JSON tool calling, open-source |
| LLM Secondary | Mistral Large 3 | 675B MoE | Vision + parallel tool calls, Apache 2.0 |
| LLM Triage | Ministral 3-14B | 14B | Clasificacion rapida de intents |
| LLM Serving | vLLM | 0.8+ | PagedAttention, tensor parallelism, OpenAI-compatible |
| LLM Cloud Fallback | Together AI / Groq | — | Fallback si self-hosted no disponible |
| LLM Ultimo Recurso | Anthropic Claude Sonnet | — | Ceiling de calidad. Solo si cloud falla |
| Tool Protocol | MCP | v2025-11-25 | Estandar emergente LLM-tool |
| Database | Supabase PostgreSQL | 15+ | RLS, Realtime, Edge Functions, pgvector |
| Vector DB | pgvector | 0.7+ | HNSW indexing, integrado en PostgreSQL |
| Embeddings | OpenAI text-embedding-3-small | — | 1536 dimensiones |
| Auth | Supabase Auth | — | JWT, MFA (TOTP/WebAuthn), OAuth, RLS |
| Payments Primary | Stripe | — | PCI-DSS, webhooks, idempotency |
| Payments Secondary | Wise + SEPA | — | Transferencias EU (Phase 3+) |
| Workflow Engine | n8n | 1.x self-hosted | 400+ integraciones, visual debugging |
| Monitoring | Prometheus + Grafana | — | Estandar de industria |
| Error Tracking | Sentry | — | Error boundaries, performance traces |
| Container Runtime | Docker | 24+ | Sandboxing MCP |
| Deployment Frontend | Vercel | — | Auto-deploy desde GitHub |
| Deployment Backend | GCP Cloud Run | — | Auto-scaling, europe-west1 |
| LLM Hosting | GKE | — | GPU support nativo (A100/H100) |
| Load Balancer | Cloudflare | — | DDoS, WAF, TLS 1.3, WebSocket |
| IaC | Terraform | — | Infraestructura reproducible |
| CI/CD | GitHub Actions | — | Integrado con GitHub |
| Object Storage | Supabase Storage + S3 | — | Documentos, audit logs frios |

**Cadena de fallback LLM:** vLLM self-hosted (5s timeout) > Together AI / Groq (10s) > Claude Sonnet (ultimo recurso).


---

## 8. MODELO DE DATOS (ENTIDADES CLAVE Y RELACIONES)

### 8.1 Extensiones PostgreSQL Requeridas

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

### 8.2 Tabla `organizations`

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free','pro','enterprise')),
    monthly_budget NUMERIC(12,2) DEFAULT 0,
    budget_spent NUMERIC(12,2) DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.3 Tabla `user_profiles`

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
    display_name TEXT,
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_method TEXT DEFAULT 'totp' CHECK (mfa_method IN ('totp','sms','email','webauthn')),
    biometric_enabled BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{"email":true,"push":true,"sms":false}',
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.4 Tabla `agents`

```sql
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'idle' CHECK (status IN ('idle','running','paused','error','killed')),
    config JSONB NOT NULL DEFAULT '{}',
    current_thread_id TEXT,
    total_tasks_completed INTEGER DEFAULT 0,
    total_money_saved NUMERIC(12,2) DEFAULT 0,
    total_money_spent NUMERIC(12,2) DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.5 Tabla `skills`

```sql
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),  -- NULL = skill global
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('real_estate','sales','legal','supply_chain','wealth','general','custom')),
    version TEXT DEFAULT '1.0.0',
    input_schema JSONB NOT NULL,
    output_schema JSONB,
    sandbox_level TEXT DEFAULT 'standard' CHECK (sandbox_level IN ('none','standard','strict')),
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low','medium','high','critical')),
    requires_hitl BOOLEAN DEFAULT false,
    estimated_cost NUMERIC(8,2) DEFAULT 0,
    transaction_limit_daily NUMERIC(12,2) DEFAULT 0,
    transaction_limit_monthly NUMERIC(12,2) DEFAULT 0,
    mcp_tools JSONB DEFAULT '[]',
    dependencies JSONB DEFAULT '[]',
    code_hash TEXT,  -- SHA256 for versioning
    approval_status TEXT DEFAULT 'DRAFT' CHECK (approval_status IN ('DRAFT','PENDING_REVIEW','APPROVED','DEPRECATED')),
    status TEXT DEFAULT 'active',
    deleted_at TIMESTAMPTZ,  -- Soft delete
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.6 Tabla `tasks`

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    agent_id UUID NOT NULL REFERENCES agents(id),
    skill_id UUID REFERENCES skills(id),
    thread_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending','planning','executing','awaiting_approval',
        'approved','rejected','completed','failed','cancelled'
    )),
    input JSONB NOT NULL,
    output JSONB,
    plan JSONB,
    error_message TEXT,
    risk_score NUMERIC(3,2),
    execution_time_ms INTEGER,
    tokens_used INTEGER DEFAULT 0,
    cost_eur NUMERIC(8,4) DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_org ON tasks(org_id);
CREATE INDEX idx_tasks_agent ON tasks(agent_id);
CREATE INDEX idx_tasks_status ON tasks(status);
```

### 8.7 Tabla `approval_tickets`

```sql
CREATE TABLE approval_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    task_id UUID NOT NULL REFERENCES tasks(id),
    agent_id UUID NOT NULL REFERENCES agents(id),
    status TEXT DEFAULT 'PENDING_USER' CHECK (status IN (
        'PENDING_USER','APPROVAL_MFA_SENT','APPROVED',
        'REJECTED','EXECUTING','COMPLETED','FAILED','EXPIRED','ESCALATED'
    )),
    transaction_type TEXT NOT NULL,
    transaction_data JSONB NOT NULL,
    amount NUMERIC(12,2),
    currency TEXT DEFAULT 'EUR',
    risk_score NUMERIC(3,2) NOT NULL,
    risk_factors JSONB DEFAULT '[]',
    justification TEXT,
    evidence_links TEXT[],
    requires_mfa BOOLEAN DEFAULT false,
    mfa_verified BOOLEAN DEFAULT false,
    mfa_verified_at TIMESTAMPTZ,
    mfa_attempts INTEGER DEFAULT 0,
    approved_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    decided_at TIMESTAMPTZ,
    executed_at TIMESTAMPTZ,
    execution_result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_approval_org_status ON approval_tickets(org_id, status);
CREATE INDEX idx_approval_expires ON approval_tickets(expires_at);
```

### 8.8 Tabla `audit_log` (Inmutable)

```sql
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    org_id UUID NOT NULL REFERENCES organizations(id),
    actor_type TEXT NOT NULL CHECK (actor_type IN ('agent','user','system')),
    actor_id UUID NOT NULL,
    action TEXT NOT NULL,                -- formato: recurso.verbo (ej: payment.executed)
    resource_type TEXT NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}',          -- amount, risk_score, state_hash, IP, HMAC signature
    ip_address INET,
    signature TEXT,                       -- HMAC-SHA256 (Constitution Art. 2.3)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Inmutabilidad: prohibir UPDATE y DELETE
CREATE POLICY "audit_no_update" ON audit_log FOR UPDATE USING (false);
CREATE POLICY "audit_no_delete" ON audit_log FOR DELETE USING (false);
REVOKE UPDATE, DELETE ON audit_log FROM authenticated, anon;

CREATE INDEX idx_audit_org ON audit_log(org_id);
CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
```

### 8.9 Tabla `agent_memory` (Vector Store)

```sql
CREATE TABLE agent_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    agent_id UUID NOT NULL REFERENCES agents(id),
    content TEXT NOT NULL,               -- cifrado at-rest
    metadata JSONB DEFAULT '{}',         -- source, tags, sensitivity_level, purpose
    embedding VECTOR(1536),
    memory_type TEXT DEFAULT 'episodic' CHECK (memory_type IN ('episodic','semantic','procedural')),
    importance_score NUMERIC(3,2) DEFAULT 0.5,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days'),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indice HNSW para busqueda semantica
CREATE INDEX ON agent_memory USING hnsw (embedding vector_cosine_ops) WITH (m=16, ef_construction=64);
CREATE INDEX idx_memory_org_agent ON agent_memory(org_id, agent_id);
```

### 8.10 Tabla `payment_transactions`

```sql
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    approval_ticket_id UUID REFERENCES approval_tickets(id),
    transaction_type TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED','REFUNDED')),
    payment_provider TEXT CHECK (payment_provider IN ('stripe','wise','sepa')),
    external_transaction_id TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    executed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tx_org ON payment_transactions(org_id, created_at DESC);
```

### 8.11 Tabla `incident_logs` (Kill Switch)

```sql
CREATE TABLE incident_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    incident_type TEXT NOT NULL CHECK (incident_type IN ('anomaly','security','manual','rate_limit','constitutional_violation')),
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('auto','manual')),
    severity TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
    kill_switch_level TEXT CHECK (kill_switch_level IN ('L1','L2','L3','L4')),
    reason TEXT,
    affected_agents JSONB,
    affected_tickets JSONB,
    recovery_started_at TIMESTAMPTZ,
    recovery_completed_at TIMESTAMPTZ,
    post_mortem TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.12 Tabla `constitutional_limits`

```sql
CREATE TABLE constitutional_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('lead_purchase','api_subscription','data_enrichment','transfer','general')),
    per_transaction_max NUMERIC(10,2),
    daily_max NUMERIC(10,2),
    weekly_max NUMERIC(10,2),
    monthly_max NUMERIC(10,2),
    require_approval BOOLEAN DEFAULT true,
    risk_score_threshold NUMERIC(3,2) DEFAULT 0.7,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_limits_org_action ON constitutional_limits(org_id, action_type);
```

### 8.13 Row-Level Security (RLS) Multi-Tenant

```sql
-- Funcion helper: obtener org_id del usuario actual
CREATE OR REPLACE FUNCTION get_user_org_id() RETURNS UUID AS $$
  SELECT org_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Habilitar RLS en todas las tablas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Politicas de aislamiento por organizacion
CREATE POLICY "org_isolation" ON agents FOR ALL TO authenticated
  USING (org_id = get_user_org_id());
CREATE POLICY "org_isolation" ON tasks FOR ALL TO authenticated
  USING (org_id = get_user_org_id());
CREATE POLICY "org_isolation" ON approval_tickets FOR ALL TO authenticated
  USING (org_id = get_user_org_id());
CREATE POLICY "audit_read" ON audit_log FOR SELECT TO authenticated
  USING (org_id = get_user_org_id());
CREATE POLICY "audit_insert" ON audit_log FOR INSERT TO service_role
  WITH CHECK (true);
CREATE POLICY "skills_visibility" ON skills FOR SELECT TO authenticated
  USING (org_id IS NULL OR org_id = get_user_org_id());
CREATE POLICY "memory_isolation" ON agent_memory FOR ALL TO authenticated
  USING (org_id = get_user_org_id());

-- Indices para performance RLS
CREATE INDEX idx_agents_org ON agents(org_id);
CREATE INDEX idx_approval_org ON approval_tickets(org_id);
```

---

## 9. ORQUESTACION AGENTICA (LangGraph)

### 9.1 State Schema

```python
class AgentState(TypedDict):
    messages: Sequence[BaseMessage]
    org_id: str
    user_id: str
    agent_id: str
    session_id: str
    thread_id: str
    skill_id: str
    current_task: str
    plan: list[dict]               # [{step, tool, status}]
    iteration: int                  # max 10 (Constitution Art. 8.1)
    max_iterations: int             # Default: 10
    tool_calls: list[dict]
    tool_results: list[dict]
    pending_approval: dict | None
    approval_ticket_id: str | None
    risk_score: float               # [0.0, 1.0]
    risk_factors: list[str]
    budget_remaining: dict          # {daily, weekly, monthly}
    cost_accumulated: float
    constitutional_violations: list[str]
    reasoning: str
    execution_log: list[dict]
    status: str                     # idle | running | waiting_approval | completed | failed | killed
    started_at: str
    completed_at: str | None
```

### 9.2 State Graph (Nodos y Edges)

```
[process_input] > [planner] > [constitutional_check] > (conditional)
                                                            |
                      +-------------------------------------+
                      |                                     |
                      v                                     v
              [tool_selector]                        [emergency_stop] > END
                      |
                      v
           [transaction_detector] > (conditional)
                  |           |            |
                  v           v            v
            [executor]  [human_approval]  [emergency_stop]
                  |           |
                  v           v
         [result_evaluator]  [payment_processor]
                  |                |
          (conditional)            |
           |         |             v
           v         v      [result_evaluator]
       [finalize]  [planner]       |
           |       (re-plan)   (conditional)
           v                   |         |
          END              [finalize]  [planner]
```

**Nodos (11 nodos):**

1. `process_input`: Carga contexto del usuario desde Supabase (limites, perfil, historial). Construye system prompt con reglas constitucionales. Inicializa budget_remaining.
2. `planner`: Invoca LLM (Llama 3.3 70B). Descompone objetivo en sub-tareas. Incrementa iteracion. Si iteracion >= max_iterations, finaliza.
3. `constitutional_check`: Valida cada sub-tarea contra `constitutional_limits`. Verifica presupuesto, permisos de skill, risk level. Si violation critica: ruta a `emergency_stop`.
4. `tool_selector`: Resuelve herramientas MCP desde tabla `skills`. Valida permisos y sandbox level.
5. `transaction_detector`: Detecta intenciones monetarias en tool_calls. Calcula risk_score (Constitution Titulo V). Ruteo condicional segun riesgo.
6. `human_approval`: Crea `approval_ticket` en Supabase. Usa `interrupt()` para pausar el grafo. Espera decision humana. Retorna `Command` con goto condicional.
7. `executor`: Ejecuta herramientas en sandbox Docker via MCP. Non-financial tools only.
8. `payment_processor`: Invoca Edge Function para pago post-aprobacion. Stripe con idempotency_key.
9. `result_evaluator`: Evalua si objetivo se cumplio. Decide: completed, re-plan, o escalar.
10. `finalize`: Persiste resultados en `tasks`, embeddings en `agent_memory`, logs en `audit_log`.
11. `emergency_stop`: Kill Switch inmediato. Status = 'killed'. Log en `incident_logs`.

**Edges condicionales:**

- `constitutional_check > tool_selector` si sin violaciones.
- `constitutional_check > emergency_stop` si violacion critica.
- `transaction_detector > executor` si no monetario.
- `transaction_detector > human_approval` si monetario (beta: SIEMPRE).
- `transaction_detector > emergency_stop` si violacion de limites.
- `result_evaluator > finalize` si status == 'completed'.
- `result_evaluator > planner` si status == 'running' (re-plan con ajustes).

### 9.3 HITL con interrupt()

```python
def request_human_approval(state: AgentState) -> Command[Literal["payment_processor", "planner"]]:
    transaction = state["pending_approval"]
    risk_score = state["risk_score"]

    approval = interrupt({
        "type": "transaction_approval",
        "ticket_id": state["approval_ticket_id"],
        "amount": transaction["amount"],
        "currency": transaction["currency"],
        "recipient": transaction["recipient"],
        "risk_score": risk_score,
        "risk_factors": state["risk_factors"],
        "budget_remaining": state["budget_remaining"],
        "requires_mfa": risk_score > 0.7 or transaction["amount"] > 500,
        "expires_at": (datetime.now() + timedelta(hours=24)).isoformat()
    })

    if approval.get("decision") == "approved":
        return Command(
            update={"pending_approval": {**transaction, "status": "APPROVED"}},
            goto="payment_processor"
        )
    return Command(
        update={"pending_approval": {**transaction, "status": "REJECTED"}},
        goto="planner"
    )
```

### 9.4 LLM Service (Multi-Provider)

| Provider | Modelo | Uso |
|---|---|---|
| vLLM (self-hosted/GKE) | Llama 3.3 70B | Primary — razonamiento |
| vLLM (self-hosted/GKE) | Mistral Large 3 675B MoE | Secondary — vision + parallel tools |
| vLLM (self-hosted/GKE) | Ministral 3-14B | Triage + clasificacion rapida |
| Together AI | Llama 3.3 | Cloud fallback si vLLM no disponible |
| Groq | Mistral | Cloud fallback |
| Anthropic | Claude Sonnet | Ultimo recurso. Ceiling de calidad |

**Seleccion automatica:** vLLM no responde en 5s > Together AI/Groq. Si cloud falla > Claude.

### 9.5 Checkpointing

```python
checkpointer = AsyncPostgresSaver.from_conn_string(SUPABASE_DB_URL)
app = graph.compile(checkpointer=checkpointer, interrupt_before=["human_approval"])
```

El checkpointing persiste el estado completo del grafo en PostgreSQL. Tras aprobacion HITL, el grafo se resume desde el checkpoint exacto con `Command` routing.

---

## 10. PROTOCOLO HITL Y FLUJOS MONETARIOS

El protocolo HITL se define en su totalidad en la Constitucion (Titulo IV). Esta seccion especifica su implementacion tecnica.

### 10.1 Los 6 Pasos (Constitution Art. 4.2)

1. **Deteccion:** Nodo `transaction_detector` analiza tool_calls buscando senales monetarias (palabras clave, MCP annotations, patrones de API).
2. **Validacion Constitucional:** `constitutional_check` verifica limites, permisos, horario, frecuencia.
3. **Generacion de Ticket:** Insert en `approval_tickets` con justificacion LLM, evidencia, risk score, expiracion 24h.
4. **Notificacion:** Supabase Realtime broadcast al widget Monetary Pulse + n8n workflow envia email/push/SMS.
5. **Verificacion MFA:** Segun risk score (Constitution Art. 4.8): < 0.3 click simple, 0.3-0.7 OTP, > 0.7 MFA completo. **Beta: MFA para todo.**
6. **Ejecucion:** Edge Function valida APPROVED + MFA + no expirado. Stripe con idempotency_key = ticket.id.

### 10.2 Estados del Ticket

```
PENDING_USER > APPROVAL_MFA_SENT > APPROVED > EXECUTING > COMPLETED
                                           |                  |
                                           v                  v
                                        FAILED             FAILED
PENDING_USER > REJECTED
PENDING_USER > EXPIRED (24h sin respuesta)
PENDING_USER > ESCALATED (sin respuesta en threshold configurado)
```

### 10.3 Expiracion y Escalacion

- **Timeout default:** 24 horas.
- **Cron de expiracion:** Cada 5 minutos, busca tickets con `expires_at < now()` y `status = 'PENDING_USER'`, marca como EXPIRED.
- **Escalacion:** Si no hay respuesta en 30 min, segundo recordatorio urgente. Si no hay respuesta en umbral configurable, escala a admin superior.

```sql
SELECT cron.schedule(
  'expire-approval-tickets',
  '*/5 * * * *',
  $$UPDATE approval_tickets SET status = 'EXPIRED'
    WHERE expires_at < now() AND status = 'PENDING_USER'$$
);
```

---

## 11. MCP, SKILLS Y SANDBOXING

### 11.1 Arquitectura MCP

Cada herramienta ejecuta en un contenedor Docker aislado con las siguientes restricciones (Constitution Art. 8.2):

| Restriccion | Valor |
|---|---|
| Red | Sin acceso por defecto. Whitelist explicita por skill |
| Filesystem | Read-only excepto `/tmp` |
| CPU | 1 core maximo |
| RAM | 512 MB maximo |
| Timeout | 30 segundos por invocacion (standard) / 10s (strict) |
| Privilegios | `no-new-privileges: true`, `cap_drop: ALL` |
| Usuario | Non-root (uid 1000) |

### 11.2 Niveles de Sandbox

| Nivel | Restricciones | Ejemplo |
|---|---|---|
| `none` | Ejecucion directa, solo lectura pura | Busqueda en memoria local |
| `standard` | Timeout 30s, network whitelist, sin filesystem write | API externa, scraping |
| `strict` | Timeout 10s, sin network, sin I/O | Calculos, transformaciones puras |

### 11.3 Docker Compose (MCP Servers)

```yaml
services:
  mcp-file-server:
    build: ./mcp-servers/files
    security_opt: ["no-new-privileges:true"]
    cap_drop: ["ALL"]
    read_only: true
    tmpfs: ["/tmp"]
    mem_limit: 512m
    cpus: 1
    networks: [mcp-isolated]

  mcp-web-search:
    build: ./mcp-servers/web-search
    security_opt: ["no-new-privileges:true"]
    cap_drop: ["ALL"]
    read_only: true
    mem_limit: 1g
    cpus: 2
    networks: [mcp-isolated, internet]  # Whitelist

networks:
  mcp-isolated:
    driver: bridge
    internal: true  # Sin conectividad externa
  internet:
    driver: bridge
```

### 11.4 Servidor MCP (TypeScript SDK)

```typescript
import { Server } from "@modelcontextprotocol/sdk/server";

const server = new Server({
  name: "openclaw-skills",
  version: "1.0.0",
  capabilities: {
    tools: { listChanged: true },
    resources: { subscribe: true }
  }
});

server.setRequestHandler("tools/list", async () => {
  const skills = await supabase.from("skills").select("*").eq("status", "active");
  return {
    tools: skills.data.map(skill => ({
      name: skill.slug,
      description: skill.description,
      inputSchema: skill.input_schema,
      annotations: {
        cost: skill.estimated_cost,
        risk_level: skill.risk_level,
        requires_approval: skill.requires_hitl
      }
    }))
  };
});

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  // Validacion constitucional ANTES de ejecucion
  const validation = await validateConstitutional(await resolveSkill(name), args);
  if (!validation.passed) {
    return { content: [{ type: "text", text: `BLOCKED: ${validation.reason}` }] };
  }
  return { content: [{ type: "text", text: JSON.stringify(await executeSandboxed(name, args)) }] };
});
```

---

## 12. SISTEMA DE COLAS Y CONCURRENCIA (LANES)

| Tipo de Lane | Proposito | Concurrencia Default |
|---|---|---|
| Session Lane | Cola FIFO por conversacion | 1 (serial) |
| Global Main Lane | Tareas de usuario cross-session | 4 |
| Cron Lane | Jobs recurrentes programados | 2 |
| Subagent Lane | Agentes hijos para delegacion paralela | 8 |

**Implementacion:** Semaforos anidados. Session lock (serial per-user) > Global lane slot (rate limit global). Garantiza que un usuario no bloquea a otros.

```typescript
class LaneQueue {
  private sessionQueues: Map<string, Semaphore> = new Map();
  private globalLane: Semaphore = new Semaphore(4);

  async enqueue(sessionId: string, task: Task) {
    const sessionQueue = this.getOrCreateQueue(sessionId);
    const sessionRelease = await sessionQueue.acquire();
    try {
      const globalRelease = await this.globalLane.acquire();
      try {
        await this.executeTask(task);
      } finally {
        globalRelease();
      }
    } finally {
      sessionRelease();
    }
  }
}
```

---

## 13. HEARTBEAT Y MONITORIZACION DE AGENTES

Cada agente envia senal heartbeat cada 60 segundos durante tareas long-running.

| Condicion | Accion |
|---|---|
| Sin actividad > 2 minutos | Alerta warning al dashboard |
| Sin actividad > 5 minutos | Kill Switch L2 (agente pausado) |

Canales de alerta configurables: Slack, Telegram, Discord. Deduplicacion de alertas en ventana de 24 horas.

**Timeout configurable por skill:** Skills de procesamiento pesado (data analysis) pueden configurar timeout extendido hasta 15 minutos, siempre que emitan heartbeat "thinking" messages cada 60 segundos.

---

## 14. PERSISTENCIA, MEMORIA VECTORIAL Y RAG

### 14.1 Funcion de Busqueda Semantica

```sql
CREATE OR REPLACE FUNCTION search_agent_memory(
    p_agent_id UUID,
    p_query_embedding VECTOR(1536),
    p_match_count INT DEFAULT 5,
    p_threshold FLOAT DEFAULT 0.7,
    p_memory_type TEXT DEFAULT NULL
) RETURNS TABLE (id UUID, content TEXT, metadata JSONB, similarity FLOAT, memory_type TEXT)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.content, m.metadata,
           1 - (m.embedding <=> p_query_embedding) AS similarity,
           m.memory_type
    FROM agent_memory m
    WHERE m.agent_id = p_agent_id
      AND m.org_id = get_user_org_id()
      AND (p_memory_type IS NULL OR m.memory_type = p_memory_type)
      AND 1 - (m.embedding <=> p_query_embedding) > p_threshold
    ORDER BY m.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;
```

### 14.2 Tipos de Memoria

| Tipo | Proposito | Ejemplo |
|---|---|---|
| `episodic` | Hechos de conversaciones pasadas | "El usuario prefirio la propiedad en Palma" |
| `semantic` | Conocimiento general del dominio | "Los precios en Mallorca subieron 12% en 2025" |
| `procedural` | Procedimientos aprendidos | "Para comprar leads en Apollo, primero filtrar por industry" |

### 14.3 Limpieza GDPR

```sql
SELECT cron.schedule(
  'delete-expired-memories',
  '0 2 * * *',  -- Diario a las 02:00 UTC
  $$DELETE FROM agent_memory WHERE expires_at < NOW()$$
);
```

PII se redacta ANTES de vectorizacion. Los embeddings nunca contienen datos personales en crudo. Retencion default: 90 dias (configurable por org).

---

## 15. INTEGRACION DE PAGOS

### 15.1 Stripe (Primary)

**Flujo:**
1. Edge Function recibe `approval_ticket_id` aprobado.
2. Verifica: ticket en estado APPROVED, MFA verificado, ticket no expirado.
3. Marca ticket como EXECUTING.
4. Crea `PaymentIntent` en Stripe con `idempotency_key = ticket.id`.
5. Amount en centimos: `Math.round(ticket.amount * 100)`.
6. Metadata: `{approval_ticket_id, skill_id, org_id}`.
7. Si exito: status COMPLETED, registra en `payment_transactions`, deduce presupuesto via `deduct_budget`, audit log.
8. Si fallo: 3 reintentos con backoff exponencial. Si todos fallan: status FAILED, rollback, notificacion.

### 15.2 Webhook Handling

```
POST /webhooks/stripe
  > Validar firma Stripe (stripe-signature header)
  > Si payment_intent.succeeded:
      > Actualizar approval_ticket > COMPLETED
      > Registrar en payment_transactions
      > Resumir LangGraph desde checkpoint
  > Si payment_intent.failed:
      > Actualizar approval_ticket > FAILED
      > Notificar usuario
```

### 15.3 Idempotencia

La `idempotency_key` es el `approval_ticket_id`, garantizando que una re-ejecucion no duplica el pago. Stripe rechaza automaticamente PaymentIntents duplicados con la misma key.


---

## 16. n8n — ORQUESTACION DE WORKFLOWS

### 16.1 Arquitectura de Integracion

n8n se despliega self-hosted en entorno privado. Acceso exclusivo via autenticacion API desde OpenClaw server. Los flujos se exponen como webhooks que el LangGraph invoca via MCP.

### 16.2 Workflows Criticos

| Workflow | Trigger | Accion | Frecuencia |
|---|---|---|---|
| HITL Notification | Webhook desde LangGraph | Push + email con ticket pendiente via Supabase + SendGrid | Real-time |
| Payment Execution | Post-aprobacion (APPROVED) | Stripe API via Edge Function, audit_log | Real-time |
| Skill Scheduler | Cron expression | Skills recurrentes (Sentinel cada 6h, audits mensuales) | Configurable |
| Audit Aggregation | Supabase Realtime | Metricas ROI al Dashboard en tiempo real | Real-time |
| Alert Escalation | Threshold breach | Escalacion automatica si sin respuesta en timeout configurado | 30min, 1h, 6h |


---

## 17. ESPECIFICACION DE API

### 17.1 REST API

**Base URL:** `https://api.openclaw.ai/v1`

**Auth:** Todas las rutas requieren `Authorization: Bearer <jwt>` salvo las marcadas como publicas.

| Endpoint | Method | Descripcion | Auth Level |
|---|---|---|---|
| `/auth/register` | POST | Registro de usuario | Publico |
| `/auth/login` | POST | Login (retorna JWT + MFA flag) | Publico |
| `/auth/mfa/verify` | POST | Verificacion MFA | Publico |
| `/auth/logout` | POST | Logout | Authenticated |
| `/agents` | GET | Listar agentes del usuario | User |
| `/agents` | POST | Crear nuevo agente | Admin |
| `/agents/:id` | GET | Detalle de agente | User |
| `/agents/:id` | PATCH | Actualizar configuracion | Admin |
| `/agents/:id` | DELETE | Terminar agente | Owner |
| `/agents/:skill_id/execute` | POST | Ejecutar agente con skill | User |
| `/agents/kill-switch` | POST | Activar Kill Switch | Admin+ |
| `/approvals?status=PENDING_USER` | GET | Tickets pendientes | User |
| `/approvals/:id/approve` | POST | Aprobar (requiere MFA) | Admin+ |
| `/approvals/:id/reject` | POST | Rechazar | User |
| `/skills` | GET | Listar skills | User |
| `/skills` | POST | Crear skill | User |
| `/skills/:id` | PUT | Actualizar skill | User |
| `/limits` | GET | Obtener limites constitucionales | User |
| `/limits` | PUT | Actualizar limites | POWER_USER |
| `/memory/chunks` | POST | Ingestar documento en RAG | User |
| `/memory/search` | GET | Busqueda semantica | User |
| `/transactions` | GET | Historial de transacciones | User |
| `/transactions/:id` | GET | Detalle + audit log | User |
| `/audit-logs` | GET | Logs de auditoria | Admin+ |
| `/sessions/:id/history` | GET | Historial de conversacion | User |

### 17.2 WebSocket API

**Conexion:** `wss://gateway.openclaw.ai/v1/connect`

**Mensajes Server > Client:**

| Tipo | Payload | Descripcion |
|---|---|---|
| `agent_state` | `{iteration, reasoning, tool_calls, status}` | Estado en tiempo real del agente |
| `tool_result` | `{tool, result, execution_time_ms}` | Resultado de ejecucion de herramienta |
| `approval_required` | `{ticket_id, type, amount, justification, risk_score}` | Ticket HITL pendiente |
| `execution_completed` | `{status, output, tokens_used}` | Ejecucion finalizada |
| `agent_response` | `{session_id, chunk, is_final}` | Streaming de respuesta |

**Mensajes Client > Server:**

| Tipo | Payload | Descripcion |
|---|---|---|
| `AUTH` | `{jwt}` | Autenticacion inicial |
| `USER_MESSAGE` | `{session_id, content, attachments?}` | Mensaje del usuario |
| `pause` | `{}` | Pausar agente |


---

## 18. FRONTEND — DASHBOARD BENTO GRID

### 18.1 Project Structure

```
openclaw-frontend/
+-- app/
|   +-- layout.tsx
|   +-- page.tsx (dashboard root)
|   +-- auth/ (login, mfa, setup)
|   +-- dashboard/ (layout + bento-grid)
|   +-- skills/ ([skill-id]/editor, lab)
|   +-- api/ (auth routes, approvals, webhooks)
+-- components/
|   +-- widgets/ (AgentThoughtStream, MonetaryPulse, EfficiencySavings,
|   |             SkillLab, MemoryNavigator, KillSwitch)
|   +-- ui/ (shadcn/ui components)
|   +-- common/ (Header, Navigation, ErrorBoundary)
+-- lib/
|   +-- api/ (axios client, approvals, agents)
|   +-- hooks/ (useAuth, useApprovals, useAgent)
|   +-- store/ (Zustand appStore)
|   +-- utils/ (formatCurrency, calculateRiskScore)
+-- styles/ (globals.css, bento-grid.css)
```

### 18.2 Layout del Bento Grid

```
6 columnas x 4 filas (responsive: 1-col mobile, 2-col tablet, 6-col desktop)

+------------------------------+  +------------------+
|  Agent Thought-Stream        |  |  Monetary Pulse  |
|  (4 col x 2 rows)           |  |  (2 col x 2 rows)|
+------------------------------+  +------------------+
+------------------+  +------------------+  +--------+
| Efficiency &     |  | Skill Lab        |  |Memory  |
| Savings (2x1)    |  | (2 col x 2 rows) |  |Nav(2x1)|
+------------------+  +------------------+  +--------+
                                            +--------+
                                            |Kill-Sw.|
                                            | (1x1)  |
                                            +--------+
```

### 18.3 Widgets

| Widget | Grid Size | Datos en Tiempo Real | Fuente |
|---|---|---|---|
| Agent Thought-Stream | 4x2 | Reasoning, tool calls, iteration progress, status | WebSocket `agent_state` |
| Monetary Pulse | 2x2 | Budget bars, pending approvals, Approve/Reject buttons | Supabase Realtime `approval_tickets` |
| Efficiency & Savings | 2x1 | ROI estimado, horas ahorradas, costos optimizados | REST `/analytics` |
| Skill Lab | 2x2 | Lista de skills, editor, estado de aprobacion | REST `/skills` |
| Memory Navigator | 2x1 | Busqueda semantica, chunks recientes | REST `/memory/search` |
| Kill Switch | 1x1 | Boton rojo con confirmacion doble + MFA. Borde pulsante si incidente activo | REST `/agents/kill-switch` |

### 18.4 Glassmorphism CSS

```css
.glassmorphism {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(15px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
}
.glassmorphism:hover {
  background: rgba(17, 24, 39, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}
.glassmorphism.processing {
  border-image: linear-gradient(45deg, #3b82f6, #8b5cf6, #3b82f6) 1;
  animation: borderGradient 3s linear infinite;
}
```


---

## 19. CATALOGO DE SKILLS MONETIZABLES

### 19.1 Real Estate

| Skill | MCP Tools | Limite Diario | Limite Mensual | Revenue Model |
|---|---|---|---|---|
| Sniper de Oportunidades | zillow_api, mls_search, property_valuation, roi_calculator | EUR 10,000 | EUR 50,000 | EUR 500/mes + 5% deal value |
| Property Management Sentinel | expense_tracking, vendor_price_comparison, payment_automation | EUR 5,000 | EUR 30,000 | 20% de costos reducidos |
| Inversionista Predictivo | market_analysis, financial_modeling | EUR 0 | EUR 0 | Solo analisis |
| Lead Qualifier | lead_scoring, crm_enrichment | N/A | N/A | +35% conversion |
| Contract Analyzer | contract_analysis, compliance_check | N/A | N/A | EUR 500-2K/contrato |

### 19.2 B2B SDR

| Skill | MCP Tools | Limite Diario | Limite Mensual | Revenue Model |
|---|---|---|---|---|
| SDR Autonomo | lead_providers, smtp_send, hubspot_integration, personalization | EUR 2,000 | EUR 20,000 | EUR 0.50/lead + EUR 5/qualified |
| Meeting Prep | calendar_api, crm_lookup, news_search | N/A | N/A | 2h/reunion ahorro |
| CRM Enrichment | apollo_api, clearbit, hunter | N/A | N/A | +60% data completeness |
| Legal Auditor | contract_analysis, compliance_check | EUR 0 | EUR 0 | Solo analisis |

### 19.3 Verticales Adicionales

| Skill | Vertical | Risk | HITL | ROI Estimado |
|---|---|---|---|---|
| Legal Document Auditor | Legal | High | Si | EUR 200-500/hora |
| Compliance Monitor | Legal | Medium | No | Prevencion multas |
| Due Diligence Automator | Legal | High | Si | 40h/operacion |
| Supply Chain Oracle | Supply Chain | Medium | No | -15% disrupciones |
| Inventory Optimizer | Supply Chain | Medium | Si | -20% stock muerto |
| Wealth Advisor | Wealth | Critical | Si (siempre) | 24/7 advisory |
| Tax Optimizer | Wealth | High | Si | 5-15% ahorro fiscal |
| Expense Categorizer | Wealth | Low | No | 10h/mes |

### 19.4 Marketplace (Terceros)

| Parametro | Valor |
|---|---|
| Comision Anclora | 20% del revenue generado |
| Pago a creators | Mensual via Wise (80%) |
| Sandbox obligatorio | Nivel `strict` |
| Revocacion automatica | Risk score promedio > 0.80 durante 30 dias |
| Failure rate maximo | 10% en 30 dias (si supera: deprecated) |


---

## 20. SEGURIDAD, AUDITORIA Y COMPLIANCE

### 20.1 Cifrado

| Capa | Estandar |
|---|---|
| En transito | TLS 1.3 minimo. mTLS entre servicios internos |
| En reposo | AES-256-GCM para campos PII. Transparent encryption Supabase |
| Gestion de claves | Supabase Vault. Rotacion: master keys 90 dias, API keys 180 dias |
| Embeddings | PII redactada antes de vectorizacion |
| Backups | Cifrado en disco (server-side encryption) |

### 20.2 OWASP LLM Top 10 2025

| OWASP LLM Risk | Mitigacion OpenClaw |
|---|---|
| LLM01: Prompt Injection | Input sanitization pre-LLM con regex + XML delimiters + output validation |
| LLM02: Sensitive Info Disclosure | PII redaction con `redact_pii()`, RLS isolation, log sanitization |
| LLM03: Supply Chain | Modelos verificados con SHA256, SBOM, checksum validation |
| LLM04: Data/Model Poisoning | Embeddings solo de fuentes verificadas, source whitelisting |
| LLM05: Improper Output | Typed MCP schemas, JSON schema validation, `sanitize_html()` |
| LLM06: Excessive Agency | HITL obligatorio, budget caps, Kill-Switch, constitutional validation |
| LLM07: System Prompt Leakage | Prompts en Supabase (no hardcoded), no secrets en prompts |
| LLM08: Vector/Embedding Weakness | pgvector HNSW cosine, dimensionality validation, rate limiting |
| LLM09: Misinformation | Confidence metadata, source citations, disclaimers |
| LLM10: Unbounded Consumption | Rate limiting por org, token budgets, skill timeouts, iteration limits |

### 20.3 Rate Limiting (Upstash Redis)

| Recurso | Limite | Ventana |
|---|---|---|
| API calls | 100 | por minuto por org |
| LLM calls | 50 | por minuto por org |
| Vector search | 200 | por minuto por org |
| Approval create | 10 | por minuto por org |

### 20.4 Input Sanitization

```python
import re, html, hmac, hashlib

def sanitize_user_input(user_message: str) -> str:
    dangerous_patterns = [
        r'ignore previous instructions',
        r'disregard above',
        r'you are now',
        r'system:',
        r'<\|system\|>',
        r'<\|assistant\|>',
    ]
    for pattern in dangerous_patterns:
        user_message = re.sub(pattern, '[REDACTED]', user_message, flags=re.IGNORECASE)
    user_message = html.escape(user_message)
    return f"<user_message>{user_message}</user_message>"

def redact_pii(text: str) -> str:
    """Redacta PII antes de vectorizacion."""
    patterns = {
        r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b': '[EMAIL]',
        r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b': '[PHONE]',
        r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b': '[CREDIT_CARD]',
        r'\b\d{3}-\d{2}-\d{4}\b': '[SSN]',
    }
    for pattern, replacement in patterns.items():
        text = re.sub(pattern, replacement, text)
    return text
```

### 20.5 Audit Logging con HMAC-SHA256

```python
async def log_audit(org_id, actor_type, actor_id, action, resource_type, details):
    timestamp = datetime.utcnow().isoformat()
    message = f"{actor_id}||{action}||{timestamp}||{json.dumps(details)}"
    signature = hmac.new(
        os.getenv("AUDIT_SECRET_KEY").encode(), message.encode(), hashlib.sha256
    ).hexdigest()
    await supabase.table("audit_log").insert({
        "org_id": org_id, "actor_type": actor_type, "actor_id": actor_id,
        "action": action, "resource_type": resource_type,
        "details": {**details, "signature": signature}
    }).execute()
```

### 20.6 Verificacion de Integridad de Audit Log

```python
async def verify_audit_log(entry: dict) -> bool:
    """Verifica que un registro de audit no ha sido manipulado."""
    details = entry["details"]
    signature = details.pop("signature", None)
    if not signature:
        return False
    message = f"{entry['actor_id']}||{entry['action']}||{entry['created_at']}||{json.dumps(details)}"
    expected = hmac.new(
        os.getenv("AUDIT_SECRET_KEY").encode(), message.encode(), hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)
```

### 20.7 Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 20.8 Runbook: SQL Injection Detectada

1. **0-5 min:** Kill Switch automatico. Aislar conexiones DB afectadas.
2. **5-10 min:** PagerDuty a CTO + SOC. Slack #security-incidents.
3. **5-30 min:** Pull query logs de Supabase audit.
4. **30 min-2h:** Verificar exfiltracion. Parche en staging, code review, deploy produccion.
5. **2-24h:** Notificar usuarios afectados. GDPR breach assessment. Post-mortem.


---

## 21. INFRAESTRUCTURA, DESPLIEGUE Y CI/CD

### 21.1 Componentes de Infraestructura

| Componente | Servicio | Config |
|---|---|---|
| Frontend | Vercel | Auto-deploy desde `main`, preview deployments desde PR |
| Database | Supabase PostgreSQL | 2 vCPU, 8 GB RAM, eu-central-1, connection pooling |
| Agent Core | GCP Cloud Run | Auto-scaling 0-10, europe-west1, 2 vCPU, 4Gi RAM |
| LLM Serving | GKE | 2 replicas Llama 3.3: A100 GPU, 8Gi RAM, 4 CPU |
| MCP Servers | Docker (Cloud Run) | Isolated networking, per-skill containers |
| Load Balancer | Cloudflare | DDoS protection, WAF rules, WebSocket proxying |
| Object Storage | Supabase Storage + S3 | Documentos, audit frios, backups |
| Workflow Engine | n8n (self-hosted) | Docker Compose, persistent volume |
| Monitoring | Prometheus + Grafana | Cloud Run sidecar + Grafana Cloud |

### 21.2 CI/CD Pipeline (GitHub Actions)

```yaml
name: OpenClaw CI/CD
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Python Tests
        run: |
          pip install -r requirements.txt
          pytest --cov=backend --cov-report=xml -v
      - name: TypeScript Tests
        run: |
          cd frontend && npm ci && npm test
      - name: Security Scan (Trivy)
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'
          exit-code: '1'

  security:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: OWASP ZAP Scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: ${{ secrets.STAGING_URL }}
      - name: Container Scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: 'openclaw-agent:latest'
          severity: 'CRITICAL,HIGH'

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: [test, security]
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Frontend (Vercel)
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Backend (Cloud Run)
        run: |
          gcloud run deploy openclaw-agent \
            --image gcr.io/$PROJECT_ID/openclaw-agent:$GITHUB_SHA \
            --region europe-west1 \
            --platform managed
      - name: Run Supabase Migrations
        run: supabase db push --linked

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [test, security]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy Frontend
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy Backend
        run: |
          gcloud run deploy openclaw-agent \
            --image gcr.io/$PROJECT_ID/openclaw-agent:$GITHUB_SHA \
            --region europe-west1 \
            --platform managed \
            --no-traffic
          gcloud run services update-traffic openclaw-agent \
            --to-latest --region europe-west1
      - name: Smoke Tests
        run: npm run test:smoke -- --target=$PRODUCTION_URL
```

### 21.3 Infrastructure as Code (Terraform)

Terraform gestiona: Vercel project, Supabase project, GCP Cloud Run services, GKE cluster, networking (VPC, firewall rules), secrets (GCP Secret Manager).

Estructura:
```
infrastructure/
+-- terraform/
|   +-- main.tf
|   +-- variables.tf
|   +-- outputs.tf
|   +-- modules/
|       +-- vercel/
|       +-- supabase/
|       +-- gcp/
|       +-- networking/
|       +-- secrets/
```


---

## 22. OBSERVABILIDAD, METRICAS Y ALERTAS

### 22.1 Metricas Prometheus

| Metrica | Tipo | Descripcion |
|---|---|---|
| `openclaw_active_sessions` | Gauge | Sesiones de agente activas |
| `openclaw_token_consumption_total` | Counter | Tokens LLM consumidos (por modelo, org) |
| `openclaw_approval_queue_size` | Gauge | Tickets HITL pendientes |
| `openclaw_tool_call_duration_seconds` | Histogram | Latencia de ejecucion de herramientas MCP |
| `openclaw_error_rate` | Counter | Errores por tipo (4xx, 5xx, timeout) |
| `openclaw_budget_burn_rate` | Gauge | Velocidad de consumo presupuestario por org |

### 22.2 Dashboards Grafana

| Dashboard | Metricas Clave |
|---|---|
| Agent Health | Sessions activas, iteration rate, error rate, kill switch events |
| Financial Monitoring | Budget burn rate, transaction volume, approval latency |
| LLM Usage | Tokens por modelo, latencia P50/P95/P99, fallback rate |
| System Resources | CPU, memory, disk, network por servicio |
| Security Events | Failed auth attempts, constitutional violations, rate limit hits |

### 22.3 Alertas

| Alerta | Condicion | Canal | Severidad |
|---|---|---|---|
| High Error Rate | Error rate > 5% en 5 min | Slack + PagerDuty | Critical |
| Budget Near Limit | Budget > 80% consumed | Email + Push | Warning |
| HITL Queue Backlog | > 10 tickets pendientes > 30 min | Slack | Warning |
| Agent Stuck | Sin heartbeat > 5 min | Slack + SMS | High |
| Kill Switch Activated | Cualquier activacion | PagerDuty + SMS + Email | Critical |
| Constitutional Violation | Cualquier violacion detectada | PagerDuty + Slack | Critical |


---

## 23. BACKUP, DISASTER RECOVERY Y SLA

### 23.1 Estrategia de Backup

| Tipo | Frecuencia | Retencion | Metodo |
|---|---|---|---|
| Supabase Automated | Diario | 30 dias | Supabase built-in |
| Point-in-Time Recovery (PITR) | Continuo | 7 dias WAL | Supabase PITR |
| Manual (pre-migracion) | Bajo demanda | Indefinida | `pg_dump` cifrado a S3 |
| Config & Secrets | En cada cambio | Git history + Vault | Git encrypted + Supabase Vault |

### 23.2 Objetivos de Recuperacion

| Metrica | Objetivo |
|---|---|
| RTO (Recovery Time Objective) | < 1 hora |
| RPO (Recovery Point Objective) | < 15 minutos |

### 23.3 Procedimiento de Recuperacion

1. Identificar punto de fallo y ultimo backup valido.
2. Restaurar base de datos desde PITR o backup diario.
3. Verificar integridad de `audit_log` (HMAC signatures).
4. Restaurar servicios en orden: DB > Auth > Agent Core > Frontend.
5. Ejecutar smoke tests automatizados.
6. Notificar stakeholders. Post-mortem en 24h.


---

## 24. GUIA DE DESARROLLO

### 24.1 Estructura del Proyecto

```
openclaw/
+-- app/                    # Next.js 15 frontend (App Router)
+-- components/             # React components (widgets, ui, common)
+-- lib/                    # Frontend utilities (api, hooks, store)
+-- styles/                 # CSS (globals, bento-grid, glassmorphism)
+-- backend/                # Python agent core
|   +-- agents/             # LangGraph definitions
|   +-- tools/              # MCP tool implementations
|   +-- services/           # LLM, payment, audit services
|   +-- models/             # Pydantic models
+-- supabase/
|   +-- migrations/         # SQL migrations (ordered)
|   +-- functions/          # Edge Functions (Deno/TypeScript)
|   +-- seed.sql            # Development seed data
+-- mcp-servers/            # Docker-based MCP tool servers
+-- n8n/workflows/          # n8n workflow JSON exports
+-- infrastructure/         # Terraform, Docker Compose
+-- .github/workflows/      # CI/CD pipelines
+-- tests/
|   +-- unit/
|   +-- integration/
|   +-- load/
|   +-- security/
+-- docs/                   # Architecture docs, runbooks
```

### 24.2 Code Style

| Lenguaje | Estandar | Herramienta |
|---|---|---|
| Python | PEP 8, `mypy --strict` | Black + isort + Ruff + mypy |
| TypeScript | ESLint + Prettier, `strict: true`, no `any` | ESLint + Prettier |
| SQL | Queries parametrizadas siempre. RLS habilitado en todas las tablas | pgTAP para tests |

### 24.3 Testing

| Tipo | Cobertura Minima | Herramienta |
|---|---|---|
| Unit Tests | > 80% | pytest (Python), Jest (TypeScript) |
| Integration Tests | RLS policies, HITL E2E, payment flow | pgTAP, Playwright |
| Load Tests | 1000 WebSocket concurrentes | k6 |
| Security Tests | OWASP ZAP sin Critical/High findings | ZAP, Trivy |

### 24.4 Mejores Practicas de Seguridad

1. Queries SQL siempre parametrizadas. Jamas concatenacion de strings.
2. JWT validado en cada request. Access token 30 min, refresh 7 dias. httpOnly cookies.
3. Rate limiting en todos los endpoints publicos.
4. Secrets exclusivamente en variables de entorno o Supabase Vault. Jamas en codigo.
5. Logs nunca contienen PII, tokens ni secrets.
6. Error messages genericos al usuario. Detalles solo en logs internos.
7. Dependency scanning semanal con Dependabot + Trivy.


---

## 25. ROADMAP DE IMPLEMENTACION

### Phase 0 — Foundation (M0, Semanas 1-4)

- Repositorio monorepo, CI/CD basico, linting
- Supabase project: schema inicial, RLS policies, Edge Functions skeleton
- Next.js 15 boilerplate con shadcn/ui
- Autenticacion Supabase Auth + MFA
- Docker Compose para desarrollo local

### Phase 1 — Core Agent (M1-M2)

- LangGraph StateGraph con nodos: planner, constitutional_check, tool_selector, executor, finalize
- Gateway WebSocket server
- Lane-based queue system
- Heartbeat monitoring
- MCP server skeleton con 2 herramientas demo
- Bento Grid dashboard con 3 widgets (Thought-Stream, Kill Switch, Efficiency)
- Audit log inmutable con HMAC

### Phase 2 — Real Estate MVP (M3-M4)

- Skills: Sniper de Oportunidades, Property Management Sentinel, Inversionista Predictivo
- HITL completo: approval_tickets, Monetary Pulse widget, notificaciones n8n
- Stripe integration + Edge Function payment processor
- pgvector + RAG memory
- Constitutional limits enforcement

### Phase 3 — B2B SDR (M5-M6)

- Skills: SDR Autonomo, Meeting Prep, CRM Enrichment
- HubSpot + Apollo integrations via MCP
- Email sending con SendGrid
- Performance dashboards

### Phase 4 — Marketplace (M7-M9)

- SDK para third-party skill development
- Sandbox enforcement (strict obligatorio)
- Commission tracking (20%)
- Skill approval workflow
- Wise integration para pagos a creators

### Phase 5 — Scale & Polish (M10-M12)

- Multi-region deployment (EU + US)
- Advanced analytics y ML-based risk scoring
- SOC 2 Type II audit preparation
- Performance optimization (P95 < 2s)
- Onboarding automatizado


---

## 26. REQUISITOS NO FUNCIONALES

| Requisito | Metrica | Objetivo |
|---|---|---|
| Latencia API | P95 response time | < 2 segundos |
| Disponibilidad | Uptime mensual | 99.9% |
| Throughput WebSocket | Conexiones concurrentes | 1,000 simultaneas |
| Throughput API | Requests por segundo | 500 rps |
| HITL Notification | Tiempo desde creacion de ticket hasta notificacion | < 3 segundos |
| Audit Log Write | Tiempo de escritura | < 100 ms |
| Vector Search | Latencia de busqueda semantica | < 500 ms |
| Kill Switch | Tiempo desde activacion hasta detencion total | < 5 segundos |
| GDPR Export | Tiempo para generar export completo de datos de usuario | < 30 minutos |
| Memory Recall | Precision de recuperacion semantica relevante | > 85% |
| Budget Compliance | Transacciones que respetan limites presupuestarios | 100% |
| Security Incidents | Incidentes de seguridad criticos por mes | 0 |
| Test Coverage | Unit test coverage | > 80% |
| False Positive Rate | Tickets HITL innecesarios | < 5% |

---

## 27. CHECKLIST DE ACEPTACION / QA

Cada item debe ser verificado antes de release a produccion:

| # | Criterio | Verificacion |
|---|---|---|
| 1 | RLS testeado: usuario A no ve datos de org B | pgTAP + test manual |
| 2 | `audit_log` inmutable: UPDATE y DELETE bloqueados | pgTAP + intentos de modificacion |
| 3 | HITL E2E: creacion ticket > notificacion < 3s > aprobacion > ejecucion > audit | Playwright E2E |
| 4 | Kill Switch L1-L4: agente se detiene en < 5s | Test automatizado |
| 5 | Risk scoring: 20 escenarios pre-definidos con resultados esperados | pytest parametrizado |
| 6 | MFA enforcement: transaccion > EUR 500 requiere MFA | Test E2E |
| 7 | Stripe idempotency: doble-click no duplica pago | Test con misma idempotency_key |
| 8 | Docker sandbox: MCP server sin network no resuelve DNS | Test de aislamiento |
| 9 | JWT: access token expira en 30 min, refresh en 7 dias | Test de expiracion |
| 10 | WebSocket: reconexion automatica < 3 segundos | Test de resiliencia |
| 11 | Lane queue: 1000 sesiones simultaneas sin deadlock | k6 load test |
| 12 | Heartbeat: agente sin respuesta > 5 min activa Kill Switch L2 | Test con agente mock |
| 13 | Glassmorphism: widgets renderizan correctamente en Chrome, Firefox, Safari | Visual regression (Chromatic) |
| 14 | OWASP ZAP: 0 findings Critical, 0 findings High | Security scan report |
| 15 | Budget hard stop: transaccion bloqueada cuando budget agotado | Test con budget = 0 |
| 16 | Backup: RTO < 1h, RPO < 15 min verificado | Drill de recuperacion |
| 17 | Env vars: ninguna variable sensible expuesta en logs o frontend | Grep automatizado |
| 18 | Error boundaries: error en widget no crashea dashboard | Test con error inyectado |
| 19 | Constitutional validation: violacion critica bloquea accion + log | Test con accion prohibida |
| 20 | GDPR: export de datos de usuario completo en < 30 min | Test de export |

---

## 28. SUPUESTOS, DECISIONES Y TRADE-OFFS

### 28.1 Decisiones Arquitectonicas

| # | Decision | Alternativa Considerada | Justificacion |
|---|---|---|---|
| D1 | Multi-tenant con `org_id` + RLS | Schema-per-tenant | Escalabilidad, menor overhead operativo, alineado con Supabase |
| D2 | EUR como moneda base | USD | Mercado objetivo ES/UE. Configurable por org |
| D3 | Supabase Vault para secrets | HashiCorp Vault / AWS KMS | Integrado en stack. HSM para PCI-DSS evaluado en M6+ |
| D4 | vLLM para LLM serving | Ollama | vLLM superior en produccion (PagedAttention, tensor parallelism). Ollama para dev local |
| D5 | Ticket HITL TTL = 24 horas | 1 hora | Permite aprobacion asicrona razonable. Escalacion a 30 min |
| D6 | `risk_score` NUMERIC(3,2) [0.0-1.0] | INT [0-100] | Consistente con Constitution Art. 5.2. Precision decimal |
| D7 | Gateway WebSocket separado | Supabase Realtime unico | Mejor control de routing, lane management, heartbeat |
| D8 | n8n para workflows | Temporal.io | n8n cubre 100% de casos de uso actuales. Temporal evaluado M6+ |
| D9 | `weekly_limit` en presupuesto | Solo daily + monthly | Granularidad tri-nivel (Constitution Art. 3.7) |
| D10 | Glassmorphism dark theme | Light theme / Material | Diferenciacion visual, premium feel |
| D11 | pgvector (MVP) | Pinecone / Weaviate | Integrado en PostgreSQL, sin servicio adicional. Migracion path documentado |
| D12 | Zustand (state management) | Redux Toolkit | Menor boilerplate, TypeScript-first, suficiente para MVP |
| D13 | httpOnly cookies para refresh tokens | localStorage | Proteccion contra XSS |

### 28.2 Trade-Offs Asumidos

| Trade-Off | Consecuencia | Mitigacion |
|---|---|---|
| pgvector vs vector DB dedicada | Menor rendimiento a >1M vectores | Migracion a Pinecone planificada si necesario |
| vLLM self-hosted vs cloud-only | Mayor costo infra, mas complejo | Fallback chain a cloud providers |
| n8n vs Temporal | Menor durabilidad en workflows largos | Evaluacion Temporal en M6 |
| Supabase Vault vs HSM | No certificable PCI-DSS Level 1 | HSM evaluado para M6+ si necesario |

### 28.3 Preguntas Abiertas (Requieren Decision)

| # | Pregunta | Impacto | Deadline |
|---|---|---|---|
| Q1 | HSM vs Supabase Vault para PCI-DSS Level 1 | Compliance pagos | M4 |
| Q2 | Llama 3.3 70B vs Mistral 7B para triage | Costo vs precision | M2 |
| Q3 | Edge Functions (Deno) vs Cloud Run para payment processor | Latencia vs flexibilidad | M3 |
| Q4 | Bento Grid breakpoints exactos para tablet | UX responsive | M2 |
| Q5 | DocuSign integration para contratos Real Estate | Feature scope | M4 |
| Q6 | Skill Marketplace comision 20% competitiva | Business model | M6 |
| Q7 | vLLM en GKE vs cloud GPU (Together AI) coste-eficacia | Infra cost | M3 |
| Q8 | GDPR 90 dias retencion suficiente para all verticals | Compliance | M3 |

---

## 29. VARIABLES DE ENTORNO

```bash
# === Supabase ===
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_URL=postgresql://...
SUPABASE_JWT_SECRET=...

# === LLM ===
VLLM_BASE_URL=http://localhost:8000/v1
VLLM_MODEL_PRIMARY=meta-llama/Llama-3.3-70B-Instruct
VLLM_MODEL_SECONDARY=mistralai/Mistral-Large-3
VLLM_MODEL_TRIAGE=mistralai/Ministral-3-14B
TOGETHER_API_KEY=...
GROQ_API_KEY=...
ANTHROPIC_API_KEY=...

# === Embeddings ===
OPENAI_API_KEY=...  # Solo para text-embedding-3-small
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# === Payments ===
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
WISE_API_KEY=...  # Phase 3+

# === Security ===
AUDIT_SECRET_KEY=...  # HMAC-SHA256 signing key (min 256 bits)
ENCRYPTION_KEY=...    # AES-256-GCM
JWT_SECRET=...
MFA_ISSUER=OpenClaw

# === Monitoring ===
SENTRY_DSN=https://...
PROMETHEUS_PUSHGATEWAY=http://...
GRAFANA_API_KEY=...

# === n8n ===
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=...
N8N_WEBHOOK_SECRET=...

# === Infrastructure ===
GCP_PROJECT_ID=...
GCP_REGION=europe-west1
VERCEL_TOKEN=...
CLOUDFLARE_API_TOKEN=...
```

Todas las variables sensibles se almacenan en Supabase Vault o GCP Secret Manager. Jamas en codigo fuente, logs, ni frontend bundles.

---

## 30. METADATOS DEL DOCUMENTO

| Campo | Valor |
|---|---|
| Version | 1.0.0 |
| Estado | VIGENTE — Production Ready (Beta) |
| Fecha | Febrero 2026 |
| Clasificacion | Internal / Confidential |
| Owner | System Architect & Engineering Team |
| Mantenido por | Toni (CTO, Anclora) |
| Revision | Bi-semanal (features), Mensual (arquitectura) |
| Enmienda | PR review + CTO approval |
| Compliance | GDPR + PCI-DSS + SOC 2 Type II readiness |
| Documento supremo | `constitution.md` (prevalece en caso de conflicto) |
| Hash de integridad | Se generara al cierre de esta version |

### 30.1 Informe de Consolidacion

Este documento canonico fue producido mediante la consolidacion de 4 especificaciones tecnicas:

| Fuente | Tipo | Lineas | Contribucion principal |
|---|---|---|---|
| spec-master-1-perplexity | Exhaustiva | 2,841 | Constitution, LLM stack (vLLM), security OWASP, deployment |
| spec-master-3-Claude | Exhaustiva | 1,409 | Estructura legislativa, MCP SDK, Docker sandbox levels, vLLM commands |
| spec-final-1-perplexity | Optimizada | 3,729 | LangGraph 11 nodos completo, rate limiting Upstash, audit HMAC, sanitization code |
| spec-final-3-Claude | Optimizada | 1,398 | Glosario, actores/roles, NFRs, QA checklist, decisions table, env vars |

### 30.2 Conflictos Resueltos

| # | Conflicto | Fuentes | Resolucion | Criterio |
|---|---|---|---|---|
| C1 | `org_id` multi-tenant vs `user_id` | master-1 vs final-3 | `org_id` | SaaS B2B, Constitution Art. 1.4 |
| C2 | Ollama vs vLLM | final-3 vs master-1/3 | vLLM produccion, Ollama dev | Rendimiento produccion |
| C3 | pgvector vs Pinecone | Todos | pgvector MVP, migracion path | Integracion, costo |
| C4 | Stripe only vs multi-provider | master-1 vs final-1 | Stripe MVP, Wise Phase 3+ | Implementabilidad |
| C5 | Heartbeat 60s vs 30s | master-1 vs final-1 | 60s default, configurable | Equilibrio carga/deteccion |
| C6 | text-embedding-ada-002 vs 3-small | master-1 vs final-1 | text-embedding-3-small | ada-002 deprecated |
| C7 | Sandbox 3 vs 4 niveles | master-3 vs master-1 | 3 niveles (none/standard/strict) | Simplicidad |
| C8 | Budget daily+monthly vs tri-nivel | master-1 vs final-3 | Tri-nivel (daily+weekly+monthly) | Constitution Art. 3.7 |
| C9 | risk_score NUMERIC vs INT | final-3 vs master-1 | NUMERIC(3,2) [0.0-1.0] | Constitution Art. 5.2 |
| C10 | Ticket TTL 1h vs 24h | master-1 vs final-3 | 24h con escalacion a 30min | Aprobacion asincrona |
| C11 | knowledge_chunks vs agent_memory | master-1 vs master-3 | `agent_memory` | Nombre mas descriptivo |
| C12 | Zustand vs Redux | final-3 vs master-1 | Zustand | Menos boilerplate, MVP |
| C13 | Gateway separado vs Supabase Realtime | final-3 vs master-1 | Gateway separado | Control de lanes, heartbeat |

### 30.3 Decisiones Propuestas (No Implementadas)

| Decision | Estado | Evaluacion |
|---|---|---|
| Pinecone para escala > 1M vectores | Diferida | M6+ si pgvector insuficiente |
| Redis para cache/rate-limiting | Diferida | Upstash Redis evaluado M3 |
| Temporal.io para workflows duraderos | Diferida | M6+ si n8n insuficiente |
| GKE Autopilot para Ollama/vLLM | Activa | GKE con A100 GPUs |
| mTLS entre servicios internos | Recomendada | Implementar M3 |

---

**FIN DEL DOCUMENTO**

*Este documento es la fuente tecnica canonica de OpenClaw. `constitution.md` prevalece en caso de conflicto. Toda modificacion requiere PR review + aprobacion CTO.*

