PROMPT: Implementa el bloque DB de `ANCLORA-CSL-001`.

CONTEXTO:
- Usa `.antigravity/prompts/currency-surface-localization/feature-currency-surface-localization-shared-context.md`.
- Lee specs en `sdd/features/currency-surface-localization/`.

TAREAS:
1) Crear migración `025_currency_surface_localization.sql`:
- añadir `useful_area_m2`, `built_area_m2`, `plot_area_m2` en `properties`
- checks no negativos
- check lógico `useful_area_m2 <= built_area_m2`
- backfill inicial desde `surface_m2`
2) Crear rollback `026_currency_surface_localization_rollback.sql`.
3) Añadir script SQL de verificación post-migración.

ALCANCE:
- Solo `supabase/migrations/*` y ajustes mínimos en spec-migration si aplica.

STOP:
- No tocar backend/frontend.
- Entregar archivos tocados y detenerse.
