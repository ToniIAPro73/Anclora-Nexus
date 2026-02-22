# Origin Aware Editability Policy v1 - Test Plan

## 1. Objetivo
Validar que la política de editabilidad por origen se aplica y sanea cambios en leads y propiedades.

## 2. Casos funcionales

1. Lead manual editable completo
- Precondición: lead `source_system=manual`.
- Resultado: todos los campos del modal editables.

2. Lead auto-ingestado
- Precondición: lead `source_system=cta_web` (o `social/import/referral/partner`).
- Resultado:
  - `name/email/phone/budget/property_interest` bloqueados.
  - `priority/status` editables.
  - se muestra aviso de política.

3. Propiedad manual
- Precondición: property `source_system=manual`.
- Resultado: campos de origen y score editables.

4. Propiedad widget
- Precondición: property `source_system=widget`.
- Resultado:
  - `source_system/source_portal` bloqueados.
  - `match_score` editable.
  - se muestra aviso de política.

5. Propiedad pbm
- Precondición: property `source_system=pbm`.
- Resultado:
  - `source_system/source_portal/match_score` bloqueados.
  - se muestra aviso específico PBM.

6. Saneo de payload
- Simular payload con campos bloqueados.
- Resultado: `sanitizeLeadUpdates` / `sanitizePropertyUpdates` eliminan campos bloqueados antes de `update*`.

7. Policy API (backend)
- `GET /api/policy?entity=lead&source_system=cta_web` devuelve `locked_fields` esperados.
- `GET /api/policy?entity=property&source_system=pbm` incluye bloqueo de scoring.
- `PATCH /api/leads/{lead_id}` no sobrescribe campos bloqueados si el lead no es manual.

## 3. i18n
- Verificar avisos y labels nuevos en `es/en/de/ru`.
- No deben quedar claves visibles ni hardcodes nuevos en UI añadida.

## 4. Regresión
- Crear/editar lead manual sigue funcionando.
- Crear/editar propiedad manual sigue funcionando.
- Lint en archivos modificados pasa sin errores.
