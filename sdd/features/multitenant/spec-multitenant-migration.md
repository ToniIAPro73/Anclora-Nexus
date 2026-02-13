# ESPECIFICACIÓN: MIGRACIÓN DE DATOS - MULTI-TENANT MEMBERSHIPS V1

**Feature ID**: ANCLORA-MTM-001-MIGRATION  
**Versión**: 1.0  
**Fecha**: 2026-02-13  
**Status**: Pre-implementación  
**Criticidad**: ALTA (sin migración correcta hay pérdida de datos)

---

## 1. CONTEXTO

Anclora Nexus actualmente tiene roles embebidos en `user_profiles.role`. Multi-Tenant Memberships v1 traslada esta fuente de verdad a `organization_members.role`.

**Objetivo**: Migrar datos históricos sin pérdida y asegurar coherencia.

---

## 2. FASES DE MIGRACIÓN

### Fase 0: Preparación (Pre-v1)

**Sin cambios destructivos**. Solo crear estructuras nuevas.

```sql
-- Crear tabla nueva (vacía)
CREATE TABLE organization_members (...);

-- Crear índices
CREATE INDEX idx_org_members_org_id ON organization_members(org_id);

-- Agregar campos a organizations
ALTER TABLE organizations ADD COLUMN owner_id UUID;
ALTER TABLE organizations ADD COLUMN status TEXT DEFAULT 'active';
ALTER TABLE organizations ADD COLUMN metadata JSONB DEFAULT '{}';
```

**Duración**: <1 minuto  
**Rollback**: Fácil (solo DROP TABLE + DROP INDEX)

### Fase 1: Migración de Roles (Post-aprobación v1)

**Traslada roles de `user_profiles` → `organization_members`**

```sql
-- 1. Validar datos antes
SELECT COUNT(*) FROM user_profiles WHERE role IS NOT NULL;
SELECT COUNT(*) FROM user_profiles WHERE org_id IS NULL;

-- 2. Backup
COPY user_profiles TO '/tmp/user_profiles_backup.sql';

-- 3. Migrar roles
INSERT INTO organization_members (org_id, user_id, role, status, joined_at)
SELECT 
  COALESCE(up.org_id, (SELECT id FROM organizations LIMIT 1)),
  up.user_id,
  COALESCE(up.role, 'agent'),
  'active',
  NOW()
FROM user_profiles up
WHERE up.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.user_id = up.user_id 
    AND om.org_id = COALESCE(up.org_id, (SELECT id FROM organizations LIMIT 1))
  )
ON CONFLICT (org_id, user_id) DO NOTHING;

-- 4. Actualizar organizations.owner_id
UPDATE organizations SET owner_id = (
  SELECT user_id FROM organization_members 
  WHERE org_id = organizations.id 
  AND role = 'owner' 
  LIMIT 1
)
WHERE owner_id IS NULL;

-- 5. Validar
SELECT COUNT(*) FROM organization_members; -- Debe ≈ contar históricos
SELECT COUNT(*) FROM organizations WHERE owner_id IS NOT NULL; -- Todas con owner
```

**Duración**: <5 minutos  
**Rollback**: RESTORE desde backup

### Fase 2: Validación Post-migración

```sql
-- 1. Contar registros
SELECT COUNT(*) as total_members FROM organization_members;
SELECT COUNT(*) as total_users FROM user_profiles;

-- 2. Detectar orfanados
SELECT COUNT(*) FROM organization_members om
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = om.user_id);
-- Debe ser 0

-- 3. Detectar orgs sin owner
SELECT COUNT(*) FROM organizations WHERE owner_id IS NULL;
-- Debe ser 0

-- 4. Validar constraint UNIQUE
SELECT org_id, user_id, COUNT(*) as cnt 
FROM organization_members 
GROUP BY org_id, user_id 
HAVING COUNT(*) > 1;
-- Debe estar vacío

-- 5. Contar por status
SELECT status, COUNT(*) as cnt FROM organization_members GROUP BY status;
-- Esperado: todos 'active' en v1
```

### Fase 3: Deprecación (Post-validación)

**Eliminar `user_profiles.role` (fuente única ahora: `organization_members.role`)**

```sql
-- 1. Validar que NO hay queries usando user_profiles.role
-- (Búsqueda en código backend)

-- 2. Eliminar columna
ALTER TABLE user_profiles DROP COLUMN role;

-- 3. Documentar cambio en CHANGELOG
```

**Duración**: <1 minuto  
**Rollback**: ALTER TABLE ADD COLUMN role TEXT

---

## 3. SCRIPTS SQL POR FASE

### Script Fase 0: Preparación

```sql
-- ============ FASE 0: PREPARACIÓN ============
-- Ejecutar ANTES de v1 en producción

BEGIN TRANSACTION;

-- 1. Crear tabla organization_members
CREATE TABLE IF NOT EXISTS organization_members (
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

-- 2. Crear índices
CREATE INDEX idx_org_members_org_id ON organization_members(org_id);
CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_role ON organization_members(role);
CREATE INDEX idx_org_members_status ON organization_members(status);
CREATE INDEX idx_org_members_org_user ON organization_members(org_id, user_id);
CREATE INDEX idx_org_members_code ON organization_members(invitation_code) 
  WHERE status = 'pending';

-- 3. Agregar campos a organizations (si no existen)
ALTER TABLE organizations 
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);
ALTER TABLE organizations 
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'inactive'));
ALTER TABLE organizations 
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 4. Crear índice en organizations.owner_id
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);

COMMIT;

-- Resultado: Tablas nuevas creadas, listas para migración
-- Rollback: DROP TABLE organization_members; ALTER TABLE organizations DROP COLUMN owner_id, status, metadata;
```

**Ejecución**: ~30 segundos

---

### Script Fase 1: Migración de Roles

```sql
-- ============ FASE 1: MIGRACIÓN DE ROLES ============
-- Ejecutar DESPUÉS de Fase 0 aprobada
-- CRÍTICO: Validaciones pre/post incluidas

BEGIN TRANSACTION;

-- --------- PRE-MIGRACIÓN CHECKS ---------
-- 1. Contar usuarios con roles
DO $$
DECLARE
  v_count_with_role INT;
  v_count_null_org INT;
  v_count_dup_user INT;
BEGIN
  SELECT COUNT(*) INTO v_count_with_role 
    FROM user_profiles WHERE role IS NOT NULL;
  
  SELECT COUNT(*) INTO v_count_null_org 
    FROM user_profiles WHERE org_id IS NULL AND role IS NOT NULL;
  
  SELECT COUNT(*) INTO v_count_dup_user 
    FROM (SELECT user_id FROM user_profiles WHERE role IS NOT NULL 
          GROUP BY user_id HAVING COUNT(*) > 1) t;
  
  RAISE NOTICE 'PRE-MIGRACIÓN:';
  RAISE NOTICE '  Usuarios con role: %', v_count_with_role;
  RAISE NOTICE '  Usuarios con org_id NULL: %', v_count_null_org;
  RAISE NOTICE '  Usuarios duplicados: %', v_count_dup_user;
END $$;

-- 2. Backup (IMPORTANTE)
-- COPY user_profiles TO '/tmp/user_profiles_backup_' || to_char(NOW(), 'YYYY-MM-DD-HHmmss') || '.sql';

-- --------- MIGRACIÓN ---------
-- 3. Insertar roles de user_profiles en organization_members
INSERT INTO organization_members (
  org_id, user_id, role, status, joined_at
)
SELECT 
  COALESCE(up.org_id, org.id) as org_id,
  up.user_id,
  COALESCE(NULLIF(up.role, ''), 'agent') as role,
  'active' as status,
  COALESCE(up.created_at, NOW()) as joined_at
FROM user_profiles up
LEFT JOIN organizations org ON org.id = up.org_id
WHERE up.user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.user_id = up.user_id 
    AND om.org_id = COALESCE(up.org_id, org.id)
  )
ON CONFLICT (org_id, user_id) DO NOTHING;

-- 4. Actualizar organizations.owner_id (primeros owners encontrados)
UPDATE organizations o SET owner_id = (
  SELECT om.user_id FROM organization_members om 
  WHERE om.org_id = o.id 
  AND om.role = 'owner' 
  ORDER BY om.joined_at ASC 
  LIMIT 1
)
WHERE o.owner_id IS NULL 
  AND EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.org_id = o.id AND om.role = 'owner'
  );

-- Si una org no tiene owner, asignar el primero en joined_at
UPDATE organizations o SET owner_id = (
  SELECT om.user_id FROM organization_members om 
  WHERE om.org_id = o.id 
  ORDER BY om.joined_at ASC 
  LIMIT 1
)
WHERE o.owner_id IS NULL;

-- --------- POST-MIGRACIÓN CHECKS ---------
DO $$
DECLARE
  v_count_migrated INT;
  v_count_orphaned INT;
  v_count_no_owner INT;
  v_count_duplicates INT;
BEGIN
  SELECT COUNT(*) INTO v_count_migrated FROM organization_members;
  
  SELECT COUNT(*) INTO v_count_orphaned 
    FROM organization_members om
    WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = om.user_id);
  
  SELECT COUNT(*) INTO v_count_no_owner 
    FROM organizations WHERE owner_id IS NULL;
  
  SELECT COUNT(*) INTO v_count_duplicates 
    FROM (SELECT org_id, user_id FROM organization_members 
          GROUP BY org_id, user_id HAVING COUNT(*) > 1) t;
  
  RAISE NOTICE 'POST-MIGRACIÓN:';
  RAISE NOTICE '  Registros migratos: %', v_count_migrated;
  RAISE NOTICE '  Orfanados detectados: %', v_count_orphaned;
  RAISE NOTICE '  Orgs sin owner: %', v_count_no_owner;
  RAISE NOTICE '  Duplicados: %', v_count_duplicates;
  
  -- Fallar si hay problemas críticos
  IF v_count_orphaned > 0 OR v_count_no_owner > 0 THEN
    RAISE EXCEPTION 'MIGRACIÓN FALLIDA: Datos inconsistentes detectados';
  END IF;
END $$;

COMMIT;

-- Resultado: Roles migrados, validaciones pasadas
-- Rollback: ROLLBACK (antes de COMMIT)
```

**Ejecución**: ~2-5 minutos  
**Validación**: Incluida inline

---

### Script Fase 2: Validaciones Exhaustivas

```sql
-- ============ FASE 2: VALIDACIÓN POST-MIGRACIÓN ============
-- Ejecutar DESPUÉS de migración completada

BEGIN TRANSACTION;

-- 1. VALIDACIÓN: Conteo general
SELECT 
  (SELECT COUNT(*) FROM organization_members) as total_members,
  (SELECT COUNT(*) FROM user_profiles) as total_users,
  (SELECT COUNT(*) FROM organizations) as total_orgs,
  (SELECT COUNT(DISTINCT user_id) FROM organization_members) as unique_users
;

-- 2. VALIDACIÓN: Orfanados
SELECT COUNT(*) as orphaned_members
FROM organization_members om
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = om.user_id);
-- Esperado: 0

-- 3. VALIDACIÓN: Orgs sin propietario
SELECT id, name, owner_id FROM organizations WHERE owner_id IS NULL;
-- Esperado: 0 filas

-- 4. VALIDACIÓN: Constraint UNIQUE
SELECT org_id, user_id, COUNT(*) as duplicate_count
FROM organization_members
GROUP BY org_id, user_id
HAVING COUNT(*) > 1;
-- Esperado: 0 filas

-- 5. VALIDACIÓN: Distribución por status
SELECT status, COUNT(*) as count FROM organization_members GROUP BY status;
-- Esperado: todos 'active' en v1

-- 6. VALIDACIÓN: Distribución por role
SELECT role, COUNT(*) as count FROM organization_members GROUP BY role;
-- Esperado: mezcla owner/manager/agent

-- 7. VALIDACIÓN: Cada org tiene mínimo 1 owner
SELECT o.id, o.name, COUNT(om.id) as owner_count
FROM organizations o
LEFT JOIN organization_members om ON om.org_id = o.id AND om.role = 'owner'
GROUP BY o.id, o.name
HAVING COUNT(om.id) < 1;
-- Esperado: 0 filas

-- 8. VALIDACIÓN: Integridad referencial
SELECT 'members_without_org' as check,
       COUNT(*) as issues
FROM organization_members om
WHERE NOT EXISTS (SELECT 1 FROM organizations o WHERE o.id = om.org_id)
UNION ALL
SELECT 'members_without_user',
       COUNT(*)
FROM organization_members om
WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = om.user_id)
UNION ALL
SELECT 'orgs_without_owner_ref',
       COUNT(*)
FROM organizations o
WHERE o.owner_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = o.owner_id);
-- Esperado: todos COUNT = 0

-- 9. REPORTE: Memberships por organización
SELECT 
  o.name as org_name,
  COUNT(om.id) as total_members,
  SUM(CASE WHEN om.role = 'owner' THEN 1 ELSE 0 END) as owners,
  SUM(CASE WHEN om.role = 'manager' THEN 1 ELSE 0 END) as managers,
  SUM(CASE WHEN om.role = 'agent' THEN 1 ELSE 0 END) as agents
FROM organizations o
LEFT JOIN organization_members om ON om.org_id = o.id AND om.status = 'active'
GROUP BY o.id, o.name
ORDER BY o.name;

COMMIT;

-- Si todas las validaciones pasan: ✅ Migración exitosa
-- Si alguna falla: ❌ Investigar antes de continuar
```

---

### Script Fase 3: Deprecación

```sql
-- ============ FASE 3: DEPRECACIÓN ============
-- Ejecutar SOLO DESPUÉS de validación exitosa
-- Y después de actualizar backend para NO usar user_profiles.role

BEGIN TRANSACTION;

-- 1. Verificar que NO hay queries usando user_profiles.role
-- (Buscar en código backend - grep -r "user_profiles.role")

-- 2. Crear backup final
-- COPY user_profiles TO '/tmp/user_profiles_final_backup.sql';

-- 3. Eliminar columna role (irreversible)
ALTER TABLE user_profiles DROP COLUMN role;

-- 4. Verificar que tabla aún funciona
SELECT COUNT(*) FROM user_profiles LIMIT 1;

COMMIT;

-- Rollback manual: ALTER TABLE user_profiles ADD COLUMN role TEXT;
```

---

## 4. VALIDACIÓN DE INTEGRIDAD

### Pre-migración

```python
# Script Python para validar antes de ejecutar SQL

import psycopg2

def validate_pre_migration(conn):
    cur = conn.cursor()
    
    # 1. Usuarios con roles
    cur.execute("SELECT COUNT(*) FROM user_profiles WHERE role IS NOT NULL")
    count_with_role = cur.fetchone()[0]
    print(f"✓ Usuarios con role: {count_with_role}")
    
    # 2. Usuarios con org_id NULL
    cur.execute("SELECT COUNT(*) FROM user_profiles WHERE org_id IS NULL AND role IS NOT NULL")
    count_null_org = cur.fetchone()[0]
    if count_null_org > 0:
        print(f"⚠ Usuarios con org_id NULL: {count_null_org} (se asignarán a default org)")
    
    # 3. Usuarios duplicados
    cur.execute("""
        SELECT COUNT(*) FROM (
            SELECT user_id FROM user_profiles 
            GROUP BY user_id HAVING COUNT(*) > 1
        ) t
    """)
    count_duplicates = cur.fetchone()[0]
    if count_duplicates > 0:
        print(f"❌ ERROR: Usuarios duplicados: {count_duplicates}")
        return False
    
    # 4. Tabla organization_members vacía?
    cur.execute("SELECT COUNT(*) FROM organization_members")
    count_existing = cur.fetchone()[0]
    if count_existing > 0:
        print(f"⚠ organization_members ya tiene {count_existing} registros")
    
    return True
```

### Post-migración

```python
def validate_post_migration(conn):
    cur = conn.cursor()
    
    checks = [
        ("Orfanados", "SELECT COUNT(*) FROM organization_members om WHERE NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = om.user_id)", 0),
        ("Orgs sin owner", "SELECT COUNT(*) FROM organizations WHERE owner_id IS NULL", 0),
        ("Duplicados", "SELECT COUNT(*) FROM (SELECT org_id, user_id FROM organization_members GROUP BY org_id, user_id HAVING COUNT(*) > 1) t", 0),
        ("Constraint violation", "SELECT COUNT(*) FROM organization_members WHERE org_id IS NULL OR user_id IS NULL", 0),
    ]
    
    all_pass = True
    for name, query, expected in checks:
        cur.execute(query)
        result = cur.fetchone()[0]
        status = "✓" if result == expected else "❌"
        print(f"{status} {name}: {result} (esperado {expected})")
        if result != expected:
            all_pass = False
    
    return all_pass
```

---

## 5. ROLLBACK PROCEDURES

### Si migración falla

```sql
-- ROLLBACK COMPLETO (ejecutar DENTRO de transacción)
ROLLBACK;

-- Verificar que nada cambió
SELECT COUNT(*) FROM organization_members;  -- Debe ser 0 o pre-migración
SELECT COUNT(*) FROM user_profiles WHERE role IS NOT NULL;  -- Datos intactos
```

### Si se detectan problemas post-migración

```sql
-- TRUNCATE organization_members (si está corrupta)
TRUNCATE TABLE organization_members CASCADE;

-- Reejecutar migración desde backup
-- O restaurar desde backup completo de BD
```

---

## 6. TIMELINE RECOMENDADO

| Actividad | Duración | Timing |
|-----------|----------|--------|
| Fase 0: Preparación | <1 min | Antes deploy v1 |
| Backup pre-migración | 2 min | 5 min antes Fase 1 |
| Fase 1: Migración | 5 min | Durante maintenance window |
| Fase 2: Validación | 2 min | Inmediato post-migración |
| Fase 3: Deprecación | <1 min | 24h post-validación exitosa |
| **Total** | **~10 min** | **Sin downtime** |

---

## 7. CHECKLIST PRE-MIGRACIÓN

- [ ] Backup completo de BD realizado
- [ ] Script Fase 0 ejecutado exitosamente
- [ ] Script validación pre-migración pasado
- [ ] Código backend actualizado (no usa `user_profiles.role`)
- [ ] Tabla `organization_members` creada y vacía
- [ ] Índices creados
- [ ] Script Fase 1 listo (revisado)
- [ ] Ventana de mantenimiento programada
- [ ] Team notificado
- [ ] Rollback procedure documentado

---

## 8. CHANGELOG ENTRY

```markdown
## [1.0] - 2026-02-13

### Migration
- **008_create_organization_members.sql**: Tabla nueva para gestión de membresía
- **009_alter_organizations.sql**: Campos owner_id, status, metadata
- **010_migrate_roles.sql**: Migración de user_profiles.role → organization_members.role

### Breaking Changes
- `user_profiles.role` DEPRECATED (leer de `organization_members.role`)
- Todos endpoints deben validar membresía pre-acceso

### Migration Steps
1. Ejecutar Fase 0: Preparación
2. Ejecutar Fase 1: Migración roles
3. Ejecutar Fase 2: Validaciones
4. Ejecutar Fase 3: Deprecación (24h post-validación)

### Rollback
- Si Fase 1: ROLLBACK
- Si Fase 3: ALTER TABLE user_profiles ADD COLUMN role TEXT
```

---

**Documento versión**: 1.0  
**Status**: Pre-implementación  
**Criticidad**: ALTA  
**Próxima revisión**: Post-migración completada
