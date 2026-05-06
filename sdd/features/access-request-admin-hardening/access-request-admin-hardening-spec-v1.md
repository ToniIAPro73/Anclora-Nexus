# Access Request Admin Hardening — Spec v1

Feature ID: ANCLORA-ARAH-001  
Status: Draft

## 1. Problema

El flujo actual de aprobación/rechazo de `access_requests` acepta `reviewed_by` desde el payload del frontend. Aunque la ruta requiere autenticación, confiar en un identificador enviado por cliente permite spoofing de identidad en decisiones administrativas y auditoría.

## 2. Objetivo

Garantizar que toda decisión administrativa sobre una solicitud de acceso use como `reviewed_by` la identidad autenticada por backend (`get_current_user().id`), no un campo enviado por el cliente.

## 3. Contrato deseado

### Approve

Request body permitido:

```json
{
  "admin_notes": "Texto opcional"
}
```

Backend:

- resuelve `current_user` vía `Depends(get_current_user)`;
- usa `current_user.id` como `reviewer_id`;
- persiste `reviewed_by = reviewer_id`;
- registra auditoría con `actor_id = reviewer_id`.

### Reject

Request body permitido:

```json
{
  "admin_notes": "Texto opcional",
  "rejection_reason": "Motivo obligatorio"
}
```

Backend:

- aplica el mismo criterio de identidad autenticada;
- mantiene `rejection_reason` obligatorio.

## 4. Cambios previstos

### Backend routes

Archivo: `backend/api/routes/access_requests.py`

- Cambiar `_user=Depends(get_current_user)` por `current_user=Depends(get_current_user)` en approve/reject.
- Pasar `reviewer_id=current_user.id` al servicio.

### Backend models

Archivo: `backend/models/access_requests.py`

- Eliminar `reviewed_by` de `AccessRequestReviewDecision`.
- Eliminar validador de `reviewed_by`.
- Mantener `admin_notes`.
- Mantener `rejection_reason` obligatorio en `AccessRequestRejectDecision`.

### Backend service

Archivo: `backend/services/access_request_service.py`

- `approve_request(..., decision, reviewer_id: str)`
- `reject_request(..., decision, reviewer_id: str)`
- Usar `reviewer_id` para:
  - `update_payload["reviewed_by"]`
  - `_log_audit_event(actor_id=...)`

### Frontend

Archivos previstos:

- `frontend/src/app/(dashboard)/access-requests/page.tsx`
- `frontend/src/lib/access-requests-api.ts`

Cambios:

- No construir ni enviar `reviewed_by` en payload de approve/reject.
- Mantener lectura de `reviewed_by` en respuestas y detalle histórico.

## 5. No migración

No se requiere migración SQL. La columna `reviewed_by` sigue existiendo como dato persistido, pero su origen pasa a ser backend-authenticated.

## 6. Riesgos

- Tests existentes pueden fallar por seguir enviando `reviewed_by`.
- La UI puede conservar variables derivadas de identidad ya innecesarias.
- Si algún mock de usuario no define `.id`, hay que adaptarlo.

## 7. Criterios de aceptación

- Approve acepta payload sin `reviewed_by`.
- Reject acepta payload sin `reviewed_by`.
- Payload con `reviewed_by` no es necesario para operar.
- La base de datos recibe `reviewed_by` derivado de `current_user.id`.
- Auditoría usa `actor_id=current_user.id`.
- Tests backend relevantes pasan.
- Frontend build/lint no queda roto.
