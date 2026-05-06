# Access Request Admin Hardening — INDEX

Feature ID: ANCLORA-ARAH-001  
Branch: sdd/access-request-admin-hardening  
Status: Draft

## Objetivo

Endurecer las operaciones internas de aprobación y rechazo de `access_requests` para que `reviewed_by` se derive exclusivamente del usuario autenticado por backend mediante `get_current_user`, evitando confiar en valores enviados por el frontend.

## Alcance

- Backend FastAPI:
  - `approve` y `reject` derivan reviewer desde `current_user.id`.
  - El servicio persiste `reviewed_by` con identidad autenticada.
  - Auditoría usa el mismo actor autenticado.
- Modelos Pydantic:
  - El request de decisión deja de aceptar `reviewed_by` desde cliente.
- Frontend:
  - El payload de approve/reject deja de enviar `reviewed_by`.
- Tests:
  - Cobertura de rutas y servicio adaptada al nuevo contrato.

## Fuera de alcance

- Cambios de esquema Supabase.
- Nuevos roles o permisos avanzados.
- Cambios visuales amplios en la UI.
- Reescritura del flujo de emails de decisión.

## Artefactos

- `access-request-admin-hardening-INDEX.md`
- `access-request-admin-hardening-spec-v1.md`
- `access-request-admin-hardening-test-plan-v1.md`
- `QA_REPORT_ANCLORA_ARAH_001.md`
- `GATE_FINAL_ANCLORA_ARAH_001.md`
