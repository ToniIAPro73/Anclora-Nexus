# SUB-AGENT D: TESTING SPECIALIST

**Para**: Google Antigravity (Agente D - Fase Post-Paralelo)  
**Timeline**: T=3.83-5h (después Agents A/B/C completan código)  
**Feature**: ANCLORA-MTM-001 - Multi-Tenant Memberships v1  
**PRE-REQUISITO**: Outputs de Agents A, B, C listos en repositorio

---

## OBJETIVO

Generar **test-code completo** (pytest + Vitest) basado en **test-specifications ya definidas**.

Agent D NO DISEÑA tests. Agent D IMPLEMENTA tests basándose en specifications que ya existen.

---

## PRE-REQUISITOS (Agent D comienza DESPUÉS que A/B/C)

**Código que Agent D necesita para testing:**

- ✅ Database migrations (Agent A) - 3 migrations SQL completadas
- ✅ Backend API (Agent B) - 6 endpoints + middleware + servicios listos
- ✅ Frontend components (Agent C) - 3 componentes React + context + hooks listos

**Specifications que Agent D DEBE USAR:**

- ✅ `.sdd/features/multitenant/tests/test-specifications/test-plan-v1.md`
- ✅ `.sdd/features/multitenant/tests/test-specifications/test-cases-crud.md`
- ✅ `.sdd/features/multitenant/tests/test-specifications/test-cases-roles.md`
- ✅ `.sdd/features/multitenant/tests/test-specifications/test-cases-invitation.md`
- ✅ `.sdd/features/multitenant/tests/test-specifications/test-cases-isolation.md`

---

## ARTEFACTOS A GENERAR

### FASE 1: Backend Tests (pytest) - 2 horas

#### 1.1 conftest.py (150 líneas)
**Ubicación**: `.sdd/features/multitenant/tests/test-code/`

Debe incluir:
- Pytest fixtures para organizations, users, memberships
- Database session fixture
- API client fixtures (owner, manager, agent)
- Cleanup/teardown procedures
- Event loop fixture para async tests

**Basado en**: test-plan-v1.md sección 7 (Test Data & Fixtures)

#### 1.2 test_membership_crud.py (300+ líneas, 32 tests)
**Ubicación**: `.sdd/features/multitenant/tests/test-code/`

Implementar 32 test cases de `test-cases-crud.md`:
- Suite 1: POST /members invite (5 tests)
- Suite 2: GET /members list (4 tests)
- Suite 3: PATCH /members/{id} change role (4 tests)
- Suite 4: DELETE /members/{id} remove (4 tests)
- Suite 5: GET /invitations/{code} validate (4 tests)
- Suite 6: POST /invitations/{code}/accept (5 tests)
- Suite 7: org_id filtering (3 tests)
- Suite 8: Validation rules (3 tests)

**Criterios**:
- Usar pytest + async/await
- Type hints 100%
- Docstrings para cada test
- Mínimo 32 tests pasando
- Coverage 85%+ backend

#### 1.3 test_role_isolation.py (350+ líneas, 20 tests)
**Ubicación**: `.sdd/features/multitenant/tests/test-code/`

Implementar 17 test cases de `test-cases-roles.md`:
- Owner tests (4)
- Manager tests (5)
- Agent tests (5)
- Middleware tests (3)

**Criterios**:
- Validar role-based permissions
- Owner vs Manager vs Agent access levels
- Middleware enforce role requirements
- Coverage 90%+ backend

#### 1.4 test_invitation_flow.py (350+ líneas, 18 tests)
**Ubicación**: `.sdd/features/multitenant/tests/test-code/`

Implementar 18 test cases de `test-cases-invitation.md`:
- Code generation (3 tests)
- Validation (4 tests)
- Acceptance (5 tests)
- Expiry (3 tests)
- Error cases (3 tests)

**Criterios**:
- Test invitation lifecycle complete
- Code uniqueness
- Expiry validation (7 days)
- Acceptance updates status
- Coverage 90%+ backend

---

### FASE 2: Frontend Tests (Vitest) - 1.5 horas

#### 2.1 test_team_management.tsx (350+ líneas, 20+ tests)
**Ubicación**: `.sdd/features/multitenant/tests/test-code/frontend/`

Implementar tests para TeamManagement component:
- Rendering (2 tests)
- Form submission (3 tests)
- Role change (3 tests)
- Member removal (2 tests)
- Permission checks (2 tests)
- Loading/error states (3 tests)

**Usa**: React Testing Library + Vitest + userEvent
**Criterios**:
- Component renders correctly
- User interactions work
- Only Owner can see form
- Proper error handling
- Coverage 85%+ frontend

#### 2.2 test_org_context.tsx (300+ líneas, 15+ tests)
**Ubicación**: `.sdd/features/multitenant/tests/test-code/frontend/`

Implementar tests para OrgContext + hooks:
- Context provider (2 tests)
- useOrgMembership hook (5 tests)
- useTeamManagement hook (4 tests)
- Permission flags (4 tests)

**Usa**: React Testing Library + Vitest
**Criterios**:
- Context provides correct values
- Hooks return accurate permissions
- Role-based flag calculation correct
- Coverage 85%+ frontend

---

## CRITERIOS DE ACEPTACIÓN

### Coverage Targets
- ✅ Backend: 85%+ code coverage (pytest)
- ✅ Frontend: 85%+ code coverage (Vitest)
- ✅ DB: 100% migration validation (Agent A validates)
- ✅ All tests passing (no skips)

### Code Quality
- ✅ Type hints 100% (Python + TypeScript)
- ✅ Docstrings present (Google format)
- ✅ No console.warn or console.error in tests
- ✅ Proper cleanup/fixtures
- ✅ Async/await properly handled

### Test Organization
- ✅ Grouped by endpoint/component
- ✅ Clear test naming (test_feature_scenario)
- ✅ Happy path + error + edge cases
- ✅ Fixtures reused properly

### Performance
- ✅ All backend tests run <300ms (500ms total)
- ✅ All frontend tests run <200ms (400ms total)
- ✅ Database fixtures clean up properly

---

## REFERENCES

**Test Specifications** (BASE para implementar):
- `.sdd/features/multitenant/tests/test-specifications/test-plan-v1.md`
- `.sdd/features/multitenant/tests/test-specifications/test-cases-*.md`

**Backend API Spec** (que tests validan):
- `.sdd/features/multitenant/spec-multitenant-v1.md` secciones 5-6

**Frontend Components** (que tests validan):
- `.sdd/features/multitenant/spec-multitenant-v1.md` sección 7

**Code from Agents A/B/C**:
- Backend: `backend/api/routes/memberships.py`, `services/`, `models/`
- Frontend: `frontend/src/components/`, `lib/hooks/`, `lib/contexts/`
- Database: `supabase/migrations/008_*, 009_*, 010_*`

---

## FIXTURES & TEST DATA

Agent D DEBE usar fixtures definidas en conftest.py:

```python
@fixture
async def test_org() -> dict: ...

@fixture
async def test_owner() -> dict: ...

@fixture
async def api_client(test_owner) -> AsyncClient: ...
```

**No hardcodear UUIDs o datos**. Usar fixtures y factories.

---

## TIMELINE

```
T=3.83h: Agent D inicia
├─ 30 min: conftest.py + fixtures
├─ 60 min: Backend tests (CRUD 32 + roles 20 + invitation 18)
├─ 45 min: Frontend tests (TeamManagement 20 + OrgContext 15)
├─ 15 min: Coverage reports + validation
└─ 15 min: Documentation + handoff
T=5h: All tests passing, 85%+ coverage
```

---

## RUNNING TESTS

```bash
# Backend tests (pytest)
pytest backend/tests/multitenant/ -v --cov=backend --cov-report=term-missing

# Frontend tests (Vitest)
npm run test:unit frontend/tests/multitenant/

# All tests with coverage
pytest ... && npm run test:unit ... # Combined report
```

---

## WHAT AGENT D DOES NOT DO

- ❌ Design test specifications (already done)
- ❌ Modify code from A/B/C
- ❌ Create integration test pipelines (that's post-deploy)
- ❌ Performance benchmarking
- ❌ Security scanning

Agent D ONLY writes code that tests Agents A/B/C output.

---

## SUCCESS = "All tests passing, 85%+ coverage, ready for Staging"

Agent D is DONE when:
1. All 32 + 20 + 18 + 20 + 15 = 105 tests passing
2. Backend coverage: 85%+
3. Frontend coverage: 85%+
4. Tests run in <5 minutes total
5. Documentation complete

---

**Status**: Ready for Agent D execution  
**Next**: Agents A/B/C complete code → Agent D generates tests

