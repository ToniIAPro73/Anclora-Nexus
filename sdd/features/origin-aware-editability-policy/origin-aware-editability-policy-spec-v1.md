# Origin Aware Editability Policy v1 - Spec

## 1. Contexto
Nexus mezcla entidades creadas manualmente y entidades ingeridas automáticamente (web CTA, social, widget, PBM). Sin contrato homogéneo de edición, existe riesgo de degradar trazabilidad y coherencia operativa.

## 2. Problema
- Leads de canales automáticos pueden editarse igual que manuales.
- Propiedades con origen no manual tienen reglas parciales y dispersas.
- No hay contrato reusable para UI que permita bloquear/sanitizar de forma consistente.

## 3. Objetivo funcional
Definir política única de editabilidad por origen y aplicarla en modales de edición de leads y propiedades.

## 4. Contrato v1

### 4.1 Leads
- Origen `manual`: todos los campos editables.
- Origen distinto de `manual`: bloquear
  - `name`
  - `email`
  - `phone`
  - `budget`
  - `property_interest`
- Siempre editable:
  - `priority`
  - `status`

### 4.2 Propiedades
- Origen `manual`: todos los campos editables.
- Origen distinto de `manual`: bloquear
  - `source_system`
  - `source_portal`
- Origen `pbm`: además bloquear
  - `match_score`

## 5. Implementación técnica v1
- Nuevo helper: `frontend/src/lib/origin-editability.ts`
  - `buildLeadEditabilityPolicy`
  - `buildPropertyEditabilityPolicy`
  - `sanitizeLeadUpdates`
  - `sanitizePropertyUpdates`
- Integración:
  - `frontend/src/components/modals/LeadFormModal.tsx`
  - `frontend/src/components/modals/PropertyFormModal.tsx`
- i18n:
  - `frontend/src/lib/i18n/translations.ts` en `es/en/de/ru`.
- Backend:
  - `backend/services/origin_editability_policy.py`
  - Enforcement server-side en `supabase_service.update_lead*` y `prospection_service.update_property`.
  - Endpoint update lead con scope:
    - `PATCH /api/leads/{lead_id}`
  - Endpoints de contrato policy:
    - `GET /api/policy?entity=lead|property&source_system=...`
    - `GET /api/policy/leads/{lead_id}`
    - `GET /api/policy/properties/{property_id}`

## 6. Criterios de aceptación
- CA-1: En lead no manual, los campos de captura aparecen bloqueados.
- CA-2: En propiedad widget/pbm, `source_system` y `source_portal` bloqueados.
- CA-3: En propiedad pbm, `match_score` bloqueado.
- CA-4: Aunque el usuario intente modificar campos bloqueados, el payload se sanea y no los sobrescribe.
- CA-5: Mensajería de política visible en UI en 4 idiomas.

## 7. Riesgos
- El enforcement server-side cubre rutas actuales, pero puede existir código legacy que actualice tablas sin pasar por servicios endurecidos.
- Mitigación: centralizar toda escritura de leads/properties en servicios con policy.
