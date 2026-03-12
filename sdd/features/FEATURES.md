# FEATURES - ANCLORA NEXUS

**Registro centralizado de features implementadas y en especificación**

---

## TRAMO PRODUCTIVO Q2 2026

### Release tranche BL-001 → BL-011

Estado: `Implemented`

Bloques cerrados y empujados en `main`:

- `ANCLORA-TSCP-001 v1.2` Territorial Sync Control Plane
- `ANCLORA-SCUI-001 v1.2` Source Connectors Unified Ingestion seller-side
- `ANCLORA-SEWS-001 v1.2` Supervised Email & WhatsApp Send
- `ANCLORA-STFX-002 v1.1` StateFox Telegram Bridge
- `ANCLORA-STFX-LC-001 v1.0` StateFox Live Capture
- `ANCLORA-SPO-001 v1.2` Source Performance Observatory
- `ANCLORA-GAA-001 v1.2` Guardrailed Automation & Operational Alerting
- `ANCLORA-SMSR-001 v1.1` Seller Memory Semantic Recall
- `ANCLORA-GCWW-001 v1.2` Gravity Claw Whale Workbench contextual
- `ANCLORA-FCCC-001 v1.2` FinOps and Commercial Command Center productivo
- `ANCLORA-TCH-001 v1.0` Tenant Config Hardening
- `ANCLORA-RGQ-001 v1.0` Release Gate Operational QA

Dependencias DB recientes:

- `040_seller_contact_channels_and_supervised_send.sql`
- `041_ingestion_entity_type_seller_signal.sql`
- `042_operational_automation_alerts.sql`
- `043_seller_memory_semantic_recall.sql`

Resultado funcional:

- seller pipeline operable end-to-end
- intelligence territorial conectada a sellers
- outreach HITL trazable
- memoria semántica seller-side
- observabilidad operativa y command center ejecutivo

### Expansión post-GO

Estado: `Implemented`

- `ANCLORA-MTIP-001 v1.0` Multi-Tenant Intelligence Packs
- `ANCLORA-NBUY-001 v1.0` Nexus Buyers
- `ANCLORA-BMCR-001 v1.0` Buyer Memory Contextual Recall
- `ANCLORA-PAA-001 v1.0` Private Area Access Architecture
- `ANCLORA-SPA-001 v1.0` Synergi Partner Admission
- `ANCLORA-SPW-001 v1.0` Synergi Partner Workspace
- `ANCLORA-SPW-002 v1.0` Synergi Partner Workspace v2
- `ANCLORA-BPNM-001 v1.0` Buyer Partner Network Management
- `ANCLORA-DLAB-001 v1.0` Data Lab Portal
- `ANCLORA-DLAB-002 v1.0` Data Lab Selective Access

Resultado funcional:

- catálogo de packs de inteligencia por tenant
- activación de pack territorial/comercial por `org_id`
- endpoints territoriales capaces de resolver el pack activo o uno explícito
- pantalla `Intelligence` preparada para convivir con Suroeste, Tramuntana u otros packs por tenant
- buyer intake v1 por referrals, CRM reactivation y web inbound
- buyer profiles enriquecidos con fuente, referral, scores e intelligence pack opcional
- buyer memory contextual derivada de perfil, matches y actividad

---

## FEATURES IMPLEMENTADAS

### 1. Intelligence v1

**ID**: ANCLORA-INT-001  
**Versión**: 1.0  
**Status**: Implemented  
**Fase**: Phase 0 (Operacional)

**Descripción**: Sistema de decisión autónomo con Governor, Router y Synthesizer. Planificación de queries, análisis de riesgos y síntesis de información.

**Documentación**:
- SDD: `sdd/features/intelligence/spec-intelligence-v1.md`
- Rules: `.agent/rules/feature-intelligence.md`
- SKILL: `.agent/skills/features/intelligence/SKILL.md`
- Prompt: `.antigravity/prompts/feature-intelligence-v1.md`

**Timeline**:
- Especificación: 2026-01-XX
- Implementación: 2026-01-XX
- Deploy: 2026-01-XX (Production)

**Permisos**: 
- Acceso: Owner, Manager
- Status: Activa

**Dependencias**: Core API, Core Database

---

## FEATURES EN ESPECIFICACIÓN

### 1. Multi-Tenant Memberships v1

**ID**: ANCLORA-MTM-001  
**Versión**: 1.0  
**Status**: Specification Phase  
**Fase**: Prerequisito integrado (Phase 1)  
**Prioridad**: CRÍTICA

**Descripción**: Implementa modelo organizativo con tres roles jerárquicos (Owner, Manager, Agent) y aislamiento de datos por organización. Prerequisito para Phase 1 (validación inmobiliaria) que requiere separación de datos por usuario/rol.

**Características clave**:
- Tabla `organization_members` (gestión de membresía)
- Tres roles: Owner (control total), Manager (supervisión), Agent (ejecución)
- Aislamiento org_id en leads, properties, tasks
- 6 endpoints nuevos para gestión de miembros
- 5+ endpoints modificados con filtrado
- UI Team Management (Owner gestiona equipo)
- Flujo invitación: código único → aceptación → acceso

**Documentación**:
- **SDD Index**: `sdd/features/multitenant/INDEX.md` ← LEER PRIMERO
- **Spec Técnica**: `sdd/features/multitenant/spec-multitenant-v1.md` (implementación)
- **Spec Migración**: `sdd/features/multitenant/spec-multitenant-migration.md` (datos históricos)
- **Feature Rules**: `.agent/rules/feature-multitenant.md` (arquitectura)
- **SKILL**: `.agent/skills/features/multitenant/SKILL.md` (métodos)
- **Prompt Antigravity**: `.antigravity/prompts/feature-multitenant-v1.md` (generación)

**Alcance v1**:
- ✅ Tabla `organization_members` + índices
- ✅ Aislamiento básico por org_id + rol
- ✅ Endpoints CRUD memberships
- ✅ Middleware de validación
- ✅ UI Team Management
- ✅ Flujo invitación por código
- ❌ RLS nativo PostgreSQL (v2)
- ❌ Email automático (v1.1)
- ❌ Multi-org por usuario (v2)

**Timeline estimado**:

| Actividad | Duración | Status |
|-----------|----------|--------|
| Especificación | 1 día | ✅ Completado |
| Antigravity Generation | 2-3 horas | ⏳ Pendiente |
| Local Development | 1 día | ⏳ Pendiente |
| Testing & QA | 1 día | ⏳ Pendiente |
| Staging Deploy | 2 horas | ⏳ Pendiente |
| Production Deploy | 1 hora | ⏳ Pendiente |
| **Total** | **3-4 días** | — |

**Dependencias**:
- PostgreSQL 14+
- FastAPI 0.100+
- Next.js 14+
- Supabase 1.0+

**Pre-requisitos de Phase 1**:
- [ ] Multi-Tenant Memberships v1 debe estar IMPLEMENTED
- [ ] Data migration completada sin pérdida
- [ ] Tests pasando (80%+ cobertura)
- [ ] Production deploy exitoso

**Costo**:
- Tokens Antigravity estimados: 15,000
- Presupuesto disponible: 38.06€
- Costo estimado: 7.50€
- Buffer post-implementación: 30.56€

**Permisos post-implementación**:
- Owner: Control total de org
- Manager: Lectura/escritura todo, no puede cambiar roles
- Agent: Solo datos asignados

**Cambios Core documentados**:
- Database: 3 migraciones (008, 009, 010)
- API: Middleware nuevo + endpoints modificados
- Ver: `.sdd/core/CHANGELOG.md` (actualizado)

**Owner**: Toni (CTO Anclora)  
**Lead Técnico**: Toni  
**Status Aprobación**: ⏳ Pendiente (SDD formal)

---

### 2. Prospection & Buyer Matching v1

**ID**: ANCLORA-PBM-001  
**Versión**: 1.0  
**Status**: Implemented  
**Fase**: Growth Engine  
**Prioridad**: CRÍTICA

**Descripción**: Añade prospección de inmuebles high-ticket, prospección de compradores potenciales y motor de vinculación comprador-propiedad con scoring explicable para priorizar cierres y comisión.

**Características clave**:
- Entidades nuevas de prospección y matching.
- `high_ticket_score` por inmueble.
- `match_score` por vínculo buyer-property.
- Registro de actividad comercial por match.
- Priorización de oportunidades por score y valor esperado.

**Documentación**:
- **SDD Index**: `sdd/features/prospection-matching-INDEX.md`
- **Spec Técnica**: `sdd/features/prospection-matching-spec-v1.md`
- **Spec Migración**: `sdd/features/prospection-matching-spec-migration.md`
- **Test Plan**: `sdd/features/prospection-matching-test-plan-v1.md`
- **Feature Rules**: `.agent/rules/feature-prospection-matching.md`
- **SKILL**: `.agent/skills/features/prospection-matching-SKILL.md`
- **Prompt Antigravity**: `.antigravity/prompts/feature-prospection-matching-v1.md`

**Reglas de compliance**:
- No scraping no autorizado.
- No contacto irreversible sin paso humano.
- Trazabilidad obligatoria de fuentes y scoring.

**Status Aprobación**: ⏳ Pendiente (SDD formal)

---

### 3. Lead Source Observability v1

**ID**: ANCLORA-LSO-001  
**Versión**: 1.0  
**Status**: Implemented  
**Fase**: Data Quality & Attribution  
**Prioridad**: ALTA

**Descripción**: Añade trazabilidad completa del origen de clientes/leads (manual, web CTA, social+CTA, import, referral), con metadatos de captación para atribución comercial y base de políticas de edición por origen.

**Documentación**:
- **SDD Index**: `sdd/features/lead-source-observability/lead-source-observability-INDEX.md`
- **Spec Técnica**: `sdd/features/lead-source-observability/lead-source-observability-spec-v1.md`
- **Spec Migración**: `sdd/features/lead-source-observability/lead-source-observability-spec-migration.md`
- **Test Plan**: `sdd/features/lead-source-observability/lead-source-observability-test-plan-v1.md`
- **Feature Rules**: `.agent/rules/feature-lead-source-observability.md`
- **SKILL**: `.agent/skills/features/lead-source-observability/SKILL.md`
- **Prompt Antigravity**: `.antigravity/prompts/feature-lead-source-observability-v1.md`

---

### 4. Currency & Surface Localization v1

**ID**: ANCLORA-CSL-001  
**Versión**: 1.0  
**Status**: Implemented  
**Fase**: Commercial UX & Data Quality  
**Prioridad**: CRÍTICA

**Descripción**: Unifica el formateo de importes por moneda (independiente del idioma), introduce desglose de superficies (`útil`, `construida`, `terreno`) y define reglas de editabilidad por origen para propiedades y contactos.

**Documentación**:
- **SDD Index**: `sdd/features/currency-surface-localization/currency-surface-localization-INDEX.md`
- **Spec Técnica**: `sdd/features/currency-surface-localization/currency-surface-localization-spec-v1.md`
- **Spec Migración**: `sdd/features/currency-surface-localization/currency-surface-localization-spec-migration.md`
- **Test Plan**: `sdd/features/currency-surface-localization/currency-surface-localization-test-plan-v1.md`
- **Feature Rules**: `.agent/rules/feature-currency-surface-localization.md`
- **SKILL**: `.agent/skills/features/currency-surface-localization/SKILL.md`
- **Prompt Antigravity**: `.antigravity/prompts/currency-surface-localization/feature-currency-surface-localization-v1.md`

---

### 5. Cost Governance Foundation v1

**ID**: ANCLORA-CGF-001  
**Versión**: 1.0  
**Status**: Implemented  
**Fase**: FinOps Foundation  
**Prioridad**: CRÍTICA

**Descripción**: Introduce presupuesto mensual por organización, registro de consumo por capability y alertas de umbral/hard-stop para evitar sobrecoste operativo.

**Documentación**:
- **SDD Index**: `sdd/features/cost-governance-foundation/cost-governance-foundation-INDEX.md`
- **Spec Técnica**: `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-v1.md`
- **Spec Migración**: `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-migration.md`
- **Test Plan**: `sdd/features/cost-governance-foundation/cost-governance-foundation-test-plan-v1.md`
- **SKILL**: `.agent/skills/features/cost-governance-foundation/SKILL.md`
- **Prompts Antigravity**: `.antigravity/prompts/features/cost-governance-foundation/`

---

### 6. Source Connectors Unified Ingestion v1.2

**ID**: ANCLORA-SCUI-001  
**Versión**: 1.2  
**Status**: Implemented  
**Fase**: Ingestion & Normalization  
**Prioridad**: ALTA

**Descripción**: Crea una capa unificada de conectores para ingestión de leads, propiedades y `seller_signals`, con contrato canónico, idempotencia por `dedupe_key`, trazabilidad operativa por fuente y resolución live-first con fallback controlado a snapshot seller-side.

**Documentación**:
- **SDD Index**: `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-INDEX.md`
- **Spec Técnica**: `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1_2.md`
- **Spec Migración**: `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-migration.md`
- **Test Plan**: `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-test-plan-v1_2.md`
- **SKILL**: `.agent/skills/features/source-connectors-unified-ingestion/SKILL.md`
- **Prompts Antigravity**: `.antigravity/prompts/features/source-connectors-unified-ingestion/`

---

### 7. Data Quality and Entity Resolution v1

**ID**: ANCLORA-DQER-001  
**Versión**: 1.0  
**Status**: Specification Phase  
**Fase**: Data Quality & Identity  
**Prioridad**: ALTA

**Descripción**: Implementa reglas de calidad y resolución de entidades para detectar/gestionar duplicados de leads y propiedades entre fuentes, con score explicable y trazabilidad auditable.

**Documentación**:
- **SDD Index**: `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-INDEX.md`
- **Spec Técnica**: `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-v1.md`
- **Spec Migración**: `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-migration.md`
- **Test Plan**: `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-test-plan-v1.md`
- **SKILL**: `.agent/skills/features/data-quality-and-entity-resolution/SKILL.md`
- **Prompts Antigravity**: `.antigravity/prompts/features/data-quality-and-entity-resolution/`

---

### 8. Content Design and Localization Governance v1

**ID**: ANCLORA-CDLG-001  
**Versión**: 1.0  
**Status**: Implemented  
**Fase**: Content Governance & Localization  
**Prioridad**: ALTA

**Descripción**: Establece gobernanza de Content Design, UX Writing, terminología e i18n/l10n para el producto, con contratos obligatorios de entorno, cobertura multilingüe (`es/en/de/ru`), consistencia visual y limpieza de artefactos de test.

**Documentación**:
- **Doc Base**: `public/docs/CONTENT_DESIGN_AND_LOCALIZATION_GOVERNANCE.md`
- **SDD Index**: `sdd/features/content-design-and-localization-governance/content-design-and-localization-governance-INDEX.md`
- **Spec Técnica**: `sdd/features/content-design-and-localization-governance/content-design-and-localization-governance-spec-v1.md`
- **Spec Migración**: `sdd/features/content-design-and-localization-governance/content-design-and-localization-governance-spec-migration.md`
- **Test Plan**: `sdd/features/content-design-and-localization-governance/content-design-and-localization-governance-test-plan-v1.md`
- **SKILL (Anclora)**: `.agent/skills/features/content-design-and-localization-governance/SKILL.md`
- **SKILL (Portable)**: `.agent/skills/features/content-design-and-localization-governance/portable-base/SKILL.md`
- **Prompts Antigravity**: `.antigravity/prompts/features/content-design-and-localization-governance/`

---

### 9. Role Scoped Workspace Visibility v1

**ID**: ANCLORA-RSWV-001  
**Versión**: 1.0  
**Status**: Implemented  
**Fase**: Access Control & Operación Comercial  
**Prioridad**: CRÍTICA

**Descripción**: Fuerza visibilidad por rol en Nexus para que `agent` solo vea su cartera asignada (leads/tareas/propiedades), manteniendo visión global para `owner/manager`, con hardening en DB mediante RLS.

**Documentación**:
- **SDD Index**: `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-INDEX.md`
- **Spec Técnica**: `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-spec-v1.md`
- **Spec Migración**: `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-spec-migration.md`
- **Test Plan**: `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-test-plan-v1.md`
- **Feature Rules**: `.agent/rules/feature-role-scoped-workspace-visibility.md`
- **SKILL**: `.agent/skills/features/role-scoped-workspace-visibility/SKILL.md`
- **Prompts Antigravity**: `.antigravity/prompts/features/role-scoped-workspace-visibility/`

---

### 10. Prospection Unified Workspace v1

**ID**: ANCLORA-PUW-001  
**Versión**: 1.0  
**Status**: Implemented  
**Fase**: Prospection Operations  
**Prioridad**: ALTA

**Descripción**: Unifica en una sola experiencia operativa la prospección de propiedades, buyers y matches (manual/widget/PBM), con filtros compartidos y acciones rápidas para acelerar ejecución comercial.

**Documentación**:
- **SDD Index**: `sdd/features/prospection-unified-workspace/prospection-unified-workspace-INDEX.md`
- **Spec Técnica**: `sdd/features/prospection-unified-workspace/prospection-unified-workspace-spec-v1.md`
- **Spec Migración**: `sdd/features/prospection-unified-workspace/prospection-unified-workspace-spec-migration.md`
- **Test Plan**: `sdd/features/prospection-unified-workspace/prospection-unified-workspace-test-plan-v1.md`
- **QA Report**: `sdd/features/prospection-unified-workspace/QA_REPORT_ANCLORA_PUW_001.md`
- **Gate Final**: `sdd/features/prospection-unified-workspace/GATE_FINAL_ANCLORA_PUW_001.md`
- **Feature Rules**: `.agent/rules/feature-prospection-unified-workspace.md`
- **SKILL**: `.agent/skills/features/prospection-unified-workspace/SKILL.md`
- **Prompts Antigravity**: `.antigravity/prompts/features/prospection-unified-workspace/`

---

### 11. Origin Aware Editability Policy v1

**ID**: ANCLORA-OAEP-001  
**Versión**: 1.0  
**Status**: Implemented  
**Fase**: Governance & Data Integrity  
**Prioridad**: ALTA

**Descripción**: Define una política unificada de editabilidad por origen para leads y propiedades, bloqueando campos sensibles de trazabilidad en entidades no manuales y saneando payload antes de persistir.

**Documentación**:
- **SDD Index**: `sdd/features/origin-aware-editability-policy/origin-aware-editability-policy-INDEX.md`
- **Spec Técnica**: `sdd/features/origin-aware-editability-policy/origin-aware-editability-policy-spec-v1.md`
- **Spec Migración**: `sdd/features/origin-aware-editability-policy/origin-aware-editability-policy-spec-migration.md`
- **Test Plan**: `sdd/features/origin-aware-editability-policy/origin-aware-editability-policy-test-plan-v1.md`
- **QA Report**: `sdd/features/origin-aware-editability-policy/QA_REPORT_ANCLORA_OAEP_001.md`
- **Gate Final**: `sdd/features/origin-aware-editability-policy/GATE_FINAL_ANCLORA_OAEP_001.md`
- **Feature Rules**: `.agent/rules/feature-origin-aware-editability-policy.md`
- **SKILL**: `.agent/skills/features/origin-aware-editability-policy/SKILL.md`
- **Prompts Antigravity**: `.antigravity/prompts/features/origin-aware-editability-policy/`

---

## PLANIFICACIÓN FUTURA

### Phase 1 Roadmap

1. **Multi-Tenant Memberships v1** (AHORA)
   - Prerequisito: Aislamiento de datos
   - Timeline: 3-4 días
   - Status: En especificación

2. **Validación Inmobiliaria** (POST MULTITENANT)
   - Requiere: Multi-Tenant completado
   - Lead Intake con isolamiento org/rol
   - Timeline: TBD
   - Status: Planificado

### Futuras Features (Post-v1)

- **Multi-Tenant Memberships v2**: RLS nativo, email automático, multi-org
- **Intelligence v2**: Integración con org_id en contexto
- **Audit & Compliance**: Logging completo de cambios

---

## TABLA DE REFERENCIA RÁPIDA

| Feature | ID | Versión | Status | Fase | Docs |
|---------|----|---------|---------|----|------|
| Intelligence | ANCLORA-INT-001 | 1.0 | Implemented | Phase 0 | INDEX.md |
| Multi-Tenant | ANCLORA-MTM-001 | 1.0 | Specification | Phase 1 Prerequisito | INDEX.md |
| Prospection & Matching | ANCLORA-PBM-001 | 1.0 | Specification | Growth Engine | INDEX.md |
| Lead Source Observability | ANCLORA-LSO-001 | 1.0 | Implemented | Data Quality & Attribution | INDEX.md |
| Currency & Surface Localization | ANCLORA-CSL-001 | 1.0 | Implemented | Commercial UX & Data Quality | INDEX.md |
| Cost Governance Foundation | ANCLORA-CGF-001 | 1.0 | Implemented | FinOps Foundation | INDEX.md |
| Source Connectors Unified Ingestion | ANCLORA-SCUI-001 | 1.2 | Implemented | Ingestion & Normalization | INDEX.md |
| Lead Ingestion and Routing | ANCLORA-LIR-001 | 1.0 | In Progress | Ingestion & Routing | spec-lead-ingestion-and-routing-v1.md |
| Role Scoped Workspace Visibility | ANCLORA-RSWV-001 | 1.0 | Implemented | Access Control & Operación Comercial | role-scoped-workspace-visibility-INDEX.md |
| Data Quality & Entity Resolution | ANCLORA-DQER-001 | 1.0 | Specification | Data Quality & Identity | INDEX.md |
| Content Design & Localization Governance | ANCLORA-CDLG-001 | 1.0 | Implemented | Content Governance & Localization | INDEX.md |
| Prospection Unified Workspace | ANCLORA-PUW-001 | 1.0 | Implemented | Prospection Operations | prospection-unified-workspace-INDEX.md |
| Multichannel Feed Orchestrator | ANCLORA-MFO-001 | 1.0 | Implemented | Distribution & Publication | multichannel-feed-orchestrator-INDEX.md |
| Origin Aware Editability Policy | ANCLORA-OAEP-001 | 1.0 | Implemented | Governance & Data Integrity | origin-aware-editability-policy-INDEX.md |
| Guardrailed Automation and Alerting | ANCLORA-GAA-001 | 1.0 | Implemented | Automation and Alerting | guardrailed-automation-and-alerting-INDEX.md |
| FinOps and Commercial Command Center | ANCLORA-FCCC-001 | 1.0 | Implemented | Executive KPI and FinOps | finops-and-commercial-command-center-INDEX.md |
| Deal Margin Simulator | ANCLORA-DMS-001 | 1.0 | Implemented | Commercial Profitability | deal-margin-simulator-INDEX.md |
| Source Performance Observatory | ANCLORA-SPO-001 | 1.0 | Implemented | Acquisition Optimization | source-performance-observatory-INDEX.md |
| AI Runtime Provider Profiles | ANCLORA-AIRP-001 | 1.0 | Implemented | AI Runtime & Provider Governance | ai-runtime-provider-profiles-INDEX.md |

---

## CRITERIOS DE FEATURE COMPLETENESS

**Una feature se considera "Implemented" cuando**:

- ✅ SDD formal completado y aprobado
- ✅ Código generado via Antigravity
- ✅ Tests pasando (80%+ cobertura)
- ✅ API docs completos
- ✅ Frontend integrado
- ✅ Migración de datos completada
- ✅ Deploy a staging exitoso
- ✅ Deploy a producción exitoso
- ✅ Documentación en wiki/docs

**Una feature está en "Specification Phase" cuando**:

- 📝 SDD en desarrollo
- 📝 Rules documentadas
- 📝 SKILLs creados
- ⏳ Antigravity generation no iniciada
- ⏳ Testing no iniciado

**Una feature está en "Planning" cuando**:

- 🗺️ Conceptualizada pero sin SDD
- 🗺️ No tiene documentación formal
- ⏳ Fecha de inicio TBD

---

## CÓMO USAR ESTE DOCUMENTO

### Para encontrar una feature:

1. Buscar por **ID** (ANCLORA-XXX-###)
2. Buscar por **nombre** (Ctrl+F)
3. Consultar tabla de referencia rápida

### Para conocer status:

- ✅ = Implementada y productiva
- 📝 = En especificación/desarrollo
- 🗺️ = Planificada pero sin especificación
- ⏳ = Pendiente siguiente fase

### Para acceder documentación:

- Cada feature tiene links a:
  - SDD (especificación técnica)
  - Rules (arquitectura)
  - SKILL (métodos para desarrollo)
  - Prompt (instrucciones Antigravity)

---

## CHANGELOG FEATURES

| Fecha | Feature | Cambio |
|-------|---------|--------|
| 2026-02-17 | Content Design and Localization Governance v1 | Feature RELEASED - Gate Final OK |
| 2026-02-16 | Cost Governance Foundation v1 | Feature RELEASED - Gate Final OK |
| 2026-02-15 | Currency & Surface Localization v1 | Feature RELEASED - Gate Final OK |
| 2026-02-16 | Source Connectors Unified Ingestion v1 | Feature RELEASED - Gate Final OK |
| 2026-02-16 | Data Quality and Entity Resolution v1 | Entrada inicial en Specification Phase |
| 2026-02-20 | Role Scoped Workspace Visibility v1 | Feature RELEASED - Gate Final OK |
| 2026-02-24 | Prospection Unified Workspace v1 | Feature RELEASED - Gate Final OK |
| 2026-02-24 | Multichannel Feed Orchestrator v1 | Feature RELEASED - Gate Final OK |
| 2026-02-24 | Origin Aware Editability Policy v1 | Feature RELEASED - Gate Final OK |
| 2026-02-24 | Guardrailed Automation and Alerting v1 | Feature RELEASED - Gate Final OK |
| 2026-02-24 | FinOps and Commercial Command Center v1 | Feature RELEASED - Gate Final OK |
| 2026-02-24 | Deal Margin Simulator v1 | Feature RELEASED - Gate Final OK |
| 2026-02-24 | Source Performance Observatory v1 | Feature RELEASED - Gate Final OK |
| 2026-03-08 | AI Runtime Provider Profiles v1 | Feature RELEASED - Groq + Cloudflare runtime profile enabled |
| 2026-02-15 | Lead Source Observability v1 | Feature RELEASED - Gate Final OK |
| 2026-02-14 | Prospection & Buyer Matching v1 | Entrada inicial en Specification Phase |
| 2026-02-13 | Multi-Tenant v1 | Entrada inicial en Specification Phase |
| 2026-01-XX | Intelligence v1 | Implemented y deploy a producción |

---

## CONTACT & GOVERNANCE

**Features Owner**: Toni (CTO)  
**Documentation**: Toni + Claude  
**Aprobación SDD**: Toni  
**Aprobación Deploy**: Toni  

**Para actualizar este documento**:
1. Editar entrada correspondiente
2. Actualizar CHANGELOG
3. Commit a repo

---

**Documento versión**: 1.0  
**Última actualización**: 2026-03-08  
**Próxima revisión**: Post roadmap continuation completion

---

## ROADMAP CONTINUATION - 2026-02-24

### 12. Guardrailed Automation and Alerting v1

**ID**: ANCLORA-GAA-001  
**Version**: 1.0  
**Status**: Implemented  
**Phase**: Automation and Alerting  
**Priority**: MEDIA

**Documentation**:
- sdd/features/guardrailed-automation-and-alerting/guardrailed-automation-and-alerting-INDEX.md
- sdd/features/guardrailed-automation-and-alerting/QA_REPORT_ANCLORA_GAA_001.md
- sdd/features/guardrailed-automation-and-alerting/GATE_FINAL_ANCLORA_GAA_001.md
- .agent/rules/feature-guardrailed-automation-and-alerting.md
- .agent/skills/features/guardrailed-automation-and-alerting/SKILL.md
- .antigravity/prompts/features/guardrailed-automation-and-alerting/

### 13. FinOps and Commercial Command Center v1

**ID**: ANCLORA-FCCC-001  
**Version**: 1.0  
**Status**: Implemented  
**Phase**: Executive KPI and FinOps  
**Priority**: MEDIA

**Documentation**:
- sdd/features/finops-and-commercial-command-center/finops-and-commercial-command-center-INDEX.md
- sdd/features/finops-and-commercial-command-center/QA_REPORT_ANCLORA_FCCC_001.md
- sdd/features/finops-and-commercial-command-center/GATE_FINAL_ANCLORA_FCCC_001.md
- .agent/rules/feature-finops-and-commercial-command-center.md
- .agent/skills/features/finops-and-commercial-command-center/SKILL.md
- .antigravity/prompts/features/finops-and-commercial-command-center/

### 14. Deal Margin Simulator v1

**ID**: ANCLORA-DMS-001  
**Version**: 1.0  
**Status**: Implemented  
**Phase**: Commercial Profitability  
**Priority**: MEDIA-BAJA

**Documentation**:
- sdd/features/deal-margin-simulator/deal-margin-simulator-INDEX.md
- sdd/features/deal-margin-simulator/QA_REPORT_ANCLORA_DMS_001.md
- sdd/features/deal-margin-simulator/GATE_FINAL_ANCLORA_DMS_001.md
- .agent/rules/feature-deal-margin-simulator.md
- .agent/skills/features/deal-margin-simulator/SKILL.md
- .antigravity/prompts/features/deal-margin-simulator/

### 15. Source Performance Observatory v1

**ID**: ANCLORA-SPO-001  
**Version**: 1.0  
**Status**: Implemented  
**Phase**: Acquisition Optimization  
**Priority**: BAJA

**Documentation**:
- sdd/features/source-performance-observatory/source-performance-observatory-INDEX.md
- sdd/features/source-performance-observatory/QA_REPORT_ANCLORA_SPO_001.md
- sdd/features/source-performance-observatory/GATE_FINAL_ANCLORA_SPO_001.md
- .agent/rules/feature-source-performance-observatory.md
- .agent/skills/features/source-performance-observatory/SKILL.md
- .antigravity/prompts/features/source-performance-observatory/

### 16. AI Runtime Provider Profiles v1

**ID**: ANCLORA-AIRP-001  
**Version**: 1.0  
**Status**: Implemented  
**Phase**: AI Runtime & Provider Governance  
**Priority**: ALTA

**Documentation**:
- sdd/features/ai-runtime-provider-profiles/ai-runtime-provider-profiles-INDEX.md
- sdd/features/ai-runtime-provider-profiles/QA_REPORT_ANCLORA_AIRP_001.md
- sdd/features/ai-runtime-provider-profiles/GATE_FINAL_ANCLORA_AIRP_001.md
- .agent/rules/feature-ai-runtime-provider-profiles.md
- .agent/skills/features/ai-runtime-provider-profiles/SKILL.md
- .antigravity/prompts/features/ai-runtime-provider-profiles/
- `ANCLORA-NBOS-001` Nexus Buyers Outreach Supervised
- `ANCLORA-SPW-003` Synergi Shared Opportunities
- `ANCLORA-BPNM-002` Buyer Partner Network Management v2
