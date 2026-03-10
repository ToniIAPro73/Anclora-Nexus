# QA Report — ANCLORA-STFX-002 v1.1

## Resultado

- `PYTHONPATH=/home/dev/proyectos/anclora-nexus .venv/bin/pytest -q backend/tests/test_statefox_bridge_routes.py backend/tests/test_statefox_discovery_routes.py backend/tests/test_statefox_bridge_service.py`: OK
- `npm run frontend:lint`: OK
- `npm run frontend:build`: OK

## Cobertura esperada

- Parseo seller-side
- Importación property + seller ingestion
- Contrato de trazabilidad
- Feedback UI de candidatos seller-side
