# Test Plan - ANCLORA-SPA-001 v1

## Backend

1. Crear solicitud publica normaliza listas y deja `status=submitted`.
2. Revisar solicitud cambia estado y notas.
3. Ruta publica `/api/public/partner-admissions` responde `201`.
4. Rutas internas `/api/partners/admissions*` existen y responden.

## Frontend

1. `/private-area/partner` permite enviar solicitud.
2. `/partner-admissions` lista y revisa solicitudes.
3. Sidebar expone acceso a la cola de admision.

## Regression

1. `pytest` sobre rutas y servicio del bloque.
2. `npm run frontend:lint`
3. `npm run frontend:build`
