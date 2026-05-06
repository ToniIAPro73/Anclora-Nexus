# Access Request Admin Hardening — Test Plan v1

Feature ID: ANCLORA-ARAH-001  
Status: Draft

## 1. Backend route tests

Archivo previsto:

- `backend/tests/test_access_request_review_routes.py`

Casos:

1. `POST /access-requests/{id}/approve`
   - body sin `reviewed_by`
   - debe responder OK
   - debe llamar al servicio con `reviewer_id` igual al usuario autenticado mockeado.

2. `POST /access-requests/{id}/reject`
   - body sin `reviewed_by`
   - con `rejection_reason`
   - debe responder OK
   - debe usar identidad autenticada.

3. Transiciones inválidas
   - conservar comportamiento 409.

4. Solicitud inexistente
   - conservar comportamiento 404.

## 2. Backend service tests

Archivo previsto:

- `backend/tests/test_access_request_review_service.py`

Casos:

1. `approve_request`
   - recibe `reviewer_id`
   - persiste `reviewed_by=reviewer_id`
   - auditoría usa `actor_id=reviewer_id`.

2. `reject_request`
   - recibe `reviewer_id`
   - persiste `reviewed_by=reviewer_id`
   - persiste `rejection_reason`
   - auditoría usa `actor_id=reviewer_id`.

3. Validación de `rejection_reason`
   - sigue siendo obligatoria y no vacía.

## 3. Frontend

Archivos previstos:

- `frontend/src/app/(dashboard)/access-requests/page.tsx`
- `frontend/src/lib/access-requests-api.ts`

Validaciones:

- El cliente no envía `reviewed_by` en approve/reject.
- La tabla/detalle puede seguir mostrando `reviewed_by` recibido del backend.

## 4. Comandos de validación

```bash
cd backend
pytest tests/test_access_request_review_routes.py tests/test_access_request_review_service.py

cd ../frontend
npm run lint
npm run build
```

## 5. Gate

La feature solo puede cerrarse si:

- no hay regresión funcional en approve/reject;
- `reviewed_by` queda controlado por backend;
- auditoría y persistencia comparten la misma identidad autenticada.
