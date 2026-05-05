PROMPT: Implementa la feature `ANCLORA-CSL-001` (Currency & Surface Localization v1) en modo spec-driven estricto.

CONTEXTO:
- Usa `.antigravity/prompts/currency-surface-localization/feature-currency-surface-localization-shared-context.md`.
- Respeta `.agent/rules/feature-currency-surface-localization.md`.
- No mezclar tareas entre agentes.

ENTRADA:
1) `sdd/features/currency-surface-localization/currency-surface-localization-INDEX.md`
2) `sdd/features/currency-surface-localization/currency-surface-localization-spec-v1.md`
3) `sdd/features/currency-surface-localization/currency-surface-localization-spec-migration.md`
4) `sdd/features/currency-surface-localization/currency-surface-localization-test-plan-v1.md`

SALIDA:
- Ejecutar con orquestación A/B/C/D + gate final.
- 1 prompt = 1 commit.
- Stop obligatorio al cierre de bloque.
