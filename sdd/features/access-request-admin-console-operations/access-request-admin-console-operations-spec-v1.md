# Access Request Admin Console Operations — Spec v1

Feature ID: ANCLORA-ARCO-001  
Status: Draft

## 1. Contexto inspeccionado

La consola actual ya lista, detalla, aprueba y rechaza `access_requests`. PR #10 eliminó `reviewed_by` del payload del cliente y lo deriva de `get_current_user().id`.

Fuentes locales inspeccionadas:

- `README.md`
- `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
- `docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md`
- `docs/standards/UI_MOTION_CONTRACT.md`
- `docs/standards/MODAL_CONTRACT.md`
- `docs/standards/LOCALIZATION_CONTRACT.md`
- `sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`
- `sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md`
- `sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md`
- `.agent/rules/feature-synergi-datalab-access-requests.md`
- `/home/toni/projects/anclora-design-system/README.md`
- `/home/toni/projects/anclora-design-system/docs/design-system-audit-and-target-architecture.md`

## 2. Decisiones

### Roles

La fuente real de roles es `organization_members`, con roles `owner`, `manager`, `agent`. El patrón existente considera `owner` y `manager` como roles de escritura operativa, y `agent` como rol restringido.

Para esta feature:

- `owner` y `manager` pueden aprobar/rechazar y leer auditoría de una solicitud.
- `agent` autenticado recibe `403`.
- ausencia de sesión conserva `401` desde `get_current_user`.

### Auditoría

Los eventos de access requests ya se escriben en `audit_log` mediante `AccessRequestAuditService`, con:

- `resource_type = "access_request"`
- `resource_id = access_request_id`
- `action = access_request.*`
- `details = metadata`

Se expondrá un endpoint de lectura sobre eventos reales. No se crearán datos falsos.

### Filtros

Se amplía `GET /api/access-requests` con filtros simples:

- `status`
- `product`
- `source`
- `email`
- `created_from`
- `created_to`
- `limit`

No se implementa búsqueda full-text global para evitar patrones Supabase no usados en este flujo.

## 3. Contrato operativo

```text
access request received
  -> list filters by org_id
  -> detail scoped by org_id
  -> approve/reject require owner/manager
  -> reviewed_by = current_user.id
  -> audit actor_id = current_user.id
  -> audit endpoint returns real events scoped by org_id/request_id
```

## 4. UI

La pantalla seguirá la gramática interna actual:

- `page-title`, `page-subtitle`, `section-title`, `section-subtitle`;
- `surface-primary`, `surface-secondary`, `surface-copy-safe`;
- `btn-action`, `btn-create`;
- `ui-select`, `ui-input`, `ui-textarea`;
- i18n en `es/en/de/ru`.

Mejoras previstas:

- filtro de fuente y email;
- detalle con trail de auditoría real;
- estados de auditoría loading/empty/error;
- mensajes más claros para 403/404/409;
- acciones solo en solicitudes `pending`.

## 5. No migración

No se requiere migración. Las tablas `organization_members`, `access_requests` y `audit_log` ya existen y cubren el alcance.

## 6. Riesgos

- El endpoint de auditoría depende de que `audit_log` tenga eventos previos para la solicitud.
- La ejecución local de tests backend requiere `PYTHONPATH=.` con `backend/venv`.
- La validación visual de navegador se limitará a build/lint salvo que se levante servidor local.
