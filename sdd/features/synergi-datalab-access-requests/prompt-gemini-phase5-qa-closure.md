# Prompt Gemini — Phase 5 QA Closure / Feature Gate

Repo: `~/projects/anclora-nexus`  
Branch: `sdd/synergi-datalab-access-requests`

## Contexto

Estamos cerrando la feature centralizada de solicitudes de acceso Synergi/Data Lab en Anclora Nexus.

Arquitectura vigente:

- **Nexus** = INTERNAL / control plane / backoffice / solicitudes / revisión / aprobación-rechazo / administración / trazabilidad / emails de decisión.
- **Anclora Synergi** = PREMIUM / experiencia partner / workspace propio en repo separado.
- **Anclora Data Lab** = PREMIUM / experiencia analítica / workspace propio en repo separado.

Fases ya implementadas y pusheadas en la rama:

```text
d265069 feat: add centralized access requests intake backend
b0759db feat: add internal access request review backend
1eac996 feat: add access request decision emails and audit trail
263fa94 feat: add internal access requests review UI
```

Prompts/documentos relevantes:

```text
sdd/features/synergi-datalab-access-requests/spec-v1.md
sdd/features/synergi-datalab-access-requests/implementation-plan-nexus.md
sdd/features/synergi-datalab-access-requests/audit-legacy-synergi-datalab-features.md
sdd/features/synergi-datalab-access-requests/prompt-gemini-phase1-backend.md
sdd/features/synergi-datalab-access-requests/prompt-codex-phase2-internal-review.md
sdd/features/synergi-datalab-access-requests/prompt-codex-phase3-decision-emails-audit.md
sdd/features/synergi-datalab-access-requests/prompt-codex-phase4-internal-ui.md
```

Contratos obligatorios:

```text
AGENTS.md
sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md
sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md
sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md
sdd/contracts/UI-TEXT-FIELD-CONTRACT.md
sdd/contracts/UI-SELECT-FIELD-CONTRACT.md
sdd/contracts/UI-BOOLEAN-FIELD-CONTRACT.md
```

## Objetivo

Realizar cierre técnico/QA de la rama antes de preparar PR o merge.

No implementar nuevas features.

La tarea es auditar, validar, documentar riesgos y proponer correcciones mínimas solo si hay bloqueantes reales.

## Fuera de alcance

No hacer:

- no crear nuevas features;
- no tocar Synergi/Data Lab;
- no tocar `PrivateAreaShell`;
- no modificar `/api/public/cta/lead`;
- no borrar legacy;
- no cambiar contratos;
- no arreglar deudas globales fuera de scope salvo que bloqueen esta feature directamente;
- no hacer commit sin aprobación.

## Regla crítica

El endpoint existente debe seguir intacto:

```text
POST /api/public/cta/lead
```

Validar:

```bash
git diff origin/sdd/synergi-datalab-access-requests -- backend/api/routes/public.py
```

Y, si comparas contra base/main, revisar que los cambios en `public.py` solo correspondan a endpoints `access_requests`, no a `public_cta_lead_capture`.

## Revisión funcional esperada

Validar que el flujo queda completo:

```text
1. POST /api/public/access-requests crea pending.
2. Wrappers legacy /data-lab-access-requests y /partner-admissions transforman a modelo canónico.
3. GET /api/access-requests lista solicitudes internas.
4. GET /api/access-requests/{id} muestra detalle.
5. POST /api/access-requests/{id}/approve cambia pending -> approved.
6. POST /api/access-requests/{id}/reject cambia pending -> rejected.
7. reject exige rejection_reason.
8. estados terminales bloquean nuevas decisiones.
9. approve/reject intentan email de decisión.
10. created/approved/rejected/email_sent/email_skipped/email_send_failed se auditan.
11. UI interna /access-requests permite operar la cola.
```

## Revisión de contratos INTERNAL

Validar especialmente:

- Nexus se mantiene como app INTERNAL.
- UI `/access-requests` es backoffice/control plane.
- No se ha introducido estética premium externa.
- No se usa `PrivateAreaShell`.
- No se copia lenguaje de Synergi/Data Lab como app premium.
- No se acepta `org_id` desde cliente público o frontend.
- `reviewed_by = internal-user` queda tratado como fallback temporal/deuda, no como solución final de identidad.

## Comandos obligatorios

Ejecutar desde raíz del repo:

```bash
git status --short

git log --oneline --decorate -12

git diff --stat origin/main...HEAD

git diff --name-only origin/main...HEAD
```

Backend tests:

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

Frontend validation:

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

npm run build
```

Global lint:

```bash
npm run lint
```

Si falla por deuda previa conocida en `frontend/src/lib/server-auth.ts`, no corregir en esta feature. Documentarlo como no bloqueante si el eslint focalizado y build pasan.

## Inspecciones específicas

Ejecutar:

```bash
# No debe mostrar cambios actuales sin commit
git status --short

# No debe existir diff local en public.py
git diff -- backend/api/routes/public.py

# Comprobar que UI no envía org_id
grep -Rni "org_id" frontend/src/app/\(dashboard\)/access-requests frontend/src/components/access-requests frontend/src/lib/access-requests-api.ts || true

# Comprobar que no se tocó PrivateAreaShell
git diff --name-only origin/main...HEAD | grep -E "PrivateAreaShell|private-area" || true

# Comprobar rutas access request
grep -Rni "access-requests" backend/api frontend/src | sed -n '1,220p'
```

## Entregable requerido

Crear un informe Markdown nuevo:

```text
sdd/features/synergi-datalab-access-requests/QA_CLOSURE_REPORT.md
```

El informe debe contener:

1. resumen ejecutivo;
2. alcance implementado por fases;
3. commits relevantes;
4. archivos principales modificados;
5. validaciones ejecutadas y resultado;
6. estado de tests backend;
7. estado de lint/build frontend;
8. deuda conocida fuera de scope;
9. riesgos restantes;
10. decisión gate:
    - `PASS`
    - `PASS_WITH_NOTES`
    - `BLOCKED`
11. checklist de merge/PR.

## Criterios de Gate

Marcar `PASS` si:

- tests backend target pasan;
- eslint focalizado pasa;
- build frontend pasa;
- `public_cta_lead_capture` no está modificado;
- UI respeta contratos INTERNAL;
- no hay cambios fuera de scope.

Marcar `PASS_WITH_NOTES` si:

- todo lo anterior pasa;
- pero existe deuda previa no bloqueante, como `npm run lint` global fallando por `server-auth.ts`.

Marcar `BLOCKED` si:

- falla build;
- fallan tests target;
- se modificó `/api/public/cta/lead`;
- se tocó PrivateAreaShell;
- se aceptó/envió `org_id` desde frontend público;
- la UI viola contratos INTERNAL;
- hay cambios en Synergi/Data Lab desde esta rama.

## Si encuentras bloqueantes

No hagas cambios grandes.

Reporta:

```text
BLOCKER:
- archivo
- problema
- por qué bloquea
- corrección mínima sugerida
```

Solo aplicar correcciones mínimas si son claramente necesarias y de bajo riesgo.

## Después de crear el informe

Reportar:

```text
git status --short
git diff --stat
sed -n '1,260p' sdd/features/synergi-datalab-access-requests/QA_CLOSURE_REPORT.md
```

No hacer commit sin aprobación explícita.

## Commit sugerido

Si el informe queda correcto:

```text
docs: add access requests QA closure report
```
