# Informe: Reparación 404 SyncXML Pilot Router — 2026-06-20

## Causa confirmada del 404

El router `backend/api/routes/syncxml_pilot.py` existía y estaba correctamente implementado,
pero **nunca fue importado ni registrado en ningún entrypoint FastAPI**. El resultado era que
cualquier `POST /api/syncxml-pilot/{id}/approve` devolvía 404 Not Found —
no un error de negocio, sino una ruta inexistente.

## Entrypoint real de FastAPI (producción)

| Archivo | Título | Rol |
|---|---|---|
| `backend/main.py` | "Anclora Nexus API" | **Producción (Render)** — se registran aquí todos los routers nuevos |
| `backend/api/main.py` | "Anclora Intelligence API v1" | Dev local (`uvicorn api.main:app`) |

Evidencia: el CHANGELOG documenta `backend/main.py` para feeds, command_center, DMS y todos
los routers recientes. Contiene también `internal_webhooks_router` y CORS restrictivo —
característico de producción.

## Archivos modificados

| Archivo | Cambio |
|---|---|
| `backend/main.py` | Import + `app.include_router(syncxml_pilot_router, prefix="/api/syncxml-pilot", ...)` |
| `backend/api/main.py` | Import + `app.include_router(syncxml_pilot_router, prefix="/api/syncxml-pilot", ...)` |
| `backend/tests/test_syncxml_pilot_routes.py` | Creado — 31 tests en 4 secciones (A–D) |
| `docs/recovery/fix-syncxml-pilot-router-diagnosis.md` | Diagnóstico previo |

## Rutas registradas y métodos HTTP

Tras la corrección, las siguientes rutas están disponibles en producción:

| Método | Ruta | Función |
|---|---|---|
| `POST` | `/api/syncxml-pilot/{request_id}/approve` | Aprobación manual por revisor |
| `POST` | `/api/syncxml-pilot/{request_id}/reject` | Rechazo manual con razón |
| `POST` | `/api/syncxml-pilot/{request_id}/request-more-info` | Solicitar más información |
| `POST` | `/api/internal/webhooks/syncxml-pilot` | Webhook entrante desde SyncXML |

## Resultados de tests

```
31 passed, 0 failed
```

Secciones cubiertas:

- **A — Registro de rutas**: verifica que `backend.main` expone `/approve`, `/reject` y `/request-more-info`
- **B — Endpoints manuales**: approve 200, reject 200, 404 negocio vs. 404 router, idempotencia
- **C — Matriz de decisión automática**: 8 casos cubriendo todas las ramas de `_decide_status`
- **D — Seguridad webhook**: key inválida → 403, key ausente → 403, key válida → 200

## Verificación de la matriz de decisión automática

| Condición | Resultado esperado | Test confirma |
|---|---|---|
| `acceptsPilotConditions=False` | `rejected` (determinístico) | ✅ |
| `acceptsSyntheticOrAnonymizedData=False` | `rejected` (determinístico) | ✅ |
| Texto contiene "datos reales" / "producción" | `pending` (revisión manual) | ✅ |
| AI score≥85, no flags, `AUTO_APPROVE=False` | `pending` | ✅ |
| AI score≥85, no flags, `AUTO_APPROVE=True`, no safety mode | `approved` | ✅ |
| AI score≥85, no flags, `AUTO_APPROVE=True`, safety mode activo | `pending` | ✅ |
| AI score≤20, flags presentes | `rejected` (determinístico) | ✅ |
| AI response ambigua | `pending` | ✅ |

## Confirmaciones de seguridad

- `SYNCXML_PILOT_AUTO_APPROVE` **no se ha activado**. Permanece `false` por defecto.
- Ninguna llamada real a Supabase, Resend ni SyncXML durante los tests (todo mockeado).
- `ALLOW_REAL_SUPABASE_WRITE` nunca se estableció como `true`.
- No se realizaron deploys a Render, Vercel ni Supabase producción.
- No se enviaron emails reales.
- No se ejecutaron migraciones de base de datos.
- No se hizo `git push` ni `git push --force`.

## Riesgos pendientes antes del redeploy

1. **Permisos en Supabase**: `require_access_request_reviewer` llama a Supabase para verificar
   el rol del usuario. Confirmar que la tabla/función RLS existe y los revisores tienen el rol
   correcto asignado antes de probar en staging.

2. **Variables de entorno en Render**: Confirmar que `SYNCXML_WEBHOOK_SECRET`,
   `NEXUS_INTERNAL_API_KEY`, y las vars de email están configuradas en el servicio de producción.

3. **Smoke test en staging**: Tras el deploy, ejecutar un `POST /api/syncxml-pilot/{id}/approve`
   con un `request_id` real en estado `pending` y verificar que devuelve 200 (no 404).

## Próximos pasos sugeridos (no ejecutados)

```bash
# 1. Commit local
# git add backend/main.py backend/api/main.py backend/tests/test_syncxml_pilot_routes.py docs/recovery/
# Usar agente `commit` — nunca git commit directo

# 2. Push a rama y PR
# git push origin fix/register-syncxml-pilot-router

# 3. Deploy a Render (staging primero)
# Render auto-deploys desde main — no ejecutar hasta merge aprobado

# 4. Smoke test en staging
# curl -X POST https://anclora-nexus-backend-staging.onrender.com/api/syncxml-pilot/<id>/approve \
#   -H "Authorization: Bearer <token>" \
#   -H "Content-Type: application/json" -d '{}'
```
