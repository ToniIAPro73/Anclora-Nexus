# SKILL: Multi-Tenant Memberships v1

**Versión**: 1.0  
**Tipo**: Feature Architecture  
**Status**: Specification Phase  
**Complejidad**: Alta  
**Dependencias**: Core Database + Core API  

---

## DESCRIPCIÓN GENERAL

Este skill encapsula la implementación completa de Multi-Tenant Memberships v1 para Anclora Nexus. Cubre desde definición de schema hasta componentes frontend, proporcionando templates, validaciones y arquitectura.

---

## CAPACIDADES

### Arquitectura

1. **Database Schema** - Tabla `organization_members` + migraciones
2. **Backend Layer** - Endpoints FastAPI + middleware de validación
3. **Frontend Layer** - Componentes React + contextos + guards
4. **Security Layer** - Aislamiento org_id + validación de roles

### Especificidades

1. **Rol Management** - Owner, Manager, Agent (jerarquía funcional)
2. **Membership Flow** - Invitación → Aceptación → Acceso
3. **Data Isolation** - Filtrado por org_id + visibilidad según rol
4. **Integration** - Leads, Properties, Tasks, Intelligence

---

## ESTRUCTURA DE ARCHIVOS

```
skills/features/multitenant/
├── SKILL.md (este archivo)
├── database/
│   ├── schema.sql
│   ├── migrations/
│   │   ├── 008_create_organization_members.sql
│   │   ├── 009_alter_organizations.sql
│   │   └── 010_migrate_roles.sql
│   └── indices.sql
├── backend/
│   ├── models.py (OrganizationMember, schemas)
│   ├── endpoints.py (6 nuevas rutas)
│   ├── middleware.py (verify_org_membership)
│   ├── services.py (membership logic)
│   └── validation.py (business rules)
├── frontend/
│   ├── components/
│   │   ├── TeamManagement.tsx
│   │   ├── InvitationAccept.tsx
│   │   └── RoleBasedUIShell.tsx
│   ├── hooks/
│   │   ├── useOrgMembership.ts
│   │   └── useTeamManagement.ts
│   ├── contexts/
│   │   └── OrgContext.tsx
│   └── guards/
│       └── ProtectedRoute.tsx
├── tests/
│   ├── test_membership_crud.py
│   ├── test_role_isolation.py
│   ├── test_e2e_flow.py
│   └── test_integration.py
└── docs/
    ├── architecture.md
    ├── api-reference.md
    └── testing-guide.md
```

---

## MÉTODOS CLAVE

### Database Methods

#### `create_organization_members_table()`

Crea tabla central de membresía.

**Parámetros**: Ninguno  
**Retorna**: SQL DDL  
**Validaciones**:
- UUID fields deben ser válidas
- Role enum debe contener: owner, manager, agent
- Status enum debe contener: active, pending, suspended, removed

**SQL generado**:

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'agent')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'removed')),
  joined_at TIMESTAMP DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  invitation_code TEXT UNIQUE,
  invitation_accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);
```

#### `create_membership_indices()`

Optimiza performance de queries.

**Índices creados**:
- `org_id` (búsqueda rápida por organización)
- `user_id` (búsqueda rápida por usuario)
- `role` (filtrado por rol)
- `status` (filtrado activos/inactivos)
- Composite `(org_id, user_id)` para searches frecuentes

### Backend Methods

#### `verify_org_membership(user_id: UUID, org_id: UUID, required_role: Optional[str])`

**Propósito**: Middleware de autorización central

**Lógica**:
1. Valida `user_id` existe y está autenticado
2. Busca membership en `organization_members`
3. Verifica `status = 'active'`
4. Si `required_role` especificado: valida match
5. Retorna `OrganizationMember` o raise `PermissionDenied`

**Uso**:
```python
@router.get("/leads")
async def get_leads(user: User = Depends(get_current_user)):
    member = await verify_org_membership(user.id, user.org_id)  # Valida básico
    # ... continúa con lógica
```

#### `invite_member(org_id: UUID, email: str, role: str, invited_by: UUID)`

**Propósito**: Crear invitación para nuevo miembro

**Validaciones**:
- `invited_by` debe ser Owner de `org_id`
- `role` debe estar en enum
- `email` no puede ser duplicado en misma org

**Retorna**: `InvitationCode` (32 caracteres)

**Genera**:
- Registro en `organization_members` (status='pending')
- `invitation_code` único
- Email invitación (future)

#### `accept_invitation(code: str, user_id: UUID)`

**Propósito**: Aceptar invitación y activar membership

**Validaciones**:
- `code` debe existir y ser válido
- `code` no debe estar expirado (7 días)
- `code` no debe estar already used

**Cambios**:
- `status`: pending → active
- `invitation_accepted_at` = NOW()
- `user_id` asignado

#### `change_member_role(org_id: UUID, member_id: UUID, new_role: str, changed_by: UUID)`

**Propósito**: Cambiar rol a miembro existente

**Validaciones**:
- `changed_by` debe ser Owner de `org_id`
- `new_role` debe estar en enum
- No puede cambiar último Owner

**Cambios**:
- `role` actualizado
- `updated_at` = NOW()

### Frontend Methods

#### `<TeamManagement />`

**Props**: Ninguno (usa OrgContext)

**Render condicional**: Solo Owner

**Funcionalidades**:
1. Listar todos miembros con roles
2. Form "Invitar miembro"
3. Botón cambiar rol por miembro
4. Botón remover miembro
5. Indicador status (active/pending/suspended)

**Interacciones**:
- Click "Invitar": abre form
- Form submit: POST `/api/organizations/{org_id}/members`
- Change role dropdown: PATCH `/api/organizations/{org_id}/members/{member_id}`
- Remove button: DELETE `/api/organizations/{org_id}/members/{member_id}`

#### `useOrgMembership()` Hook

**Retorna**: 
```typescript
{
  org_id: UUID,
  user_id: UUID,
  role: 'owner' | 'manager' | 'agent',
  joined_at: Date,
  canManageTeam: boolean,
  canViewAll: boolean,
  canCreateTasks: boolean
}
```

**Lógica interna**:
1. Lee `OrgContext`
2. Mapea role → permisos
3. Retorna objeto con flags

---

## FLUJOS DE IMPLEMENTACIÓN

### Flujo 1: Crear Membership (Owner invita)

```
1. Owner en TeamManagement
2. Click "Invitar"
3. Form: email, rol
4. Submit: POST /api/organizations/{org_id}/members
   └─ Body: { email, role }
5. Backend:
   └─ verify_org_membership(owner_id, org_id, 'owner')
   └─ invite_member(org_id, email, role, owner_id)
   └─ Return: InvitationCode
6. UI: Mostrar "Código enviado a email"
7. Email: Enlace con código
8. Nuevo usuario: Accede con código
9. Página InvitationAccept: Validar + Accept
10. Backend: accept_invitation(code, new_user_id)
11. Status: pending → active
12. Nuevo usuario redirigido a dashboard
```

### Flujo 2: Cambiar Rol (Owner modifica)

```
1. Owner en TeamManagement
2. Selecciona miembro de lista
3. Click dropdown rol
4. Selecciona nuevo rol
5. Submit: PATCH /api/organizations/{org_id}/members/{member_id}
   └─ Body: { role: 'agent' }
6. Backend:
   └─ verify_org_membership(owner_id, org_id, 'owner')
   └─ change_member_role(org_id, member_id, 'agent', owner_id)
7. Response: Updated member
8. UI: Actualiza lista con nuevo rol
```

### Flujo 3: Agent accede a leads (con filtrado)

```
1. Agent autentica (auth.users)
2. Accede a /dashboard/leads
3. Frontend: useOrgMembership() → role='agent'
4. GET /api/leads
5. Backend:
   └─ verify_org_membership(agent_id, agent_org_id)
   └─ Query: SELECT * FROM leads 
            WHERE org_id = $1 
            AND agent_id = $2
6. Retorna solo leads asignados a agente
7. Manager accede mismo endpoint:
   └─ Query: SELECT * FROM leads 
            WHERE org_id = $1
8. Retorna todos leads de org
```

---

## PATRONES Y ANTI-PATRONES

### ✅ CORRECTO

```python
# ✅ Siempre validar membership primero
async def get_leads(user: User = Depends(get_current_user)):
    member = await verify_org_membership(user.id, user.org_id)  # PRIMERO
    
    # Luego filtrar por org_id
    leads = await db.fetch(
        "SELECT * FROM leads WHERE org_id = $1 AND ...",
        member.org_id
    )
    return leads
```

### ❌ INCORRECTO

```python
# ❌ Confiar en user.org_id sin validar
async def get_leads(user: User):
    leads = await db.fetch(
        "SELECT * FROM leads WHERE org_id = $1",
        user.org_id  # ¿De dónde vino esto? No está validado
    )
    return leads
```

### ✅ CORRECTO (Frontend)

```typescript
// ✅ Usar guard de ruta
<ProtectedRoute requiredRole={['owner']}>
  <TeamManagement />
</ProtectedRoute>
```

### ❌ INCORRECTO (Frontend)

```typescript
// ❌ Renderizar condicional sin contexto
{user.role === 'owner' && <TeamManagement />}  // ¿De dónde vino user.role?
```

---

## TESTING PATTERNS

### Unit Test: Verify Membership

```python
async def test_verify_org_membership_success():
    # Setup: Crear user + org + membership
    user = await create_test_user()
    org = await create_test_org()
    member = await create_membership(org.id, user.id, 'agent', 'active')
    
    # Test
    result = await verify_org_membership(user.id, org.id)
    
    # Assert
    assert result.role == 'agent'
    assert result.status == 'active'

async def test_verify_org_membership_wrong_org():
    # Setup: User en org A, intenta acceder org B
    user = await create_test_user()
    org_a = await create_test_org()
    org_b = await create_test_org()
    await create_membership(org_a.id, user.id, 'agent')
    
    # Test & Assert
    with pytest.raises(PermissionDenied):
        await verify_org_membership(user.id, org_b.id)
```

### Integration Test: Invite Flow

```python
async def test_invite_and_accept_flow():
    # 1. Owner invita
    owner = await create_test_user()
    org = await create_test_org(owner.id)
    invitation = await invite_member(org.id, "new@test.com", "agent", owner.id)
    
    # 2. Código válido
    assert invitation.code
    
    # 3. Nuevo user acepta
    new_user = await create_test_user(email="new@test.com")
    result = await accept_invitation(invitation.code, new_user.id)
    
    # 4. Status cambió
    assert result.status == 'active'
    
    # 5. Ahora tiene acceso
    member = await verify_org_membership(new_user.id, org.id)
    assert member.role == 'agent'
```

---

## INTEGRACIÓN CON OTRAS FEATURES

### Intelligence (No requiere cambios v1)

```
Intelligence solo usa data de una org:
  Queries:
    - Governor accede leads/properties de org_id
    - Router planifica dentro org_id
    - Synthesizer sintetiza de org_id
    
Post-v1:
  - Intelligence debe recibir org_id en contexto
  - RLS protegerá queries automáticamente
```

### Leads/Properties/Tasks (Cambios inmediatos)

```python
# v0: SIN PROTECCIÓN
leads = await db.fetch("SELECT * FROM leads")  # 🚨 INSEGURO

# v1: CON PROTECCIÓN
member = await verify_org_membership(user.id, user.org_id)
leads = await db.fetch(
    "SELECT * FROM leads WHERE org_id = $1",
    member.org_id
)
```

---

## PERFORMANCE CONSIDERATIONS

### Query Performance

**Sin índices** (v0):
```
SELECT * FROM leads WHERE org_id = $1: ~500ms (10k registros)
```

**Con índices** (v1):
```
CREATE INDEX idx_leads_org_id ON leads(org_id);
SELECT * FROM leads WHERE org_id = $1: ~50ms
```

### Middleware Overhead

```
verify_org_membership() overhead: ~5-10ms per request
Aceptable para <1000 concurrent users
Post-v1: RLS reduce a ~1ms con caching
```

---

## CHANGELOG

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 2026-02-13 | Skill inicial - Multi-Tenant v1 |

---

## REFERENCIAS

- **Feature Rules**: `feature-multitenant.md`
- **Spec Técnico**: `sdd/features/multitenant/spec-multitenant-v1.md`
- **Prompt Antigravity**: `.antigravity/prompts/feature-multitenant-v1.md`

---

**Skill controlado por**: Multi-Tenant Memberships  
**Próxima versión**: 1.1 (Post-RLS nativo)  
**Status**: Listo para Antigravity
