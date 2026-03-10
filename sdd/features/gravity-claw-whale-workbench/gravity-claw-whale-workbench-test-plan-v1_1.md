# TEST PLAN: GRAVITY CLAW WHALE WORKBENCH V1.1

## Frontend

1. Abrir `/sellers`.
2. Verificar que el bloque de oportunidades territoriales usa datos cargados desde backend.
3. Verificar orden por urgencia cuando exista metadata.
4. Verificar degradacion segura si `territorial-summary` falla.

## Regression

1. No se rompe `SellerDrawer`.
2. No se rompe `/api/sellers/` ni `/api/sellers/stats`.
3. `RadarTerritorial` y `/sellers` muestran una lectura coherente del cerebro territorial.
