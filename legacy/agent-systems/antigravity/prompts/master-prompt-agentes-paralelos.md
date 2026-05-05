# MASTER PROMPT: ANCLORA-MTM-001 PARALLEL AGENTS STRATEGY

**Versión**: 2.0 (CON AGENT D)  
**Feature**: Multi-Tenant Memberships v1  
**Timeline**: 5-5.5 horas (paralelo + testing)  
**Status**: Ready for Antigravity execution

---

## ESTRATEGIA PARALELA (3 + 1 AGENTES)

```
T=0h:        Agents A/B/C comienzan EN PARALELO
             (todos simultáneamente)

T=0-0.33h:   Lectura shared-context.md (todos)

T=0.33-2.83h: Agent A SOLO: Database (2.5 hours)
              └─ 3 migrations SQL
              └─ Índices, constraints, FK

T=0.33-3.58h: Agent C SOLO: Frontend (3.25 hours)
              └─ 3 componentes React
              └─ Context, hooks, pages

T=0.33-3.83h: Agent B SOLO: Backend (3.5 hours)
              └─ 6 endpoints API
              └─ Middleware, servicios, modelos

T=3.83h:     Agents A/B/C TERMINAN (código completo en repo)
             Agent D COMIENZA (PRE-REQUISITO: código listo)

T=3.83-5h:   Agent D SOLO: Testing (1.17 hours)
             └─ conftest.py
             └─ test_membership_crud.py (32 tests)
             └─ test_role_isolation.py (20 tests)
             └─ test_invitation_flow.py (18 tests)
             └─ test_team_management.tsx (20 tests)
             └─ test_org_context.tsx (15 tests)
             └─ Coverage: 85%+ backend, 85%+ frontend

T=5h:        Feature COMPLETA (código + tests)
             Validaciones E2E: 15 min
             Listo para STAGING

T=5.25h:     TOTAL: Feature lista
```

---

## REQUISITOS PRE-EJECUCIÓN

### 1. Todos los Agentes leen primero:
- `multitenant-shared-context.md` (20 min)
  - Secciones 1-4 de spec-multitenant-v1.md
  - Data model
  - Roles & RBAC matrix
  - Alineación entre agentes

### 2. Agent A SOLO lee:
- `spec-multitenant-v1.md` sección 3 (Data Model)
- `spec-multitenant-migration.md` (migration plan)
- Database design patterns

### 3. Agent B SOLO lee:
- `spec-multitenant-v1.md` secciones 5-6 (API, Backend)
- `feature-multitenant.md` (rules & validation)
- FastAPI/Supabase patterns

### 4. Agent C SOLO lee:
- `spec-multitenant-v1.md` sección 7 (Frontend)
- React/Next.js patterns
- Component composition

### 5. Agent D SOLO lee (después T=3.83h):
- `test-plan-v1.md`
- `test-cases-*.md` (all 5 files)
- `Agent-D-Testing-Specialist.md`

---

## SUB-AGENT A: DATABASE SPECIALIST

**Timeline**: 2.5 hours (T=0.33 - T=2.83)  
**Deliverables**: 3 migration files

### A.1 Pre-requisitos
- ✅ Lee: `multitenant-shared-context.md` (20 min)
- ✅ Lee: `spec-multitenant-migration.md` (30 min)

### A.2 Artefactos a generar

**Migration 008: Create organization_members table**
```sql
-- File: supabase/migrations/008_create_organization_members.sql
-- Lines: ~80
-- Contiene:
-- - Table definition (8 columns)
-- - Constraints (UNIQUE, CHECK, FK)
-- - Indices (6 índices)
-- - Validations
```

**Migration 009: Alter organizations table**
```sql
-- File: supabase/migrations/009_alter_organizations.sql
-- Lines: ~40
-- Contiene:
-- - ALTER TABLE organizations ADD COLUMN owner_id
-- - ALTER TABLE organizations ADD COLUMN status
-- - ALTER TABLE organizations ADD COLUMN metadata
-- - Índices nuevos
```

**Migration 010: Migrate user roles**
```sql
-- File: supabase/migrations/010_migrate_user_roles.sql
-- Lines: ~50
-- Contiene:
-- - Data migration: user_profiles.role → organization_members.role
-- - Validations (no nulls, UNIQUE enforced)
-- - Rollback procedure
```

### A.3 Success Criteria
- ✅ 3 migrations generadas (008, 009, 010)
- ✅ Todas las migrations son idempotentes
- ✅ Validaciones pre/post inline
- ✅ Rollback procedures documentados
- ✅ Índices optimizados (6 por tabla)
- ✅ Constraints enforced (UNIQUE, FK, CHECK)
- ✅ No data loss in migration 010

### A.4 Test Validation
- Agent D validará migrations con test-cases-isolation.md (21 tests)
- Coverage: 100% (todas las constraints validadas)

---

## SUB-AGENT B: BACKEND FASTAPI SPECIALIST

**Timeline**: 3.5 hours (T=0.33 - T=3.83)  
**Deliverables**: 6 endpoints + middleware + servicios + modelos

### B.1 Pre-requisitos
- ✅ Lee: `multitenant-shared-context.md` (20 min)
- ✅ Lee: `spec-multitenant-v1.md` secciones 5-6 (40 min)
- ✅ Lee: `feature-multitenant.md` rules (20 min)

### B.2 Artefactos a generar

**6 Endpoints nuevos**:
1. POST `/api/organizations/{org_id}/members` (invite)
2. GET `/api/organizations/{org_id}/members` (list)
3. PATCH `/api/organizations/{org_id}/members/{member_id}` (change role)
4. DELETE `/api/organizations/{org_id}/members/{member_id}` (remove)
5. GET `/api/invitations/{code}` (validate)
6. POST `/api/invitations/{code}/accept` (accept)

**5+ Endpoints modificados** (org_id filtering):
- GET `/api/leads`
- GET `/api/properties`
- GET `/api/tasks`
- POST `/api/leads`
- POST `/api/properties`

**Archivos a generar**:
- `backend/api/routes/memberships.py` (200 líneas, 6 endpoints)
- `backend/api/middleware.py` (50 líneas, verify_org_membership)
- `backend/models/membership.py` (60 líneas, Pydantic models)
- `backend/services/membership_service.py` (150 líneas, business logic)
- `backend/tests/test_memberships.py` (100 líneas, basic tests)

### B.3 Requirements
- Type hints 100%
- Docstrings (Google format)
- Error handling: 403, 404, 409, 422
- Middleware validating org_id before route
- Pydantic validation
- Database transactions where needed

### B.4 Success Criteria
- ✅ 6 endpoints funcionando
- ✅ 5+ endpoints org_id filtering aplicado
- ✅ Middleware enforcing verify_org_membership
- ✅ Type hints 100%
- ✅ Docstrings completos
- ✅ Error responses correct status codes

### B.5 Test Validation
- Agent D validará con test-cases-crud.md (32 tests) + test-cases-roles.md (20 tests)
- Coverage: 85%+ backend

---

## SUB-AGENT C: REACT/NEXT.JS FRONTEND SPECIALIST

**Timeline**: 3.25 hours (T=0.33 - T=3.58)  
**Deliverables**: 3 componentes + context + hooks + pages

### C.1 Pre-requisitos
- ✅ Lee: `multitenant-shared-context.md` (20 min)
- ✅ Lee: `spec-multitenant-v1.md` sección 7 (30 min)

### C.2 Artefactos a generar

**Context & Hooks**:
- `frontend/src/lib/contexts/OrgContext.tsx` (80 líneas)
  - Provider
  - Hooks: useOrg()
  
- `frontend/src/lib/hooks/useOrgMembership.ts` (60 líneas)
  - canManageTeam
  - canViewAll
  - canEditOwn
  
- `frontend/src/lib/hooks/useTeamManagement.ts` (70 líneas)
  - inviteCallback
  - changeRoleCallback
  - removeCallback

**Componentes**:
- `frontend/src/components/TeamManagement.tsx` (150 líneas)
  - Member table
  - Invite form (owner only)
  - Role change dropdown
  - Remove button with confirmation
  
- `frontend/src/components/InvitationAccept.tsx` (100 líneas)
  - Public form (no auth required)
  - Code validation
  - Accept flow
  
- `frontend/src/components/RoleBasedUIShell.tsx` (60 líneas)
  - Conditional rendering per role

**Pages**:
- `frontend/src/app/(dashboard)/team/page.tsx` (40 líneas)
  - Layout
  - TeamManagement integration
  
- `frontend/src/app/invite/[code]/page.tsx` (50 líneas)
  - Dynamic route
  - InvitationAccept integration

### C.3 Requirements
- Type hints 100% (TypeScript)
- React hooks best practices
- Proper loading/error states
- Responsive design
- Accessible (a11y)
- Form validation

### C.4 Success Criteria
- ✅ 3 componentes renderizando
- ✅ Context provider functional
- ✅ 2 hooks custom functional
- ✅ Type hints 100%
- ✅ Responsive design
- ✅ No console errors

### C.5 Test Validation
- Agent D validará con test_team_management.tsx (20 tests) + test_org_context.tsx (15 tests)
- Coverage: 85%+ frontend

---

## SUB-AGENT D: TESTING SPECIALIST

**Timeline**: 1.17 hours (T=3.83 - T=5.0)  
**PRE-REQUISITO**: Agents A/B/C código completado en repo  
**Deliverables**: 105 tests ejecutables (pytest + Vitest)

### D.1 Pre-requisitos
- ✅ Lee: `test-plan-v1.md` (20 min)
- ✅ Lee: `test-cases-*.md` (5 files) (30 min)
- ✅ Lee: `Agent-D-Testing-Specialist.md` (10 min)
- ⚠️ ESPERA: Agents A/B/C completen código (T=3.83h)

### D.2 Artefactos a generar

**Backend Tests (pytest)**:
- `conftest.py` (150 líneas)
  - Fixtures: test_org, test_owner, test_manager, test_agent
  - DB fixtures, API clients
  
- `test_membership_crud.py` (300+ líneas, 32 tests)
  - Basado en test-cases-crud.md
  - CRUD endpoints + validation
  
- `test_role_isolation.py` (350+ líneas, 20 tests)
  - Basado en test-cases-roles.md
  - Role-based access control
  
- `test_invitation_flow.py` (350+ líneas, 18 tests)
  - Basado en test-cases-invitation.md
  - Invitation lifecycle

**Frontend Tests (Vitest)**:
- `test_team_management.tsx` (400+ líneas, 20+ tests)
  - Component rendering
  - User interactions
  - Form submission
  
- `test_org_context.tsx` (300+ líneas, 15+ tests)
  - Context provider
  - Hooks functionality
  - Permission flags

### D.3 Requirements
- Type hints 100% (Python + TypeScript)
- Docstrings (Google format)
- No console.warn/error
- Proper async/await
- Fixtures cleanup
- Coverage: Backend 85%+, Frontend 85%+

### D.4 Success Criteria
- ✅ 105 tests total passing
- ✅ Backend coverage: 85%+
- ✅ Frontend coverage: 85%+
- ✅ Tests run < 5 minutes
- ✅ All fixtures clean up properly
- ✅ Type hints 100%

### D.5 Testing Timeline
```
T=3.83-4.13h: conftest.py + backend fixtures (30 min)
T=4.13-5h:    Backend tests (47 min)
              - test_membership_crud.py (32 tests)
              - test_role_isolation.py (20 tests)
              - test_invitation_flow.py (18 tests)
T=5-5.17h:    Frontend tests (17 min)
              - test_team_management.tsx (20+ tests)
              - test_org_context.tsx (15+ tests)
T=5.17h:      COMPLETE (coverage reports generated)
```

---

## INTEGRACIÓN & VALIDACIÓN POST-PARALELO

**T=5h - T=5.25h: Integration Testing (15 min)**

1. Verificar todos los endpoints funcionan
2. Validar middleware intercepts
3. Test invitation flow end-to-end
4. Validate data isolation
5. Run full test suite: `pytest ... && npm run test:unit ...`

**Success**: All green ✓

---

## CHECKLIST PRE-LANZAMIENTO

### Pre-Antigravity
- ✅ spec-multitenant-v1.md completado (11 secciones)
- ✅ spec-multitenant-migration.md completado (migration plan)
- ✅ multitenant-shared-context.md completado (shared context)
- ✅ Test specifications creadas (5 files, 98 scenarios)
- ✅ Agent prompts listos (A, B, C, D)
- ✅ Feature rules documentadas
- ✅ Development methods (SKILL) documentados

### Durante Ejecución
- ⏳ Agent A: Migrations 008, 009, 010
- ⏳ Agent B: 6 endpoints + middleware + servicios
- ⏳ Agent C: 3 componentes + context + hooks + pages
- ⏳ Agent D: 105 tests (pytest + Vitest)

### Post-Ejecución
- ⏳ Validar E2E flow (15 min)
- ⏳ Coverage report (85%+ backend, 85%+ frontend)
- ⏳ Code review
- ⏳ Deploy to staging

---

## REFERENCIAS COMPLETAS

**Documentos SDD**:
- `.sdd/features/multitenant/INDEX.md` - Navigation
- `.sdd/features/multitenant/spec-multitenant-v1.md` - Tech spec (11 secciones)
- `.sdd/features/multitenant/spec-multitenant-migration.md` - Migration plan
- `.sdd/features/multitenant/tests/test-specifications/test-plan-v1.md`
- `.sdd/features/multitenant/tests/test-specifications/test-cases-*.md` (5 files)

**Agent Prompts**:
- `multitenant-shared-context.md` - Common context (all agents)
- `Agent-D-Testing-Specialist.md` - Agent D prompt

**Rules & Methods**:
- `.agent/rules/feature-multitenant.md` - Feature rules
- `.agent/skills/features/multitenant/SKILL.md` - Development methods

---

## TIMELINE FINAL

| Milestone | Time | Status |
|-----------|------|--------|
| Shared context reading | 0.33h | PRE-REQ |
| Agent A (Database) | 2.5h | PARALLEL |
| Agent B (Backend) | 3.5h | PARALLEL |
| Agent C (Frontend) | 3.25h | PARALLEL |
| Agent D (Testing) | 1.17h | SEQUENTIAL |
| **TOTAL** | **5.25h** | **COMPLETE** |

---

**Status**: READY FOR ANTIGRAVITY EXECUTION  
**Next**: Launch Agents A/B/C in parallel, then Agent D for testing

