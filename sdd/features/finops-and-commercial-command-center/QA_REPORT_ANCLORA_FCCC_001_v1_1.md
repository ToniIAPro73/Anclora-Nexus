# QA Report: ANCLORA-FCCC-001 v1.1

## Resultado

- `PYTHONPATH=/home/dev/proyectos/anclora-nexus .venv/bin/pytest -q backend/tests/test_command_center_routes.py backend/tests/test_command_center_service.py`: OK (`7 passed`)
- `npm run frontend:lint`: OK
- `npm run frontend:build`: OK

## Cobertura esperada

- consolidación operativa en snapshot
- tendencias con alertas
- throughput y conversión seller-side en snapshot y trends
- command center ejecutivo accionable

## Notas

- Se consolida observabilidad operativa reutilizando `automation_alerts`, `source_observatory` y estado territorial sin persistencia nueva.
- Persisten warnings legacy ajenos al alcance de este bloque en FastAPI `on_event` y modelos Pydantic antiguos.
