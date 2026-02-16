# CHANGELOG - ANCLORA NEXUS CORE

**Registro de cambios arquitectónicos en core database y API**

---

## [1.0] - 2026-02-16 - Cost Governance Foundation v1

**Fecha**: 2026-02-16  
**Status**: ✅ RELEASED  
**Criticidad**: CRÍTICA  
**Feature**: ANCLORA-CGF-001 v1.0

### Database Changes

#### New Tables

- `org_cost_policies`
  - Presupuesto y umbrales por organización
- `org_cost_usage_events`
  - Eventos de consumo por capability/proveedor
- `org_cost_alerts`
  - Alertas warning/hard-stop por mes

### API Changes (Feature Layer)

- `GET /api/finops/budget`
- `PATCH /api/finops/budget`
- `GET /api/finops/usage`
- `GET /api/finops/alerts`
- `POST /api/finops/usage/log` (internal)

### Security & Governance

- Aislamiento estricto por `org_id`.
- Guardrails de coste (warning + hard-stop configurable).
- Endpoints de logging protegidos para uso interno.

### SDD References

- `sdd/features/cost-governance-foundation/cost-governance-foundation-INDEX.md`
- `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-v1.md`
- `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-migration.md`
- `sdd/features/cost-governance-foundation/cost-governance-foundation-test-plan-v1.md`

---

## [1.0] - 2026-02-16 - Source Connectors Unified Ingestion v1

**Fecha**: 2026-02-16  
**Status**: ✅ RELEASED  
**Criticidad**: ALTA  
**Feature**: ANCLORA-SCUI-001 v1.0

### Database Changes

#### New Tables

- `ingestion_connectors`
  - Configuración de conectores por org y tipo de entidad.
- `ingestion_events`
  - Registro operativo de ingestión con estado, errores y trazabilidad.

### API Changes (Feature Layer)

- `POST /api/ingestion/leads`
- `POST /api/ingestion/properties`
- `GET /api/ingestion/events`
- `GET /api/ingestion/events/{id}`

### Security & Governance

- Aislamiento estricto por `org_id`.
- Idempotencia por `dedupe_key` para evitar duplicados.
- Endpoints de ingestión protegidos con credenciales técnicas.

### SDD References

- `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-INDEX.md`
- `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1.md`
- `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-migration.md`
- `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-test-plan-v1.md`

---

## [1.0] - 2026-02-16 - Data Quality and Entity Resolution v1

**Fecha**: 2026-02-16
**Status**: ✅ RELEASED
**Criticidad**: ALTA
**Feature**: ANCLORA-DQER-001 v1.0

### Database Changes

#### New Tables

- `dq_quality_issues`
  - Registro de incidencias de calidad por entidad.
- `dq_entity_candidates`
  - Candidatos de duplicado con `similarity_score` y señales explicables.
- `dq_resolution_log`
  - Bitácora auditable de decisiones de resolución.

### API Changes (Feature Layer)

- `GET /api/dq/issues`
- `GET /api/dq/metrics`
- `POST /api/dq/resolve`
- `POST /api/dq/recompute`

### Security & Governance

- Aislamiento estricto por `org_id`.
- Resoluciones con trazabilidad y reversibilidad.
- Sin auto-merge irreversible fuera de reglas explícitas.

### SDD References

- `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-INDEX.md`
- `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-v1.md`
- `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-migration.md`
- `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-test-plan-v1.md`

---

## [UPCOMING] - Multi-Tenant Memberships v1 (Phase Prerequisito)

**Fecha anticipada**: 2026-02-XX (Post-Antigravity generation)  
**Status**: En especificación  
**Criticidad**: ALTA (Prerequisito Phase 1)  
**Feature**: ANCLORA-MTM-001 v1.0

### Database Changes

#### New Tables

- **`organization_members`** (Migration 008)
  - Central repository para membresía usuario-organización
  - Campos: id, org_id, user_id, role, status, joined_at, invited_by, invitation_code, invitation_accepted_at
  - Constraints: UNIQUE(org_id, user_id), FKs a organizations + auth.users
  - Índices: org_id, user_id, role, status, composite (org_id, user_id)
  - Propósito: Reemplazar `user_profiles.role` como fuente de verdad

#### Altered Tables

- **`organizations`** (Migration 009)
  - `owner_id UUID REFERENCES auth.users(id)` - Referencia rápida a propietario
  - `status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'))` - Desactivación sin eliminar
  - `metadata JSONB DEFAULT '{}'` - JSON para extensiones futuras
  - Índice: `idx_organizations_owner_id`

- **`user_profiles`** (Deprecación marcada, no eliminada)
  - Campo `role` MARCADO COMO DEPRECATED (Ver Migration 010)
  - Seguirá existiendo para backward compatibility en v1
  - Post-v1: Será eliminado (Migration 011)
  - Migración: Valores trasladados a `organization_members.role`

#### New Migrations

1. **`008_create_organization_members.sql`**
   - Crea tabla `organization_members` con schema completo
   - Crea todos índices necesarios
   - Duración: <30s
   - Reversible: DROP TABLE

2. **`009_alter_organizations.sql`**
   - Agrega campos a `organizations`
   - Crea índices asociados
   - Duración: <10s
   - Reversible: DROP COLUMN

3. **`010_migrate_roles.sql`**
   - Migra datos históricos de `user_profiles.role` → `organization_members.role`
   - Actualiza `organizations.owner_id` basado en roles migratos
   - Incluye validaciones pre/post migración
   - Duración: 2-5 min (depende volumen datos)
   - Rollback: Requiere TRUNCATE organization_members

### API Changes

#### New Endpoints (Backend)

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/organizations/{org_id}/members` | owner | Invitar miembro |
| GET | `/api/organizations/{org_id}/members` | owner, manager | Listar miembros |
| PATCH | `/api/organizations/{org_id}/members/{member_id}` | owner | Cambiar rol/estado |
| DELETE | `/api/organizations/{org_id}/members/{member_id}` | owner | Remover miembro |
| GET | `/api/invitations/{code}` | public | Validar invitación |
| POST | `/api/invitations/{code}/accept` | authenticated | Aceptar invitación |

#### Modified Endpoints (Backend)

Todos los siguientes endpoints agregan filtrado automático por org_id:

- `GET /api/leads` - Filtro: `WHERE org_id = $1 (AND agent_id = $2 si Agent)`
- `POST /api/leads` - Validación: org_id del usuario
- `GET /api/properties` - Filtro: `WHERE org_id = $1 (AND agent_id = $2 si Agent)`
- `GET /api/properties/{id}` - Filtro: `WHERE org_id = $1 AND id = $2`
- `POST /api/properties` - Validación: org_id del usuario
- `GET /api/tasks` - Filtro: `WHERE org_id = $1`
- `POST /api/tasks` - Validación: org_id del usuario
- (+ cualquier endpoint que accede leads/properties/tasks)

#### New Middleware

**`verify_org_membership()`** (`backend/api/middleware.py`)

```python
async def verify_org_membership(
    user_id: UUID,
    org_id: UUID,
    required_role: Optional[str] = None,
    required_status: str = 'active'
) -> OrganizationMember
```

- Valida membresía de usuario en organización
- Verifica status = 'active' (si especificado)
- Verifica role requerido (si especificado)
- Retorna OrganizationMember o raise PermissionDenied
- CRÍTICO: Usar en TODAS rutas que acceden org_data

#### New Models (Backend)

- **`OrganizationMember`** (Pydantic)
  - id, org_id, user_id, role, status, joined_at, invited_by, invitation_code, invitation_accepted_at
- **`InviteRequest`** (Pydantic)
  - email, role
- **`MemberResponse`** (Pydantic)
  - id, org_id, user_id, role, status, joined_at, email (si disponible)
- **`InvitationResponse`** (Pydantic)
  - valid, email, role, org_name, expires_at

#### New Services

- **`MembershipService`** (`backend/services/membership_service.py`)
  - `invite_member(org_id, email, role, invited_by)`
  - `accept_invitation(code, user_id)`
  - `change_member_role(org_id, member_id, new_role, changed_by)`
  - `remove_member(org_id, member_id, removed_by)`
  - Validaciones: Owner exists, unique org_user, role constraints, etc.

### Frontend Changes

#### New Components

- **`<TeamManagement />`** (Owner only)
  - Lista miembros, invitar, cambiar rol, remover
  - Ubicación: `frontend/src/components/TeamManagement.tsx`

- **`<InvitationAccept />`** (Public)
  - Validar código de invitación, aceptar
  - Ubicación: `frontend/src/components/InvitationAccept.tsx`
  - Ruta: `/invite/{code}`

- **`<RoleBasedUIShell />`** (Wrapper)
  - Renderizado condicional por rol
  - Ubicación: `frontend/src/components/RoleBasedUIShell.tsx`

#### New Context

- **`OrgContext`** (`frontend/src/lib/contexts/OrgContext.tsx`)
  - Proporciona: org_id, user_id, role, joined_at, status
  - Inicializado en RootLayout post-auth

#### New Hooks

- **`useOrgMembership()`** (`frontend/src/lib/hooks/useOrgMembership.ts`)
  - Acceso a OrgContext con helpers
  - Retorna: org_id, user_id, role, canManageTeam, canViewAll, etc.

- **`useTeamManagement()`** (`frontend/src/lib/hooks/useTeamManagement.ts`)
  - Lógica de invitación, cambio rol, remoción
  - Integración con endpoints nuevos

#### New Route Guards

- **`<ProtectedRoute requiredRole={['owner']}>` pattern**
  - Protege rutas basado en rol
  - Ubicación: `frontend/src/components/ProtectedRoute.tsx`

### Security & Authorization

#### Role-Based Access Control (RBAC)

| Action | Owner | Manager | Agent |
|--------|-------|---------|-------|
| Ver todos leads | ✅ | ✅ | ❌ (asignados solo) |
| Ver todos properties | ✅ | ✅ | ❌ (asignados solo) |
| Crear lead | ✅ | ✅ | ❌ |
| Crear property | ✅ | ✅ | ❌ |
| Crear task | ✅ | ✅ | ✅ (limitado) |
| Cambiar rol | ✅ | ❌ | ❌ |
| Invitar miembro | ✅ | ❌ | ❌ |
| Gestionar equipo | ✅ | ❌ | ❌ |

#### Data Isolation

- **org_id filtering**: Todas queries deben incluir `WHERE org_id = $1`
- **Role-based filtering**: Si Agent, agregar `AND agent_id = $2`
- **Middleware validation**: `verify_org_membership()` antes de acceso
- **Post-v1**: RLS nativo PostgreSQL para doble validación

### Validation Rules

#### Business Rules (Críticas)

1. **Mínimo 1 Owner por org**
   - Validación: Antes de remover último Owner
   - Excepción: Owner puede remover a sí mismo si hay otros owners

2. **Un usuario = Una org en v1**
   - Constraint: UNIQUE(org_id, user_id)
   - Cambios: Requiere design change para v2

3. **Status pending expira en 7 días**
   - Validación: Cleanup job futuro (v1.1)
   - Manualmente: Remover expired codes

4. **Solo Owner puede cambiar roles**
   - Validación: Middleware requerido_role='owner'
   - Exception logging: Intentos de cambio sin permisos

5. **Invitación única**
   - Constraint: UNIQUE(invitation_code)
   - Validación: Code debe existir, no expirado, no usado

### Testing Requirements

#### Unit Tests

- `test_organization_members_crud()`
- `test_verify_org_membership()`
- `test_role_based_access()`
- `test_invitation_lifecycle()`
- `test_unique_constraint_org_user()`

#### Integration Tests

- `test_agent_isolation()` - Agent solo ve asignados
- `test_manager_visibility()` - Manager ve todo
- `test_owner_full_access()` - Owner controla todo
- `test_role_change_flow()` - Cambio de rol funciona
- `test_member_removal()` - Remover miembro

#### E2E Tests

- `test_full_invitation_flow()` - Code → Accept → Dashboard
- `test_role_based_ui_rendering()` - UI se adapta por rol
- `test_data_isolation_integrity()` - No data leaks

### Performance Considerations

#### Database Optimization

- Índices creados en: org_id, user_id, role, status
- Composite index: (org_id, user_id)
- Query plan: EXPLAIN ANALYZE para invites expire query

#### API Performance

- Endpoint response time <100ms (50 miembros)
- Middleware overhead <10ms
- Caché: organizations.owner_id para referencia rápida

#### Frontend Performance

- Components lazy-loaded (TeamManagement)
- Context no re-renders innecesarios
- Memoización en ProtectedRoute

### Migration Path

#### Phase 0: Preparation (Pre-v1 deploy)

```sql
CREATE TABLE organization_members (...)
ALTER TABLE organizations ADD COLUMN ...
```

#### Phase 1: Data Migration (During maintenance window)

```sql
INSERT INTO organization_members (...)
  SELECT FROM user_profiles WHERE ...
UPDATE organizations SET owner_id = ...
```

#### Phase 2: Validation (Post-migration)

```sql
SELECT COUNT(*) FROM organization_members -- Verify counts
SELECT COUNT(*) FROM organizations WHERE owner_id IS NULL -- Verify owners
```

#### Phase 3: Deprecation (24h post-validation)

```sql
ALTER TABLE user_profiles DROP COLUMN role
```

Ver: `sdd/features/multitenant/spec-multitenant-migration.md` para scripts completos.

### Breaking Changes

**⚠️ BREAKING CHANGES in v1**:

1. **Authorization**
   - Todas rutas que acceden org_data requieren membership válida
   - Requests sin org_id en contexto serán rechazados

2. **Data Access**
   - Queries ahora filtran por org_id automáticamente
   - Agents ya NO verán datos de otros agents

3. **Role Source**
   - `user_profiles.role` está deprecada (no usar en código nuevo)
   - Nueva fuente de verdad: `organization_members.role`

### Dependencies

- PostgreSQL 14+ (UUID nativo)
- FastAPI 0.100+ (async middleware)
- Next.js 14+ (React Context)
- Supabase 1.0+ (RLS ready para v2)

### Rollback Plan

**Si migración falla pre-Migration 010**:
```sql
DROP TABLE organization_members;
ALTER TABLE organizations DROP COLUMN owner_id, status, metadata;
```

**Si migración falla post-Migration 010**:
```sql
TRUNCATE organization_members CASCADE;
-- Restaurar desde backup pre-migración
```

## [1.0] - 2026-02-15 - Currency & Surface Localization (CSL)

**Status**: ✅ RELEASED
**Criticidad**: MEDIA
**Feature**: ANCLORA-CSL-001 v1.0

### Database Changes
- **Migration 025**: Added `useful_area_m2`, `built_area_m2`, `plot_area_m2` to `properties`.
- **Constraints**: Non-negative checks + Logic check (`useful <= built`).
- **Backfill**: Populated `built_area_m2` and `useful_area_m2` from legacy `surface_m2`.

### API Changes
- `POST/PUT /api/properties`: Accepts and validates new surface fields.
- **Validation**: Enforces strict logical constraints between surface areas.
- **Origin Contract**: Enforces read-only fields based on `origin_type`.

### Frontend Changes
- **Currency Switcher**: added to header (EUR/USD/GBP/etc).
- **Unit Switcher**: added to sidebar (Metric/Imperial).
- **Property Forms**: New inputs for surface breakdown + auto-conversion.
- **Display**: All prices and areas abide by selected global preferences.

---

## [1.0] - 2026-02-15 - Property Origin Unification (Visibility & Matching)

**Status**: ✅ RELEASED  
**Criticidad**: MEDIA  
**Feature**: ANCLORA-POU-001 v1.0

### Database Changes
- **Migration 020**: Added `source_system` and `source_portal` to `properties`.
- **Constraint**: `source_system` must be in `('manual', 'widget', 'pbm')`.
- **Constraint**: `source_portal` restricted to allowed real estate portals or `other`.
- **Performance**: Added composite indexes for `(org_id, source_system)` and `(org_id, source_portal)`.

### API Changes
- `POST /api/properties`: Supports `source_system` and `source_portal` field intake.
- `GET /api/properties`: Returns normalized source data for frontend badges.

### Frontend Changes
- **Properties Page**: Integrated color-coded badges for origin and portal.
- **Commercial Signals**: Displays Top Buyer Name, Match %, and Potential Commission for linked properties.
- **Form Modal**: Structured select inputs for source portal categorization.

---

## [UPCOMING] - Multi-Tenant Memberships v1 (Phase Prerequisito)

### Database Changes

#### New Tables

- `prospected_properties`
- `buyer_profiles`
- `property_buyer_matches`
- `match_activity_log`

#### Core Constraints

- Score range: `0 <= high_ticket_score <= 100`
- Score range: `0 <= match_score <= 100`
- Unique link: `UNIQUE(property_id, buyer_id)`
- Isolation: `org_id` obligatorio en todas entidades nuevas

### API Changes (Feature Layer)

Nuevos grupos de endpoints:
- Prospected properties CRUD + scoring
- Buyer profiles CRUD
- Matching recompute/list/update
- Match activity logging

### Security & Governance

- Prohibido scraping no autorizado.
- Prohibida automatización de contacto irreversible sin intervención humana.
- Source traceability obligatoria (`source`, `source_url`).
- Cumplimiento de transparencia y reversibilidad conforme a Constitución.

### SDD References

- `sdd/features/prospection-matching-INDEX.md`
- `sdd/features/prospection-matching-spec-v1.md`
- `sdd/features/prospection-matching-spec-migration.md`
- `sdd/features/prospection-matching-test-plan-v1.md`
- `.agent/rules/feature-prospection-matching.md`

**Frontend rollback**:
- Remover componentes nuevos
- Remover ProtectedRoute guards
- Restaurar OrgContext a null

### Documentation Updated

- ✅ API docs: 6 nuevos endpoints + 5+ modificados
- ✅ Database schema: org_members, columns organizations
- ✅ Authorization guide: RBAC matriz
- ✅ Migration guide: Scripts + validaciones
- ✅ Testing guide: Unit + integration + E2E

### Known Limitations (v1)

- ❌ No soporte multi-organización por usuario (v2)
- ❌ No RLS nativo (v2 - requiere migration 011)
- ❌ No email automático (v1.1)
- ❌ No auditoría completa (v2)

### Future Enhancements (v2+)

- [ ] RLS nativo PostgreSQL para doble validación
- [ ] Email automático para invitaciones
- [ ] Multi-organización soporte
- [ ] Auditoría completa con audit logs
- [ ] Soft delete mejorado con suspensión
- [ ] Permiso granular por recurso

### References

- Feature Spec: `sdd/features/multitenant/spec-multitenant-v1.md`
- Migration Guide: `sdd/features/multitenant/spec-multitenant-migration.md`
- Feature Rules: `.agent/rules/feature-multitenant.md`
- SKILL Doc: `.agent/skills/features/multitenant/SKILL.md`

### Timeline

| Phase | Duration | Timing |
|-------|----------|--------|
| Spec completion | ~1 day | ✅ Done |
| Antigravity generation | 2-3 hours | ⏳ Pending approval |
| Local dev + testing | 1 day | ⏳ Post-generation |
| Staging deploy | 2 hours | ⏳ Post-testing |
| Production deploy | 1 hour + migration | ⏳ Post-staging |

**Total: 3-4 days**

---

## [1.0] - 2026-01-XX - Intelligence Feature Launch

### Added

- Intelligence feature v1.0 (ANCLORA-INT-001)
- Governor component: Strategic decision-making
- Router component: Intent classification y domain selection
- Synthesizer component: Information synthesis
- Governor Decision schema + Query Plan schema
- API endpoints para intelligence queries
- Frontend Intelligence dashboard
- Audit logs para decisiones

### Changed

- API routing architecture para soporte multi-mode
- Database schema para audit logs
- Frontend layout para dashboard intelligence

### Fixed

- Query planning consistency
- Risk assessment accuracy

### Security

- Audit log de todas decisions
- Governor validations en decision output

---

## [0.1] - Core Infrastructure

### Added

- PostgreSQL schema core (extensions, auth, organizations, user_profiles)
- Supabase setup
- FastAPI core structure
- Next.js frontend setup
- Authentication flow
- Basic CRUD operations

### Known Issues

- Single-tenant architecture (to be fixed in MTM v1)
- No role-based access control
- No data isolation

---

## Notes

- **Version Format**: [MAJOR].[MINOR].[PATCH] - Date (Feature Name)
- **Status Indicators**: ✅ Done | ⏳ Pending | ❌ Breaking
- **Criticality Levels**: CRÍTICA | ALTA | MEDIA | BAJA
- **Timeline Format**: Days / Hours / Minutes

---

**Changelog maintained by**: Toni (CTO)  
**Last updated**: 2026-02-13  
**Next review**: Post Multi-Tenant v1 Production Deploy


