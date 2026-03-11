---
name: synergi-partner-admission
description: Implementa la admision curada de Synergi con formulario publico, tabla partner_admissions, cola interna y fallback de notificacion.
---

## Leer primero

1. `sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md`
2. `sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md`
3. `sdd/features/private-area-access-architecture/private-area-access-architecture-spec-v1.md`
4. `sdd/features/synergi-partner-admission/synergi-partner-admission-spec-v1.md`
5. `.agent/rules/feature-synergi-partner-admission.md`

## Metodo

1. Crear persistencia `partner_admissions`.
2. Exponer alta publica por `/api/public/partner-admissions`.
3. Exponer cola interna por `/api/partners/admissions`.
4. Conectar `/private-area/partner` con formulario real.
5. Crear vista interna de revision.
6. Añadir i18n, tests backend y validacion frontend.
