# PROMPT: FEATURE MULTI-TENANT MEMBERSHIPS V1

**Para**: Google Antigravity Agent  
**Feature ID**: ANCLORA-MTM-001  
**Version**: 1.0  
**Fecha**: 2026-02-13

---

## INSTRUCCIÓN PRINCIPAL

Genera la implementación completa de **Multi-Tenant Memberships v1** para Anclora Nexus conforme a la especificación técnica adjunta. La feature implementa un modelo organizativo con tres roles jerárquicos (Owner, Manager, Agent) y aislamiento de datos por organización.

**Prerequisito integrado para Phase 1 (validación inmobiliaria)**.

---

## ESPECIFICACIÓN INLINE COMPRIMIDA

### 1. Tabla Nueva: `organization_members`

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'agent')),
  status TEXT NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'pending', 'suspended', 'removed')),
  joined_at TIMESTAMP DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  invitation_code TEXT UNIQUE,
  invitation_accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_org_members_org_id ON organization_members(org_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);
CREATE INDEX idx_org_members_status ON organization_members(status);
CREATE INDEX idx_org_members_org_user ON organization_members(org_id, user_id);
```

### 2. Cambios a Tablas Existentes

```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS (
  owner_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  metadata JSONB DEFAULT '{}'
);

-- Deprecación (NO eliminar aún)
-- user_profiles.role → será deprecada post-v1
```

### 3. Roles y Aislamiento

**Owner**:
- Control total de organización
- Puede invitar, cambiar roles, remover miembros
- Único con permisos de gestión de equipo
- Mínimo 1 por organización

**Manager**:
- Visibilidad de todos los datos (leads, properties, tasks)
- Lectura/escritura de operacional
- Ver equipo (readonly)
- NO puede cambiar roles

**Agent**:
- Solo datos asignados (agent_id = su id)
- Puede crear tasks limitadamente
- NO ve otros agentes
- NO ve equipo

### 4. Endpoints Nuevos (6 Total)

| Método | Ruta | Rol requerido | Descripción |
|--------|------|---------------|-------------|
| POST | `/api/organizations/{org_id}/members` | owner | Invitar miembro |
| GET | `/api/organizations/{org_id}/members` | owner, manager | Listar miembros |
| PATCH | `/api/organizations/{org_id}/members/{member_id}` | owner | Cambiar rol/estado |
| DELETE | `/api/organizations/{org_id}/members/{member_id}` | owner | Remover miembro |
| GET | `/api/invitations/{code}` | public | Validar código |
| POST | `/api/invitations/{code}/accept` | authenticated | Aceptar invitación |

### 5. Endpoints Modificados (5+)

Agregar filtrado automático:

```python
# Antes
SELECT * FROM leads

# Después (Owner/Manager)
SELECT * FROM leads WHERE org_id = $1

# Después (Agent)
SELECT * FROM leads WHERE org_id = $1 AND agent_id = $2
```

**Aplica a**: leads, properties, properties/{id}, tasks, etc.

### 6. Middleware Crítico

```python
async def verify_org_membership(
    user_id: UUID,
    org_id: UUID,
    required_role: Optional[str] = None
) -> OrganizationMember:
    """
    Valida:
    1. Usuario existe y autenticado
    2. Pertenece a org_id (status='active')
    3. Tiene rol requerido (si especificado)
    
    Retorna: OrganizationMember o raise PermissionDenied
    """
```

Usar en TODOS endpoints que acceden org_data.

### 7. Componentes Frontend (3)

#### `<TeamManagement />`
- Owner only
- Listar miembros (tabla)
- Form invitar
- Cambiar rol dropdown
- Remover button

#### `<InvitationAccept />`
- Página pública `/invite/{code}`
- Validar código
- Form aceptación
- Redirigir post-accept

#### `<RoleBasedUIShell />`
- Renderizado condicional por rol
- Owner: acceso total
- Manager: todo menos team management
- Agent: datos asignados solo

### 8. Validaciones Críticas

1. Cada org DEBE tener mínimo 1 Owner
2. Usuario NO puede eliminar su propio membership
3. Status `pending` expira 7 días
4. Un usuario = una org en v1
5. Solo Owner puede cambiar roles

---

## ARTEFACTOS A GENERAR

### Backend (FastAPI)

```
backend/
├── api/
│   ├── routes/
│   │   └── memberships.py (nuevas 6 rutas)
│   └── middleware.py (verify_org_membership)
├── models/
│   ├── membership.py (OrganizationMember pydantic)
│   └── schemas.py (request/response schemas)
├── services/
│   └── membership_service.py (lógica de negocio)
└── tests/
    ├── test_membership_crud.py
    ├── test_role_isolation.py
    └── test_invitation_flow.py
```

**Cada archivo debe**:
- Ser completamente funcional
- Pasar linting (black, flake8)
- Incluir docstrings
- Incluir type hints
- Incluir validaciones

### Frontend (Next.js)

```
frontend/src/
├── components/
│   ├── TeamManagement.tsx
│   ├── InvitationAccept.tsx
│   └── RoleBasedUIShell.tsx
├── lib/
│   ├── contexts/
│   │   └── OrgContext.tsx
│   └── hooks/
│       ├── useOrgMembership.ts
│       └── useTeamManagement.ts
└── app/
    ├── (dashboard)/
    │   └── team/
    │       └── page.tsx
    └── invite/
        └── [code]/
            └── page.tsx
```

**Cada archivo debe**:
- Ser TypeScript + React 18+
- Usar Tailwind CSS (sin librerías de componentes externas)
- Ser responsive
- Incluir manejo de errores
- Incluir loading states

### Database

```
supabase/migrations/
├── 008_create_organization_members.sql
├── 009_alter_organizations.sql
└── 010_migrate_roles.sql
```

**Cada SQL debe**:
- Ser idempotente (IF NOT EXISTS)
- Incluir comentarios
- Incluir índices
- Incluir validaciones CHECK

---

## CRITERIOS DE CALIDAD

### Código

- ✅ Type hints en 100% de funciones
- ✅ Docstrings en todas clases/funciones públicas
- ✅ Manejo de excepciones explícito
- ✅ No hardcode de valores
- ✅ Nombres variables descriptivos

### Testing

- ✅ Tests unitarios: >80% cobertura
- ✅ Tests de integración: endpoints CRUD
- ✅ Tests de aislamiento: Agent no ve otros datos
- ✅ Tests de flujo: invitación end-to-end
- ✅ Fixtures para data setup

### Documentación

- ✅ Docstrings en funciones (formato Google)
- ✅ Comentarios en lógica compleja
- ✅ README.md en carpeta feature
- ✅ Ejemplos de API en comentarios

### Performance

- ✅ Índices creados en tablas
- ✅ Queries optimizadas (no N+1)
- ✅ Componentes React sin re-renders innecesarios
- ✅ Lazy loading donde aplicable

---

## RESTRICCIONES Y REGLAS

### NO hacer

- ❌ Usar localStorage/sessionStorage
- ❌ Hardcode de UUIDs o emails
- ❌ Confiar en user.org_id sin validar
- ❌ Múltiples organizaciones por usuario
- ❌ Implementar RLS nativo (post-v1)
- ❌ Email automático (scaffolding solo)

### SÍ hacer

- ✅ Validar membresía antes de acceso
- ✅ Filtrar por org_id en todas queries
- ✅ Usar middleware en rutas críticas
- ✅ Verificar constraint UNIQUE(org_id, user_id)
- ✅ Mantener backward compatibility (user_profiles.role intacto)

---

## FLUJOS ESPERADOS

### Invitación (POST → ACCEPT)

```
1. Owner: POST /api/organizations/{org_id}/members
   Body: { email, role }
2. Backend: Generar code, insertar (status=pending)
3. Response: code
4. Usuario recibe email con /invite/{code}
5. GET /api/invitations/{code}: Validar
6. POST /api/invitations/{code}/accept: Activar
7. Frontend: Redirigir a dashboard
```

### Agent accediendo leads

```
1. Agent autenticado
2. GET /api/leads
3. Middleware: verify_org_membership(agent_id, agent_org_id)
4. Query: WHERE org_id = $1 AND agent_id = $2
5. Retorna solo asignados
```

---

## CONFIGURACIÓN ESPERADA

### Backend

- FastAPI 0.100+
- PostgreSQL 14+
- Pydantic v2
- Python 3.11+

### Frontend

- Next.js 14+
- React 18+
- TypeScript 5+
- Tailwind CSS 3+

### Database

- Supabase 1.0+
- UUID nativo
- CHECK constraints soportados

---

## VALIDACIONES POST-GENERACIÓN

**Tests deben pasar**:

```python
# Todos estos deben ✅

# CRUD
test_create_organization_member()
test_get_organization_members()
test_update_member_role()
test_delete_member()

# Aislamiento
test_agent_sees_only_assigned_leads()
test_manager_sees_all_leads()
test_owner_can_manage_team()

# Invitación
test_generate_invitation_code()
test_accept_invitation_flow()
test_expired_invitation_rejected()

# Validación
test_unique_org_user_constraint()
test_organization_has_minimum_owner()
test_role_change_restrictions()
```

---

## INTEGRACIÓN ESPERADA

**Sin cambios a**:
- Intelligence feature (post-v1: agregar contexto org_id)
- Leads/properties schema (agregar filtrado solo)

**Con cambios a**:
- API routes (6 nuevas, 5+ modificadas)
- Middleware (add verify_org_membership)
- Database (tabla nueva + campos)

---

## ENTREGA ESPERADA

**Estructura de archivos generados**:

```
backend/
  api/routes/memberships.py
  api/middleware.py
  models/membership.py
  models/schemas.py
  services/membership_service.py
  tests/test_*.py

frontend/
  components/TeamManagement.tsx
  components/InvitationAccept.tsx
  components/RoleBasedUIShell.tsx
  lib/contexts/OrgContext.tsx
  lib/hooks/useOrgMembership.ts
  lib/hooks/useTeamManagement.ts
  app/(dashboard)/team/page.tsx
  app/invite/[code]/page.tsx

supabase/migrations/
  008_create_organization_members.sql
  009_alter_organizations.sql
  010_migrate_roles.sql
```

**Todos los archivos deben**:
- Ser completamente funcionales
- Pasar type checking (pyright, mypy, tsc)
- Pasar linting
- Tener tests pasando

---

## NOTAS IMPORTANTES

1. **Backward compatibility**: user_profiles.role NO eliminar (será deprecado post-v1)
2. **Performance**: Crear índices en migration 008
3. **Security**: TODAS las rutas deben usar verify_org_membership()
4. **Testing**: 80% cobertura mínimo
5. **Documentation**: Docstrings + README
6. **Migration**: Scripts en `spec-multitenant-migration.md` deben ejecutarse
7. **Phase 1**: Multi-Tenant es PREREQUISITO para Phase 1 (validación inmobiliaria)

---

## REFERENCIAS

- **Spec completa**: `spec-multitenant-v1.md` (LEER PRIMERO)
- **Migration plan**: `spec-multitenant-migration.md`
- **SKILL methods**: `.agent/skills/features/multitenant/SKILL.md`
- **Feature rules**: `.agent/rules/feature-multitenant.md`

---

## CHECKLIST GENERACIÓN

Después de generar, validar:

- [ ] Tabla `organization_members` creada
- [ ] 6 endpoints nuevos funcionales
- [ ] 5+ endpoints modificados con filtrado
- [ ] Middleware `verify_org_membership()` en lugar
- [ ] Components React compilando sin errores
- [ ] Tests pasando (80%+ cobertura)
- [ ] No warnings de type checking
- [ ] Docstrings presentes
- [ ] Migration scripts idempotentes
- [ ] Backend + Frontend integrados

---

**Instrucciones claras, especificación inline, criterios definidos.**

**¿Listo para generar?**
