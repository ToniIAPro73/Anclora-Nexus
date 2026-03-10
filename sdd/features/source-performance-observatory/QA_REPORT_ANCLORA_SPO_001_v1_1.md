# QA Report: ANCLORA-SPO-001 v1.1

## Resultado

- `PYTHONPATH=/home/dev/proyectos/anclora-nexus .venv/bin/pytest -q backend/tests/test_source_observatory_routes.py backend/tests/test_source_observatory_service.py`: OK (`8 passed`)
- `npm run frontend:lint`: OK
- `npm run frontend:build`: OK
- Verificación adicional: el build ya no emite el warning deprecado de `middleware`

## Cobertura esperada

- agregación operativa por fuente
- degradación y frescura
- ranking ampliado
- eliminación del warning de `middleware`
