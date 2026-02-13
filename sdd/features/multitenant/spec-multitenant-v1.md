# ESPECIFICACIÓN TÉCNICA: MULTI-TENANT MEMBERSHIPS V1

**Feature ID**: ANCLORA-MTM-001  
**Versión**: 1.0  
**Fecha**: 2026-02-13  
**Status**: Specification Phase  
**Fase**: Prerequisito integrado (Phase 1)  
**Prioridad**: CRÍTICA

---

## 1. RESUMEN EJECUTIVO

Multi-Tenant Memberships v1 transforma Anclora Nexus de arquitectura single-tenant encubierta a multi-tenant funcional real. Implementa modelo organizativo con tres roles jerárquicos (Owner, Manager, Agent) y aislamiento de datos por organización mediante:

1. **Tabla nueva**: `organization_members` (gestión central de membresía)
2. **Filtrado org_id**: En todas entidades críticas (leads, properties, tasks)
3. **Middleware de validación**: Verifique membresía antes de acceso
4. **UI Team Management**: Owner gestiona equipo, asigna roles
5. **Flujo invitación**: Código único → Aceptación → Acceso según rol

**Objetivo**: Permitir que múltiples agentes con roles diferentes accedan a Nexus dentro de Anclora Private Estates manteniendo aislamiento completo según su nivel jerárquico.

---

## 2. ALCANCE VERSIÓN 1

### Incluido

| Item | Descripción | Requisito |
|------|-------------|-----------|
| **Tabla `organization_members`** | Gestión central de membresía | CRÍTICA |
| **Tres roles** | Owner, Manager, Agent | CRÍTICA |
| **Aislamiento org_id** | Filtrado en leads/properties/tasks | CRÍTICA |
| **Endpoints nuevos** | 6 rutas para memberships | ALTA |
| **Endpoints modificados** | 5+ rutas existentes con filtrado | ALTA |
| **UI Team Management** | Componente para Owner | MEDIA |
| **Flujo invitación** | Código → Aceptación | ALTA |
| **Validación middleware** | `verify_org_membership()` | CRÍTICA |

### Excluido (Futuro)

- ❌ Row Level Security (RLS) nativo PostgreSQL - v2
- ❌ Email automático para invitaciones - v1.1
- ❌ Asignación granular por permisos específicos - v2
- ❌ Multi-organización por usuario - v2
- ❌ Auditoría completa - v2
- ❌ Revocación de membresía - v1.1

---

## 3. MODELO DE DATOS

### 3.1 Tabla Nueva: `organization_members`

**Propósito**: Fuente única de verdad para membresía y rol.

```sql
CREATE TABLE organization_members (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Membresía
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'agent')),
  status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'pending', 'suspended', 'removed')),
  joined_at TIMESTAMP DEFAULT NOW(),
  
  -- Invitación
  invited_by UUID REFERENCES auth.users(id),
  invitation_code TEXT UNIQUE,
  invitation_accepted_at TIMESTAMP,
  
  -- Auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraint
  UNIQUE(org_id, user_id)
);
```

**Índices requeridos**:

```sql
CREATE INDEX idx_org_members_org_id ON organization_members(org_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);
CREATE INDEX idx_org_members_status ON organization_members(status);
CREATE INDEX idx_org_members_org_user ON organization_members(org_id, user_id);
CREATE INDEX idx_org_members_code ON organization_members(invitation_code) 
  WHERE status = 'pending';
```

### 3.2 Cambios a Tabla: `organizations`

**Campos nuevos**:

```sql
ALTER TABLE organizations ADD COLUMN (
  owner_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  metadata JSONB DEFAULT '{}'
);
```

**Propósito**:
- `owner_id`: Referencia rápida al propietario
- `status`: Desactivar org sin eliminar
- `metadata`: JSON flexible para futuras extensiones

### 3.3 Cambios a Tabla: `user_profiles`

**Deprecación**:

```sql
-- Campo a deprecar (mantener para backward compatibility)
user_profiles.role VARCHAR -- NO USAR DESPUÉS V1

-- Nueva fuente de verdad
organization_members.role -- USAR
```

**Migración**: Ver `spec-multitenant-migration.md`

---

## 4. ROLES Y AISLAMIENTO

### 4.1 Matriz de Permisos

| Acción | Owner | Manager | Agent |
|--------|-------|---------|-------|
| **Ver todos leads** | ✅ | ✅ | ❌ (solo asignados) |
| **Ver todos properties** | ✅ | ✅ | ❌ (solo asignados) |
| **Ver todos tasks** | ✅ | ✅ | ❌ (solo creados/asignados) |
| **Crear lead** | ✅ | ✅ | ❌ |
| **Crear property** | ✅ | ✅ | ❌ |
| **Crear task** | ✅ | ✅ | ✅ (limitado) |
| **Asignar lead** | ✅ | ❌ | ❌ |
| **Cambiar rol** | ✅ | ❌ | ❌ |
| **Invitar miembro** | ✅ | ❌ | ❌ |
| **Remover miembro** | ✅ | ❌ | ❌ |
| **Ver equipo** | ✅ | ✅ | ❌ |

### 4.2 Definición de Roles

#### Owner
- **Descripción**: Propietario de organización
- **Responsabilidades**: Control total, gestión de equipo
- **Acceso**: Toda la organización
- **Permisos únicos**: Cambiar roles, invitar, remover
- **Único por org**: SÍ (mínimo 1)

#### Manager
- **Descripción**: Gestor operativo
- **Responsabilidades**: Supervisión, asignación de tareas
- **Acceso**: Todos los datos (lectura/escritura)
- **Permisos especiales**: Ver equipo (readonly)
- **Límites**: No puede cambiar roles

#### Agent
- **Descripción**: Agente de ventas/marketing
- **Responsabilidades**: Ejecución, prospección
- **Acceso**: Datos asignados solo
- **Permisos limitados**: Crear tasks asignadas, actualizar registros
- **Límites**: No ve otros agentes ni puede asignar

---

## 5. API SPECIFICATION

### 5.1 Endpoints Nuevos

#### `POST /api/organizations/{org_id}/members`

**Propósito**: Invitar nuevo miembro a organización

**Autenticación**: Bearer token (Owner requerido)

**Parámetros path**:
- `org_id` (UUID): ID de organización

**Body**:
```json
{
  "email": "newmember@example.com",
  "role": "agent"
}
```

**Validaciones**:
1. Requester es Owner de `org_id`
2. `email` no existe en `org_id`
3. `role` está en enum (owner, manager, agent)

**Response (201)**:
```json
{
  "id": "uuid",
  "org_id": "uuid",
  "email": "newmember@example.com",
  "role": "agent",
  "status": "pending",
  "invitation_code": "ABC123DEF456...",
  "joined_at": "2026-02-13T15:30:00Z"
}
```

**Errores**:
- 401: No autenticado
- 403: No es Owner
- 409: Email ya existe en org
- 422: Role inválido

---

#### `GET /api/organizations/{org_id}/members`

**Propósito**: Listar miembros de organización

**Autenticación**: Bearer token (Owner/Manager requerido)

**Parámetros query**:
- `status` (optional): active, pending, suspended, removed
- `role` (optional): owner, manager, agent
- `limit` (optional, default=50): Máx registros
- `offset` (optional, default=0): Paginación

**Response (200)**:
```json
{
  "members": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "role": "agent",
      "status": "active",
      "joined_at": "2026-02-13T15:30:00Z",
      "email": "agent@example.com"
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

**Errores**:
- 401: No autenticado
- 403: No es Owner/Manager

---

#### `PATCH /api/organizations/{org_id}/members/{member_id}`

**Propósito**: Cambiar rol o estado de miembro

**Autenticación**: Bearer token (Owner requerido)

**Parámetros path**:
- `org_id` (UUID)
- `member_id` (UUID)

**Body** (uno o ambos):
```json
{
  "role": "manager",
  "status": "suspended"
}
```

**Validaciones**:
1. Requester es Owner de `org_id`
2. `role` está en enum
3. `status` está en enum
4. No puede cambiar último Owner

**Response (200)**:
```json
{
  "id": "uuid",
  "role": "manager",
  "status": "active",
  "updated_at": "2026-02-13T15:45:00Z"
}
```

---

#### `DELETE /api/organizations/{org_id}/members/{member_id}`

**Propósito**: Remover miembro de organización

**Autenticación**: Bearer token (Owner requerido)

**Validaciones**:
1. Requester es Owner
2. No es último Owner

**Response (204)**: No content

---

#### `GET /api/invitations/{code}`

**Propósito**: Validar código de invitación

**Autenticación**: Opcional (public endpoint)

**Parámetros path**:
- `code` (string): Código de invitación

**Response (200)**:
```json
{
  "valid": true,
  "email": "user@example.com",
  "role": "agent",
  "org_name": "Anclora Private Estates",
  "expires_at": "2026-02-20T15:30:00Z"
}
```

**Response (404)**: Código inválido o expirado

---

#### `POST /api/invitations/{code}/accept`

**Propósito**: Aceptar invitación e iniciar sesión

**Autenticación**: Session (usuario debe estar autenticado)

**Parámetros path**:
- `code` (string): Código de invitación

**Body**:
```json
{
  "user_id": "uuid"
}
```

**Validaciones**:
1. `code` existe y es válido
2. No expirado (>7 días)
3. `user_id` coincide con email en invitación

**Response (200)**:
```json
{
  "id": "uuid",
  "org_id": "uuid",
  "role": "agent",
  "status": "active",
  "joined_at": "2026-02-13T15:50:00Z",
  "message": "Bienvenido a Anclora"
}
```

---

### 5.2 Endpoints Modificados

#### `GET /api/leads`

**Cambios**:
- Agregar filtrado automático por `org_id`
- Si Agent: agregar `AND agent_id = $2`

**Query Backend**:
```python
# Owner/Manager
SELECT * FROM leads WHERE org_id = $1

# Agent
SELECT * FROM leads WHERE org_id = $1 AND agent_id = $2
```

**Igual para**:
- GET /api/properties
- GET /api/properties/{id}
- GET /api/tasks
- POST /api/leads (validar org_id)
- POST /api/properties (validar org_id)

---

## 6. MIDDLEWARE Y VALIDACIÓN

### 6.1 Middleware: `verify_org_membership()`

**Ubicación**: `backend/api/middleware.py`

**Firma**:
```python
async def verify_org_membership(
    user_id: UUID,
    org_id: UUID,
    required_role: Optional[str] = None,
    required_status: str = 'active'
) -> OrganizationMember
```

**Lógica**:
1. Buscar en `organization_members` WHERE `user_id` = $1 AND `org_id` = $2
2. Validar `status` = `required_status`
3. Si `required_role` especificado: validar `role` match
4. Retornar `OrganizationMember` o raise `PermissionDenied`

**Uso en rutas**:
```python
@router.get("/leads")
async def get_leads(user: User = Depends(get_current_user)):
    # Validar membership básico
    member = await verify_org_membership(user.id, user.org_id)
    
    # Ahora construir query con org_id
    leads = await db.fetch(
        "SELECT * FROM leads WHERE org_id = $1",
        member.org_id
    )
    return leads

@router.post("/organizations/{org_id}/members")
async def invite_member(
    org_id: UUID,
    payload: InvitePayload,
    user: User = Depends(get_current_user)
):
    # Validar que es Owner
    member = await verify_org_membership(
        user.id, org_id, required_role='owner'
    )
    # ... rest del código
```

### 6.2 Validaciones de Negocio

**En `backend/services/membership_service.py`**:

1. **`validate_owner_exists()`**
   - Cada org debe tener mínimo 1 Owner
   - Usado antes de remover último Owner

2. **`validate_invitation_code()`**
   - Código único y válido
   - No expirado (7 días)
   - No usado previamente

3. **`validate_role_change()`**
   - No cambiar último Owner a otro role
   - Solo Owner puede cambiar roles

4. **`validate_user_single_org()`**
   - Un usuario = una org en v1
   - UNIQUE(user_id, status='active') constraint

---

## 7. COMPONENTES FRONTEND

### 7.1 Context: `OrgContext`

**Ubicación**: `frontend/src/lib/contexts/OrgContext.tsx`

```typescript
interface OrgMembership {
  org_id: UUID;
  user_id: UUID;
  role: 'owner' | 'manager' | 'agent';
  joined_at: Date;
  status: 'active' | 'pending' | 'suspended' | 'removed';
}

export const OrgContext = createContext<OrgMembership | null>(null);
```

**Inicialización**: En `RootLayout`, después de auth

```typescript
const membership = await fetchOrgMembership(user.id);
<OrgContext.Provider value={membership}>
  {children}
</OrgContext.Provider>
```

### 7.2 Hook: `useOrgMembership()`

```typescript
export function useOrgMembership() {
  const context = useContext(OrgContext);
  if (!context) throw new Error('useOrgMembership must be used within OrgProvider');
  
  return {
    ...context,
    canManageTeam: context.role === 'owner',
    canViewAll: context.role in ['owner', 'manager'],
    canCreateLead: context.role in ['owner', 'manager'],
    canAssignAgent: context.role === 'owner',
  };
}
```

### 7.3 Componentes Nuevos

#### `<TeamManagement />`

**Props**: Ninguno (usa `useOrgMembership()`)

**Render condicional**: Solo Owner

**Funcionalidades**:

1. **Lista de miembros**
   - Tabla con: Nombre, Email, Rol, Status, Acciones
   - Ordenable por rol/status
   - Paginación

2. **Invitar nuevo miembro**
   - Form: Email, Rol dropdown
   - Button: "Enviar invitación"
   - Feedback: "Invitación enviada"

3. **Cambiar rol**
   - Click en fila → abre editor rol
   - Dropdown: owner, manager, agent
   - Button guardar
   - Validación: no cambiar último owner

4. **Remover miembro**
   - Button rojo "Remover"
   - Confirmación modal
   - DELETE /api/organizations/{org_id}/members/{member_id}

#### `<InvitationAccept />`

**Props**:
- `code` (string): De URL query param

**Ubicación**: `/invite/{code}`

**Funcionalidades**:
1. Valida código → GET /api/invitations/{code}
2. Muestra: "Invitado a [org] como [role]"
3. Button: "Aceptar invitación"
4. POST /api/invitations/{code}/accept
5. Redirige a `/dashboard`

#### `<RoleBasedUIShell />`

**Props**:
- `children`: Contenido a renderizar

**Lógica**:
```typescript
const { role } = useOrgMembership();

const canAccess = {
  owner: ['dashboard', 'leads', 'properties', 'tasks', 'team'],
  manager: ['dashboard', 'leads', 'properties', 'tasks', 'team-view'],
  agent: ['dashboard', 'my-leads', 'my-properties', 'my-tasks']
}[role];
```

### 7.4 Guards de Rutas

```typescript
<ProtectedRoute requiredRole={['owner']}>
  <TeamManagement />
</ProtectedRoute>

<ProtectedRoute requiredRole={['owner', 'manager']}>
  <LeadsList />
</ProtectedRoute>

<ProtectedRoute requiredRole={['owner', 'manager', 'agent']}>
  <Dashboard />
</ProtectedRoute>
```

---

## 8. FLUJOS OPERACIONALES

### 8.1 Onboarding Nuevo Miembro

```
┌─ Owner en TeamManagement
├─ Click "Invitar miembro"
├─ Form: email + role
├─ POST /api/organizations/{org_id}/members
│  ├─ Backend valida: requester es Owner
│  ├─ Genera invitation_code único
│  ├─ Inserta en organization_members (status=pending)
│  └─ Retorna code
├─ UI: "Invitación enviada a [email]"
├─ Email: Enlace /invite/{code}
├─ Nuevo usuario: Accede con código
├─ GET /api/invitations/{code}
├─ Página InvitationAccept: Valida + Muestra rol
├─ POST /api/invitations/{code}/accept
│  ├─ Backend: Actualiza status pending→active
│  ├─ invitation_accepted_at = NOW()
│  └─ Retorna membership
└─ Redirige a /dashboard (ahora con acceso)
```

### 8.2 Cambio de Rol

```
┌─ Owner en TeamManagement
├─ Selecciona miembro de lista
├─ Abre editor: dropdown role
├─ Selecciona "manager"
├─ Click guardar
├─ PATCH /api/organizations/{org_id}/members/{member_id}
│  ├─ Body: { role: 'manager' }
│  ├─ Backend valida: requester es Owner
│  ├─ Actualiza organization_members.role
│  ├─ updated_at = NOW()
│  └─ Retorna updated member
├─ UI: Actualiza tabla con nuevo rol
└─ Próxima consulta del usuario refleja cambio
```

### 8.3 Agent accediendo Leads (con aislamiento)

```
┌─ Agent autenticado
├─ Navega a /dashboard/leads
├─ useOrgMembership() → role='agent'
├─ GET /api/leads
├─ Backend:
│  ├─ verify_org_membership(agent_id, agent_org_id)
│  ├─ Query:
│  │  SELECT * FROM leads 
│  │  WHERE org_id = $1 
│  │  AND agent_id = $2
│  └─ Retorna solo leads asignados
├─ UI: Muestra solo mis leads
└─ Manager:
   ├─ GET /api/leads (mismo endpoint)
   ├─ Query: WHERE org_id = $1 (sin agent_id)
   └─ Retorna todos leads de org
```

---

## 9. CRITERIOS DE ACEPTACIÓN

**La feature está completa cuando**:

- ✅ Tabla `organization_members` creada con migraciones
- ✅ Todos 6 endpoints nuevos funcionales y testeados
- ✅ Middleware `verify_org_membership()` en todas rutas críticas
- ✅ Leads/properties/tasks filtran por org_id + rol
- ✅ UI TeamManagement funcional (Owner solo)
- ✅ Flujo invitación end-to-end (código → aceptación → acceso)
- ✅ Agent ve solo datos asignados
- ✅ Manager ve todo pero no puede cambiar roles
- ✅ Owner gestiona equipo completamente
- ✅ Tests: 80% cobertura unitarios + E2E
- ✅ API docs actualizadas
- ✅ Migración datos históricos sin pérdida

---

## 10. ESTIMACIONES

| Componente | Tokens | Duración |
|-----------|--------|----------|
| Schema SQL + migraciones | 2,500 | 15 min |
| FastAPI endpoints (6 nuevos + 5 mod) | 5,000 | 45 min |
| Middleware + validación | 2,000 | 20 min |
| React components + context | 3,500 | 30 min |
| Tests + documentación | 2,000 | 25 min |
| **TOTAL** | **15,000** | **~2.25h** |

**Costo**: 15,000 tokens × 0.0005€ = **7.50€**

---

## 11. REFERENCIAS

- **Feature Rules**: `.agent/rules/feature-multitenant.md`
- **SKILL**: `.agent/skills/features/multitenant/SKILL.md`
- **Migration**: `spec-multitenant-migration.md`
- **Prompt Antigravity**: `.antigravity/prompts/feature-multitenant-v1.md`

---

**Documento versión**: 1.0  
**Status**: Specification Phase  
**Controlado por**: SDD Multi-Tenant Memberships v1  
**Última actualización**: 2026-02-13
