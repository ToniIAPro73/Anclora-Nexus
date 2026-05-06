# QA Report — ANCLORA-ARAH-001

Status: Passed

## Validaciones ejecutadas

- [x] Backend route tests ejecutados
- [x] Backend service tests ejecutados
- [x] Frontend lint ejecutado
- [x] Frontend build ejecutado
- [x] Revisión manual de payload frontend sin `reviewed_by`
- [x] Grep estático sin dependencia de `decision.reviewed_by`
- [x] Health check backend ejecutado

## Comandos y resultados

```bash
pytest backend/tests/test_access_request_review_routes.py backend/tests/test_access_request_review_service.py
```

Resultado: falló porque `pytest` no está disponible en `PATH` desde la raíz del repo.

```bash
backend/venv/bin/pytest backend/tests/test_access_request_review_routes.py backend/tests/test_access_request_review_service.py
```

Resultado: falló en colección porque la invocación sin `PYTHONPATH=.` no resuelve imports `backend.*`.

```bash
PYTHONPATH=. backend/venv/bin/pytest backend/tests/test_access_request_review_routes.py backend/tests/test_access_request_review_service.py
```

Resultado: OK, `22 passed`, `11 warnings`.

```bash
npm run frontend:lint
```

Resultado: OK.

```bash
npm run build
```

Resultado: OK. Next.js emitió mensajes existentes de `Dynamic server usage` durante generación estática para rutas que leen `cookies`, pero el comando terminó con exit code 0 y finalizó el build.

```bash
grep -Rni "reviewed_by" backend frontend/src \
  --exclude-dir=__pycache__ \
  --exclude-dir=node_modules \
  | sed -n '1,260p'

grep -Rni "decision.reviewed_by" backend frontend/src \
  --exclude-dir=__pycache__ \
  --exclude-dir=node_modules \
  || true
```

Resultado: OK. `reviewed_by` solo queda en respuesta/display, tests de persistencia, y escrituras backend desde `reviewer_id`. No queda ninguna referencia a `decision.reviewed_by`.

```bash
PYTHONPATH=. backend/venv/bin/python - <<'PY'
from fastapi.testclient import TestClient
from backend.api.main import app

response = TestClient(app).get('/health')
print(response.status_code)
print(response.text[:500])
raise SystemExit(0 if response.status_code == 200 else 1)
PY
```

Resultado: OK, `200`.

## Confirmaciones

- No se requirió migración SQL.
- El frontend ya no envía `reviewed_by` en approve/reject.
- Las rutas FastAPI derivan `reviewer_id` desde `get_current_user().id`.
- El servicio persiste `reviewed_by=reviewer_id`.
- La auditoría usa `actor_id=reviewer_id`.

## Limitaciones conocidas

- La invocación de tests backend necesita `PYTHONPATH=.` con el virtualenv local `backend/venv`.
- El build frontend conserva mensajes existentes de rutas dinámicas por uso de `cookies`; no bloquearon el build.
