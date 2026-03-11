# Rule - ANCLORA-MTIP-001

## Objetivo

Permitir múltiples packs de inteligencia por `org_id` sin romper el control-plane territorial legacy ni mezclar datos entre tenants.

## Reglas obligatorias

1. Todo pack de inteligencia debe estar scopeado por `org_id`.
2. Ninguna consulta de insights territoriales puede mezclar packs de tenants distintos.
3. Toda UI nueva de esta feature debe usar:
   - `page-title` / `page-subtitle` para cabeceras
   - `surface-primary`, `surface-secondary` y `surface-copy-safe` para frames/cards
4. Toda copy nueva debe entrar en `frontend/src/lib/i18n/translations.ts`.
5. El pack legacy del Suroeste debe seguir disponible como fallback seguro si no existen registros en `intelligence_packs`.
6. El pack activo por tenant debe poder resolverse sin variables globales hardcoded en frontend.
7. Nuevos campos de datos deben tener contrato claro en migración y spec antes de usarse en backend/frontend.

## No hacer

- No sustituir el control-plane territorial existente por una implementación incompatible.
- No depender de `NOTEBOOKLM_NOTEBOOK_ID` como única fuente para todos los tenants.
- No introducir pantallas o cards nuevos fuera de los contratos visuales vigentes.
