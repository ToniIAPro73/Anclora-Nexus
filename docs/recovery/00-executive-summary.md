# Resumen Ejecutivo — Restauración Pre-Spec 2026-06-19

Generado: 2026-06-20  
Estado: **FASE C COMPLETA — ESPERANDO APROBACIÓN DE TONI PARA FASE D**

---

## Qué encontré

El agente **Kiro** ejecutó la spec `ecosystem-consolidation-plan` entre el 19
y 20 de junio de 2026 en los repos confirmados por Toni. La ejecución incluyó
la tarea **5.7 "Deprecate SyncXML"** — que contradice directamente las
decisiones de negocio de Toni sobre SyncXML como producto independiente.

La mayor parte del trabajo de la spec es legítimo y debe preservarse.
El daño está acotado a **dos repos** y es **reversible sin perder datos**.

---

## Qué se rompió

### `anclora-nexus` (commit `ed891c4` + `dde894d`)

El flujo SyncXML Pilot fue **eliminado completamente** del código de aplicación:

- 9 archivos eliminados (526+65+57+44+204+63+30+21+36 = 1.046 líneas)
- Enums Python `SYNCXML` y `SYNCXML_LANDING` eliminados del modelo
- Webhook `/api/internal/webhooks/syncxml-pilot` eliminado
- Auth del webhook simplificada (se perdió `SYNCXML_WEBHOOK_SECRET`)
- Email service: branding SyncXML reemplazado por "Anclora Nexus"
- Frontend: filtros SyncXML eliminados de la página access-requests
- Frontend: lógica de decisión diferenciada para SyncXML eliminada
- 4 claves i18n eliminadas (es, ca, en, de)
- CI check `ops:syncxml-pilot:check-env` eliminado de 5 workflows

### `anclora-syncXML` (commit `48c7f32`)

El README fue reescrito para declarar el repo como **archivado y de solo
lectura**, con badge DEPRECATED y tiempo verbal en pasado.

---

## Qué NO se rompió

- **Base de datos: INTACTA.** Migración `062_syncxml_access_requests_compatibility.sql`
  mantiene constraints correctos para `syncxml` y `syncxml_landing`.
- **Flujos de Synergi y Data Lab: intactos.**
- **Private Estates Landing: lead intake ampliado, no regresionado.**
- **anclora-synergi: no afectado (cero commits desde 2026-06-19).**

---

## Plan de restauración (mínimo, no destructivo)

| Acción | Repo | Archivos | Riesgo |
|---|---|---|---|
| Restaurar 9 archivos eliminados | nexus | Backend services/routes/tests/docs | BAJO |
| Restaurar enums Python | nexus | `backend/models/access_requests.py` | MUY BAJO |
| Restaurar webhook endpoint | nexus | `backend/api/internal_webhooks.py` | BAJO |
| Restaurar email branding SyncXML | nexus | `access_request_email_service.py` | BAJO |
| Restaurar frontend TS API type | nexus | `frontend/src/lib/access-requests-api.ts` | MUY BAJO |
| Restaurar filtros frontend | nexus | `access-requests/page.tsx` | BAJO |
| Restaurar 4 claves i18n | nexus | `translations.ts` | MEDIO (archivo 11k líneas) |
| Restaurar syncxml-pilot-api.ts | nexus | `frontend/src/lib/syncxml-pilot-api.ts` | BAJO |
| Restaurar CI check | nexus | 5 workflow YAML files | MUY BAJO |
| Revertir deprecation README | syncxml | `README.md` | MUY BAJO |

**No hay migraciones de DB que ejecutar.**  
**No hay cambios destructivos en otros repos.**

---

## Gap adicional identificado (no es regresión)

El Command Center de `anclora-group` (nuevo en Phase 5) no incluye SyncXML
en su health polling. Esto no es una regresión (Command Center no existía antes),
pero es una mejora futura recomendada: añadir `syncxml` a `AppId` y su
URL de health en el aggregator.

---

## PREGUNTAS PARA APROBACIÓN DE TONI

Responde explícitamente a cada una antes de continuar con Fase D:

**1.** ¿Apruebas la restauración de los 9 archivos eliminados más los 7 cambios
   quirúrgicos en `anclora-nexus`? (Estrategia: rama `restore/syncxml-pilot-service`)

**2.** ¿Apruebas revertir el README.md de `anclora-syncXML` al estado previo
   al commit `48c7f32`?

**3.** ¿Quieres también restaurar el CI check `ops:syncxml-pilot:check-env`
   en los 5 workflows de Nexus? (Recomendado: sí)

**4.** ¿Están configuradas `SYNCXML_WEBHOOK_SECRET` y `SYNCXML_APP_URL`
   en los entornos desplegados (Vercel/Render)? Si no, la restauración
   funcionará en desarrollo pero el webhook no podrá autenticarse en staging.

**5.** ¿Prefieres PR independiente por repo o commit directo en rama de restauración?

**6.** ¿Quieres añadir SyncXML al Command Center de `anclora-group`
   (gap nuevo, no regresión) como parte de esta restauración, o lo dejamos
   como tarea futura?
