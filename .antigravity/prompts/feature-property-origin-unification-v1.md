PROMPT: Implementa `ANCLORA-POU-001` (Property Origin Unification v1).

CONTEXTO:
- Objetivo: trazabilidad de origen de propiedades + señales de match en ficha.
- Basarse en:
  1) `sdd/features/property-origin-unification-INDEX.md`
  2) `sdd/features/property-origin-unification-spec-v1.md`
  3) `sdd/features/property-origin-unification-spec-migration.md`
  4) `sdd/features/property-origin-unification-test-plan-v1.md`

ENTREGABLES:
1) DB
- Migración para `properties.source_system` y `properties.source_portal` con constraints/índices.

2) Backend
- Create/List properties soportando nuevos campos.
- Validaciones de dominio para ambos campos.

3) Frontend
- Modal de alta/edición con origen y portal.
- Tarjetas de Propiedades con:
  - origen legible
  - portal
  - buyer potencial + match + comisión si existen

4) QA
- Tests y checklist de regresión.

CRITERIOS:
- No romper multitenancy.
- No romper CRUD actual.
- Datos consistentes entre backend/frontend.

