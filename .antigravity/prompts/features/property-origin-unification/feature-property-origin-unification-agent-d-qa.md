PROMPT: Ejecuta QA de `ANCLORA-POU-001`.

CONTEXTO:
- Usa `.antigravity/prompts/feature-property-origin-unification-shared-context.md`.

LECTURAS:
1) `sdd/features/property-origin-unification/property-origin-unification-test-plan-v1.md`
2) `sdd/features/property-origin-unification/property-origin-unification-spec-v1.md`

TAREAS:
1) Validar migración y rollback en entorno de prueba.
2) Validar API create/list/update con nuevos campos.
3) Validar UI en `Propiedades`:
- origen
- portal
- buyer/match/comisión
4) Verificar no-regresión de CRUD propiedades y aislamiento org.

CRITERIOS:
- Sin P0/P1.
- Casos críticos en verde.
- Resultado reproducible.

SALIDA:
- Informe QA con GO/NO-GO y riesgos residuales.

