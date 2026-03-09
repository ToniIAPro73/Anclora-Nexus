# TEST PLAN: GRAVITY CLAW WHALE WORKBENCH V1

## Backend

1. `GET /api/sellers/{seller_id}/workbench` retorna `seller`, `interactions`, `latest_artifacts`, `snapshot`.
2. `POST /api/sellers/{seller_id}/generate-dossier` retorna email, WhatsApp, call brief y context brief.
3. `POST /api/sellers/{seller_id}/interactions` registra llamada/nota manual.

## Frontend

1. Abrir `SellerDrawer` desde `/sellers`.
2. Generar workbench y verificar cards de artefactos.
3. Copiar email / WhatsApp / briefings.
4. Registrar una interaccion manual y verificar aparicion inmediata en historial.

## Regression

1. El flujo previo de dossier/email sigue funcionando.
2. No se rompe `/api/sellers/stats` ni `/api/sellers/`.
3. `frontend:lint` sin errores.
