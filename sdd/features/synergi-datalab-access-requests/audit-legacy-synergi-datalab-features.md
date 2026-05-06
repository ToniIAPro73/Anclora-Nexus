# Audit — Legacy Synergi/Data Lab Features

Estado: draft operativo  
Fecha: 2026-05-05  
Repo principal: `ToniIAPro73/Anclora-Nexus`  
Rama: `sdd/synergi-datalab-access-requests`

## 1. Objetivo

Auditar las features antiguas de Nexus relacionadas con Synergi, Data Lab, private area, partner workspaces y buyer partner network para decidir qué debe reutilizarse, migrarse, deprecarse o mantenerse.

Esta auditoría se apoya en la arquitectura actualmente decidida:

- **Anclora Nexus**: aplicación INTERNAL, control plane, backoffice, aprobación/rechazo, administración, trazabilidad y emails de decisión.
- **Anclora Synergi**: aplicación PREMIUM independiente para experiencia partner y workspace propio.
- **Anclora Data Lab**: aplicación PREMIUM independiente para experiencia analítica y workspace propio.

## 2. Conclusión ejecutiva

No se recomienda revertir todo ni empezar desde cero.

Sí se recomienda una migración controlada porque existen piezas valiosas ya implementadas, pero mezcladas bajo una arquitectura anterior donde Nexus también actuaba como portal premium externo.

La situación actual contiene duplicidad funcional entre los tres repos:

- Nexus conserva features, migraciones, servicios y UI de private area relacionadas con Synergi/Data Lab.
- Synergi ya tiene solicitud pública, backoffice de admisiones, decisión, login, activación, workspace, assets, referrals y emails.
- Data Lab ya tiene solicitud pública, backoffice de access requests, login, workspace y SQL propio.

La arquitectura correcta debe convertir Nexus en la única fuente de verdad para solicitudes y decisiones, mientras Synergi/Data Lab consumen el resultado y mantienen solo la experiencia premium correspondiente.

## 3. Principio rector

La regla de separación queda fijada así:

```text
Nexus = request intake + review + decision + audit + decision emails + internal administration
Synergi = partner experience + workspace + profile + assets + referrals + opportunities UI
Data Lab = analytical experience + workspace + intelligence assets + user-facing analytical UI
```

No debe existir lógica de aprobación/rechazo duplicada en Synergi ni en Data Lab una vez consolidada la feature `synergi-datalab-access-requests`.

## 4. Inventario Nexus auditado

Features antiguas Nexus relacionadas:

- `sdd/features/synergi-partner-admission`
- `sdd/features/synergi-partner-workspace`
- `sdd/features/synergi-partner-workspace-v2`
- `sdd/features/synergi-partner-workspace-v4`
- `sdd/features/synergi-shared-opportunities`
- `sdd/features/data-lab-portal`
- `sdd/features/data-lab-selective-access`
- `sdd/features/private-area-access-architecture`
- `sdd/features/buyer-partner-network-management`
- `sdd/features/buyer-partner-network-management-v2`

Servicios backend relevantes:

- `backend/services/external_portal_email_service.py`
- `backend/services/partner_workspace_service.py`
- `backend/services/partner_network_service.py`

Tests relevantes:

- `backend/tests/test_external_portal_email_service.py`
- `backend/tests/test_partner_workspace_service.py`
- `backend/tests/test_partner_network_service.py`
- `backend/tests/test_partner_network_routes.py`
- `backend/tests/test_public_partner_workspace_routes.py`

Rutas relevantes:

- `backend/api/routes/partners.py`
- `backend/api/routes/public.py`

Frontend relevante:

- `frontend/src/components/private-area/PrivateAreaShell.tsx`
- `frontend/src/components/private-area/RecaptchaPanel.tsx`
- `frontend/src/lib/partner-workspace-api.ts`
- `frontend/src/lib/partner-network-api.ts`
- `frontend/src/lib/private-area-access.ts`
- `frontend/src/app/private-area/page.tsx`
- `frontend/src/app/private-area/agent/page.tsx`

Migraciones Nexus relacionadas:

- `049_synergi_partner_admissions.sql`
- `050_synergi_partner_workspace_v1.sql`
- `051_synergi_partner_network_management.sql`
- `052_data_lab_selective_access.sql`
- `053_synergi_partner_workspace_v2.sql`
- `054_synergi_shared_opportunities.sql`
- `055_public_portal_submission_hardening.sql`

## 5. Inventario Synergi auditado

El repo `anclora-synergi` ya contiene implementación propia para:

- landing pública premium
- solicitud pública de partnership
- ruta `src/app/api/partner-admission/route.ts`
- rutas `src/app/api/partner-admissions/...`
- panel `src/app/partner-admissions/page.tsx`
- login interno de admisiones
- analítica/observabilidad de admisiones
- activación partner
- login partner
- workspace partner
- assets partner
- referrals
- opportunities
- emails Synergi
- SQL propio `db/partner_admissions.sql`

Esto confirma que Synergi no está vacío. Ya contiene parte de lo que antes Nexus intentaba cubrir.

## 6. Inventario Data Lab auditado

El repo `anclora-data-lab` ya contiene implementación propia para:

- landing pública premium
- solicitud pública de acceso
- ruta `src/app/api/access-request/route.ts`
- rutas `src/app/api/access-requests/...`
- panel `src/app/access-requests/page.tsx`
- login interno de revisión
- login usuario aprobado
- workspace Data Lab
- SQL propio `db/datalab_access.sql`
- store `src/lib/datalab-access-store.ts`
- auth `src/lib/datalab-auth.ts`

Esto confirma que Data Lab también tiene duplicidad de backoffice y decisión frente al nuevo papel de Nexus.

## 7. Riesgo principal detectado

Actualmente hay riesgo de tres fuentes de verdad:

```text
Nexus legacy tables/routes
Synergi partner_admissions + local decision workflow
Data Lab datalab_access_requests + local decision workflow
```

Eso puede provocar:

- estados divergentes
- emails duplicados o contradictorios
- aprobaciones en una app no reflejadas en otra
- tokens/invitaciones incompatibles
- auditoría fragmentada
- dificultad para administrar el funnel premium desde un único backoffice

## 8. Matriz de decisión por feature Nexus

| Feature Nexus | Estado | Decisión | Motivo |
|---|---|---|---|
| `synergi-partner-admission` | Legacy útil | Migrar a `access_requests` | La admisión Synergi debe entrar al modelo canónico de solicitudes Nexus. |
| `data-lab-selective-access` | Legacy útil | Migrar a `access_requests` | La solicitud Data Lab debe unificarse en Nexus. |
| `private-area-access-architecture` | Arquitectura anterior | Deprecated | Representa Nexus como gateway/portal premium externo. Ya no encaja. |
| `data-lab-portal` | UI premium externa | Migrar/deprecar en Nexus | La experiencia Data Lab debe vivir en `anclora-data-lab`. |
| `synergi-partner-workspace` | UI/workspace externo | Migrar/deprecar en Nexus | Workspace partner debe vivir en `anclora-synergi`. |
| `synergi-partner-workspace-v2` | Evolución workspace | Migrar/deprecar en Nexus | Misma razón. Puede servir como referencia funcional. |
| `synergi-partner-workspace-v4` | Shell premium consolidado | Migrar/deprecar en Nexus | Encaja en apps premium, no en Nexus. |
| `synergi-shared-opportunities` | Concepto mixto | Dividir | Administración interna en Nexus; consumo/respuesta partner en Synergi. |
| `buyer-partner-network-management` | Backoffice interno | Mantener en Nexus | Gestión de red, trust, notas y relación buyer-side son control plane. |
| `buyer-partner-network-management-v2` | Backoffice interno | Mantener en Nexus | Extiende capacidades internas aprovechables. |

## 9. Matriz de decisión por archivo/servicio Nexus

| Archivo | Decisión | Acción recomendada |
|---|---|---|
| `external_portal_email_service.py` | Reutilizar/refactorizar | Convertir en `access_request_email_service.py` o integrarlo en servicio de access requests. |
| `partner_workspace_service.py` | Dividir | Extraer invitaciones/tokens/decisión a Nexus; mover lógica de workspace a Synergi o dejar deprecated. |
| `partner_network_service.py` | Mantener | Conservar como servicio interno de gestión de red partner. |
| `backend/api/routes/partners.py` | Mantener/adaptar | Debe servir solo backoffice interno, no portal premium externo. |
| `backend/api/routes/public.py` | Revisar | Mantener endpoints públicos solo si son wrappers hacia access requests. Deprecar workspace público en Nexus. |
| `PrivateAreaShell.tsx` | Deprecated | No debe seguir como shell premium externo activo en Nexus. |
| `RecaptchaPanel.tsx` | Reutilizable parcialmente | Puede servir como referencia de validación captcha, pero UI premium externa debe salir de Nexus. |
| `partner-workspace-api.ts` | Deprecated/adaptar | No debe exponer workspace premium desde Nexus. |
| `partner-network-api.ts` | Mantener | Cliente para backoffice interno de partner network. |
| `private-area-access.ts` | Deprecated/adaptar | Vinculado a private area antigua. Revisar antes de borrar. |

## 10. Decisiones para Synergi

Mantener en `anclora-synergi`:

- landing premium
- identidad visual y UI premium
- partner login
- first-access activation
- private workspace
- partner profile
- partner assets
- partner referrals
- partner opportunities
- operational emails propios del producto si no son emails de decisión de admisión

Deprecar o adaptar en `anclora-synergi`:

- backoffice local de admisiones
- flujo local de aprobación/rechazo
- generación autónoma de invitaciones si no viene de Nexus
- emails de aceptación/rechazo si la decisión pasa a Nexus
- tabla local `partner_admissions` como fuente principal de decisión

Destino recomendado:

```text
Synergi debe enviar solicitudes a Nexus o consumir una API Nexus.
Synergi debe leer/usar invitaciones, tokens o estados emitidos por Nexus.
Synergi no debe decidir admisiones por su cuenta.
```

## 11. Decisiones para Data Lab

Mantener en `anclora-data-lab`:

- landing premium
- identidad visual y UI Data Lab
- login usuario aprobado
- workspace analítico
- contenido y assets Data Lab
- auth de usuario final aprobado

Deprecar o adaptar en `anclora-data-lab`:

- backoffice local de access requests
- flujo local de aprobación/rechazo
- creación autónoma de cuentas desde decisión local si contradice Nexus
- emails de aceptación/rechazo si Nexus pasa a decidir
- tabla local `datalab_access_requests` como fuente principal de decisión

Destino recomendado:

```text
Data Lab debe enviar solicitudes a Nexus o consumir una API Nexus.
Data Lab debe crear/activar usuario final a partir de una aprobación emitida por Nexus.
Data Lab no debe decidir accesos por su cuenta.
```

## 12. Tratamiento de migraciones antiguas Nexus

No borrar migraciones `049–055` sin comprobar si ya fueron aplicadas en Supabase.

Regla segura:

1. Si una migración ya fue aplicada, se conserva como histórico.
2. No se modifica una migración ya aplicada.
3. Se crea una nueva migración canónica para `access_requests`.
4. Si hay datos reales, se crea migración de backfill desde tablas legacy.
5. Si no hay datos reales, se documenta legacy y se abandona su uso funcional.

Tablas legacy candidatas a migración/backfill:

- `partner_admissions`
- `synergi_partner_workspaces`
- `synergi_partner_opportunities`
- `synergi_partner_shared_opportunities`
- `data_lab_access_requests`
- `data_lab_access_workspaces`

## 13. Modelo canónico recomendado en Nexus

La feature `synergi-datalab-access-requests` debe introducir o consolidar una tabla canónica:

```text
access_requests
```

Campos mínimos:

```text
id
product: synergi | data_lab
source: landing | synergi_app | data_lab_app
external_id
full_name
email
company_or_organization
profile_label
service_category
service_summary
intended_use
message
locale
status: pending | approved | rejected | cancelled
review_notes
decision_reason
reviewed_by
reviewed_at
created_at
updated_at
audit metadata
captcha metadata
```

Reglas:

- `source = synergi_app` exige `product = synergi`.
- `source = data_lab_app` exige `product = data_lab`.
- `source = landing` puede crear solicitudes Synergi o Data Lab.
- Data Lab debe aportar `intended_use` o `message`.
- Synergi debe aportar `service_category` y `service_summary`.

## 14. API recomendada Nexus

Endpoints canónicos:

```text
POST /api/public/access-requests
GET /api/access-requests
GET /api/access-requests/{id}
POST /api/access-requests/{id}/approve
POST /api/access-requests/{id}/reject
```

Wrappers temporales opcionales:

```text
POST /api/public/data-lab-access-requests
POST /api/public/partner-admissions
```

Los wrappers solo deben transformar payloads legacy al modelo `access_requests`. No deben contener lógica de decisión propia.

## 15. Emails

Nexus debe poseer los emails de decisión:

- recepción de solicitud
- aprobación
- rechazo
- reemisión de invitación/token si procede

Synergi/Data Lab pueden mantener emails operativos internos posteriores:

- aviso de asset disponible
- notificación de workspace
- mensajes de actividad partner
- avisos de contenido Data Lab

`external_portal_email_service.py` debe revisarse como base para:

```text
access_request_email_service.py
```

## 16. Plan de deprecación recomendado

Fase 1 — Documental:

- Añadir este informe de auditoría.
- Marcar SDD antiguas como legacy/deprecated sin borrar.
- Actualizar índices que aún apunten a `.antigravity` si procede.

Fase 2 — Modelo canónico Nexus:

- Crear migración nueva para `access_requests`.
- Crear modelos Pydantic.
- Crear servicio `access_request_service.py`.
- Crear servicio de emails de decisión.
- Crear rutas públicas e internas.

Fase 3 — Adaptación Synergi/Data Lab:

- Synergi: cambiar `partner-admission` para enviar a Nexus o crear wrapper compatible.
- Data Lab: cambiar `access-request` para enviar a Nexus o crear wrapper compatible.
- Mantener workspace y login propios.

Fase 4 — Backoffice único:

- Desactivar o deprecar backoffices locales de Synergi/Data Lab.
- Mantenerlos solo como pantallas temporales si son necesarias durante migración.

Fase 5 — Limpieza Nexus:

- Retirar exposición activa de `/private-area/...` en Nexus.
- Deprecar `PrivateAreaShell`.
- Mantener `partner_network` como backoffice interno.
- Revisar tests legacy y adaptarlos a `access_requests`.

## 17. Qué no hacer

No hacer:

- Borrar migraciones antiguas sin comprobar estado de base de datos.
- Mantener aprobación/rechazo en tres repos.
- Permitir que Synergi o Data Lab envíen emails de decisión si Nexus ya decide.
- Mantener UI premium externa dentro de Nexus.
- Mezclar la implementación de workspace partner con el backoffice interno.
- Cambiar contratos premium dentro de Nexus; los contratos premium viven en sus repos correspondientes.

## 18. Estado recomendado por bloque

```text
Nexus / access_requests: construir ahora
Nexus / partner_network: mantener
Nexus / old private-area: deprecated
Nexus / old synergi workspace: deprecated or reference only
Nexus / old data lab portal: deprecated or reference only
Synergi / workspace: mantener y evolucionar
Synergi / local admissions backoffice: deprecar/adaptar
Data Lab / workspace: mantener y evolucionar
Data Lab / local access backoffice: deprecar/adaptar
```

## 19. Recomendación final

La mejor decisión es conservar el aprendizaje y parte de la implementación, pero centralizar el workflow de acceso en Nexus.

Decisión final propuesta:

```text
No revertir todo.
No empezar desde cero.
Crear access_requests como capa canónica en Nexus.
Migrar o adaptar las solicitudes antiguas.
Mantener Synergi/Data Lab como apps premium de experiencia, no como centros de decisión.
```

## 20. Prompt operativo sugerido para Gemini

```text
Estás trabajando en el repo ~/projects/anclora-nexus, rama sdd/synergi-datalab-access-requests.

Lee primero:
- AGENTS.md
- sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md
- sdd/features/synergi-datalab-access-requests/spec-v1.md
- sdd/features/synergi-datalab-access-requests/implementation-plan-nexus.md
- sdd/features/synergi-datalab-access-requests/audit-legacy-synergi-datalab-features.md

Objetivo:
Implementar la feature centralizada de access requests sin mezclar Nexus con la experiencia premium externa.

Reglas:
- Nexus es INTERNAL/control plane.
- Synergi y Data Lab son apps PREMIUM independientes.
- No crear UI premium externa nueva dentro de Nexus.
- No borrar migraciones antiguas sin confirmación.
- Reutilizar servicios legacy solo si encajan con aprobación, trazabilidad, emails o administración interna.
- Deprecar o aislar lo que pertenezca a workspace premium externo.
- Trabajar paso a paso y mostrar diff antes de commit.
```
