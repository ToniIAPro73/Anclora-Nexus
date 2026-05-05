# Prompt Codex — Phase 3 Decision Emails + Audit Trail

Repo: `~/projects/anclora-nexus`  
Branch: `sdd/synergi-datalab-access-requests`

## Contexto

Ya están implementadas y comiteadas las fases anteriores:

```text
d265069 feat: add centralized access requests intake backend
b0759db feat: add internal access request review backend
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
- `sdd/features/synergi-datalab-access-requests/prompt-codex-phase2-internal-review.md`

Revisa también:

- `backend/models/access_requests.py`
- `backend/services/access_request_service.py`
- `backend/api/routes/access_requests.py`
- `backend/services/external_portal_email_service.py`
- `backend/services/email_service.py` o servicio equivalente si existe
- `backend/tests/test_external_portal_email_service.py`
- patrones existentes de `audit_log` o servicios de auditoría

## Objetivo de esta fase

Implementar solo Fase 3 backend para:

1. emails de decisión de access requests;
2. trazabilidad/audit trail mínimo para intake, approve y reject;
3. integración de esos eventos en el servicio canónico `access_request_service.py`.

Esta fase debe completar el flujo backend básico:

```text
public request -> pending -> internal review -> approved/rejected -> decision email -> audit event
```

## Fuera de alcance

No implementar todavía:

- UI frontend.
- cambios en repos `anclora-synergi` o `anclora-data-lab`.
- provisión real de cuentas en Synergi/Data Lab.
- invitaciones/tokens externos, salvo si ya existe una utilidad clara y se mantiene opcional.
- backfill/migración de tablas legacy.
- eliminación/deprecación física de features antiguas.
- cambios en `/api/public/cta/lead`.
- cambios en `PrivateAreaShell`.
- cambios en endpoints públicos de Fase 1 salvo bug justificado.
- cambios en router interno de Fase 2 salvo integración mínima necesaria.

## Regla crítica

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

Toca solo estos archivos salvo justificación objetiva previa:

```text
backend/models/access_requests.py
backend/services/access_request_service.py
backend/services/access_request_email_service.py
backend/services/access_request_audit_service.py
backend/tests/test_access_request_email_service.py
backend/tests/test_access_request_audit_service.py
backend/tests/test_access_request_review_service.py
backend/tests/test_access_request_review_routes.py
```

Opcional, solo si existe patrón real que lo exige:

```text
backend/services/external_portal_email_service.py
backend/services/email_service.py
backend/api/routes/access_requests.py
backend/api/main.py
supabase/migrations/062_access_request_audit_events.sql
```

No tocar `frontend/`.

No tocar `anclora-synergi` ni `anclora-data-lab`.

## Decisión sobre emails

Nexus debe poseer los emails de decisión:

- email de aprobación;
- email de rechazo;
- opcionalmente email de recepción si Fase 1 no lo dejó cubierto.

Synergi/Data Lab podrán tener emails operativos propios en fases posteriores, pero no deben enviar la decisión de acceso si Nexus es el source of truth.

## Reutilización recomendada

Revisar primero:

```text
backend/services/external_portal_email_service.py
backend/tests/test_external_portal_email_service.py
```

Si contiene builders útiles para Synergi/Data Lab, no borrarlo. Preferir una de estas opciones:

1. crear `access_request_email_service.py` reutilizando ideas/código de builders legacy;
2. adaptar mínimamente `external_portal_email_service.py` solo si encaja claramente;
3. dejar legacy intacto y crear servicio nuevo canónico.

Recomendación preferente:

```text
Crear backend/services/access_request_email_service.py
```

con builders puros testeables:

```text
build_access_request_approved_email(record)
build_access_request_rejected_email(record)
```

y una capa de envío separada si ya existe transporte SMTP.

## Contrato de email mínimo

Los builders deben devolver una estructura simple compatible con el patrón existente, por ejemplo:

```python
{
    "to": "user@example.com",
    "subject": "...",
    "text": "...",
    "html": "...",
}
```

Contenido mínimo approval:

- nombre del solicitante;
- producto: Synergi o Data Lab;
- mensaje claro de aprobación;
- indicación de que recibirá próximos pasos o enlace cuando aplique;
- firma Anclora.

Contenido mínimo rejection:

- nombre del solicitante;
- producto: Synergi o Data Lab;
- mensaje claro y profesional;
- `rejection_reason` si está autorizado para mostrarse;
- firma Anclora.

No incluir promesas comerciales ni acceso automático si aún no hay provisioning.

## Envío de emails

Antes de implementar, revisar si existe un servicio de email real.

Buscar patrones:

```bash
grep -RniE "SMTP|send_email|email_service|mail|external_portal_email" backend/services backend/api backend/tests
```

Si existe servicio estable, reutilizarlo.

Si no existe o no está claro, implementar solo builders y dejar un método `send_decision_email(...)` preparado con fallback seguro/logging, sin bloquear approve/reject por fallo de transporte salvo que el patrón existente diga lo contrario.

Regla recomendada:

- fallo al construir email = error de implementación;
- fallo al enviar email = registrar error y devolver warning, pero no revertir la decisión ya persistida en esta fase;
- no hacer rollback manual sin transacciones claras.

## Audit trail mínimo

Implementar trazabilidad para eventos:

```text
access_request.created
access_request.approved
access_request.rejected
```

Opcional si encaja:

```text
access_request.email_send_failed
access_request.email_sent
```

Antes de crear tabla nueva, revisar si existe `audit_log` o servicio equivalente.

Buscar:

```bash
grep -RniE "audit_log|Audit|audit" backend supabase/migrations backend/tests
```

Si ya existe un patrón funcional de auditoría, reutilizarlo.

Si no existe patrón claro, crear una tabla específica mínima:

```text
access_request_audit_events
```

Migración sugerida:

```text
supabase/migrations/062_access_request_audit_events.sql
```

Campos mínimos:

```text
id uuid primary key default gen_random_uuid()
org_id uuid not null
access_request_id uuid not null references access_requests(id) on delete cascade
event_type text not null
actor_id text
actor_type text not null default 'system'
metadata jsonb not null default '{}'::jsonb
created_at timestamptz not null default now()
```

Índices:

```text
(org_id, access_request_id, created_at desc)
(org_id, event_type, created_at desc)
```

RLS:

- enable row level security;
- policy para `service_role` si ese es el patrón usado en `061_access_requests.sql`.

No modificar migraciones antiguas.

## Integración en access_request_service.py

Integrar eventos de auditoría y emails en estos puntos:

### create_public_request

Después de persistir solicitud pending:

```text
log access_request.created
```

No enviar email de recepción salvo que se implemente explícitamente y esté testeado.

### approve_request

Después de persistir `approved`:

```text
log access_request.approved
build/send approval email
log access_request.email_sent o email_send_failed si aplica
```

### reject_request

Después de persistir `rejected`:

```text
log access_request.rejected
build/send rejection email
log access_request.email_sent o email_send_failed si aplica
```

No enviar emails antes de confirmar persistencia.

## Cuidado con transiciones

No romper lo ya implementado:

- solo `pending` puede aprobarse/rechazarse;
- estados terminales siguen bloqueados;
- `rejection_reason` sigue obligatorio;
- `org_id` sigue controlado por backend;
- endpoints públicos siguen intactos;
- `/cta/lead` sigue intacto.

## Modelos opcionales

Si hace falta, añadir modelos Pydantic simples para audit event o email result.

No sobrediseñar.

## Tests requeridos

Mantener todos los tests existentes pasando.

Añadir tests mínimos para email builders:

```text
backend/tests/test_access_request_email_service.py
```

Cobertura mínima:

1. approval email para Synergi incluye `Synergi`, destinatario, subject y nombre;
2. approval email para Data Lab incluye `Data Lab`, destinatario, subject y nombre;
3. rejection email incluye razón de rechazo si se pasa;
4. rejection email no falla si `rejection_reason` está ausente o vacía;
5. HTML y text no están vacíos.

Añadir tests mínimos para audit:

```text
backend/tests/test_access_request_audit_service.py
```

Cobertura mínima:

1. registra `access_request.created`;
2. registra `access_request.approved`;
3. registra `access_request.rejected`;
4. usa `org_id` y `access_request_id`;
5. no acepta event_type vacío.

Actualizar tests de review service:

- approve llama al email service después de actualizar estado;
- reject llama al email service después de actualizar estado;
- si email falla, la decisión persiste y se registra warning/audit failure si se implementa ese comportamiento;
- si audit falla, decidir comportamiento explícito y testearlo. Recomendación: audit failure no debe romper respuesta de usuario en esta fase, pero debe loguearse.

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
  backend/tests/test_access_request_review_routes.py \
  backend/tests/test_access_request_email_service.py \
  backend/tests/test_access_request_audit_service.py
```

Criterios:

- `public_cta_lead_capture` no puede aparecer modificado.
- Tests nuevos y antiguos pasan.
- No hay cambios en frontend.
- No hay cambios en Synergi/Data Lab.
- No hay borrado de legacy.
- Si hay migración `062`, no modifica migraciones anteriores.

## Entrega esperada antes de aplicar cambios

Antes de modificar archivos, reportar:

1. archivos exactos que tocarás;
2. patrón de email detectado;
3. patrón de audit detectado;
4. si crearás o no `062_access_request_audit_events.sql`;
5. cómo actuarás si falla el envío de email;
6. cómo actuarás si falla audit logging;
7. primer diff conceptual.

Después de aplicar cambios, reportar:

1. `git status --short`;
2. `git diff --stat`;
3. diff de `backend/api/routes/public.py` para demostrar que `/cta/lead` no cambió;
4. migraciones nuevas si las hay;
5. tests ejecutados;
6. resultado de tests;
7. riesgos restantes;
8. commit sugerido, sin hacer commit hasta aprobación.

## Commit sugerido

Si todo está correcto:

```text
feat: add access request decision emails and audit trail
```

No hacer commit sin aprobación explícita.
