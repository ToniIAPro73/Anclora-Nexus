# Informe Forense — Restauración Pre-Spec 2026-06-19

Generado: 2026-06-20  
Analista: Claude Code (Release Recovery Architect)  
Alcance: Spec `ecosystem-consolidation-plan` ejecutada por Kiro (+ posiblemente Codex)  
Frontera temporal: commits desde `2026-06-19 00:00:00 UTC`

---

## Resumen ejecutivo

El agente **Kiro** (sin acceso a memoria de negocio) ejecutó la spec
`anclora-group/.kiro/specs/ecosystem-consolidation-plan` entre el 19 y 20 de
junio de 2026. La spec incluía la tarea **5.7 "Deprecate SyncXML"** que
contradice directamente las decisiones de negocio vinculantes de Toni:
SyncXML es un producto independiente y no debe archivarse ni absorberse en Nexus.

Kiro ejecutó Phases 0, 1, 2 completas (excepto tareas 7.5 y 7.8 de Phase 3),
más trabajo adicional de Phases 3-5. La mayor parte del trabajo es legítimo
(AML vault, RAG quality, lead intake, governance). La única parte
problemática es la **eliminación del flujo SyncXML** del código de aplicación.

**La base de datos NO fue afectada.** La migración 062 mantiene intactos
los constraints de SyncXML en Supabase. El daño es exclusivamente en código.

---

## Frontera temporal

- Zona horaria de los commits: `+0200` (CEST)
- Normalizado a UTC: commits a partir de `2026-06-18 22:00:00 UTC`
- Corte operativo confirmado: `2026-06-19 00:00:00` (hora local)
- Commit de referencia pre-spec en Nexus: `adad2ec` (ci: normalize promotion workflow metadata)

---

## Matriz de repos auditados

| Repo | ¿Afectado? | Motivo | Acción |
|---|---|---|---|
| `anclora-nexus` | **SÍ — CRÍTICO** | Eliminó SyncXML pilot service, rutas, tests, frontend, enums | Restauración selectiva |
| `anclora-syncXML` | **SÍ — CRÍTICO** | README.md reescrito con deprecation notice | Revertir README |
| `anclora-content-generator-ai` | **NO** | Solo adiciones (webhook receiver, RAG, watermark) | Ninguna |
| `anclora-private-estates-landing` | **REVISIÓN** | Seller intake wired to leads — ampliación, no regresión | Auditoría leve |
| `anclora-advisor-ai` | **NO** | Solo adiciones (RAG quality, compliance, disclaimers) | Ninguna |
| `anclora-group` | **NO** | Solo adiciones (auth, governance, Command Center) | Ninguna |
| `anclora-data-lab` | **NO** | Solo adiciones (AVM Mallorca model) | Ninguna |
| `anclora-synergi` | **NO AFECTADO** | Cero commits desde 2026-06-19 | Ninguna |
| `anclora-command-center` | **NO APLICA** | No repo independiente encontrado | — |

---

## Forense detallado: `anclora-nexus`

### Commit `ed891c4` — "Complete ecosystem phase 3 nexus integration"

**Fecha:** 2026-06-20 00:57 CEST  
**Autor:** ToniIAPro73 (ejecutado por Kiro)  
**Estado:** En ramas development, staging, production, main

#### Archivos ELIMINADOS (a restaurar):

| Archivo | Líneas | Commit anterior | Estado actual |
|---|---|---|---|
| `backend/services/syncxml_pilot_service.py` | 526 | `ed891c4^` | ELIMINADO |
| `backend/api/routes/syncxml_pilot.py` | 65 | `ed891c4^` | ELIMINADO |
| `backend/scripts/smoke_syncxml_email.py` | 57 | `ed891c4^` | ELIMINADO |
| `backend/scripts/smoke_syncxml_pilot_task.py` | 44 | `ed891c4^` | ELIMINADO |
| `backend/tests/test_syncxml_pilot_tasks.py` | 204 | `ed891c4^` | ELIMINADO |
| `docs/ENVIRONMENT_SETUP_SYNCXML_PILOT.md` | 63 | `ed891c4^` | ELIMINADO |
| `docs/SYNCXML_PILOT_REVIEW_FLOW.md` | 30 | `ed891c4^` | ELIMINADO |
| `docs/env-syncxml-pilot.md` | 21 | `ed891c4^` | ELIMINADO |
| `frontend/src/lib/syncxml-pilot-api.ts` | 36 | `ed891c4^` | ELIMINADO |

Todos los archivos son recuperables con `git show ed891c4^:<ruta>`.

#### Archivos MODIFICADOS (partes a restaurar):

**`backend/models/access_requests.py`**:
- Eliminado `SYNCXML = "syncxml"` de `AccessRequestProduct`
- Eliminado `SYNCXML_LANDING = "syncxml_landing"` de `AccessRequestSource`
- *Nota: DB migración 062 mantiene estos valores en constraints — solo hay
  que restaurar los enums Python*

**`backend/api/internal_webhooks.py`**:
- Eliminado import `syncxml_pilot_service`
- Cambiado auth: `settings.SYNCXML_WEBHOOK_SECRET or settings.NEXUS_INTERNAL_API_KEY`
  → solo `settings.NEXUS_INTERNAL_API_KEY`
- Eliminado endpoint `@router.post("/syncxml-pilot")`

**`backend/services/access_request_email_service.py`**:
- Eliminado branch `if product == "syncxml": return "SyncXML"`
- Eliminadas funciones `_syncxml_app_url()` y `_syncxml_logo_url()`
- Cambiado eyebrow por defecto de "Anclora SyncXML" → "Anclora Nexus"
- Cambiado branding del shell de email: nombre y subtítulo

**`frontend/src/app/(dashboard)/access-requests/page.tsx`**:
- Eliminado import `{ approveSyncXmlPilot, rejectSyncXmlPilot }`
- Eliminada lógica de decisión diferenciada para `product === 'syncxml'`
- Eliminado `<option value="syncxml">SyncXML</option>` del filtro de producto
- Eliminado `<option value="syncxml_landing">` del filtro de fuente

**`frontend/src/lib/access-requests-api.ts`**:
- Eliminado `'syncxml'` de `AccessRequestProduct` type union
- Eliminado `'syncxml_landing'` de `AccessRequestSource` type union

**`frontend/src/lib/i18n/translations.ts`**:
- Eliminadas las 4 entradas `accessRequestsSourceSyncXmlLanding` (es, ca, en, de)

### Commit `dde894d` — "Remove deprecated SyncXML CI check"

**Fecha:** 2026-06-20 01:02 CEST  
**Archivos:** 5 workflow files — 3 líneas eliminadas de cada uno

Línea eliminada en cada workflow:

```yaml
- name: Check SyncXML pilot env example
  run: npm run ops:syncxml-pilot:check-env
```

Esto fue consecuencia de la eliminación del servicio. Al restaurar el
servicio, hay que decidir si restaurar este check de CI (recomendado: sí).

---

## Forense detallado: `anclora-syncXML`

### Commit `48c7f32` — "Document SyncXML deprecation"

**Fecha:** 2026-06-20 01:08 CEST  
**Archivos:** Solo `README.md`

Cambios introducidos:

- Añadido bloque `> DEPRECATED:` al inicio
- Cambiado badge `status-pre--MVP%20%2F%20controlled%20validation-orange`
  → `status-DEPRECATED-red`
- Cambiado tiempo verbal de presente a pasado ("is" → "was")
- Añadida línea "The content below is retained for historical context only."

**Resultado:** El repo aparece como archivado y de solo lectura públicamente.

**Estado de la DB:** No afectada. El repo no gestiona su propio esquema.

---

## Estado de la base de datos (INTACTO)

La migración `062_syncxml_access_requests_compatibility.sql` está **presente**
en `supabase/migrations/` y contiene:

- Tabla `access_requests` con `product DEFAULT 'syncxml'`
- Constraint: `product IN ('synergi', 'data_lab', 'syncxml')`
- Constraint: `source IN ('landing', 'synergi_app', 'data_lab_app', 'syncxml_landing')`
- Index: `task_type = 'syncxml_pilot_review'`

**No se requieren migraciones de base de datos para la restauración.**
El schema está correcto. Solo hay que restaurar el código de aplicación.

---

## Safety tags creados

```text
safety/pre-restore-20260620-175415
```

Creado en: anclora-nexus, anclora-syncXML, anclora-content-generator-ai,
anclora-private-estates-landing, anclora-advisor-ai, anclora-group, anclora-data-lab.

---

## Plan de restauración mínima no destructiva

### Estrategia: cherry-pick selectivo + restauración de archivos

**NO se usará `git reset`.**

Se creará una rama `restore/syncxml-pilot-service` en `anclora-nexus` partiendo
de `development`. Los cambios se harán file-by-file usando `git show` para
recuperar contenido exacto del historial, y ediciones quirúrgicas para los
archivos modificados parcialmente.

### Acciones por repo

#### `anclora-nexus` — 15 cambios selectivos

| # | Archivo | Acción | Método |
|---|---|---|---|
| 1 | `backend/services/syncxml_pilot_service.py` | RESTAURAR | `git show ed891c4^:<path>` |
| 2 | `backend/api/routes/syncxml_pilot.py` | RESTAURAR | `git show ed891c4^:<path>` |
| 3 | `backend/scripts/smoke_syncxml_email.py` | RESTAURAR | `git show ed891c4^:<path>` |
| 4 | `backend/scripts/smoke_syncxml_pilot_task.py` | RESTAURAR | `git show ed891c4^:<path>` |
| 5 | `backend/tests/test_syncxml_pilot_tasks.py` | RESTAURAR | `git show ed891c4^:<path>` |
| 6 | `docs/ENVIRONMENT_SETUP_SYNCXML_PILOT.md` | RESTAURAR | `git show ed891c4^:<path>` |
| 7 | `docs/SYNCXML_PILOT_REVIEW_FLOW.md` | RESTAURAR | `git show ed891c4^:<path>` |
| 8 | `docs/env-syncxml-pilot.md` | RESTAURAR | `git show ed891c4^:<path>` |
| 9 | `frontend/src/lib/syncxml-pilot-api.ts` | RESTAURAR | `git show ed891c4^:<path>` |
| 10 | `backend/models/access_requests.py` | EDICIÓN QUIRÚRGICA | Añadir SYNCXML enums |
| 11 | `backend/api/internal_webhooks.py` | EDICIÓN QUIRÚRGICA | Restaurar endpoint + auth |
| 12 | `backend/services/access_request_email_service.py` | EDICIÓN QUIRÚRGICA | Restaurar SyncXML branding |
| 13 | `frontend/src/app/(dashboard)/access-requests/page.tsx` | EDICIÓN QUIRÚRGICA | Restaurar filtros + lógica |
| 14 | `frontend/src/lib/access-requests-api.ts` | EDICIÓN QUIRÚRGICA | Restaurar tipos |
| 15 | `frontend/src/lib/i18n/translations.ts` | EDICIÓN QUIRÚRGICA | Restaurar 4 claves i18n |
| 16 | `.github/workflows/*.yml` (5 archivos) | EDICIÓN QUIRÚRGICA | Restaurar CI check |

#### `anclora-syncXML` — 1 cambio

| # | Archivo | Acción | Método |
|---|---|---|---|
| 1 | `README.md` | REVERTIR `48c7f32` | `git show 48c7f32^:README.md` |

---

## Cambios a PRESERVAR (no tocar)

Todo lo siguiente es trabajo legítimo que debe conservarse:

- Nexus Phase 0: AML vault schema, retention tests, ADR-001 (commits before `ed891c4` in development)
- Nexus Phase 1: RAG pipeline, NotebookLM sync CLI
- Nexus Phase 2: Lead intake API, signature service, webhook dispatcher,
  contract validator, DMS signature blocking
- Nexus Phase 3: Lead pipeline, webhook dispatcher, Better Auth
- Advisor AI: compliance disclaimers, RAG quality gates, evaluation pipeline
- Content Generator: property webhook receiver, MinerU RAG ingestion, watermark
- Private Estates Landing: seller intake wired to Nexus leads
- Data Lab: AVM Mallorca model
- Group: governance, Command Center, role propagation, AI Act compliance

---

## Variables de entorno a verificar tras restauración

Variables que necesita `syncxml_pilot_service.py`:

```env
SYNCXML_WEBHOOK_SECRET=<secret compartido con SyncXML>
SYNCXML_APP_URL=https://anclora-syncxml.vercel.app
NEXUS_SYNCXML_WEBHOOK_URL=<URL del webhook en Nexus>
RESEND_FROM=Anclora SyncXML <piloto@anclora.com>
ADMIN_EMAILS=<emails del administrador>
ALLOW_REAL_SUPABASE_WRITE=false  # mantener false en staging/preview
```

Verificar que están configuradas en Vercel/Render para los entornos correctos.

---

## Riesgos

| Riesgo | Nivel | Mitigación |
|---|---|---|
| Conflictos en i18n (archivo de 11000+ líneas) | Medio | Edición quirúrgica precisa en las 4 entradas |
| Tests de email que referencian SyncXML | Bajo | `test_email_delivery_service.py` ya usa SyncXML en patches — no requiere cambios |
| CI check de env example | Bajo | Restaurar step en workflows |
| Datos existentes en DB con product='syncxml' | Nulo | DB intacta, migración 062 correcta |
| Merge conflict con otras ramas | Bajo | Trabajar desde development actual |

---

## Clasificación de todos los cambios post 2026-06-19

| Commit | Repo | Clasificación | Razón |
|---|---|---|---|
| `ed891c4` | nexus | REIMPLEMENT_SAFELY (parcial) | Contiene trabajo legítimo + destrucción SyncXML |
| `dde894d` | nexus | REVERT (parcial) | Solo las 3 líneas del CI check |
| `48c7f32` | syncxml | REVERT | Deprecation notice injustificada |
| `076445b` | content-gen | PRESERVE | Adición pura, no afecta SyncXML |
| `f1d05a5` | content-gen | PRESERVE | Adición pura |
| `ba5e60e` | pe-landing | PRESERVE | Ampliación lead intake, no rompe flujos |
| `ee5834e` | advisor | PRESERVE | Adición pura |
| `2c9e38f` | group | PRESERVE | Spec files + auth, no oculta SyncXML |
| `21dba89` | group | PRESERVE | Governance, no afecta SyncXML |
| `7e16e0d` | data-lab | PRESERVE | Adición pura |

---

## Plan de pruebas post-restauración

### Smoke E2E SyncXML → Nexus

1. Solicitud elegible desde SyncXML landing → webhook → Nexus
2. Solicitud en revisión humana (score bajo)
3. Solicitud rechazada automáticamente
4. Idempotencia (solicitud duplicada)
5. Firma inválida del webhook → 403
6. Nexus caído → SyncXML maneja error gracefully
7. La solicitud aparece en UI de Nexus con producto y fuente correctos
8. Los filtros de producto y fuente funcionan incluyendo SyncXML
9. La decisión humana (aprobar/rechazar) deja trazabilidad
10. El aprovisionamiento solo ocurre tras aprobación

### Regresión

- Synergi → Nexus: flujo existente intacto
- Data Lab → Nexus: flujo existente intacto
- Private Estates Landing → Nexus leads: flujo nuevo intacto

---

## DECISIÓN REQUERIDA DE TONI

**Antes de ejecutar la Fase D, necesito confirmación explícita de:**

1. ¿Apruebas restaurar los 15 archivos/cambios en `anclora-nexus`?
2. ¿Apruebas revertir el README.md de `anclora-syncXML`?
3. ¿Quieres también restaurar el CI check de `ops:syncxml-pilot:check-env`
   en los 5 workflows de Nexus?
4. ¿Los entornos de staging/production en Vercel/Render tienen configuradas
   las variables `SYNCXML_WEBHOOK_SECRET` y `SYNCXML_APP_URL`?
   (Necesario para que la restauración sea funcional en staging.)
5. ¿Apruebas hacer PR independientes por repo o prefieres un commit directo
   en la rama `restore/syncxml-pilot-service`?

**No se tocará ningún código hasta recibir aprobación explícita.**
