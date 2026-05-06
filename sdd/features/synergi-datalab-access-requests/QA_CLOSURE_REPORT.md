# QA Closure Report — Synergi/Data Lab Access Requests

Fecha: 2026-05-06
Rama: `sdd/synergi-datalab-access-requests`
Gate: `PASS_WITH_NOTES`

## 1. Resumen ejecutivo

La feature centralizada de solicitudes de acceso Synergi/Data Lab queda validada para PR/merge con notas no bloqueantes. El flujo backend cubre intake publico, wrappers legacy, revision interna, decision approve/reject, emails de decision y audit trail. La UI interna `/access-requests` opera como backoffice/control plane de Nexus y no reutiliza `PrivateAreaShell`.

La decision de gate es `PASS_WITH_NOTES` porque los tests backend target, ESLint focalizado y build frontend pasan, y `public_cta_lead_capture` no esta modificado. La unica nota es deuda previa fuera de scope: `npm run lint` global falla por `frontend/src/lib/server-auth.ts` con `@typescript-eslint/no-explicit-any`.

## 2. Alcance implementado por fases

- Phase 1: backend intake canonico de `access_requests`, Turnstile/reCAPTCHA compatible, endpoint publico `/api/public/access-requests`, wrappers `/api/public/data-lab-access-requests` y `/api/public/partner-admissions`, migracion `061_access_requests.sql`.
- Phase 2: backend interno de revision con `GET /api/access-requests`, `GET /api/access-requests/{request_id}`, `POST /api/access-requests/{request_id}/approve`, `POST /api/access-requests/{request_id}/reject`.
- Phase 3: builders y envio de emails de decision, eventos `access_request.created`, `access_request.approved`, `access_request.rejected`, `access_request.email_sent`, `access_request.email_skipped`, `access_request.email_send_failed` usando `audit_log`.
- Phase 4: UI interna `/access-requests` para listar, filtrar, ver detalle, aprobar y rechazar solicitudes con feedback operativo.
- Phase 5: QA closure y feature gate.

## 3. Commits relevantes

```text
d265069 feat: add centralized access requests intake backend
b0759db feat: add internal access request review backend
1eac996 feat: add access request decision emails and audit trail
263fa94 feat: add internal access requests review UI
a00d94c docs: add gemini phase5 qa closure prompt
```

## 4. Archivos principales modificados

- `backend/models/access_requests.py`
- `backend/services/access_request_service.py`
- `backend/services/access_request_email_service.py`
- `backend/services/access_request_audit_service.py`
- `backend/api/routes/access_requests.py`
- `backend/api/routes/public.py`
- `backend/api/main.py`
- `supabase/migrations/061_access_requests.sql`
- `frontend/src/app/(dashboard)/access-requests/page.tsx`
- `frontend/src/components/access-requests/AccessRequestsTable.tsx`
- `frontend/src/components/access-requests/AccessRequestDetailPanel.tsx`
- `frontend/src/components/access-requests/AccessRequestDecisionDialog.tsx`
- `frontend/src/lib/access-requests-api.ts`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/lib/i18n/translations.ts`

## 5. Validaciones ejecutadas y resultado

```bash
git status --short
```

Resultado inicial: limpio.

```bash
git log --oneline --decorate -12
git diff --stat origin/main...HEAD
git diff --name-only origin/main...HEAD
```

Resultado: ejecutados. La comparacion contra `origin/main` muestra un diff amplio de rama que incluye documentacion, contratos, legacy moved prompts y la feature `access_requests`. No se detectan cambios locales sin commit antes del informe.

```bash
git diff origin/sdd/synergi-datalab-access-requests -- backend/api/routes/public.py
git diff -- backend/api/routes/public.py
```

Resultado: sin salida. No hay diff local ni diferencia con la rama remota en `public.py`.

```bash
git diff origin/main...HEAD -- backend/api/routes/public.py
```

Resultado: los cambios son imports y endpoints publicos de access requests:

- `POST /api/public/access-requests`
- `POST /api/public/data-lab-access-requests`
- `POST /api/public/partner-admissions`

El bloque `public_cta_lead_capture` no aparece modificado.

```bash
grep -Rni "org_id" frontend/src/app/\(dashboard\)/access-requests frontend/src/components/access-requests frontend/src/lib/access-requests-api.ts || true
```

Resultado: una unica aparicion en `frontend/src/lib/access-requests-api.ts` como campo tipado de respuesta (`org_id: string`). No se envia `org_id` desde frontend.

```bash
git diff --name-only origin/main...HEAD | grep -E "PrivateAreaShell|private-area" || true
```

Resultado: no aparece `PrivateAreaShell`. Solo aparecen documentos legacy/prompts relacionados con `private-area-access-architecture`, no cambios de UI/runtime de `PrivateAreaShell`.

```bash
grep -Rni "access-requests" backend/api frontend/src | sed -n '1,220p'
```

Resultado: rutas y cliente localizados en:

- `backend/api/main.py`
- `backend/api/routes/public.py`
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/access-requests/*`
- `frontend/src/app/(dashboard)/access-requests/page.tsx`
- `frontend/src/lib/access-requests-api.ts`

Nota: `grep` tambien detecto binarios `__pycache__` ignorados por git tras ejecucion de tests/build.

## 6. Estado de tests backend

Comando ejecutado:

```bash
source backend/venv/bin/activate
PYTHONPATH=. python3 -m pytest \
  backend/tests/test_access_request_service.py \
  backend/tests/test_public_access_requests.py \
  backend/tests/test_access_request_review_service.py \
  backend/tests/test_access_request_review_routes.py \
  backend/tests/test_access_request_email_service.py \
  backend/tests/test_access_request_audit_service.py
```

Resultado:

```text
42 passed, 13 warnings in 4.10s
```

Cobertura funcional validada por tests target:

- create public request persiste `pending`;
- wrappers legacy transforman a modelo canonico;
- list/detail internos responden;
- approve/reject actualizan estado y campos de revision;
- `rejection_reason` es obligatorio;
- estados terminales bloquean nuevas decisiones;
- email builders cubren approval/rejection;
- fallos de email no revierten decision;
- audit service registra eventos y rechaza `event_type` vacio.

## 7. Estado de lint/build frontend

ESLint focalizado ejecutado:

```bash
cd frontend
npx eslint \
  'src/app/(dashboard)/access-requests/page.tsx' \
  src/components/access-requests/AccessRequestsTable.tsx \
  src/components/access-requests/AccessRequestDetailPanel.tsx \
  src/components/access-requests/AccessRequestDecisionDialog.tsx \
  src/lib/access-requests-api.ts \
  src/components/layout/Sidebar.tsx \
  src/lib/i18n/translations.ts
```

Resultado: `PASS`.

Build ejecutado:

```bash
cd frontend
npm run build
```

Resultado: `PASS`. Next.js emitio mensajes de `Dynamic server usage` por rutas que usan `cookies`, incluyendo `/access-requests`, pero finalizo con exit code 0 y listo `/access-requests` como ruta dinamica.

Lint global ejecutado:

```bash
cd frontend
npm run lint
```

Resultado: `FAIL` por deuda previa fuera de scope:

```text
frontend/src/lib/server-auth.ts
22:53  error  Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```

## 8. Deuda conocida fuera de scope

- `frontend/src/lib/server-auth.ts` contiene `any` que rompe `npm run lint` global. No se corrige en esta feature porque no pertenece al alcance de access requests y el ESLint focalizado de los archivos tocados pasa.
- La UI usa `reviewed_by = "internal-user"` como fallback temporal. Debe sustituirse por identidad real cuando el frontend exponga un patron estable de usuario interno.
- El build muestra logs de `Dynamic server usage` por uso de `cookies` en multiples rutas. No bloquea porque `next build` termina correctamente.

## 9. Riesgos restantes

- SMTP puede no estar configurado; en ese caso el backend registra `decision_email.status = skipped` y audita `access_request.email_skipped`.
- La auditoria reutiliza `audit_log`; si el insert de audit falla, la decision no se revierte y se loguea warning. Es comportamiento intencional de esta fase.
- La branch contra `origin/main` contiene cambios documentales/legacy amplios no exclusivos de esta feature. Conviene revisar el PR con foco por commits y no solo por diff agregado.
- No hay provisioning real de cuentas, invite tokens ni integracion con repos `anclora-synergi`/`anclora-data-lab`; permanece fuera de scope.

## 10. Decision gate

`PASS_WITH_NOTES`

Motivos:

- Backend target tests: `PASS`.
- Frontend focalizado ESLint: `PASS`.
- Frontend build: `PASS`.
- `public_cta_lead_capture`: intacto.
- UI `/access-requests`: mantiene lenguaje y layout INTERNAL/backoffice.
- `PrivateAreaShell`: no tocado.
- Frontend no envia `org_id`; solo lo tipa como campo de respuesta.
- Global lint falla por deuda previa fuera de scope (`server-auth.ts`).

## 11. Checklist de merge/PR

- [x] Rama local limpia antes de crear el informe.
- [x] Commits de fases backend/UI presentes en la rama.
- [x] `public_cta_lead_capture` no modificado.
- [x] Tests backend target pasan.
- [x] ESLint focalizado de archivos de la feature pasa.
- [x] `npm run build` pasa.
- [x] `npm run lint` global documentado como `PASS_WITH_NOTES` por deuda previa.
- [x] UI mantiene contrato Nexus INTERNAL.
- [x] No se toca `PrivateAreaShell`.
- [x] No se toca Synergi/Data Lab.
- [x] No se aceptan ni envian `org_id` arbitrarios desde frontend/public API.
- [ ] Revisar en PR el diff amplio contra `origin/main`, especialmente documentos/legacy arrastrados por la rama.
- [ ] Decidir si se crea issue separado para corregir `frontend/src/lib/server-auth.ts`.
- [ ] Sustituir `reviewed_by = internal-user` por identidad real en fase posterior.
