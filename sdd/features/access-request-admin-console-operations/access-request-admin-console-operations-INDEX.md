# Access Request Admin Console Operations — INDEX

Feature ID: ANCLORA-ARCO-001  
Branch: `sdd/access-request-admin-console-operations`  
Status: Draft

## Objetivo

Endurecer y madurar la consola interna de revisión de `access_requests` sin rediseño amplio: permisos backend, filtros operativos, trazabilidad consultable, UX de decisión clara y documentación SDD verificable.

## Alcance

- Backend:
  - permisos server-side para approve/reject;
  - endpoint real de auditoría por solicitud;
  - filtros adicionales de lista compatibles con Supabase y el esquema actual.
- Frontend:
  - filtros operativos adicionales;
  - carga y visualización de auditoría real cuando exista;
  - errores de autorización/transición comunicados con claridad;
  - mantener `reviewed_by` derivado del backend.
- Tests:
  - rutas, servicio, permisos y auditoría.
- SDD:
  - contratos backend/frontend, plan de pruebas, QA y gate final.

## Fuera de alcance

- Migraciones SQL nuevas.
- Reescritura RBAC amplia.
- Rediseño visual de la pantalla.
- Datos de auditoría falsos o simulados en UI.
- Cambios al intake público.

## Artefactos

- `access-request-admin-console-operations-INDEX.md`
- `access-request-admin-console-operations-spec-v1.md`
- `access-request-admin-console-operations-backend-contract-v1.md`
- `access-request-admin-console-operations-frontend-contract-v1.md`
- `access-request-admin-console-operations-test-plan-v1.md`
- `QA_REPORT_ANCLORA_ARCO_001.md`
- `GATE_FINAL_ANCLORA_ARCO_001.md`
