# FEATURES - ANCLORA NEXUS

**Registro centralizado de features implementadas y en especificación**

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
**Status**: Specification Phase  
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
**Última actualización**: 2026-02-13  
**Próxima revisión**: Post Multi-Tenant v1 aprobación
