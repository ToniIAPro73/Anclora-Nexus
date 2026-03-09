# Test Plan v1 - Supervised Email & WhatsApp Send

1. Aplicar migración 040
2. Guardar canales de contacto en un seller
3. Generar workbench
4. Preparar envío supervisado email
5. Preparar envío supervisado WhatsApp
6. Confirmar envío y verificar interacción `realizado`
7. Ejecutar `python -m pytest -q backend/tests/test_sellers_routes.py`
8. Ejecutar `npm run frontend:lint`
9. Ejecutar `npm run frontend:build`
