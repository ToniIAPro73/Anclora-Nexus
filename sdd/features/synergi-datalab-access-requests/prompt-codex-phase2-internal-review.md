# Prompt Codex — Phase 2 Internal Review Backoffice

Repo: `~/projects/anclora-nexus`  
Branch: `sdd/synergi-datalab-access-requests`

## Contexto

Ya está implementada y comiteada la Fase 1 backend para solicitudes centralizadas de acceso Synergi/Data Lab.

Commit base esperado:

```text
d265069 feat: add centralized access requests intake backend
```

Arquitectura vigente:

- **Nexus** = INTERNAL / control plane / backoffice / solicitudes / revisión / aprobación-rechazo / administración / trazabilidad / emails de decisión.
- **Anclora Synergi** = PREMIUM / experiencia partner / workspace propio en repo separado.
- **Anclora Data Lab** = PREMIUM / experiencia analítica / workspace propio en repo separado.

Lee primero:

- `AGENTS.md`
- `sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`
- `sdd/features/synergi-datalab-access-requests/spec-v1.md`
- `sdd/features/synergi-datalab-access-requests/implementation-plan-nexus.md`
- `sdd/features/synergi-datalab-access-requests/audit-legacy-synergi-datalab-features.md`
- `sdd/features/synergi-datalab-access-requests/prompt-gemini-phase1-backend.md`

También revisa el commit actual de Fase 1:

- `backend/models/access_requests.py`
- `backend/services/access_request_service.py`
- `backend/api/routes/public.py`
- `backend/tests/test_access_request_service.py`
- `backend/tests/test_public_access_requests.py`
- `supabase/migrations/061_access_requests.sql`

## Objetivo de esta fase

Implementar solo la Fase 2 mínima de revisión interna en Nexus.

Debe permitir desde backend interno:

1. listar solicitudes `access_requests`;
2. ver detalle de una solicitud;
3. aprobar una solicitud pendiente;
4. rechazar una solicitud pendiente;
5. registrar datos de revisión:
   - `reviewed_at`
   - `reviewed_by`
   - `admin_notes`
   - `rejection_reason` cuando aplique;
6. mantener estado canónico:
   - `pending`
   - `approved`
   - `rejected`
   - `cancelled`.

## Fuera de alcance

No implementar todavía:

- UI frontend.
- emails de decisión.
- integración con repos `anclora-synergi` o `anclora-data-lab`.
- generación real de cuentas en Synergi/Data Lab.
- migración/backfill de tablas legacy.
- borrado/deprecación física de features antiguas.
- cambios en `/api/public/cta/lead`.
- cambios en `PrivateAreaShell`.
- cambios en los endpoints públicos ya cerrados en Fase 1, salvo bugs estrictamente necesarios y justificados.

## Regla crítica

No tocar la lógica existente de:

```text
POST /api/public/cta/lead
```

Ese endpoint ya sufrió una regresión accidental en Fase 1 y fue restaurado. En esta fase no debe aparecer modificado en el diff.

Validación obligatoria:

```bash
git diff -- backend/api/routes/public.py | sed -n '1,240p'
```

El bloque `public_cta_lead_capture` no debe aparecer como cambiado.

## Archivos permitidos

Toca solo estos archivos salvo justificación objetiva previa:

```text
backend/models/access_requests.py
backend/services/access_request_service.py
backend/api/routes/access_requests.py
backend/api/main.py
backend/tests/test_access_request_review_service.py
backend/tests/test_access_request_review_routes.py
```

Opcional, solo si es imprescindible:

```text
backend/api/routes/public.py
```

Pero si se toca `public.py`, no puede modificarse `/cta/lead`.

## Decisión sobre rutas

Crear preferentemente un router nuevo:

```text
backend/api/routes/access_requests.py
```

No meter la revisión interna en `public.py`.

Registrar el router en:

```text
backend/api/main.py
```

Solo si no existe ya un patrón equivalente para registrar routers internos.

## Endpoints internos esperados

Propuesta de rutas:

```text
GET  /api/access-requests
GET  /api/access-requests/{request_id}
POST /api/access-requests/{request_id}/approve
POST /api/access-requests/{request_id}/reject
```

Si el proyecto usa otro prefijo para routers internos, respétalo, pero documenta la decisión.

## Contrato funcional

### Listado

`GET /api/access-requests`

Debe soportar filtros mínimos:

```text
status optional
product optional
limit optional, default razonable
```

Debe devolver solicitudes ordenadas por `created_at desc`.

### Detalle

`GET /api/access-requests/{request_id}`

Debe devolver 404 si no existe.

### Aprobar

`POST /api/access-requests/{request_id}/approve`

Reglas:

- Solo puede aprobar solicitudes en `pending`.
- Si la solicitud ya está `approved`, `rejected` o `cancelled`, devolver error 409.
- Setear:
  - `status = approved`
  - `reviewed_at = now`
  - `reviewed_by`
  - `admin_notes` si se envía
- No enviar emails todavía.
- No crear cuenta externa todavía.
- No generar invite token todavía salvo que ya esté claramente previsto en el modelo y tests; preferible dejarlo para fase posterior.

### Rechazar

`POST /api/access-requests/{request_id}/reject`

Reglas:

- Solo puede rechazar solicitudes en `pending`.
- Si la solicitud ya está `approved`, `rejected` o `cancelled`, devolver error 409.
- Requiere `rejection_reason` no vacío.
- Setear:
  - `status = rejected`
  - `reviewed_at = now`
  - `reviewed_by`
  - `admin_notes` si se envía
  - `rejection_reason`
- No enviar emails todavía.

## Modelos Pydantic esperados

Extender `backend/models/access_requests.py` con modelos similares a:

```python
class AccessRequestReviewDecision(BaseModel):
    reviewed_by: str
    admin_notes: str | None = None

class AccessRequestRejectDecision(AccessRequestReviewDecision):
    rejection_reason: str

class AccessRequestResponse(BaseModel):
    id: str
    org_id: str
    product: AccessRequestProduct
    source: AccessRequestSource
    status: AccessRequestStatus
    full_name: str
    email: EmailStr
    # incluir campos relevantes ya existentes
```

No sobre-diseñar. Mantener Fase 2 mínima.

## Servicio esperado

Extender `backend/services/access_request_service.py` con métodos similares a:

```text
list_requests(...)
get_request(request_id)
approve_request(request_id, decision)
reject_request(request_id, decision)
```

Reglas del servicio:

- La transición de estado vive en el servicio, no en la ruta.
- Las rutas solo parsean input y traducen errores a HTTP.
- No repetir lógica de validación en varias capas.
- No permitir transición desde estados terminales.

Estados terminales para esta fase:

```text
approved
rejected
cancelled
```

## Errores recomendados

Usar excepciones internas simples en el servicio, por ejemplo:

```text
AccessRequestNotFoundError
AccessRequestInvalidTransitionError
```

Mapeo HTTP:

```text
not found -> 404
invalid transition -> 409
validation error -> 422 o 400 según patrón existente
unexpected -> 500
```

## Seguridad / autorización

Fase 2 puede usar el patrón interno existente del backend si ya existe una dependencia clara.

Antes de implementar, revisar:

- `backend/api/deps.py`
- routers internos existentes como `partners.py`, `leads.py`, `sellers.py`, `memberships.py`

Si el proyecto ya usa `get_current_user`, `get_org_id` o equivalente, seguir ese patrón.

Si no hay patrón claro, no inventar auth compleja. Documentar la limitación en comentarios/tests y dejarlo preparado para fase posterior.

Importante:

- No exponer estos endpoints como públicos.
- No añadirlos a `public.py`.
- No aceptar `org_id` arbitrario del cliente para operaciones internas.

## Tests requeridos

Crear tests mínimos:

```text
backend/tests/test_access_request_review_service.py
backend/tests/test_access_request_review_routes.py
```

Cobertura mínima servicio:

1. listar solicitudes filtrando por status/product;
2. get por id existente;
3. get por id inexistente lanza not found;
4. aprobar pending -> approved;
5. rechazar pending -> rejected con rejection_reason;
6. rechazar sin rejection_reason falla;
7. aprobar solicitud ya approved/rejected/cancelled falla con invalid transition;
8. rechazar solicitud ya approved/rejected/cancelled falla con invalid transition.

Cobertura mínima rutas:

1. `GET /api/access-requests` responde 200 con lista mockeada;
2. `GET /api/access-requests/{id}` responde 200;
3. `GET /api/access-requests/{id}` not found responde 404;
4. approve responde 200;
5. reject responde 200;
6. invalid transition responde 409.

Mantener tests de Fase 1 pasando:

```bash
source backend/venv/bin/activate
PYTHONPATH=. python3 -m pytest \
  backend/tests/test_access_request_service.py \
  backend/tests/test_public_access_requests.py \
  backend/tests/test_access_request_review_service.py \
  backend/tests/test_access_request_review_routes.py
```

## Validaciones obligatorias antes de commit

Ejecutar:

```bash
git status --short

git diff --stat

git diff -- backend/api/routes/public.py | sed -n '1,240p'

source backend/venv/bin/activate
PYTHONPATH=. python3 -m pytest \
  backend/tests/test_access_request_service.py \
  backend/tests/test_public_access_requests.py \
  backend/tests/test_access_request_review_service.py \
  backend/tests/test_access_request_review_routes.py
```

Criterios:

- `public_cta_lead_capture` no puede aparecer modificado.
- Tests nuevos y antiguos pasan.
- No hay cambios en frontend.
- No hay cambios en Synergi/Data Lab.
- No hay borrado de legacy.

## Entrega esperada antes de aplicar cambios

Antes de modificar archivos, reportar:

1. archivos exactos que tocarás;
2. patrón de router interno detectado;
3. si `backend/api/main.py` necesita registrar router;
4. cómo modelarás errores 404/409;
5. primer diff conceptual.

Después de aplicar cambios, reportar:

1. `git status --short`;
2. `git diff --stat`;
3. diff de `backend/api/routes/public.py` para demostrar que `/cta/lead` no cambió;
4. tests ejecutados;
5. resultado de tests;
6. riesgos restantes;
7. commit sugerido, sin hacer commit hasta aprobación.

## Commit sugerido

Si todo está correcto:

```text
feat: add internal access request review backend
```

No hacer commit sin aprobación explícita.
