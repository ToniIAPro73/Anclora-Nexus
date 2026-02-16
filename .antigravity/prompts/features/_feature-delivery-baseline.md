# BASELINE OBLIGATORIO DE ENTREGA (A/B/C/D)

Uso obligatorio:
- Referenciar este baseline en `shared-context.md` y/o `master-parallel.md` de toda feature nueva.
- Este baseline aplica desde Agent A y no solo en QA.

## 1) Entorno y fuente de verdad (obligatorio)
- Leer siempre `.env` y `frontend/.env.local` antes de implementar o validar.
- Backend y frontend deben apuntar al mismo proyecto:
  - `SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
- Prohibido hardcodear `project_ref`, `org_id` o URLs de Supabase.

## 2) Regla de migraciones (obligatoria)
- Agent A genera migracion + rollback + verify SQL.
- La migracion debe aplicarse en el entorno objetivo antes de Agent B/C/D.
- Si migracion no aplicada: bloquear B/C/D con estado `MIGRATION_NOT_APPLIED`.

## 3) Reglas UX/UI obligatorias (Agent C)
- Mantener tipografia, espaciados y componentes del design system existente.
- Evitar scroll vertical innecesario en desktop (priorizar estructura eficiente).
- Evitar overflow/solapes en cards, tablas, filtros, sidebars y dropdowns.
- Respetar responsive en desktop + mobile.
- No introducir fuentes nuevas ni estilos aislados.

## 4) Reglas i18n obligatorias (Agent C + D)
- Todo texto nuevo/modificado visible en UI debe ir por i18n.
- Cobertura minima obligatoria: `es`, `en`, `de`, `ru`.
- Prohibido texto hardcodeado en componentes/paginas.

## 5) Criterios de bloqueo (NO-GO automatico)
- `ENV_MISMATCH`
- `MIGRATION_NOT_APPLIED`
- `I18N_MISSING_KEYS`
- `VISUAL_REGRESSION_P0` (solape, overflow o layout roto en vista principal)

