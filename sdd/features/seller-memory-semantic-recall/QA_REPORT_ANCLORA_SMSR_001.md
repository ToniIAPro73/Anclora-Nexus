# QA Report: ANCLORA-SMSR-001 v1

## Resultado

- `PYTHONPATH=/home/dev/proyectos/anclora-nexus .venv/bin/pytest -q backend/tests/test_sellers_routes.py backend/tests/test_seller_memory_service.py`: OK (`14 passed`)
- `npm run frontend:lint`: OK
- `npm run frontend:build`: OK

## Notas

- La memoria semántica degrada a `migration_missing` si no está aplicada `043_seller_memory_semantic_recall.sql`.
- Persisten warnings legacy ajenos al alcance del bloque en `FastAPI on_event` y algunos modelos Pydantic antiguos.
