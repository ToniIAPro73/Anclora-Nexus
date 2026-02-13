# Feature Rules: Multi-Tenant Memberships v1

**Versión**: 1.0  
**Fecha**: 2026-02-13  
**Status**: Specification Phase  
**Fase**: Prerequisito integrado (Phase 1)

---

## 1. DECLARACIÓN DE PROPÓSITO

Multi-Tenant Memberships v1 transforma Anclora Nexus de arquitectura single-tenant encubierta a multi-tenant funcional real. Es **prerequisito crítico** para que la validación inmobiliaria (Phase 1) opera con aislamiento correcto de datos por usuario y rol jerárquico.

**Objetivo estratégico**: Implementar modelo organizativo con Owner → Manager → Agent donde cada usuario accede solo a datos según su rol dentro de la organización Anclora Private Estates.

---

## 2. ALCANCE Y LÍMITES

### Incluido en v1

1. **Tabla `organization_members`** - Gestión central de membresía
2. **Tres roles jerárquicos** - Owner (control total), Manager (supervisión), Agent (ejecución)
3. **Aislamiento básico** - Filtrado org_id + rol en Backend
4. **Flujo de onboarding** - Invitación por código → Aceptación → Acceso
5. **UI Team Management** - Owner visualiza y gestiona equipo
6. **Endpoints nuevos** - 6 rutas para gestión de miembros
7. **Endpoints modificados** - 5+ rutas existentes con filtrado org_id

### Excluido de v1 (Post-implementación)

- ❌ Row Level Security (RLS) nativo PostgreSQL
- ❌ Email automático para invitaciones
- ❌ Asignación granular de permisos por lead/property
- ❌ Multi-organización por usuario
- ❌ Auditoría completa de cambios
- ❌ Revocación de membresía (soft delete solo)

---

## 3. REGLAS DE ARQUITECTURA

### 3.1 Modelo de Datos

**Nueva tabla obligatoria**:

```sql
organization_members (
  id UUID PRIMARY KEY,
  org_id UUID FK,
  user_id UUID FK,
  role ENUM('owner', 'manager', 'agent'),
  status ENUM('active', 'pending', 'suspended', 'removed'),
  joined_at TIMESTAMP,
  invitation_code TEXT UNIQUE,
  UNIQUE(org_id, user_id)
)
```

**Cambios a tablas existentes**:

- `organizations`: Agregar `owner_id`, `status`, `metadata`
- `user_profiles`: Marcar `role` como deprecated (migrar a `organization_members.role`)

### 3.2 Aislamiento por Rol

| Rol | Leads | Properties | Tasks | Gestión equipo |
|-----|-------|-----------|-------|----------------|
| Owner | Toda org | Toda org | Toda org | ✅ SÍ (único permisos) |
| Manager | Toda org | Toda org | Toda org | 👀 Lectura solo |
| Agent | Solo asignados | Solo asignados | Solo creados/asignados | ❌ No visible |

**Regla crítica**: Aislamiento se implementa vía:
1. Validación middleware `verify_org_membership()`
2. Filtrado SQL por `org_id` + visibilidad según rol
3. Guards de rutas en Frontend
4. Post-v1: RLS nativo en PostgreSQL

### 3.3 Integridad de Datos

**Reglas de negocio obligatorias**:

1. ✅ Cada organización DEBE tener mínimo 1 Owner
2. ✅ Usuario NO puede eliminar su propio membership (Owner exception)
3. ✅ Status `pending` expira 7 días (cleanup futuro)
4. ✅ Un usuario = una org en v1 (constraint UNIQUE)
5. ✅ Solo Owner puede cambiar roles
6. ✅ invitation_code único de 32 caracteres alphanumericos

---

## 4. ESPECIFICACIÓN TÉCNICA

### 4.1 Backend (FastAPI)

**Nuevos endpoints**:

| Endpoint | Método | Rol autorizador | Descripción |
|----------|--------|-----------------|-------------|
| `/api/organizations/{org_id}/members` | GET | owner, manager | Listar miembros |
| `/api/organizations/{org_id}/members` | POST | owner | Invitar miembro |
| `/api/organizations/{org_id}/members/{member_id}` | PATCH | owner | Cambiar rol/estado |
| `/api/organizations/{org_id}/members/{member_id}` | DELETE | owner | Remover miembro |
| `/api/invitations/{code}` | GET | public | Validar código invitación |
| `/api/invitations/{code}/accept` | POST | public (sesión) | Aceptar invitación |

**Middleware crítico**:

```python
async def verify_org_membership(
    user_id: UUID, 
    org_id: UUID, 
    required_role: Optional[str] = None
) -> OrganizationMember
```

Valida:
1. Usuario existe y está autenticado
2. Pertenece a org_id (status='active')
3. Tiene rol requerido (si se especifica)

**Modificaciones a rutas existentes**:

Todos endpoints que retornan leads/properties/tasks deben:
1. Obtener `org_id` del usuario desde `organization_members`
2. Agregar `WHERE org_id = $1` a todas las queries
3. Si Agent: agregar `AND agent_id = $2`

Ejemplo:
```python
@router.get("/leads")
async def get_leads(user: User = Depends(get_current_user)):
    member = await verify_org_membership(user.id, user.org_id)
    query = "SELECT * FROM leads WHERE org_id = $1"
    if member.role == 'agent':
        query += " AND agent_id = $2"
        leads = await db.fetch(query, user.org_id, user.id)
    else:
        leads = await db.fetch(query, user.org_id)
    return leads
```

### 4.2 Frontend (Next.js)

**Nuevos componentes**:

1. **`<TeamManagement />`** (Owner only)
   - Listar miembros con roles
   - Invitar nuevo miembro
   - Cambiar rol
   - Remover miembro

2. **`<InvitationAccept />`** (Página pública)
   - Validar código invitación
   - Botón "Aceptar"
   - Redirigir a dashboard

3. **`<RoleBasedUIShell />`** (Renderizado condicional)
   - Owner: acceso total
   - Manager: leads, properties, tasks, team (readonly)
   - Agent: datos asignados + mis tasks

**React Context**:

```typescript
interface OrgMembership {
  org_id: UUID;
  user_id: UUID;
  role: 'owner' | 'manager' | 'agent';
  joined_at: Date;
}

const OrgContext = createContext<OrgMembership | null>(null);
```

**Guards de rutas**:

```typescript
<ProtectedRoute requiredRole={['owner']}>
  <TeamManagement />
</ProtectedRoute>
```

---

## 5. FLUJOS OPERACIONALES

### 5.1 Onboarding nuevo miembro

```
1. Owner accede a Team Management
2. Click "Invitar miembro"
3. Sistema genera invitation_code único
4. Enlace enviado a usuario (future: email automático)
5. Usuario accede con código
6. Sistema valida: código válido, no expirado
7. Usuario acepta invitación
8. Status: pending → active
9. invitation_accepted_at = NOW()
10. Usuario obtiene acceso según rol asignado
```

### 5.2 Cambio de rol

```
1. Owner accede a Team Management
2. Selecciona miembro existente
3. Abre dropdown de rol
4. Selecciona nuevo rol
5. Sistema actualiza organization_members.role
6. Próxima consulta refleja nuevo rol
7. Audit log registra cambio (future)
```

### 5.3 Acceso a datos (autorización)

```
GET /api/leads (user es Agent)
  ↓
1. Middleware: verify_org_membership(user.id, user.org_id)
2. Validación: user ∈ organization_members(user.org_id)
3. Validación: status = 'active'
4. Query: SELECT * FROM leads 
          WHERE org_id = user.org_id 
          AND agent_id = user.id
5. Retorna solo leads asignados
```

---

## 6. CAMBIOS CORE (CHANGELOG)

### 6.1 Database Core

**Nuevas migraciones**:

1. **Migration 008**: Crear tabla `organization_members` + índices
2. **Migration 009**: Agregar campos a `organizations`
3. **Migration 010**: Migración de roles de `user_profiles` → `organization_members`

**Índices nuevos**:

```sql
CREATE INDEX idx_org_members_org_id ON organization_members(org_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);
CREATE INDEX idx_org_members_status ON organization_members(status);
CREATE INDEX idx_org_members_org_user ON organization_members(org_id, user_id);
```

### 6.2 API Core

**Cambios a middleware**:

- Agregar `verify_org_membership()` a `backend/api/middleware.py`
- Todas las rutas deben validar membership antes de acceso

**Cambios a servicios**:

- `supabase_service.py`: Agregar métodos para org_members
- `llm_service.py`: Sin cambios (Intelligence no se ve afectada)

---

## 7. TESTING STRATEGY

### 7.1 Unit Tests

```python
test_organization_members_crud()
test_role_based_access_control()
test_invitation_flow()
test_membership_validation()
test_org_isolation()
```

### 7.2 Integration Tests

```python
test_agent_sees_only_assigned_leads()
test_manager_sees_all_leads()
test_owner_can_manage_team()
test_invitation_code_expiration()
```

### 7.3 E2E Tests (Cypress)

```typescript
test('Owner invites and assigns Manager')
test('Agent sees only assigned properties')
test('Manager cannot change roles')
test('Invitation link works once')
```

---

## 8. INTEGRACIÓN CON FEATURES EXISTENTES

### 8.1 Intelligence (Sin cambios)

La feature Intelligence **no requiere cambios** para v1. Pero post-v1:

- Intelligence deberá considerar `org_id` en queries
- Governor/Router/Synthesizer recibirán contexto `org_id`

### 8.2 Leads, Properties, Tasks

Estas entidades **requieren filtrado inmediato**:

```python
# Antes (v0 - inseguro)
leads = await db.fetch("SELECT * FROM leads LIMIT 100")

# Después (v1 - seguro)
leads = await db.fetch(
    "SELECT * FROM leads WHERE org_id = $1",
    user_org_id
)
```

---

## 9. CRITERIOS DE ACEPTACIÓN

**Feature completada cuando**:

- ✅ Tabla `organization_members` creada + migraciones
- ✅ Endpoints CRUD funcionales y testeados
- ✅ Middleware `verify_org_membership()` operativo
- ✅ Todos leads/properties/tasks filtran por org_id + rol
- ✅ UI Team Management funcional
- ✅ Flujo invitación end-to-end
- ✅ Agent ve solo datos asignados
- ✅ 80% cobertura tests
- ✅ API docs actualizadas con nuevos endpoints
- ✅ Migración datos históricos sin pérdida

---

## 10. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Pérdida roles históricos | Media | Alto | Backup pre-migración + validador post |
| Data leak org aislada | Baja | Crítico | Tests de aislamiento + RLS pre-prod |
| Queries ineficientes | Media | Medio | Índices + EXPLAIN ANALYZE |
| Users con múltiples orgs | Baja | Crítico | Constraint UNIQUE + validación |

---

## 11. DEFINICIONES Y TÉRMINOS

- **Owner**: Propietario de organización. Control total. Único con permisos de gestión de equipo.
- **Manager**: Gestor operativo. Visibilidad de todo. Sin permisos de modificación de roles.
- **Agent**: Agente de ventas. Datos asignados solo. Puede crear tasks limitadamente.
- **org_id**: Identificador único de organización (UUID).
- **membership**: Relación user ↔ org con rol y estado.
- **invitation_code**: Código único para onboarding (32 char alphanumerics).
- **status**: Estado de membresía (active, pending, suspended, removed).

---

## 12. VALIDACIÓN DE INGENIERÍA

**Requisitos técnicos**:

- PostgreSQL 14+ (UUID nativo)
- FastAPI 0.100+ (async middleware)
- Next.js 14+ (React Context)
- Supabase 1.0+ (RLS ready)

**Performance targets**:

- Endpoint GET /members: <100ms (100 registros)
- Filtrado org_id en queries: <50ms (1000 registros)
- Validación middleware: <10ms

---

## 13. PRÓXIMOS PASOS POST-APROBACIÓN

1. **Auditoría previa** (PowerShell Supabase API)
2. **Aprobación SDD formal**
3. **Generación Antigravity** (máx 2 iteraciones)
4. **Testing en dev environment**
5. **Migración datos históricos**
6. **Deploy staging + producción**

**Tiempo estimado**: 3-4 días (incluye testing)

---

## 14. HISTORIAL DE CAMBIOS

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 2026-02-13 | Especificación inicial |

---

**Documento controlado por**: Feature Rules Multi-Tenant Memberships v1  
**Próxima revisión**: Post-implementación v1  
**Estado**: Listo para ejecución
