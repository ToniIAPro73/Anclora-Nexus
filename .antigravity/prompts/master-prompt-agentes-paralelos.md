# MASTER PROMPT: MULTI-TENANT MEMBERSHIPS V1 - AGENTES PARALELOS

**Para**: Google Antigravity (3 agentes simultáneos)  
**Feature**: ANCLORA-MTM-001  
**Timeline**: ~5 horas (paralelo vs 7-8 secuencial)  
**Status**: Listo para lanzar

---

## ⚠️ INSTRUCCIÓN CRÍTICA DE COORDINACIÓN

Este prompt define una **estrategia de 3 agentes en paralelo**.

**NO LANZAR AGENTES HASTA QUE TODOS LEAN**:
→ `multitenant-shared-context.md` (secciones 1-4 comunes)

**FASE COMPARTIDA** (0h - 0.33h):
1. Agent A lee contexto compartido
2. Agent B lee contexto compartido  
3. Agent C lee contexto compartido

**FASE PARALELA** (0.33h - 3.83h):
1. Agent A genera DB (2.5h)
2. Agent B genera Backend (3.5h)
3. Agent C genera Frontend (3.25h)

**FASE INTEGRACIÓN** (3.83h - 5h):
- Merge código
- Tests E2E
- Validaciones finales

---

## ESTRATEGIA GENERAL

Multi-Tenant Memberships v1 se divide en **3 capas independientes**:

```
┌─ LAYER 1: DATABASE        (Agent A)
│  └─ 3 migrations SQL
│  └─ Schema + indices + validaciones
│  └─ Scripts migración
│
├─ LAYER 2: BACKEND API     (Agent B)
│  └─ 6 endpoints nuevos
│  └─ Middleware + servicios
│  └─ Validaciones de negocio
│  └─ Tests unitarios
│
└─ LAYER 3: FRONTEND        (Agent C)
   └─ 3 componentes React
   └─ Context + Hooks
   └─ Rutas nuevas
   └─ Guards de rutas
```

**Dependencias**: Mínimas hasta integración.

---

# SUB-AGENT A: DATABASE SPECIALIST

## OBJETIVO

Generar **3 migraciones SQL idempotentes** para crear tabla `organization_members`, alterar `organizations`, y migrar datos históricos.

## PRE-REQUISITO

1. **Leer primero**: `multitenant-shared-context.md` (completo)
   - Sección 1: Resumen ejecutivo (context)
   - Sección 2: Alcance v1 (entiende scope)
   - Sección 3: Modelo de datos (CRÍTICO - usa schema exacto)
   - Sección 4: Roles y aislamiento (entiende validaciones)

2. **Luego leer**: `spec-multitenant-migration.md` (referencia scripts)

## ARTEFACTOS A GENERAR

### 1. `supabase/migrations/008_create_organization_members.sql`

**Propósito**: Crear tabla central de membresía + índices

**Debe incluir**:
- Definición tabla completa (ver sección 3.1 contexto compartido)
- Todos los campos: id, org_id, user_id, role, status, joined_at, invited_by, invitation_code, invitation_accepted_at, created_at, updated_at
- Constraints: CHECK (role), CHECK (status), UNIQUE(org_id, user_id)
- Foreign keys: organizations(id), auth.users(id)
- Índices: org_id, user_id, role, status, composite (org_id, user_id), code (WHERE status='pending')
- Comentarios SQL explicativos
- Idempotent (IF NOT EXISTS)

**Duración esperada**: 30 minutos
**Testing**: Ejecutar en test DB, verificar índices creados

---

### 2. `supabase/migrations/009_alter_organizations.sql`

**Propósito**: Agregar campos a tabla organizations

**Debe incluir**:
- ALTER TABLE organizations ADD COLUMN owner_id UUID (con FK a auth.users)
- ALTER TABLE organizations ADD COLUMN status TEXT DEFAULT 'active' (con CHECK)
- ALTER TABLE organizations ADD COLUMN metadata JSONB DEFAULT '{}'
- Índice en owner_id
- Comentarios explicativos
- Idempotent (ADD COLUMN IF NOT EXISTS)

**Duración esperada**: 15 minutos
**Testing**: Verificar columnas agregadas, no rompan datos existentes

---

### 3. `supabase/migrations/010_migrate_roles.sql`

**Propósito**: Migrar datos históricos de user_profiles.role → organization_members.role

**Debe incluir**:
- Script INSERT que migra de user_profiles a organization_members
- Validaciones PRE-migración (counts, orphans check)
- Actualización de organizations.owner_id
- Validaciones POST-migración (no duplicados, no nulos, integridad)
- Mensajes NOTICE/RAISE para diagnosticar
- Rollback-safe (usar transacciones)
- Comentarios detallados

**Ver**: `spec-multitenant-migration.md` para scripts referencia completos

**Duración esperada**: 60 minutos
**Testing**: Ejecutar en test DB, validar migrations pre/post inline, rollback test

---

## CRITERIOS DE ACEPTACIÓN

- ✅ 3 migrations creadas e idempotentes
- ✅ Todos los índices presentes y optimizados
- ✅ Constraints (CHECK, UNIQUE, FK) funcionales
- ✅ Scripts validación pre/post migración inline
- ✅ Comentarios SQL presentes
- ✅ Duración estimada <5 min por migration
- ✅ Rollback procedures documentadas
- ✅ Tested en PostgreSQL 14+

---

## REFERENCIAS

**Contexto**: `multitenant-shared-context.md` sección 3 (Modelo de datos)  
**Detalles**: `spec-multitenant-migration.md` (Scripts SQL completos)  
**Reglas**: `.agent/rules/feature-multitenant.md`

---

# SUB-AGENT B: BACKEND FASTAPI SPECIALIST

## OBJETIVO

Generar **API endpoints + middleware + servicios + tests** para gestión de membresías con validación de roles y aislamiento de datos.

## PRE-REQUISITO

1. **Leer primero**: `multitenant-shared-context.md` (completo)
   - Sección 1: Resumen ejecutivo
   - Sección 2: Alcance v1 (CRÍTICO - qué endpoints NO incluir)
   - Sección 3: Modelo datos (para modelos Pydantic)
   - Sección 4: Roles y aislamiento (CRÍTICO - filtrado por rol)

2. **Luego leer**: `spec-multitenant-v1.md` secciones 5-6 (API specification)

## ARTEFACTOS A GENERAR

### 1. `backend/api/routes/memberships.py`

**Propósito**: 6 endpoints CRUD para memberships + invitaciones

**Endpoints (ver sección 5.1 spec-multitenant-v1.md)**:
1. `POST /api/organizations/{org_id}/members` - Invitar
2. `GET /api/organizations/{org_id}/members` - Listar
3. `PATCH /api/organizations/{org_id}/members/{member_id}` - Cambiar rol
4. `DELETE /api/organizations/{org_id}/members/{member_id}` - Remover
5. `GET /api/invitations/{code}` - Validar código
6. `POST /api/invitations/{code}/accept` - Aceptar invitación

**Cada endpoint debe**:
- Type hints 100% (FastAPI + Pydantic)
- Request/response schemas claros
- Docstrings (Google format)
- Error handling (401, 403, 422, 409)
- Usar middleware `verify_org_membership()`
- Logging de operaciones críticas

**Duración esperada**: 90 minutos

---

### 2. `backend/api/middleware.py`

**Propósito**: Middleware central de validación

**Debe incluir**:
```python
async def verify_org_membership(
    user_id: UUID,
    org_id: UUID,
    required_role: Optional[str] = None
) -> OrganizationMember
```

**Validaciones**:
1. Usuario autenticado existe
2. Pertenece a org_id (status='active')
3. Tiene rol requerido (si especificado)
4. Retorna OrganizationMember o raise PermissionDenied

**Duración esperada**: 30 minutos

---

### 3. `backend/models/membership.py`

**Propósito**: Modelos Pydantic para membership

**Debe incluir**:
- `OrganizationMember` (tabla)
- `MemberRequest` (invitar miembro)
- `MemberUpdate` (cambiar rol)
- `InvitationResponse`
- Type hints exactos del schema (sección 3.1)

**Duración esperada**: 45 minutos

---

### 4. `backend/models/schemas.py`

**Propósito**: Schemas request/response

**Debe incluir**:
- `InviteRequest` (email, role)
- `MemberResponse` (con email si disponible)
- `InvitationResponse` (valid, email, role, org_name, expires_at)
- Validaciones Pydantic (role enum, email format)

**Duración esperada**: 30 minutos (integrado con 3)

---

### 5. `backend/services/membership_service.py`

**Propósito**: Lógica de negocio

**Métodos críticos**:
- `invite_member(org_id, email, role, invited_by)` - Con validaciones
- `accept_invitation(code, user_id)` - Con validaciones código expiration
- `change_member_role(org_id, member_id, new_role, changed_by)` - Solo Owner
- `remove_member(org_id, member_id, removed_by)` - Solo Owner
- Validaciones: owner exists, unique org_user, role constraints, invitation code

**Validaciones de negocio** (sección 4.4 contexto):
1. Cada org DEBE tener mínimo 1 Owner
2. Usuario NO puede eliminar su propio membership
3. Status pending expira 7 días
4. Un usuario = una org en v1
5. Solo Owner puede cambiar roles
6. invitation_code único

**Duración esperada**: 45 minutos

---

### 6. `backend/tests/`

**Propósito**: Unit + integration tests

**Tests requeridos**:
- `test_membership_crud.py` - CRUD operations
- `test_role_isolation.py` - Role-based filtering
- `test_invitation_flow.py` - Invitación end-to-end
- Coverage 80%+
- Fixtures para setup
- Mock DB queries

**Duración esperada**: 60 minutos

---

## MODIFICACIONES A ENDPOINTS EXISTENTES

**Todos los endpoints que retornan org_data DEBEN**:

```python
# Antes: SELECT * FROM leads
# Después: 
member = await verify_org_membership(user_id, user_org_id)
query = "SELECT * FROM leads WHERE org_id = $1"
if member.role == 'agent':
    query += " AND agent_id = $2"
    leads = await db.fetch(query, user_org_id, user_id)
else:
    leads = await db.fetch(query, user_org_id)
```

**Aplica a**: GET leads, GET properties, GET tasks, POST (validar org_id), etc.

---

## CRITERIOS DE ACEPTACIÓN

- ✅ 6 endpoints nuevos CRUD funcionales
- ✅ Middleware protect todas rutas críticas
- ✅ Validaciones de negocio implementadas (sección 4.4)
- ✅ Tests 80%+ cobertura
- ✅ Type hints 100%
- ✅ Docstrings presentes
- ✅ Error handling (401, 403, 422, 409)
- ✅ FastAPI 0.100+ async

---

## REFERENCIAS

**Contexto**: `multitenant-shared-context.md` secciones 2-4  
**Especificación**: `spec-multitenant-v1.md` secciones 5-6  
**Reglas**: `.agent/rules/feature-multitenant.md`

---

# SUB-AGENT C: REACT/NEXTJS FRONTEND SPECIALIST

## OBJETIVO

Generar **componentes React + contexto + hooks + rutas** para Team Management y Invitation flow.

## PRE-REQUISITO

1. **Leer primero**: `multitenant-shared-context.md` (completo)
   - Sección 1: Resumen ejecutivo
   - Sección 2: Alcance v1 (CRÍTICO - qué NO crear)
   - Sección 3: Modelo datos (TypeScript interfaces)
   - Sección 4: Roles y aislamiento (CRÍTICO - renderizado condicional)

2. **Luego leer**: `spec-multitenant-v1.md` sección 7 (Componentes)

## ARTEFACTOS A GENERAR

### 1. `frontend/src/lib/contexts/OrgContext.tsx`

**Propósito**: React Context para membresía organizativa

**Debe incluir**:
```typescript
interface OrgMembership {
  org_id: UUID;
  user_id: UUID;
  role: 'owner' | 'manager' | 'agent';
  joined_at: Date;
  status: 'active' | 'pending' | 'suspended' | 'removed';
}

const OrgContext = createContext<OrgMembership | null>(null);
```

**Inicialización**: En RootLayout post-auth

**Duración esperada**: 30 minutos

---

### 2. `frontend/src/lib/hooks/useOrgMembership.ts`

**Propósito**: Hook para acceder contexto + helpers

**Retorna**:
```typescript
{
  org_id: UUID,
  user_id: UUID,
  role: 'owner' | 'manager' | 'agent',
  canManageTeam: boolean,
  canViewAll: boolean,
  canCreateLead: boolean,
  canAssignAgent: boolean
}
```

**Mapea role → permisos** (sección 4.2 contexto)

**Duración esperada**: 45 minutos

---

### 3. `frontend/src/lib/hooks/useTeamManagement.ts`

**Propósito**: Lógica invitación + cambio rol + remoción

**Funciones**:
- `inviteMember(email, role)` - POST /api/organizations/{org_id}/members
- `changeMemberRole(memberId, newRole)` - PATCH
- `removeMember(memberId)` - DELETE
- Manejo errores y loading states

**Duración esperada**: 45 minutos

---

### 4. `frontend/src/components/TeamManagement.tsx`

**Propósito**: Componente gestión de equipo (Owner only)

**Debe incluir**:
- Tabla de miembros (nombre, email, rol, status)
- Form invitar (email + rol dropdown)
- Button cambiar rol (per row)
- Button remover (per row)
- Confirmación modals
- Loading states
- Paginación

**Render condicional**: Solo si `role === 'owner'`

**Duración esperada**: 75 minutos

---

### 5. `frontend/src/components/InvitationAccept.tsx`

**Propósito**: Página pública para aceptar invitación

**Debe incluir**:
- Captar `code` de URL query param
- GET /api/invitations/{code} para validar
- Mostrar: "Invitado a [org] como [role]"
- Button "Aceptar"
- POST /api/invitations/{code}/accept
- Redirigir a /dashboard post-accept
- Manejo de código inválido/expirado

**Ubicación**: `/invite/[code]`

**Duración esperada**: 30 minutos

---

### 6. `frontend/src/components/RoleBasedUIShell.tsx`

**Propósito**: Wrapper para renderizado condicional

**Lógica**:
```typescript
const canAccess = {
  owner: ['dashboard', 'leads', 'properties', 'tasks', 'team'],
  manager: ['dashboard', 'leads', 'properties', 'tasks', 'team-view'],
  agent: ['dashboard', 'my-leads', 'my-properties', 'my-tasks']
}[role];
```

**Duración esperada**: 30 minutos

---

### 7. `frontend/src/components/ProtectedRoute.tsx`

**Propósito**: Guard de rutas por rol

```typescript
<ProtectedRoute requiredRole={['owner']}>
  <TeamManagement />
</ProtectedRoute>
```

**Duración esperada**: 15 minutos

---

### 8. `frontend/src/app/(dashboard)/team/page.tsx`

**Propósito**: Ruta /team para Team Management

**Debe incluir**:
- Import TeamManagement
- Guard con ProtectedRoute requiredRole=['owner']
- Layout dashboard

**Duración esperada**: 10 minutos

---

### 9. `frontend/src/app/invite/[code]/page.tsx`

**Propósito**: Ruta pública /invite/{code}

**Debe incluir**:
- Import InvitationAccept
- Pasar `code` como prop
- Sin guard (público)

**Duración esperada**: 10 minutos

---

## CRITERIOS DE ACEPTACIÓN

- ✅ 3 componentes compilando sin TS errors
- ✅ Context + hooks funcionales
- ✅ 2 rutas nuevas creadas
- ✅ TypeScript strict mode
- ✅ Responsive design (Tailwind)
- ✅ Loading/error states
- ✅ Type hints 100%
- ✅ Next.js 14+ compatible

---

## REFERENCIAS

**Contexto**: `multitenant-shared-context.md` secciones 2-4  
**Especificación**: `spec-multitenant-v1.md` sección 7  
**Reglas**: `.agent/rules/feature-multitenant.md`

---

# FASE INTEGRACIÓN (Post-Paralelo)

Una vez completados los 3 agentes:

## MERGE & TESTING

1. **Agent A**: Ejecuta migrations 008, 009, 010 en test DB
2. **Agent B**: Conecta API contra BD (usa fixtures de Agent A)
3. **Agent C**: Conecta frontend contra API (usa endpoints de Agent B)
4. **Todos**: Tests E2E - flujo completo invitación

## VALIDACIONES FINALES

- [ ] DB schema está creado
- [ ] Endpoints retornando 200/201
- [ ] Componentes sin console errors
- [ ] Flujo invitación end-to-end
- [ ] Role-based filtering funcional
- [ ] All tests passing

---

# TIMELINE ESPERADO

```
T=0h - LECTURA CONTEXTO COMPARTIDO (20 min)
  └─ Todos leen: multitenant-shared-context.md

T=0.33h - INICIO PARALELO
  ├─ Agent A: Database
  ├─ Agent B: Backend API
  └─ Agent C: Frontend

T=2.83h - Agent A COMPLETA (database)
  └─ Queda en espera para integración

T=3.58h - Agent C COMPLETA (frontend)
  └─ Queda en espera para integración

T=3.83h - Agent B COMPLETA (backend)
  └─ Inicia FASE 2: Integración

T=5h - FEATURE COMPLETA
  └─ Todos los tests passing
  └─ Listo para staging
```

---

# CHECKLIST PRE-LANZAMIENTO

- [ ] Todos los agentes leyeron `multitenant-shared-context.md`
- [ ] Cada agente entiende su responsabilidad
- [ ] Referencias a specs correctas confirmadas
- [ ] Timeline aceptado (5 horas total)
- [ ] Criterios de aceptación claros para cada agente

---

**Master Prompt versión**: 1.0  
**Generado**: 2026-02-13  
**Status**: Listo para lanzar 3 agentes en paralelo  
**Próximo**: Distribuir a agentes y ejecutar
