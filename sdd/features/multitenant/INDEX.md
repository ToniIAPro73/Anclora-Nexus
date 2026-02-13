# MULTI-TENANT MEMBERSHIPS - INDEX

**Versión**: 1.0  
**Fecha**: 2026-02-13  
**Feature ID**: ANCLORA-MTM-001  
**Status**: Specification Phase  
**Fase**: Prerequisito integrado (Phase 1)

---

## DESCRIPCIÓN GENERAL

Feature Multi-Tenant Memberships v1 implementa gestión de membresía organizativa con tres roles jerárquicos (Owner, Manager, Agent) y aislamiento de datos por organización. Es **prerequisito crítico** para que Fase 1 (validación inmobiliaria) funcione con seguridad.

---

## DOCUMENTOS EN ESTA FEATURE

### 1. **spec-multitenant-v1.md**

Especificación técnica completa de v1.

**Contenido**:
- Alcance y límites
- Modelo de datos (tabla `organization_members`)
- Roles y aislamiento
- API endpoints (6 nuevos, 5+ modificados)
- Componentes frontend
- Flujos operacionales
- Validaciones y reglas de negocio
- Criterios de aceptación

**Lectura**: 15-20 min  
**Audiencia**: Desarrolladores, Antigravity  
**Versión**: 1.0

---

### 2. **spec-multitenant-migration.md**

Plan de migración de datos históricos.

**Contenido**:
- Fase 0: Preparación (crear tablas vacías)
- Fase 1: Migración de roles de `user_profiles` → `organization_members`
- Fase 2: Deprecación de campos antiguos
- Validaciones pre/post migración
- Scripts SQL
- Rollback procedures

**Lectura**: 10 min  
**Audiencia**: DevOps, DBA  
**Versión**: 1.0

---

## DOCUMENTOS RELACIONADOS (FUERA ESTA CARPETA)

### 3. **Feature Rules** (`.agent/rules/feature-multitenant.md`)

Guía de reglas para desarrollo de la feature.

**Contenido**:
- Propósito estratégico
- Alcance y exclusiones
- Reglas arquitectura
- Especificación técnica
- Flujos operacionales
- Testing strategy
- Integración con features existentes

**Lectura**: 20 min  
**Audiencia**: Tech leads, Architects  

---

### 4. **SKILL** (`.agent/skills/features/multitenant/SKILL.md`)

Skill para Antigravity con métodos y patrones.

**Contenido**:
- Capacidades y especificidades
- Estructura de archivos generados
- Métodos clave (Database, Backend, Frontend)
- Flujos de implementación
- Patrones y anti-patrones
- Testing patterns

**Lectura**: 20 min  
**Audiencia**: Antigravity Agent, Developers  

---

### 5. **Prompt Antigravity** (`.antigravity/prompts/feature-multitenant-v1.md`)

Prompt completo para Antigravity.

**Contenido**:
- Instrucciones precisas para generación
- Especificación inline (reducida)
- Artefactos a generar
- Validaciones esperadas
- Estructura código esperado

**Lectura**: 30 min  
**Audiencia**: Antigravity Agent (consumido automáticamente)  

---

### 6. **CHANGELOG Core** (`.sdd/core/CHANGELOG.md`)

Actualizaciones a changelog central (database + API changes).

**Cambios documentados**:
- Nuevas migraciones (008, 009, 010)
- Cambios a middleware
- Cambios a servicios
- Dependencias nuevas

---

### 7. **FEATURES.md** (`.sdd/features/FEATURES.md`)

Registro central de features (actualizado).

**Contenido**:
- Entrada Multi-Tenant Memberships v1
- Status: Specification Phase
- Links a documentación
- Timeline estimado

---

## MAPA DE DECISIONES

```
¿Necesitas generar código Antigravity?
  └─ Leer: spec-multitenant-v1.md + SKILL.md
  └─ Usar: prompt feature-multitenant-v1.md

¿Necesitas entender reglas arquitectura?
  └─ Leer: Feature Rules (feature-multitenant.md)

¿Necesitas migrar datos históricos?
  └─ Leer: spec-multitenant-migration.md

¿Necesitas actualizar CHANGELOG?
  └─ Leer: CHANGELOG.md en sdd/core/

¿Necesitas cambios a FEATURES.md?
  └─ Leer: FEATURES.md en sdd/features/
```

---

## TIMELINE

| Fase | Duración | Status |
|------|----------|--------|
| Specification (ahora) | 1 día | ✅ En curso |
| Antigravity Generation | 2-3 horas | ⏳ Pendiente aprobación |
| Local Development | 1 día | ⏳ Post-generación |
| Testing & QA | 1 día | ⏳ Post-dev |
| Staging Deploy | 2 horas | ⏳ Post-testing |
| Production Deploy | 1 hora | ⏳ Post-staging |

**Total estimado**: 3-4 días

---

## DEPENDENCIAS

### Internas (Anclora Nexus)

- `sdd/core/` - Schema core y migraciones
- `backend/api/` - FastAPI routes estructura
- `frontend/src/` - Next.js components estructura
- `.agent/skills/` - Otros skills de referencia

### Externas

- PostgreSQL 14+ (UUID nativo)
- FastAPI 0.100+ (async middleware)
- Next.js 14+ (React Context)
- Supabase 1.0+ (RLS ready para futuro)

---

## CRITERIOS DE ÉXITO

### Especificación ✅ (Ahora)

- [x] SDD completo y coherente
- [x] Feature Rules documentadas
- [x] SKILL creado
- [x] Prompts Antigravity listos

### Implementación ⏳ (Post-Antigravity)

- [ ] Código generado sin errores
- [ ] Tests pasan (80% cobertura)
- [ ] API docs actualizados
- [ ] Datos migrados sin pérdida
- [ ] RoleBasedUIShell funcional
- [ ] TeamManagement funcional
- [ ] Flujo invitación end-to-end

### Validación ⏳ (Post-implementación)

- [ ] Agent ve solo datos asignados
- [ ] Manager ve todo (no puede modificar roles)
- [ ] Owner puede gestionar equipo
- [ ] Isolation tests pasan
- [ ] Performance targets cumplidos

---

## PRÓXIMOS PASOS

### Para Técnico (Toni)

1. **Ahora**: Revisar documentación
2. **Aprobación**: Confirmar SDD está listo
3. **Antigravity**: Usar prompt en `.antigravity/prompts/`
4. **Post-generación**: Integrar código a repo

### Para Antigravity Agent

1. Leer: `feature-multitenant-v1.md` (prompt)
2. Generar: Código conforme a SDD + SKILL
3. Output: Carpetas/archivos en estructura esperada
4. Validación: Tests deben pasar

---

## ESTRUCTURA DE DIRECTORIOS

```
sdd/features/multitenant/
├── INDEX.md (este archivo)
├── spec-multitenant-v1.md
├── spec-multitenant-migration.md
├── ... (más specs si es necesario)
```

```
.agent/
├── rules/
│   └── feature-multitenant.md
└── skills/
    └── features/
        └── multitenant/
            └── SKILL.md
```

```
.antigravity/prompts/
└── feature-multitenant-v1.md
```

---

## REFERENCIAS RÁPIDAS

| Documento | Ubicación | Propósito |
|-----------|-----------|----------|
| Spec Técnico | `spec-multitenant-v1.md` | Implementación |
| Feature Rules | `.agent/rules/feature-multitenant.md` | Arquitectura |
| SKILL | `.agent/skills/features/multitenant/SKILL.md` | Métodos |
| Prompt | `.antigravity/prompts/feature-multitenant-v1.md` | Generación |
| Migración | `spec-multitenant-migration.md` | Datos |
| Changelog | `.sdd/core/CHANGELOG.md` | Core changes |
| Features | `.sdd/features/FEATURES.md` | Registry |

---

## VERSIONADO

**SDD Version**: 1.0  
**Feature Status**: Specification Phase  
**Next Review**: Post-Antigravity Generation  
**Supersedes**: Ninguno (feature nueva)

---

## CONTACTO

**Feature Owner**: Toni (CTO Anclora)  
**Technical Lead**: Toni  
**Documentation**: Toni + Claude  

---

**Generado**: 2026-02-13  
**Última actualización**: 2026-02-13  
**Controlado por**: Multi-Tenant Memberships SDD
