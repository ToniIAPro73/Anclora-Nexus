# QA Report - ANCLORA-TSCP-001

Resultado: PASS

Evidencias:
- `npm run ops:notebooklm:build-sync-pack` OK
- `npm run ops:notebooklm:validate-sync-pack` OK
- `python -m pytest -q backend/tests/test_territorial_sync_routes.py backend/tests/test_ai_runtime_routes.py` -> PASS
- `npm run frontend:lint` -> PASS
- `npm run frontend:build` -> PASS

Estado observado:
- `ops/notebooklm-territorial-sync-status.json` = `ready`
- query_count = 4
- zonas cubiertas = calvia, general, punta_negra, son_ferrer
