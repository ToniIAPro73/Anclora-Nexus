# Test Plan v1.1 - Territorial Sync Control Plane

1. Ejecutar `npm run ops:notebooklm:build-sync-pack`
2. Ejecutar `npm run ops:notebooklm:validate-sync-pack`
3. Verificar `ops/notebooklm-territorial-sync-status.json` en `ready`
4. Verificar `ops/territorial-pipeline-status.json` con `status=idle|running|success|error`
5. Probar `GET /api/intelligence/territorial-sync-status`
6. Confirmar que el payload expone `pipeline_status`
7. Verificar tarjeta en `/intelligence` con:
   - ultimo pipeline
   - estado
   - stats
8. Confirmar que el cron territorial persiste estado `running` al inicio y `success|error` al final
