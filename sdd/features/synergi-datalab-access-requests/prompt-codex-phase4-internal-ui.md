# Prompt Codex — Phase 4 Internal Access Requests UI

Repo: `~/projects/anclora-nexus`  
Branch: `sdd/synergi-datalab-access-requests`

## Contexto

Ya están implementadas y comiteadas las fases backend:

```text
d265069 feat: add centralized access requests intake backend
b0759db feat: add internal access request review backend
1eac996 feat: add access request decision emails and audit trail
```

Arquitectura vigente:

- **Nexus** = INTERNAL / control plane / backoffice / solicitudes / revisión / aprobación-rechazo / administración / trazabilidad / emails de decisión.
- **Anclora Synergi** = PREMIUM / experiencia partner / workspace propio en repo separado.
- **Anclora Data Lab** = PREMIUM / experiencia analítica / workspace propio en repo separado.

## Contratos obligatorios

Antes de tocar código, lee y respeta estos contratos. Son obligatorios para esta fase:

```text
AGENTS.md
sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md
sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md
sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md
sdd/contracts/UI-TEXT-FIELD-CONTRACT.md
sdd/contracts/UI-SELECT-FIELD-CONTRACT.md
sdd/contracts/UI-BOOLEAN-FIELD-CONTRACT.md
```

Regla crítica de diseño:

```text
Esta UI pertenece a Nexus INTERNAL.
No debe usar lenguaje visual, copy, layout ni patrones de app PREMIUM externa.
No debe parecer Synergi, Data Lab ni Private Area.
Debe parecer backoffice/control plane interno.
```

Si hay conflicto entre estética premium y contrato internal, prevalece el contrato internal.

## Documentos de feature

Lee también:

```text
sdd/features/synergi-datalab-access-requests/spec-v1.md
sdd/features/synergi-datalab-access-requests/implementation-plan-nexus.md
sdd/features/synergi-datalab-access-requests/audit-legacy-synergi-datalab-features.md
sdd/features/synergi-datalab-access-requests/prompt-codex-phase2-internal-review.md
sdd/features/synergi-datalab-access-requests/prompt-codex-phase3-decision-emails-audit.md
```

Revisa el código backend ya disponible:

```text
backend/api/routes/access_requests.py
backend/models/access_requests.py
backend/services/access_request_service.py
```

Y detecta el patrón frontend real revisando:

```bash
find frontend/src -maxdepth 4 -type f | sort | sed -n '1,240p'
find frontend/src -type f | grep -Ei "table|dialog|modal|drawer|panel|badge|button|select|input|textarea|toast|alert|layout|sidebar|nav"
cat frontend/package.json
```

## Objetivo de esta fase

Implementar una UI interna mínima en Nexus para operar `access_requests`.

Debe permitir:

1. listar solicitudes;
2. filtrar por `status` y `product`;
3. ver detalle básico de una solicitud;
4. aprobar solicitud pendiente;
5. rechazar solicitud pendiente con `rejection_reason`;
6. mostrar feedback de carga/error/éxito;
7. mostrar estado de email si la respuesta lo trae (`decision_email.status`);
8. respetar estrictamente los contratos INTERNAL.

## Fuera de alcance

No implementar todavía:

- UI premium externa.
- cambios en `anclora-synergi`.
- cambios en `anclora-data-lab`.
- provisioning real de cuentas.
- generación de invite tokens.
- edición avanzada de solicitud.
- dashboard complejo.
- métricas avanzadas.
- auditoría visual detallada.
- filtros complejos.
- migraciones nuevas.
- cambios backend salvo bug claro y justificado antes.
- cambios en `/api/public/cta/lead`.
- cambios en `PrivateAreaShell`.
- borrado/deprecación física de legacy.

## Regla crítica: no tocar CTA lead

No tocar la lógica existente de:

```text
POST /api/public/cta/lead
```

Validación obligatoria:

```bash
git diff -- backend/api/routes/public.py | sed -n '1,240p'
```

El bloque `public_cta_lead_capture` no debe aparecer modificado.

## Archivos permitidos

Detecta primero la estructura real del frontend y propone los archivos exactos.

Preferencia esperada, ajustable al patrón existente:

```text
frontend/src/app/access-requests/page.tsx
frontend/src/lib/access-requests-api.ts
frontend/src/components/access-requests/AccessRequestsTable.tsx
frontend/src/components/access-requests/AccessRequestDetailPanel.tsx
frontend/src/components/access-requests/AccessRequestDecisionDialog.tsx
```

Opcional solo si el proyecto usa navegación centralizada:

```text
frontend/src/components/layout/*
frontend/src/app/*navigation*
frontend/src/config/*
```

No tocar:

```text
frontend/src/components/private-area/PrivateAreaShell.tsx
backend/api/routes/public.py
anclora-synergi
anclora-data-lab
```

## Rutas backend ya disponibles

Consumir estos endpoints internos ya implementados:

```text
GET  /api/access-requests?status=pending&product=synergi&limit=50
GET  /api/access-requests/{request_id}
POST /api/access-requests/{request_id}/approve
POST /api/access-requests/{request_id}/reject
```

No crear endpoints nuevos en esta fase.

## Modelo de datos UI

Usar el contrato aproximado de `AccessRequestResponse`:

```text
id
org_id
product
source
status
full_name
email
phone
company
profile_type
service_category
service_summary
intended_use
requested_scope
message
privacy_accepted
gdpr_consent
submission_language
external_id
captcha_provider
captcha_verified
captcha_hostname
reviewed_at
reviewed_by
admin_notes
rejection_reason
invite_token
invite_expires_at
created_at
updated_at
decision_email optional
```

Listado mínimo:

```text
created_at
product
status
full_name
email
company/profile_type
source
```

Detalle mínimo:

```text
full_name
email
product
status
source
company/profile_type
service_category/service_summary
intended_use/requested_scope/message
submission_language
captcha_verified
created_at
reviewed_at/reviewed_by
admin_notes/rejection_reason si existen
```

## UX mínima

La pantalla debe comportarse así:

- estado inicial carga listado;
- filtros `status` y `product`;
- click en una fila abre detalle lateral, panel o sección de detalle;
- si status es `pending`, mostrar acciones:
  - Approve
  - Reject
- Approve pide confirmación y permite `admin_notes` opcional;
- Reject exige `rejection_reason` y permite `admin_notes` opcional;
- al completar approve/reject:
  - refrescar listado/detalle;
  - mostrar mensaje de éxito;
  - mostrar estado de email si la respuesta lo trae.

## Contrato visual INTERNAL

Obligatorio:

- UI de backoffice, sobria y funcional.
- Dark mode existente.
- Jerarquía clara.
- Superficies internas, no premium marketing.
- No usar fondos blancos sin override.
- No introducir dependencia nueva salvo necesidad justificada.
- No copiar estilos Synergi/Data Lab.
- No construir ni reutilizar `PrivateAreaShell`.
- No usar copy tipo “premium experience”, “exclusive workspace”, “partner journey” como lenguaje principal.
- Usar copy operativo: “Access requests”, “Review”, “Approve”, “Reject”, “Status”, “Product”, “Source”.

Antes de crear componentes nuevos, reutilizar componentes internos si existen y respetan contratos.

## Cliente API

Crear o extender cliente frontend, preferiblemente:

```text
frontend/src/lib/access-requests-api.ts
```

Debe incluir:

```text
listAccessRequests(filters)
getAccessRequest(id)
approveAccessRequest(id, payload)
rejectAccessRequest(id, payload)
```

No hardcodear URL absoluta si el proyecto usa rutas relativas.

No aceptar ni enviar `org_id` desde frontend.

Approve payload:

```json
{
  "reviewed_by": "...",
  "admin_notes": "..."
}
```

Reject payload:

```json
{
  "reviewed_by": "...",
  "admin_notes": "...",
  "rejection_reason": "..."
}
```

Si la app ya tiene usuario autenticado disponible, usar ese identificador para `reviewed_by`.

Si no hay patrón claro, usar valor temporal explícito:

```text
internal-user
```

y documentarlo como deuda técnica.

No implementar auth nueva en esta fase.

## Tests / validación

Primero detectar scripts reales:

```bash
cat frontend/package.json
```

Si existe patrón de tests frontend, añadir pruebas mínimas.

Si no hay patrón claro, no inventar infraestructura nueva. Validar con scripts existentes:

```bash
cd frontend
npm run lint
npm run build
```

Usar solo scripts reales existentes.

Si se toca backend por bug justificado, mantener estos tests pasando:

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

## Validaciones obligatorias antes de commit

Ejecutar:

```bash
git status --short

git diff --stat

git diff -- backend/api/routes/public.py | sed -n '1,240p'

cd frontend
npm run lint
npm run build
```

Si hay tests frontend reales, ejecutarlos también.

Criterios:

- `public_cta_lead_capture` no puede aparecer modificado.
- No hay cambios backend salvo justificación previa.
- No hay cambios en Synergi/Data Lab.
- No hay cambios en `PrivateAreaShell`.
- No hay borrado de legacy.
- La UI respeta contratos INTERNAL.

## Entrega esperada antes de aplicar cambios

Antes de modificar archivos, reportar:

1. contratos leídos;
2. archivos exactos que tocarás;
3. patrón frontend detectado;
4. componentes internos reutilizables detectados;
5. si hay navegación centralizada que deba actualizarse;
6. scripts reales de validación frontend;
7. primer diff conceptual.

Después de aplicar cambios, reportar:

1. `git status --short`;
2. `git diff --stat`;
3. diff de `backend/api/routes/public.py` para demostrar que `/cta/lead` no cambió;
4. archivos frontend creados/modificados;
5. scripts ejecutados;
6. resultado de lint/build/tests;
7. riesgos restantes;
8. commit sugerido, sin hacer commit hasta aprobación.

## Commit sugerido

Si todo está correcto:

```text
feat: add internal access requests review UI
```

No hacer commit sin aprobación explícita.
