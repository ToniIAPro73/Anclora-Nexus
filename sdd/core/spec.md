# ANCLORA NEXUS — ESPECIFICACIÓN TÉCNICA (spec.md)

## Referencia Arquitectónica del Motor OpenClaw adaptado para Anclora Nexus v0
### Versión 1.1.0-nexus — Febrero 2026

---

**Clasificación:** Internal / Confidential  
**Estado:** Anclora Nexus v0 (Beta)  
**Owner:** Toni Amengual (Owner, Anclora Private Estates)  
**Documento superior:** `constitution-canonical.md` (Norma Suprema)  
**Documento de producto:** `product-spec-v0.md` (Define QUÉ hace la app)

> **Nota de adaptación:** Este documento es la especificación técnica del motor OpenClaw
> adaptada para Anclora Nexus v0. Las secciones marcadas `[ELIMINADO v0]` han sido removidas
> porque no aplican al scope de v0. Las marcadas `[DIFERIDO v2+]` se preservan como referencia
> para fases futuras. Versión completa: `spec-openclaw-full.md`

---

## ÍNDICE

1. Visión, Alcance y No-Alcance `[ADAPTADO v0]`
2. Glosario Técnico
3. Actores y Roles del Sistema `[SIMPLIFICADO v0: single-user]`
4. Arquitectura del Sistema `[ADAPTADO v0: sin Gateway/MCP Docker]`
5. Stack Tecnológico `[ADAPTADO v0]`
6. Schema de Base de Datos `[USAR product-spec-v0.md Sección 3.4 como referencia primaria]`
7. Capa de Autenticación `[SIMPLIFICADO v0: magic link]`
8. Capa de Orquestación Agentica (LangGraph) `[ADAPTADO v0: 7 nodos]`
9. ~~Protocolo MCP y Sandboxing~~ `[ELIMINADO v0: skills son módulos Python]`
10. ~~Sistema de Colas y Concurrencia~~ `[ELIMINADO v0: single-user]`
11. ~~Heartbeat y Monitorización de Agentes~~ `[ELIMINADO v0: invocaciones cortas]`
12. ~~Integración de Pagos~~ `[ELIMINADO v0: sin monetización]`
13. ~~Supabase Edge Functions~~ `[DIFERIDO v2+]`
14. ~~Memoria Vectorial y RAG~~ `[DIFERIDO v2+: sin pgvector en v0]`
15. n8n — Orquestación de Workflows `[ADAPTADO v0: 3 workflows Anclora]`
16. Especificación de API `[SIMPLIFICADO v0]`
17. Frontend — Dashboard Bento Grid `[ADAPTADO v0: ver product-spec-v0.md + Antigravity Skill 3]`
18. ~~Catálogo de Skills Monetizables~~ `[REEMPLAZADO: ver constitution-canonical.md Título XIV]`
19. Seguridad, Cifrado y OWASP `[PARCIAL v0]`
20. ~~Infraestructura GKE/Terraform~~ `[ELIMINADO v0: Vercel + Railway]`
21. ~~Monitorización Prometheus/Grafana~~ `[ELIMINADO v0: Supabase Dashboard + Railway logs]`
22. ~~Backup/DR/SLA enterprise~~ `[DIFERIDO v2+]`
23. Guía de Desarrollo (Code Style + Testing)
24. ~~Roadmap OpenClaw~~ `[REEMPLAZADO: ver product-spec-v0.md Sección 4]`
25. Requisitos No Funcionales `[ADAPTADO v0]`
26. Checklist de Aceptación `[ADAPTADO v0]`
27. Supuestos y Decisiones
28. Variables de Entorno `[ADAPTADO v0]`
29. Metadatos

---

## 1. VISIÓN, ALCANCE Y NO-ALCANCE

### 1.1 Visión del Producto

OpenClaw es un Sistema Operativo de Agentes (AOS) que orquesta agentes de IA especializados bajo supervisión humana efectiva. Cada agente ejecuta tareas de negocio (ventas, real estate, legal, finanzas) que generan valor económico, operando con controles de nivel bancario: aprobación humana obligatoria para transacciones monetarias (HITL), límites de gasto configurables, trazabilidad inmutable y Kill Switch de emergencia.

### 1.2 Alcance (In-Scope)

1. Backend: Supabase (PostgreSQL + Auth + RLS + Edge Functions + pgvector).
2. Orquestación agentica: LangGraph (Python) + Model Context Protocol (MCP).
3. LLM: Modelos open-source (Llama 3.3 / Mistral) con auto-hosting. Claude como fallback.
4. Frontend: Next.js 15 + shadcn/ui + Tailwind CSS (dashboard Bento Grid con glassmorphism).
5. Workflows: n8n como orquestador secundario para flujos complejos e integraciones.
6. Pagos: Stripe (PCI-DSS Level 1) + SEPA. Wise para pagos internacionales.
7. Monitorización: Prometheus + Grafana + alertas.
8. Infraestructura: Vercel (frontend) + GCP Cloud Run (backend LangGraph) + Docker (MCP sandboxes).
9. Skills verticales: Real Estate (Sniper, Property Sentinel, Predictivo) + B2B SDR (Autónomo, Legal Auditor) + Marketplace de terceros.
10. Compliance: GDPR, PCI-DSS, SOC 2 Type II readiness.

### 1.3 No-Alcance (Out-of-Scope)

1. Aplicación móvil nativa (se accede vía responsive web).
2. Integraciones con blockchains o criptomonedas.
3. Agentes con capacidad de trading financiero autónomo.
4. Soporte multi-idioma de interfaz (solo EN/ES en MVP).
5. Integración con ERP legacy (SAP, Oracle) — fuera del MVP.

---

## 2. GLOSARIO TÉCNICO

| Término | Definición |
|---|---|
| **AOS** | Agent Operating System — el producto OpenClaw |
| **Bento Grid** | Layout de dashboard basado en grid CSS con widgets modulares (glassmorphism) |
| **Constitutional Validator** | Nodo del grafo LangGraph que valida cada acción contra `constitution.md` |
| **Edge Function** | Función serverless en Supabase Edge Runtime (Deno) |
| **Gateway** | Servidor WebSocket que actúa como control plane para todas las operaciones de agentes |
| **HITL** | Human-in-the-Loop: protocolo de aprobación humana obligatoria |
| **Kill Switch** | Mecanismo de detención de emergencia. 4 niveles: L1 Warning, L2 Pause, L3 Kill, L4 Lockdown |
| **Lane** | Cola FIFO para control de concurrencia (Session, Global, Cron, Subagent) |
| **LangGraph** | Framework Python para workflows multi-agente con estado, checkpointing y herramientas |
| **MCP** | Model Context Protocol (v2025-11-25): interfaz estandarizada de ejecución de herramientas LLM |
| **MFA** | Multi-Factor Authentication: TOTP, WebAuthn o biometría |
| **Org / Tenant** | Organización aislada por `org_id` con RLS. Unidad de facturación y aislamiento |
| **RAG** | Retrieval-Augmented Generation: LLM + búsqueda vectorial semántica |
| **Risk Score** | Métrica [0.0, 1.0] que cuantifica probabilidad de pérdida/fraude por transacción |
| **RLS** | Row-Level Security: políticas de acceso a nivel de fila en PostgreSQL |
| **Skill** | Agente especializado que ejecuta una función de negocio. Registrado en catálogo MCP |
| **Subagent** | Agente hijo delegado para tareas paralelas |
| **Ticket HITL** | Registro en `approval_tickets` con solicitud de aprobación, evidencia, risk score y TTL |

---

## 3. ACTORES Y ROLES DEL SISTEMA

| Rol | Permisos | Descripción |
|---|---|---|
| **End User** | CRUD sobre sus propios datos. Aprobar sus tickets HITL. Kill Switch sobre sus agentes | Usuario final de la plataforma |
| **Manager** | Permisos de End User + visibilidad y aprobación sobre datos del equipo | Responsable de equipo |
| **Admin** | Permisos de Manager + gestión de usuarios, configuración global, aprobación de skills | Administrador de la organización |
| **Owner** | Permisos de Admin + Kill Switch global, recovery post-emergencia, ajuste de límites | Propietario de la organización. Último responsable |
| **CFO / Ejecutivo** | Visibilidad company-wide. Aprobación de transacciones > €5,000. Escalación | Rol financiero de alto nivel |
| **CTO** | Acceso total. Kill Switch total. Aprobación de reformas constitucionales | Máxima autoridad técnica |
| **SOC / Security** | Acceso a audit logs completos. Kill Switch. Sin capacidad de aprobación de transacciones | Centro de operaciones de seguridad |
| **Auditor (Externo)** | Acceso read-only a logs de compliance | Auditor externo (PCI-DSS, SOC 2) |
| **POWER_USER** | Permisos de End User + ajuste de límites hasta 2x default vía RLS | Usuario avanzado (Constitución Art. 15.3) |

---

## 4. ARQUITECTURA DEL SISTEMA

### 4.1 Arquitectura por Capas

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER LAYER                                   │
│  Bento Grid Dashboard (Next.js 15 + shadcn/ui + Tailwind)          │
│  - Agent Thought-Stream (4x2)    - Monetary Pulse (2x2)            │
│  - Efficiency & Savings (2x1)    - Skill Lab (2x2)                 │
│  - Memory Navigator (2x1)        - Kill Switch (1x1)               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ (WebSocket + REST + Supabase Realtime)
┌──────────────────────────────┴──────────────────────────────────────┐
│                    AUTHENTICATION LAYER                               │
│  Supabase Auth + RLS + MFA (TOTP / WebAuthn / Biometría)           │
│  - OAuth providers (Google, GitHub, Microsoft)                      │
│  - JWT: 30min access + 7day refresh. Session + device tracking      │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                    GATEWAY LAYER (WebSocket Server)                   │
│  Node.js + TypeScript                                                │
│  - Lane-based FIFO Queue (Session + Global + Cron + Subagent)      │
│  - Auth Profile Rotation & Model Fallback                           │
│  - Heartbeat Monitoring (60s interval, 2min warning, 5min kill)    │
│  - Realtime Event Streaming                                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                    ORCHESTRATION LAYER (LangGraph — Python)          │
│  ┌────────────────────┐  ┌─────────────────────┐                   │
│  │ Reasoning Engine   │  │ Tool Executor (MCP)  │                   │
│  │ - Think step       │  │ - Real Estate APIs   │                   │
│  │ - Plan next action │  │ - B2B Data APIs      │                   │
│  │ - Evaluate evidence│  │ - Payment Processors │                   │
│  └─────────┬──────────┘  └──────────┬──────────┘                   │
│            │                         │                               │
│  ┌─────────┴──────────┐  ┌──────────┴──────────┐                   │
│  │ Memory Integration │  │ HITL Interceptor     │                   │
│  │ (RAG + pgvector)   │  │ (Constitutional Val.)│                   │
│  └────────────────────┘  └─────────────────────┘                   │
│  Loop Control: Max 10 iterations, 30s timeout per tool, 60min task │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ (MCP Protocol + REST)
┌──────────────────────────────┴──────────────────────────────────────┐
│                    SKILL LAYER (Agentes Especializados)              │
│  Real Estate │ B2B SDR │ Legal Auditor │ Marketplace (3rd party)   │
│  ────────────┴─────────┴───────────────┴──────────────────────────  │
│  n8n Orchestration (workflows complejos + webhooks + triggers)     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ (API calls + Webhooks)
┌──────────────────────────────┴──────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                              │
│  Real Estate (Zillow, Redfin, MLS) │ Payment (Stripe, Wise, SEPA) │
│  B2B Data (Apollo, Hunter, Clearbit) │ Comms (Twilio, SendGrid)   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────────┐
│                    DATA PERSISTENCE LAYER                             │
│  ┌──────────────────────┐  ┌────────────────────────────┐          │
│  │ Supabase PostgreSQL  │  │ Object Storage (S3/Supabase)│          │
│  │ - Core tables + RLS  │  │ - Documents, PDFs           │          │
│  │ - pgvector embeddings│  │ - Audit logs (cold, 7yr)    │          │
│  │ - Audit log (hot)    │  │ - Backups (encrypted)       │          │
│  └──────────────────────┘  └────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Principios Arquitectónicos

1. **Multi-tenant by design**: Toda tabla incluye `org_id` con RLS enforced. Aislamiento total entre organizaciones.
2. **Constitución como código**: El `constitutional_validator` es un nodo obligatorio en todo grafo LangGraph. Ninguna acción bypassa la validación constitucional.
3. **Fail-safe over fail-open**: Toda condición de error resulta en parada segura, nunca en ejecución sin validación.
4. **Audit everything**: Toda acción genera entrada en `audit_log` con firma HMAC-SHA256.
5. **Stateless compute, stateful data**: Los servicios de cómputo (Gateway, LangGraph, MCP) son stateless. El estado persiste en Supabase.

---

## 5. STACK TECNOLÓGICO `[ADAPTADO v0]`

> **Stack v0 definitivo:** Ver product-spec-v0.md Sección 3.6. Las diferencias principales:
> - LLM: OpenAI GPT-4o-mini + Anthropic Claude 3.5 Sonnet (sustituye Ollama/vLLM)
> - Hosting: Vercel + Railway (sustituye GKE/Cloud Run)
> - Monitoring: Supabase Dashboard + Railway logs (sustituye Prometheus/Grafana)
> - Auth: Supabase magic link (sin MFA/WebAuthn)
> - Sin: Docker sandbox, pgvector, Stripe, Terraform

| Capa | Tecnología | Versión Mínima | Justificación |
|---|---|---|---|
| Frontend | Next.js + TypeScript | 15.0 | App Router, RSC, streaming, SEO |
| UI Components | shadcn/ui + Tailwind CSS | Latest / 3.4 | Composable, accesible, glassmorphism |
| State Management | Zustand | 4.5 | Ligero, sin boilerplate |
| Data Fetching | React Query (TanStack) | 3.39 | Cache, retry, optimistic updates |
| Animation | Framer Motion | 11.0 | Animaciones fluidas para widgets |
| Gateway | Node.js + TypeScript | 20 LTS | WebSocket nativo, alta concurrencia |
| Agent Framework | LangGraph (Python) | Latest | Multi-agent, checkpointing, state graph |
| LLM Primary | Llama 3.3 / Mistral (via Ollama) | — | Open-source, auto-hosting, sin vendor lock-in |
| LLM Fallback | Claude (Anthropic API) | claude-sonnet-4-20250514 | Fallback si Ollama no disponible |
| Database | PostgreSQL (Supabase) | 15+ | ACID, pgvector, RLS, realtime subscriptions |
| Vector Store | pgvector extension | Latest | Nativo Postgres, cosine similarity, IVFFlat |
| Authentication | Supabase Auth | Latest | JWT + MFA + OAuth + RLS nativo |
| Payments Primary | Stripe | Latest | PCI-DSS Level 1, webhooks, idempotency |
| Payments International | Wise | Latest | Transferencias SEPA/internacionales |
| Container Runtime | Docker | 24+ | Aislamiento MCP, resource limits, security hardening |
| Workflows | n8n | Latest | Orquestación visual, webhooks, 400+ integraciones |
| Monitoring | Prometheus + Grafana | Latest | Métricas, alertas, dashboards custom |
| Logging | Supabase + JSONL + Sentry | — | Structured logs, error tracking, audit trail |
| IaC | Terraform | Latest | Reproducibilidad de infraestructura |
| CI/CD | GitHub Actions | — | Testing, security scanning, deploy automatizado |
| CDN / DDoS | Cloudflare | — | DDoS protection, caching, TLS termination |

### 5.1 Dependencias Frontend (package.json)

```json
{
  "react": "^19.0.0",
  "next": "^15.0.0",
  "typescript": "^5.6.0",
  "tailwindcss": "^3.4.0",
  "shadcn/ui": "latest",
  "zustand": "^4.5.0",
  "@tanstack/react-query": "^5.0.0",
  "axios": "^1.7.0",
  "framer-motion": "^11.0.0",
  "@supabase/supabase-js": "^2.38.0"
}
```

---

## 6. SCHEMA DE BASE DE DATOS

### 6.1 Extensiones Requeridas

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
```

### 6.2 Diagrama Entidad-Relación

```
organizations
├─ 1:N → users (via org_memberships)
├─ 1:N → agent_instances
├─ 1:N → agent_limits
├─ 1:N → skills
├─ 1:N → approval_tickets
├─ 1:N → transactions
├─ 1:N → audit_log
└─ 1:N → incident_logs

users (Supabase Auth)
├─ N:N → organizations (via org_memberships con role)
├─ 1:N → user_sessions
├─ 1:N → approval_tickets (como approver)
└─ 1:N → agent_executions

agent_instances
├─ 1:N → agent_sessions
├─ 1:N → agent_heartbeats
└─ 1:N → agent_executions

approval_tickets
└─ 1:1 → transactions

skills
└─ 1:N → agent_executions
```

### 6.3 Definiciones de Tablas

#### organizations

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | Identificador de organización |
| name | VARCHAR(255) | Nombre de la organización |
| plan | VARCHAR(20) | `free` / `pro` / `enterprise` |
| monthly_budget | NUMERIC(12,2) | Presupuesto mensual total (EUR) |
| status | VARCHAR(20) | `active` / `suspended` |
| metadata | JSONB | Configuración adicional |
| created_at | TIMESTAMPTZ | Fecha de creación |
| updated_at | TIMESTAMPTZ | Última modificación |

#### org_memberships

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| org_id | UUID FK → organizations | Organización |
| user_id | UUID FK → auth.users | Usuario |
| role | VARCHAR(50) | `user` / `manager` / `admin` / `owner` / `cto` / `power_user` |
| created_at | TIMESTAMPTZ | — |

**RLS:** `USING (auth.uid() = user_id)` para lectura; `WITH CHECK (role IN ('admin','owner'))` para escritura.

#### users (Supabase Auth + extensión)

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | Supabase `auth.uid()` |
| email | VARCHAR(255) UNIQUE | Email del usuario |
| full_name | VARCHAR(255) | Nombre completo |
| avatar_url | TEXT | URL de avatar |
| mfa_enabled | BOOLEAN DEFAULT true | MFA activado |
| mfa_method | VARCHAR(20) DEFAULT 'totp' | `totp` / `webauthn` / `sms` |
| biometric_enabled | BOOLEAN DEFAULT false | Biometría activada |
| status | VARCHAR(20) DEFAULT 'active' | `active` / `inactive` / `suspended` |
| metadata | JSONB | Datos adicionales |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |

#### user_sessions

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| user_id | UUID FK → users | — |
| device_id | VARCHAR(255) | Fingerprint del dispositivo |
| device_name | TEXT | Nombre legible del dispositivo |
| ip_address | INET | IP de conexión |
| user_agent | TEXT | User-Agent del navegador |
| last_activity | TIMESTAMPTZ | Última actividad |
| expires_at | TIMESTAMPTZ | Expiración de sesión (15min inactividad) |
| created_at | TIMESTAMPTZ | — |

#### agent_limits

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| org_id | UUID FK → organizations | Organización |
| daily_limit | NUMERIC(12,2) DEFAULT 0 | Límite diario (EUR) |
| weekly_limit | NUMERIC(12,2) DEFAULT 0 | Límite semanal (EUR) |
| monthly_limit | NUMERIC(12,2) DEFAULT 0 | Límite mensual (EUR) |
| current_daily_usage | NUMERIC(12,2) DEFAULT 0 | Gasto acumulado hoy |
| current_weekly_usage | NUMERIC(12,2) DEFAULT 0 | Gasto acumulado esta semana |
| current_monthly_usage | NUMERIC(12,2) DEFAULT 0 | Gasto acumulado este mes |
| reset_daily_at | TIMESTAMPTZ | Próximo reset diario (00:00 UTC) |
| reset_weekly_at | TIMESTAMPTZ | Próximo reset semanal (lunes 00:00 UTC) |
| reset_monthly_at | TIMESTAMPTZ | Próximo reset mensual (día 1, 00:00 UTC) |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |

**Constraint:** `UNIQUE(org_id)`.

#### agent_instances

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| org_id | UUID FK → organizations | Organización (RLS enforced) |
| name | TEXT | Nombre del agente |
| model_config | JSONB | `{provider, model_name, temperature, max_tokens}` |
| enabled_tools | TEXT[] | Array de MCP tools permitidas |
| budget_limit | NUMERIC(12,2) | Presupuesto asignado al agente |
| status | VARCHAR(20) | `ACTIVE` / `PAUSED` / `KILLED` / `TERMINATED` |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |

#### approval_tickets

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| org_id | UUID FK → organizations | Organización |
| user_id | UUID FK → users | Solicitante |
| agent_id | UUID FK → agent_instances | Agente que generó el ticket |
| skill_id | UUID FK → skills | Skill asociado |
| ticket_type | VARCHAR(50) | `lead_purchase` / `ad_spend` / `vendor_payment` / `transfer` / `subscription` |
| amount | NUMERIC(12,2) | Importe propuesto (EUR) |
| currency | VARCHAR(3) DEFAULT 'EUR' | Divisa |
| status | VARCHAR(20) DEFAULT 'PENDING_USER' | Ver tabla de estados (Constitution Art. 4.5.1) |
| justification | TEXT | Justificación generada por el agente |
| evidence | JSONB | `{lead_manifest, roi_projection, campaign_plan, ...}` |
| risk_score | NUMERIC(3,2) | [0.00, 1.00] |
| risk_category | VARCHAR(20) | `LOW` / `MEDIUM` / `HIGH` / `CRITICAL` |
| mfa_required | BOOLEAN | Determinado por risk score (Constitution Art. 4.8) |
| approved_by | UUID FK → users | Usuario que aprobó |
| approved_at | TIMESTAMPTZ | — |
| mfa_attempts | INT DEFAULT 0 | Contador de intentos MFA |
| mfa_verified_at | TIMESTAMPTZ | — |
| executed_at | TIMESTAMPTZ | — |
| execution_result | JSONB | `{transaction_id, payment_id, ...}` |
| error_message | TEXT | Mensaje de error si falló |
| expires_at | TIMESTAMPTZ | TTL: 24h desde creación |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |

**Índices:** `(org_id, status)`, `(expires_at)`.  
**Realtime:** Habilitado para propagación instantánea al dashboard.

#### transactions

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| org_id | UUID FK → organizations | — |
| user_id | UUID FK → users | — |
| approval_ticket_id | UUID FK → approval_tickets | Ticket que autorizó la transacción |
| transaction_type | VARCHAR(50) | Categoría |
| amount | NUMERIC(12,2) | Importe ejecutado |
| currency | VARCHAR(3) DEFAULT 'EUR' | — |
| status | VARCHAR(20) | `PENDING` / `PROCESSING` / `COMPLETED` / `FAILED` / `REFUNDED` |
| payment_provider | VARCHAR(50) | `stripe` / `wise` / `sepa` |
| external_transaction_id | VARCHAR(255) | ID en el procesador externo |
| description | TEXT | — |
| metadata | JSONB | Datos adicionales del procesador |
| executed_by | UUID FK → users | — |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |

**Índices:** `(org_id, created_at DESC)`, `(status)`.

#### skills

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| org_id | UUID FK → organizations | Organización propietaria |
| name | VARCHAR(255) NOT NULL | Nombre del skill |
| version | VARCHAR(10) DEFAULT '1.0.0' | Semantic versioning |
| description | TEXT | — |
| category | VARCHAR(50) | `real_estate` / `sdr` / `compliance` / `marketplace` |
| approval_status | VARCHAR(20) DEFAULT 'DRAFT' | `DRAFT` / `PENDING_REVIEW` / `APPROVED` / `DEPRECATED` |
| risk_score_max | NUMERIC(3,2) DEFAULT 0.30 | Umbral máximo de risk score |
| transaction_limit_daily | NUMERIC(12,2) DEFAULT 0 | — |
| transaction_limit_monthly | NUMERIC(12,2) DEFAULT 0 | — |
| mcp_tools | JSONB | Array de tools MCP registradas |
| dependencies | JSONB | Array de skill_ids dependientes |
| code_hash | VARCHAR(64) | SHA-256 del código para versionado |
| reviewed_by | UUID FK → users | Revisor |
| approved_date | TIMESTAMPTZ | — |
| created_at | TIMESTAMPTZ | — |
| updated_at | TIMESTAMPTZ | — |
| deleted_at | TIMESTAMPTZ | Soft delete |

**Índices:** `(category, approval_status)`.

#### knowledge_chunks (Vector Store para RAG)

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| org_id | UUID FK → organizations | RLS enforced |
| source_type | VARCHAR(50) | `document` / `contract` / `email` / `manual` |
| source_id | VARCHAR(255) | ID del documento fuente |
| content | TEXT NOT NULL | Texto original (cifrado at-rest) |
| embedding | VECTOR(1536) | Embedding (text-embedding-3-small) |
| metadata | JSONB | `{tags, sensitivity_level, purpose}` |
| created_at | TIMESTAMPTZ | — |
| expires_at | TIMESTAMPTZ | GDPR auto-delete (default 90 días) |

**Índice vectorial:** `CREATE INDEX ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);`

#### agent_executions

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| org_id | UUID FK → organizations | — |
| user_id | UUID FK → users | — |
| skill_id | UUID FK → skills | — |
| agent_id | UUID FK → agent_instances | — |
| status | VARCHAR(20) | `PENDING` / `RUNNING` / `COMPLETED` / `FAILED` / `INTERRUPTED` |
| input | JSONB | — |
| output | JSONB | — |
| reasoning | TEXT | Cadena de razonamiento del agente |
| tool_calls | JSONB | Historial de llamadas a herramientas |
| iteration_count | INT DEFAULT 0 | — |
| tokens_used | INT DEFAULT 0 | — |
| execution_time_ms | INT | Duración total |
| error_message | TEXT | — |
| created_at | TIMESTAMPTZ | — |
| completed_at | TIMESTAMPTZ | — |

**Índices:** `(org_id, skill_id, created_at DESC)`.

#### audit_log (INMUTABLE — Constitution Título X)

| Columna | Tipo | Descripción |
|---|---|---|
| id | BIGSERIAL PK | Auto-increment |
| org_id | UUID | Organización |
| actor_type | TEXT | `agent` / `user` / `system` |
| actor_id | UUID | ID del actor |
| action | TEXT | Formato `resource.verb` (ej: `payment.executed`) |
| resource_type | TEXT | Tipo del recurso afectado |
| resource_id | UUID | ID del recurso |
| details | JSONB | Importe, risk score, state_hash, IP, estado previo |
| signature | TEXT | HMAC-SHA256(org_id \|\| actor_id \|\| action \|\| timestamp \|\| payload) |
| created_at | TIMESTAMPTZ | Inmutable |

**Inmutabilidad:**
```sql
CREATE POLICY "audit_no_update" ON audit_log FOR UPDATE USING (false);
CREATE POLICY "audit_no_delete" ON audit_log FOR DELETE USING (false);
REVOKE UPDATE, DELETE ON audit_log FROM authenticated, anon;
```

#### incident_logs (Kill Switch)

| Columna | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| org_id | UUID FK → organizations | — |
| incident_type | VARCHAR(50) | `anomaly` / `security` / `manual` / `rate_limit` |
| trigger_type | VARCHAR(20) | `auto` / `manual` |
| severity | VARCHAR(20) | `low` / `medium` / `critical` |
| kill_switch_level | VARCHAR(5) | `L1` / `L2` / `L3` / `L4` |
| reason | TEXT | Descripción del incidente |
| affected_agents | JSONB | Array de agent_ids afectados |
| recovery_started | TIMESTAMPTZ | — |
| recovery_completed | TIMESTAMPTZ | — |
| post_mortem | TEXT | — |
| created_at | TIMESTAMPTZ | — |

### 6.4 RLS Policies (Patrón Base)

```sql
-- Patrón aplicado a TODAS las tablas con org_id:
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_{table}" ON {table}
  FOR ALL USING (
    org_id IN (
      SELECT org_id FROM org_memberships WHERE user_id = auth.uid()
    )
  );

-- Admin override para approval_tickets:
CREATE POLICY "admin_approve_tickets" ON approval_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM org_memberships
      WHERE user_id = auth.uid()
        AND org_id = approval_tickets.org_id
        AND role IN ('admin', 'owner', 'cto')
    )
  );
```

---

## 7. CAPA DE AUTENTICACIÓN Y AUTORIZACIÓN

### 7.1 Flujo de Autenticación

1. Usuario se registra vía email/password u OAuth (Google, GitHub, Microsoft).
2. Supabase Auth emite JWT con claims: `{sub: user_id, role: authenticated, aal: aal1}`.
3. Cliente almacena JWT en `httpOnly` cookie (web) o secure keychain (mobile).
4. Toda request incluye JWT en header `Authorization: Bearer <token>`.
5. Edge Functions validan firma y expiración del JWT.
6. Si MFA habilitado: verificación TOTP/WebAuthn → upgrade a `aal2`.

### 7.2 Configuración JWT

| Parámetro | Valor |
|---|---|
| Access Token TTL | 30 minutos |
| Refresh Token TTL | 7 días |
| Session Timeout (inactividad) | 15 minutos |
| MFA obligatorio para | Aprobación HITL, Kill Switch recovery, cambio de límites |

### 7.3 MFA Enforcement

```sql
CREATE OR REPLACE FUNCTION check_mfa_required()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.require_approval = true
     AND (SELECT mfa_enabled FROM auth.users WHERE id = NEW.user_id) = false
  THEN
    RAISE EXCEPTION 'MFA required for approval-gated actions';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 8. CAPA DE ORQUESTACIÓN AGENTICA (LangGraph) `[ADAPTADO v0: 7 nodos]`

> **Referencia primaria v0:** product-spec-v0.md Sección 3.6 define el StateGraph simplificado
> de 7 nodos (process_input → planner → limit_check → executor → result_handler → audit_logger → finalize).
> Esta sección muestra la arquitectura base OpenClaw como referencia. Nodos eliminados en v0:
> constitutional_check (fusionado con limit_check), tool_selector (fusionado con planner),
> transaction_detector (sin transacciones), human_approval (single-user), payment_processor (sin pagos).

### 8.1 State Schema

```python
class AgentState(TypedDict):
    messages: Sequence[HumanMessage | AIMessage]
    org_id: str
    user_id: str
    skill_id: str
    iteration: int          # max 10 (Constitution Art. 8.1)
    tool_calls: list[dict]
    reasoning: str
    risk_score: float       # [0.0, 1.0]
    budget_remaining: dict  # {daily, weekly, monthly}
    approval_required: bool
    approval_ticket_id: str | None
    status: str             # running | executing_tools | waiting_approval | completed | failed
```

### 8.2 State Graph (Nodos y Edges)

```
[process_input] → [think] → (conditional) → [execute_tools] → (conditional) → [think] (loop)
                                │                                    │
                                └→ [finalize]                        └→ [finalize] (if waiting_approval)
```

**Nodos:**
1. `process_input`: Recupera contexto del usuario desde Supabase (límites, perfil, historial). Construye system prompt con reglas constitucionales.
2. `think`: Invoca el LLM. Incrementa iteración. Si iteración >= 10, finaliza. Analiza si se requieren tool calls.
3. `execute_tools`: Ejecuta herramientas MCP. Si detecta `execute_payment`, intercepción HITL: crea `approval_ticket` en Supabase y pausa el grafo (`interrupt()`).
4. `finalize`: Registra ejecución en `agent_executions`. Genera respuesta final.

**Edges condicionales:**
- `think → execute_tools` si `status == 'executing_tools'`.
- `think → finalize` si `status == 'completed'` o iteración >= 10.
- `execute_tools → think` si `status == 'running'` (loop de razonamiento).
- `execute_tools → finalize` si `status == 'waiting_approval'`.

### 8.3 LLM Service (Multi-Provider) `[ADAPTADO v0]`

| Provider | Modelo | Uso v0 |
|---|---|---|
| OpenAI | GPT-4o-mini | Primary — resúmenes, análisis, clasificación |
| Anthropic | Claude 3.5 Sonnet | Creative — copy de lujo, insights cualitativos |

**Selección v0:** GPT-4o-mini para summarize/analyze. Claude 3.5 Sonnet para generate_copy. Fallback: si primary falla → creative.

---

## 9. ~~PROTOCOLO MCP Y SANDBOXING~~ `[ELIMINADO v0]`

> **Razón:** En Anclora Nexus v0, los skills son módulos Python internos invocados directamente
> por el nodo `executor` del StateGraph. No hay sandbox Docker ni MCP protocol. Reactivar en v2+
> cuando se añadan skills de terceros o marketplace. Ver `spec-openclaw-full.md` para referencia.

### 9.1 Arquitectura MCP

Cada herramienta ejecuta en un contenedor Docker aislado con las siguientes restricciones (Constitution Art. 8.2):

| Restricción | Valor |
|---|---|
| Red | Sin acceso por defecto. Whitelist explícita por skill |
| Filesystem | Read-only excepto `/tmp` |
| CPU | 1 core máximo |
| RAM | 512 MB máximo |
| Timeout | 30 segundos por invocación |
| Privilegios | `no-new-privileges: true`, `cap_drop: ALL` |
| Usuario | Non-root (uid 1000) |

### 9.2 Docker Compose (MCP Servers)

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

---

## 10. ~~SISTEMA DE COLAS Y CONCURRENCIA (LANES)~~ `[ELIMINADO v0]`

> **Razón:** Single-user, sin concurrencia. Invocaciones síncronas directas. Ver `spec-openclaw-full.md`.

| Tipo de Lane | Propósito | Concurrencia Default |
|---|---|---|
| Session Lane | Cola FIFO por conversación | 1 (serial) |
| Global Main Lane | Tareas de usuario cross-session | 4 |
| Cron Lane | Jobs recurrentes programados | 2 |
| Subagent Lane | Agentes hijos para delegación paralela | 8 |

**Implementación:** Semáforos anidados. Session lock (serial per-user) → Global lane slot (rate limit global). Garantiza que un usuario no bloquea a otros.

---

## 11. ~~HEARTBEAT Y MONITORIZACIÓN DE AGENTES~~ `[ELIMINADO v0]`

> **Razón:** Skills son invocaciones cortas (< 30s lead_intake, < 5min prospection). Sin agentes
> long-running que requieran heartbeat. Ver `spec-openclaw-full.md`.

Cada agente envía señal heartbeat cada 60 segundos durante tareas long-running.

| Condición | Acción |
|---|---|
| Sin actividad > 2 minutos | Alerta warning al dashboard |
| Sin actividad > 5 minutos | Kill Switch L2 (agente pausado) |

Canales de alerta configurables: Slack, Telegram, Discord. Deduplicación de alertas en ventana de 24 horas.

---

## 12. ~~INTEGRACIÓN DE PAGOS~~ `[ELIMINADO v0]`

> **Razón:** No hay monetización ni transacciones en v0. Sin Stripe, sin SEPA, sin webhooks de pago.
> Reactivar en v2+ si se añade funcionalidad B2B. Ver `spec-openclaw-full.md`.

### 12.1 Stripe (Primary)

**Flujo:**
1. Edge Function recibe `approval_ticket_id` aprobado.
2. Verifica: ticket en estado APPROVED, MFA verificado, ticket no expirado.
3. Crea `PaymentIntent` en Stripe con `idempotency_key = ticket.id`.
4. Amount en céntimos: `Math.round(ticket.amount * 100)`.
5. Metadata: `{approval_ticket_id, skill_id, org_id}`.
6. Si éxito: status → COMPLETED, registra en `transactions`, actualiza presupuesto.
7. Si fallo: 3 reintentos con backoff exponencial. Si todos fallan: status → FAILED, rollback.

### 12.2 Webhook Handling

```
POST /webhooks/stripe
  → Validar firma Stripe (stripe-signature header)
  → Si payment_intent.succeeded:
      → Actualizar approval_ticket → COMPLETED
      → Registrar en transactions
      → Resumir LangGraph desde checkpoint
  → Si payment_intent.failed:
      → Actualizar approval_ticket → FAILED
      → Notificar usuario
```

---

## 13. ~~SUPABASE EDGE FUNCTIONS~~ `[DIFERIDO v2+]`

> **Razón:** Las transacciones aprobadas via Edge Function no aplican en v0 (sin pagos, sin HITL
> activo). Reactivar cuando se implemente el protocolo HITL completo.

### 13.1 execute-approved-transaction

**Trigger:** POST request tras aprobación HITL verificada.

**Secuencia:**
1. Fetch `approval_ticket` por ID + verificar `org_id` match.
2. Verificar `mfa_verified_at` no nulo.
3. Verificar `expires_at > NOW()`.
4. Update status → `EXECUTING`.
5. Llamar a procesador de pago (Stripe/Wise).
6. Si éxito: insert en `transactions`, update ticket → `COMPLETED`, crear audit log, enviar notificación, deducir presupuesto.
7. Si fallo: update ticket → `FAILED`, log error, notificar usuario.

**Idempotencia:** La `idempotency_key` es el `approval_ticket_id`, garantizando que una re-ejecución no duplica el pago.

---

## 14. ~~MEMORIA VECTORIAL Y RAG~~ `[DIFERIDO v2+]`

> **Razón:** Sin pgvector en v0. agent_memory tabla preparada pero sin embeddings.
> RAG para enriquecer respuestas se implementará en v2+.

### 14.1 Función de Búsqueda Semántica

```sql
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_org_id UUID
)
RETURNS TABLE (id UUID, content TEXT, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
    SELECT k.id, k.content,
           1 - (k.embedding <=> query_embedding) AS similarity
    FROM knowledge_chunks k
    WHERE k.org_id = filter_org_id
      AND 1 - (k.embedding <=> query_embedding) > match_threshold
    ORDER BY k.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

### 14.2 Limpieza GDPR

```sql
SELECT cron.schedule(
  'delete-expired-memories',
  '0 2 * * *',  -- Diario a las 02:00 UTC
  $$DELETE FROM knowledge_chunks WHERE expires_at < NOW()$$
);
```

---

## 15. n8n — ORQUESTACIÓN DE WORKFLOWS

### 15.1 Arquitectura de Integración

n8n se despliega en entorno privado. Acceso exclusivo vía autenticación API desde OpenClaw server. Los flujos se exponen como webhooks que el LangGraph invoca vía MCP.

### 15.2 Workflow: Lead Purchase

```
[Webhook Trigger]
  → [Validate Leads (HTTP)] (3 retries, 5s delay)
  → [Calculate ROI (Function)]
  → [Create Approval Ticket (Supabase API)]
  → [Wait for Approval (Webhook, timeout 24h)]
  → [Execute Purchase (HTTP)] (2 retries)
  → [Record Transaction (Supabase)]
  → [Notify User (Slack)]
  → [Error Handler → #ops-alerts]
```

---

## 16. ESPECIFICACIÓN DE API

### 16.1 REST API

**Base URL:** `https://api.openclaw.anclora.dev/v1`  
**Auth:** Todas las rutas requieren `Authorization: Bearer <jwt>`.

| Endpoint | Method | Descripción | Auth Level |
|---|---|---|---|
| `/auth/register` | POST | Registro de usuario | Público |
| `/auth/login` | POST | Login (retorna JWT + MFA required flag) | Público |
| `/auth/mfa/verify` | POST | Verificación MFA | Público |
| `/auth/logout` | POST | Logout | Authenticated |
| `/agents` | GET | Listar agentes del usuario | User |
| `/agents` | POST | Crear nuevo agente | Admin |
| `/agents/:id` | GET | Detalle de agente | User |
| `/agents/:id` | PATCH | Actualizar configuración | Admin |
| `/agents/:id` | DELETE | Terminar agente | Owner |
| `/agents/:skill_id/execute` | POST | Ejecutar agente con skill | User |
| `/agents/kill-switch` | POST | Activar Kill Switch | Admin+ |
| `/approvals?status=PENDING_USER` | GET | Tickets pendientes | User |
| `/approvals/:id/approve` | POST | Aprobar (requiere MFA) | Admin+ |
| `/approvals/:id/reject` | POST | Rechazar | User |
| `/skills` | GET | Listar skills | User |
| `/skills` | POST | Crear skill | User |
| `/skills/:id` | PUT | Actualizar skill | User |
| `/limits` | GET | Obtener límites constitucionales | User |
| `/limits` | PUT | Actualizar límites | POWER_USER |
| `/memory/chunks` | POST | Ingestar documento en RAG | User |
| `/memory/search` | GET | Búsqueda semántica | User |
| `/transactions` | GET | Historial de transacciones | User |
| `/transactions/:id` | GET | Detalle + audit log | User |
| `/audit-logs` | GET | Logs de auditoría | Admin+ |
| `/sessions/:id/history` | GET | Historial de conversación | User |

### 16.2 WebSocket API

**Conexión:** `wss://gateway.openclaw.ai/v1/connect`

**Mensajes Server → Client:**

| Tipo | Payload | Descripción |
|---|---|---|
| `agent_state` | `{iteration, reasoning, tool_calls, status}` | Estado en tiempo real del agente |
| `tool_result` | `{tool, result, execution_time_ms}` | Resultado de ejecución de herramienta |
| `approval_required` | `{ticket_id, type, amount, justification, risk_score}` | Ticket HITL pendiente |
| `execution_completed` | `{status, output, tokens_used}` | Ejecución finalizada |
| `agent_response` | `{session_id, chunk, is_final}` | Streaming de respuesta |

**Mensajes Client → Server:**

| Tipo | Payload | Descripción |
|---|---|---|
| `AUTH` | `{jwt}` | Autenticación inicial |
| `USER_MESSAGE` | `{session_id, content, attachments?}` | Mensaje del usuario |
| `pause` | `{}` | Pausar agente |

---

## 17. FRONTEND — DASHBOARD BENTO GRID

### 17.1 Project Structure

```
openclaw-frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (dashboard root)
│   ├── auth/ (login, mfa, setup)
│   ├── dashboard/ (layout + bento-grid)
│   ├── skills/ ([skill-id]/editor, lab)
│   └── api/ (auth routes, approvals, webhooks)
├── components/
│   ├── widgets/ (AgentThoughtStream, MonetaryPulse, EfficiencySavings,
│   │             SkillLab, MemoryNavigator, KillSwitch)
│   ├── ui/ (shadcn/ui components)
│   └── common/ (Header, Navigation, ErrorBoundary)
├── lib/
│   ├── api/ (axios client, approvals, agents)
│   ├── hooks/ (useAuth, useApprovals, useAgent)
│   ├── store/ (Zustand appStore)
│   └── utils/ (formatCurrency, calculateRiskScore)
├── styles/ (globals.css, bento-grid.css)
└── config/ (env.example)
```

### 17.2 Layout del Bento Grid

```
6 columnas × 4 filas (responsive)

┌──────────────────────────────┐  ┌──────────────────┐
│  Agent Thought-Stream        │  │  Monetary Pulse  │
│  (4 col × 2 rows)           │  │  (2 col × 2 rows)│
└──────────────────────────────┘  └──────────────────┘
┌──────────────────┐  ┌──────────────────┐  ┌────────┐
│ Efficiency &     │  │ Skill Lab        │  │Memory  │
│ Savings (2x1)    │  │ (2 col × 2 rows) │  │Nav(2x1)│
└──────────────────┘  └──────────────────┘  └────────┘
                                            ┌────────┐
                                            │Kill-Sw.│
                                            │ (1x1)  │
                                            └────────┘
```

### 17.3 Glassmorphism CSS

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

### 17.4 Widgets — Especificación

| Widget | Grid Size | Datos en Tiempo Real | Fuente |
|---|---|---|---|
| Agent Thought-Stream | 4×2 | Reasoning, tool calls, iteration progress, status | WebSocket `agent_state` |
| Monetary Pulse | 2×2 | Daily/Monthly budget bars, pending approvals count, Approve/Reject buttons | Supabase Realtime `approval_tickets` |
| Efficiency & Savings | 2×1 | ROI estimado, horas ahorradas, costos optimizados, top skill | REST `/analytics` |
| Skill Lab | 2×2 | Lista de skills, editor de código, estado de aprobación | REST `/skills` |
| Memory Navigator | 2×1 | Búsqueda semántica, chunks recientes, embeddings stats | REST `/memory/search` |
| Kill Switch | 1×1 | Botón rojo con confirmación doble + MFA. Borde pulsante si hay incidente activo | REST `/agents/kill-switch` |

---

## 18. ~~CATÁLOGO DE SKILLS MONETIZABLES~~ `[REEMPLAZADO v0]`

> **Razón:** El catálogo genérico (Real Estate sniper, B2B SDR, Marketplace) está reemplazado
> por los 4 skills Anclora definidos en product-spec-v0.md Sección 3.3 y constitution-canonical.md
> Título XIV. Skills v0: lead_intake, prospection_weekly, recap_weekly, dossier_generator (Q2).

### 18.1 Real Estate

| Skill | MCP Tools | Límite Diario | Límite Mensual | Modelo de Revenue |
|---|---|---|---|---|
| Sniper de Oportunidades | zillow_api, mls_search, property_valuation, roi_calculator | €10,000 | €50,000 | €500/mes + 5% deal value |
| Property Management Sentinel | expense_tracking, vendor_price_comparison, payment_automation | €5,000 | €30,000 | 20% de costos reducidos |
| Inversionista Predictivo | market_analysis, financial_modeling | €0 | €0 | Solo análisis (no ejecuta pagos) |

### 18.2 B2B SDR

| Skill | MCP Tools | Límite Diario | Límite Mensual | Modelo de Revenue |
|---|---|---|---|---|
| SDR Autónomo | lead_providers, smtp_send, hubspot_integration, personalization | €2,000 | €20,000 | €0.50/lead + €5/qualified click |
| Legal Auditor | contract_analysis, compliance_check | €0 | €0 | Solo análisis |

### 18.3 Marketplace (Terceros)

| Parámetro | Valor |
|---|---|
| Comisión Anclora | 20% del revenue generado |
| Pago a creators | Mensual vía Wise (80%) |
| Sandbox obligatorio | Nivel strict |
| Revocación automática | Risk score promedio > 0.80 durante 30 días |
| Failure rate máximo | 10% en 30 días (si supera → deprecated) |

---

## 19. SEGURIDAD, CIFRADO Y OWASP

### 19.1 Cifrado

| Capa | Estándar |
|---|---|
| En tránsito | TLS 1.3 mínimo. Mutual TLS entre servicios internos. Certificate pinning para APIs críticas |
| En reposo | AES-256-GCM para campos con PII. Transparent encryption en Supabase |
| Gestión de claves | Supabase Vault. Rotación: master keys 90 días, API keys 180 días |
| Embeddings | PII redactada antes de vectorización |
| Backups | Cifrado en disco (server-side encryption) |

### 19.2 Matriz de Control de Acceso

| Rol | Datos Visibles | Aprobar TX | Kill Switch | Audit Logs |
|---|---|---|---|---|
| End User | Propios | Propias | Propios agentes | Propios |
| Manager | Equipo | Equipo | Escalar | Equipo |
| CFO/Ejecutivo | Company-wide | TX > €5K | Escalar | Company |
| CTO | Todos | Todas | Sí (total) | Todos |
| SOC/Security | Audit trail | No | Sí | Todos |
| Auditor Externo | Compliance (limited) | No | No | Compliance |

### 19.3 Headers de Seguridad

HSTS (Strict-Transport-Security), CSP (Content-Security-Policy), X-Frame-Options: DENY, X-Content-Type-Options: nosniff. Solo HTTPS.

### 19.4 Runbook: SQL Injection Detectada

1. Kill Switch automático (0-5 min).
2. Aislar conexiones DB afectadas.
3. PagerDuty → CTO + SOC. Slack #security-incidents.
4. Pull query logs de Supabase audit (5-30 min).
5. Verificar exfiltración de datos.
6. Parche → staging → code review → producción (30min-2h).
7. Notificar usuarios afectados. GDPR breach assessment. Post-mortem (2-24h).

---

## 20. ~~INFRAESTRUCTURA, CI/CD Y DEPLOYMENT~~ `[ELIMINADO v0]`

> **Razón:** GKE, Terraform, Cloud Run eliminados. v0 usa Vercel (frontend) + Railway (backend + n8n).
> CI/CD simplificado: GitHub Actions para tests + deploy a Vercel/Railway.

### 20.1 Componentes de Infraestructura

| Componente | Servicio | Configuración |
|---|---|---|
| Frontend | Vercel | Auto-deploy desde GitHub. Preview deployments por PR |
| Database | Supabase PostgreSQL | 2 vCPU, 8GB RAM, 100GB SSD. Region: eu-central-1 |
| LangGraph Agent | GCP Cloud Run | Auto-scaling. Region: europe-west1 |
| LLM (Ollama) | GKE | 2 replicas, 8Gi RAM, 4 CPU por pod. GPU opcional |
| MCP Containers | Docker (GCP) | Isolated network, auto-scaling |
| Load Balancer | Cloudflare | WebSocket support, TLS 1.3, DDoS protection |
| Object Storage | Supabase Storage + S3 | Documentos, audit logs fríos, backups |
| Workflows | n8n (auto-hosted) | Entorno privado, acceso solo vía API interna |

### 20.2 CI/CD Pipeline (GitHub Actions)

```yaml
on:
  push: [main, staging]
  pull_request: [main, staging]

jobs:
  test:          # npm ci → npm test → npm audit → npm lint
  security:      # Trivy filesystem scan + super-linter
  deploy-staging:  # if staging → Vercel staging
  deploy-production: # if main → Vercel prod + Cloud Run deploy
```

### 20.3 IaC (Terraform)

Recursos gestionados: Vercel project, Supabase project (eu-central-1), GCP Cloud Run service, GKE deployment (Ollama), networking, secrets.

---

## 21. ~~MONITORIZACIÓN Y OBSERVABILIDAD~~ `[ELIMINADO v0]`

> **Razón:** Prometheus/Grafana eliminados. v0 usa Supabase Dashboard + Railway logs.
> AgentStream widget del dashboard muestra actividad de agentes en tiempo real.

### 21.1 Métricas Prometheus

| Métrica | Tipo | Descripción |
|---|---|---|
| `openclaw_active_sessions` | Gauge | Sesiones de agente activas |
| `openclaw_token_consumption_total` | Counter | Tokens LLM consumidos (por modelo) |
| `openclaw_approval_queue_size` | Gauge | Tickets HITL pendientes |
| `openclaw_tool_call_duration_seconds` | Histogram | Latencia de ejecución de herramientas |
| `openclaw_error_rate` | Counter | Operaciones fallidas (por tipo) |
| `openclaw_budget_burn_rate` | Gauge | Ritmo de gasto presupuestario |

### 21.2 Alertas Grafana

| Condición | Severidad | Canal |
|---|---|---|
| Error rate > 10% (5min window) | Warning | Slack |
| Approval queue > 10 tickets (10min) | Critical | PagerDuty |
| Budget > 80% | Warning | Email |
| 5 MFA failures | Critical | Security + bloqueo |
| Agent unresponsive > 2min | Warning | Dashboard |
| Agent unresponsive > 5min | Critical | Kill Switch L2 |

---

## 22. ~~BACKUP, DISASTER RECOVERY Y SLA~~ `[DIFERIDO v2+]`

> **Razón:** SLA enterprise, DR formal, backup automatizado diferidos. v0 depende de
> Supabase built-in backups y Railway snapshots.

### 22.1 Backups

| Tipo | Frecuencia | Retención |
|---|---|---|
| Supabase automated snapshots | Diario | 30 días |
| Point-in-time recovery (WAL) | Continuo | 7 días |
| Manual snapshots | Pre-migración | Indefinido |

### 22.2 Objetivos de Recuperación

| Métrica | Objetivo |
|---|---|
| RTO (Recovery Time Objective) | 1 hora |
| RPO (Recovery Point Objective) | 15 minutos (Supabase WAL replication) |

### 22.3 Procedimiento de Recovery

1. Identificar fallo (alertas de monitorización, reports de usuarios).
2. Evaluar impacto (usuarios afectados, alcance de pérdida de datos).
3. Restaurar desde backup más cercano (Supabase dashboard o CLI).
4. Replay audit logs para recuperar transacciones perdidas.
5. Validar integridad con checksums.
6. Comunicar estado a usuarios afectados.

---

## 23. GUÍA DE DESARROLLO

### 23.1 Code Style

| Lenguaje | Estándar | Herramientas |
|---|---|---|
| Python (Agent Core) | PEP 8. Type hints obligatorios (`mypy --strict`). Docstrings Google format. Max 100 chars/línea | mypy, black, ruff |
| TypeScript (Gateway + Frontend) | Strict mode. No `any` (usar `unknown` + type guards). Async/await over callbacks | ESLint + Prettier |

### 23.2 Testing Strategy

| Tipo | Cobertura Objetivo | Framework | Scope |
|---|---|---|---|
| Unit | > 80% | pytest (Python), Jest (TS) | Lógica de negocio, risk scoring, validaciones |
| Integration | Key flows | pgTAP + pytest | RLS policies, HITL workflow E2E, vector search accuracy |
| Load | 1000 concurrent WS | k6 / Artillery | WebSocket connections, lane queue throughput, DB query perf |
| Security | OWASP Top 10 | OWASP ZAP | Staging environment scans |

### 23.3 Security Best Practices

1. Nunca loguear datos sensibles (API keys, JWTs, tarjetas de crédito).
2. Queries parametrizadas exclusivamente (prevención SQL injection).
3. Validar todos los inputs contra allowlists.
4. Rotar secrets cada 90 días.
5. OWASP ZAP scans en staging antes de cada release.

---

## 24. ~~ROADMAP DE IMPLEMENTACIÓN~~ `[REEMPLAZADO]`

> **Razón:** El roadmap OpenClaw genérico está reemplazado por el roadmap Anclora Nexus
> en product-spec-v0.md Sección 4: Q1 Foundation + Lead Intake, Q2 Prospection + Recap,
> Q3-Q4 Validación + Decisión B2B.

| Fase | Período | Entregables |
|---|---|---|
| **Phase 0: Foundation** | M0 – M1 | Supabase setup + RLS. Next.js boilerplate + Bento Grid. LangGraph skeleton. HITL flow básico (sin pagos) |
| **Phase 1: Core Agent** | M1 – M3 | LLM integration (Ollama + Llama 3.3). 3-5 MCP tools iniciales. WebSocket streaming. Risk scoring. Approval ticket UI |
| **Phase 2: Real Estate MVP** | M3 – M5 | Sniper de Oportunidades funcional. Zillow/MLS API. ROI engine. Stripe payments. Audit logging |
| **Phase 3: B2B SDR** | M5 – M7 | SDR Autónomo. Lead provider APIs (Apollo, Hunter). Email personalization. HubSpot CRM integration |
| **Phase 4: Marketplace** | M7 – M9 | Skill submission/approval flow. Creator dashboard. Commission tracking. Performance monitoring |
| **Phase 5: Scale & Polish** | M9 – M12 | Multi-language (EN/ES). Advanced ML models. Custom skill builder UI. SOC 2 certification |

---

## 25. REQUISITOS NO FUNCIONALES

| Requisito | Métrica | Objetivo |
|---|---|---|
| Latencia de respuesta (P95) | Tiempo desde input hasta primer token streaming | < 2 segundos |
| Disponibilidad | Uptime mensual | 99.9% (excluye mantenimiento programado) |
| Throughput WebSocket | Conexiones concurrentes | 1,000 mínimo |
| Throughput API REST | Requests por segundo | 500 rps |
| Time to HITL Notification | Tiempo desde detección monetaria hasta alerta en dashboard | < 3 segundos |
| Audit Log Write Latency | Tiempo de escritura en audit_log | < 100ms |
| Vector Search Latency | Búsqueda semántica (top-5) | < 500ms |
| Kill Switch Activation | Tiempo desde trigger hasta congelación de agentes | < 5 segundos |
| GDPR Data Export | Tiempo para generar export completo | < 30 minutos |

---

## 26. CHECKLIST DE ACEPTACIÓN / QA

- [ ] Todas las tablas tienen RLS habilitado y policies testeadas con pgTAP
- [ ] audit_log es inmutable (UPDATE/DELETE bloqueados para todos los roles)
- [ ] HITL flow E2E: creación de ticket → notificación → MFA → ejecución → audit log
- [ ] Kill Switch L1-L4 testeados con chaos engineering
- [ ] Risk scoring produce valores correctos para los 20 escenarios de test definidos
- [ ] MFA enforcement verificado (no se puede aprobar sin MFA si risk > 0.7)
- [ ] Stripe webhook handling con idempotency verificada
- [ ] Docker MCP sandboxes sin acceso a red por defecto (verificado con nmap)
- [ ] JWT expiration y refresh flow funcionando (30min / 7d)
- [ ] WebSocket streaming de agent state con < 3s latency
- [ ] Lane queue maneja 1000 concurrent sessions sin deadlock
- [ ] Heartbeat detecta agent unresponsive en < 3 minutos
- [ ] Glassmorphism rendering correcto en Chrome, Firefox, Safari, Edge
- [ ] OWASP ZAP scan sin findings Critical/High en staging
- [ ] Budget hard stop funciona (gasto = límite → agentes pausados)
- [ ] Backup restore testeado (RTO < 1h, RPO < 15min)
- [ ] Variables de entorno nunca expuestas al cliente
- [ ] Error boundaries en todos los widgets del dashboard

---

## 27. SUPUESTOS Y DECISIONES TOMADAS

| ID | Decisión | Alternativa Descartada | Justificación |
|---|---|---|---|
| D-01 | Multi-tenant con `org_id` en todas las tablas | `user_id` como unit of isolation (V1/V4) | Escalabilidad para equipos y empresas. Alineado con SaaS B2B |
| D-02 | EUR como divisa principal | USD (V1/V4) | Mercado target EU/España. Parametrizable para otros mercados |
| D-03 | Supabase Vault para secrets | AWS KMS / HashiCorp Vault (V2) | Reduce complejidad operativa. Vault integrado con Supabase |
| D-04 | Ollama como LLM primary, Claude como fallback | Solo Claude / Solo Ollama | Open-source first (Constitution Art. 2.8) con ceiling de calidad como safety net |
| D-05 | TTL de tickets HITL: 24 horas | 1 hora (V1) | Más implementable con flujos de escalación multi-nivel |
| D-06 | Risk score scale [0.0, 1.0] con NUMERIC(3,2) | INT 0-100 (V2 en approval_tickets) | Consistencia con Constitution Título V. Normalizado |
| D-07 | Gateway WebSocket separado (Node.js) | WebSocket integrado en Next.js API routes | Separación de concerns. Escalado independiente del frontend |
| D-08 | n8n como orquestador de workflows complejos | Todo en LangGraph | n8n aporta 400+ integraciones out-of-box, visual debugging, retry nativo |
| D-09 | `weekly_limit` incluido en `agent_limits` | Solo daily + monthly (V1) | Granularidad adicional para control presupuestario (Constitution Art. 3.7) |
| D-10 | Glassmorphism dark theme | Light theme / Material UI | Identidad visual diferenciadora. Alineado con branding Anclora |

---

## 28. VARIABLES DE ENTORNO

```bash
# === Supabase ===
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
SUPABASE_DB_URL=postgresql://postgres:password@db.supabase.co:5432/postgres

# === LLM ===
OLLAMA_BASE_URL=http://ollama-service:11434
OLLAMA_MODEL=llama3.3:70b
REPLICATE_API_TOKEN=xxxxx
ANTHROPIC_API_KEY=xxxxx  # Fallback

# === Payments ===
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
WISE_API_KEY=xxxxx

# === Security ===
JWT_SECRET=xxxxx
AUDIT_SECRET_KEY=xxxxx  # HMAC-SHA256 signing
ENCRYPTION_KEY=xxxxx    # AES-256 at-rest

# === Monitoring ===
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# === n8n ===
N8N_HOST=n8n-internal.openclaw.ai
N8N_API_KEY=xxxxx
```

**Regla:** Ningún secret se expone al cliente. `NEXT_PUBLIC_` solo para `SUPABASE_URL` y `SUPABASE_ANON_KEY`.

---

## 29. METADATOS DEL DOCUMENTO

```yaml
Title: "Anclora Nexus — Especificación Técnica (OpenClaw Kernel)"
Version: 1.1.0-nexus
Base: spec-openclaw-full.md v1.0.0
Status: "VIGENTE — Anclora Nexus v0 (Beta)"
Date: Febrero 2026
Classification: Internal / Confidential
Owner: Toni Amengual (Owner, Anclora Private Estates)
Context: Single-tenant, inmobiliaria de lujo, Mallorca SW
Related Documents:
  - constitution-canonical.md (Norma Suprema)
  - product-spec-v0.md (Definición de Producto)
  - prompt-antigravity-anclora-nexus-v0.md (Prompt de construcción)
  - spec-openclaw-full.md (Spec completa archivada)
  - constitution-openclaw-full.md (Constitución completa archivada)
Compliance: GDPR básico (v0). PCI-DSS + SOC 2 diferidos a v2+.
```

---

*FIN DE ESPECIFICACIÓN TÉCNICA — ANCLORA NEXUS v0*

---
---

# ARCHITECTURAL & EDITORIAL REPORT

---

## A) Mejoras Introducidas

### A.1. Multi-Tenant con `org_id` (reemplazo de `user_id`)

**Cambio:** Todas las tablas del schema usan `org_id` como clave de aislamiento en lugar de `user_id`.

**Origen:** V1/V4 utilizaban `user_id` como unidad de aislamiento, lo que limita a un modelo single-user. V2 mencionaba roles (manager, CFO, CTO) que implícitamente requieren organizaciones. V3 mencionaba "aislamiento multi-inquilino" pero sin schema.

**Beneficio:** Permite equipos, roles jerárquicos y facturación por organización. Alineado con el modelo SaaS B2B descrito en la Constitution (que usa `org_id` consistentemente). Se añadió tabla `org_memberships` para la relación N:N entre users y organizations.

### A.2. Schema `agent_limits` con `weekly_limit`

**Cambio:** Se añadió `weekly_limit` y `current_weekly_usage` al schema de `agent_limits`.

**Origen:** V1/V4 solo tenían daily + monthly. V3 mencionaba weekly en texto. V2 no lo incluía en schema.

**Beneficio:** Consistencia con Constitution Art. 3.7 (tope semanal). Granularidad adicional para control presupuestario.

### A.3. `incident_logs` con `kill_switch_level`

**Cambio:** Se añadió campo `kill_switch_level` (L1-L4) a la tabla `incident_logs`, alineando el schema con los 4 niveles definidos en la Constitution Título VII.

**Origen:** V2 tenía la tabla pero sin granularidad de niveles. V1/V4 no tenían tabla de incidentes.

**Beneficio:** Trazabilidad completa de qué nivel de Kill Switch se activó en cada incidente.

### A.4. Sección de Requisitos No Funcionales con Métricas Cuantificables

**Cambio:** Se añadió sección 25 con 9 requisitos no funcionales, cada uno con métrica y objetivo numérico.

**Origen:** Ninguna versión incluía NFRs formales. V1/V4 mencionaban RTO/RPO. V3 mencionaba "performance" de forma narrativa.

**Beneficio:** Criterios de aceptación verificables. Un equipo de QA puede validar cada NFR con herramientas estándar.

### A.5. Checklist de Aceptación / QA (Sección 26)

**Cambio:** Se añadió checklist de 18 ítems verificables que cubren seguridad, funcionalidad, performance y UX.

**Origen:** V1/V4 tenían testing guidelines genéricas. Ninguna versión tenía checklist de aceptación formal.

**Beneficio:** Go/No-Go verificable antes de launch. Cada ítem es binario (pasa/no pasa).

### A.6. Decisiones Documentadas (Sección 27)

**Cambio:** Se documentaron 10 decisiones arquitectónicas con alternativa descartada y justificación.

**Origen:** Las versiones tomaban decisiones implícitas sin documentar alternativas.

**Beneficio:** Trazabilidad de decisiones. Un futuro arquitecto entiende por qué se eligió cada opción.

### A.7. Eliminación de Código Implementación Extenso

**Cambio:** Se redujo el código inline de ~800 líneas (V2) a snippets representativos en las secciones de schema y funciones críticas.

**Origen:** V2 incluía componentes React completos (~200 líneas cada uno), Edge Functions completas (~150 líneas), clase LangGraph completa (~250 líneas).

**Beneficio:** La spec define *qué* se construye y *cómo* se integra, no la implementación línea por línea. El código extenso pertenece al repositorio, no al spec.md. Se conservaron los snippets SQL (schema, RLS, vector search) porque definen contratos de datos.

---

## B) Conflictos Resueltos

| Tema | Decisión Final | Versiones | Criterio |
|---|---|---|---|
| **Unit of isolation: `org_id` vs `user_id`** | `org_id` (multi-tenant) | V1/V4: user_id. V2: implícito org. V3: multi-tenant narrativo | A2 (más extensible) + A3 (alineado con Constitution) |
| **Divisa: EUR vs USD** | EUR como default, parametrizable | V1/V4: USD. V2/V3: EUR | A1 (mayoría) + mercado target EU |
| **Risk score en DB: NUMERIC(3,2) vs INT** | NUMERIC(3,2) [0.00, 1.00] | V2: `risk_score INT DEFAULT 0` en approval_tickets. V1: NUMERIC(3,2) | A2 (consistencia con Constitution Título V que define escala 0.0-1.0) |
| **Ticket TTL: 1h vs 24h** | 24 horas | V1: `expires_at` con 1h. V2/V3: 24h implícito | A2 (implementable con escalación multi-nivel de Constitution Art. 6.3) |
| **Gateway: separado vs integrado en Next.js** | Gateway WebSocket separado (Node.js) | V1: Gateway server explícito. V2: WebSocket en Next.js API routes | A3 (separación de concerns, escalado independiente) |
| **LLM fallback chain** | Ollama → Replicate → Claude | V1: No especificaba fallback. V2: Ollama → Replicate. V3: mencionaba Claude | A2 (máxima disponibilidad con 3 niveles) |
| **n8n: incluido vs excluido** | Incluido como orquestador secundario | V1: no mencionaba n8n. V2: n8n con workflow detallado. V3: n8n como integración MCP | A1 (consenso V2+V3) + A2 (400+ integraciones out-of-box) |
| **Monitoring: Prometheus vs nativo Supabase** | Prometheus + Grafana | V1: Prometheus explícito con config. V2: mencionaba Sentry/ELK. V3: SIEM genérico | A1 (V1 más detallado) + A2 (estándar de industria) |
| **Frontend state: Zustand vs Redux** | Zustand | V2: Zustand explícito en package.json. V1/V3: no especificaban | A4 (menos boilerplate, suficiente para MVP) |
| **Soft delete en skills** | Sí (`deleted_at` nullable) | V2: incluía `deleted_at`. V1: no | A3 (recuperabilidad, auditoría) |

---

## C) Decisiones Propuestas

| ID | Decisión Propuesta | Alternativas | Impacto |
|---|---|---|---|
| DP-01 | **Pinecone omitido del MVP.** pgvector es suficiente para el volumen beta. Si se supera 1M embeddings, evaluar Pinecone | Incluir Pinecone desde M0 (V2 lo mencionaba como opcional) | Reduce complejidad operativa. Riesgo: si el volumen crece rápido, migración vectorial requerida |
| DP-02 | **Redis omitido del MVP.** Session management vía Supabase Auth + JWT. Si se requiere caché de alta velocidad, añadir Redis | V2 incluía Redis en docker-compose | Reduce infraestructura. Riesgo: si rate limiting o caching se vuelven críticos, añadir post-MVP |
| DP-03 | **Temporal (event sourcing) diferido.** El audit_log append-only en Supabase cubre requisitos de auditoría. Temporal se evalúa para M6+ | V2 mencionaba Temporal Event Store. V3 lo referenciaba | Reduce complejidad M0-M6. Constitution compatible con ambos (Art. 10.1) |
| DP-04 | **Cookie httpOnly para JWT en web** (en lugar de localStorage mencionado en V1) | localStorage (V1), sessionStorage | httpOnly previene XSS access al token. Más seguro |
| DP-05 | **GKE para Ollama** (en lugar de EC2 de V1) | EC2 t3.medium (V1), Railway | GPU support nativo, auto-scaling, managed Kubernetes |

---

## D) Preguntas Abiertas

| ID | Pregunta | Impacto | Versiones que la plantean |
|---|---|---|---|
| Q-01 | ¿HSM (Hardware Security Module) para claves de pago o Supabase Vault es suficiente para PCI-DSS? | Afecta certificación PCI-DSS Level 1. HSM añade coste pero mayor seguridad | V3 sugiere HSM. V1/V2 usan Vault |
| Q-02 | ¿El modelo Ollama primary será Llama 3.3 70B o Mistral 7B? Depende de la GPU disponible en GKE | Afecta costes de infraestructura y calidad de reasoning | V2 menciona ambos. V3 menciona Llama 2 / Mistral 7B |
| Q-03 | ¿Se requiere mTLS entre todos los servicios internos o solo TLS estándar? | mTLS añade seguridad pero complejidad operativa | V2 menciona mTLS. V1 solo TLS |
| Q-04 | ¿Las Edge Functions para pagos se ejecutan en Supabase Edge Runtime (Deno) o en Cloud Run (Docker)? | Afecta timeout limits (Supabase Edge: 60s max) y cold starts | V2 usa Supabase Edge. V1 no especifica runtime |
| Q-05 | ¿El dashboard Bento Grid es responsive o se diseña desktop-first con mobile como secundario? | Afecta UX/UI scope del MVP | Ninguna versión lo especifica explícitamente |
| Q-06 | ¿Integración con DocuSign para firmas digitales en workflow de escalación C-level? | Feature opcional. No bloquea MVP | V3 de constitution lo mencionaba |

---

*FIN DEL ARCHITECTURAL & EDITORIAL REPORT*
