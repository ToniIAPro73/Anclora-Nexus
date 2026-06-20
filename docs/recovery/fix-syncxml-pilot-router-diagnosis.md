# Diagnóstico: 404 en rutas SyncXML Pilot — 2026-06-20

## Causa confirmada del 404

El router `backend/api/routes/syncxml_pilot.py` existe y está correctamente implementado,
pero **no ha sido importado ni registrado en ningún entrypoint FastAPI**.

## Entrypoints FastAPI identificados

| Archivo | Título | Uso |
|---|---|---|
| `backend/main.py` | "Anclora Nexus API" | **Producción (Render)** — donde se registran todos los routers nuevos |
| `backend/api/main.py` | "Anclora Intelligence API v1" | Dev local (`uvicorn api.main:app`) — app más antigua |

Evidencia de que `backend/main.py` es el entrypoint de producción:
- CHANGELOG documenta registros en `backend/main.py` para todas las features nuevas (feeds, command_center, DMS, etc.)
- Contiene `internal_webhooks_router` (webhook de SyncXML entrante) y toda la lógica de acceso a Supabase real
- Tiene CORSMiddleware restrictivo (`CORS_ALLOWED_ORIGINS` desde env) — característico de producción

## Ruta esperada vs ruta registrada

| | Valor |
|---|---|
| Frontend llama a | `POST /api/syncxml-pilot/{request_id}/approve` |
| Frontend llama a | `POST /api/syncxml-pilot/{request_id}/reject` |
| Router declara | `@router.post("/{request_id}/approve")` |
| Router declara | `@router.post("/{request_id}/reject")` |
| Prefix necesario | `/api/syncxml-pilot` |
| Prefix actualmente registrado | **ninguno — router no registrado** |

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `backend/main.py` | Añadir import + `app.include_router(syncxml_pilot_router, prefix="/api/syncxml-pilot", ...)` |
| `backend/api/main.py` | Ídem para consistencia con dev local |
| `backend/tests/test_syncxml_pilot_routes.py` | Crear — cobertura de rutas y decisión automática |

## Comandos de arranque

- **Producción (Render):** `uvicorn backend.main:app` o equivalente apuntando a `backend/main.py`
- **Dev local (CLAUDE.md):** `cd backend && python -m uvicorn api.main:app --reload --port 8000`
