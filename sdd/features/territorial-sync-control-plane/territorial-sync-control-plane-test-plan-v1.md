# Test Plan v1 - Territorial Sync Control Plane

1. Ejecutar `npm run ops:notebooklm:build-sync-pack`
2. Ejecutar `npm run ops:notebooklm:validate-sync-pack`
3. Verificar `ops/notebooklm-territorial-sync-status.json` en `ready`
4. Probar `GET /api/intelligence/territorial-sync-status`
5. Verificar tarjeta en `/intelligence`
6. Confirmar que `frontend:lint` y `frontend:build` pasan
7. Confirmar que el cron territorial incluye `validation_status`
