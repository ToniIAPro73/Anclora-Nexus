# Test Plan v1.2 - Territorial Sync Control Plane

1. Ejecutar `npm run ops:notebooklm:build-sync-pack`
2. Ejecutar `npm run ops:notebooklm:validate-sync-pack`
3. Ejecutar `npm run ops:notebooklm:ops-summary`
4. Verificar `ops/notebooklm-territorial-sync-status.json` con:
   - `operational_contract`
   - `freshness_state`
   - `next_refresh_due_at`
   - `runbook_status`
   - `next_action`
5. Verificar `GET /api/intelligence/territorial-sync-status`
6. Confirmar que el payload expone los nuevos campos operativos
7. Verificar tarjeta en `/intelligence` con:
   - owner
   - frescura
   - fallback
   - runbooks
   - siguiente accion
8. Confirmar que referencias `runbook_refs` existen y apuntan a `public/docs/nuevo-enfoque/...`
