# TEST PLAN: GRAVITY CLAW DOSSIER EXPORT & SHARE V1

1. `GET /api/sellers/{seller_id}/dossier-export` retorna `file_name`, `sections`, `share_summary`.
2. `SellerDrawer` exporta PDF sin errores.
3. `SellerDrawer` comparte via Web Share API o copia fallback.
4. `frontend:lint` sin errores.
5. `pytest backend/tests/test_sellers_routes.py` cubre contrato del export.
