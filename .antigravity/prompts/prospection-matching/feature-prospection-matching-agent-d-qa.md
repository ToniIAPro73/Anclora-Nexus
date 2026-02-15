PROMPT: Ejecuta QA integral de `ANCLORA-PBM-001` sobre rama integrada.

CONTEXTO:
- `.antigravity/prompts/feature-prospection-matching-shared-context.md`
- Inputs de Agent A/B/C ya mergeados.

LECTURAS:
1) sdd/features/prospection-matching-test-plan-v1.md
2) sdd/features/prospection-matching-test-cases-property-prospection.md
3) sdd/features/prospection-matching-test-cases-buyer-prospection.md
4) sdd/features/prospection-matching-test-cases-matching-engine.md
5) sdd/features/prospection-matching-test-cases-compliance-sources.md

TAREAS:
1) Ejecutar unit/integration/e2e definidos.
2) Validar seguridad: org isolation, roles, errores esperados.
3) Validar compliance: fuentes permitidas, trazabilidad, no automatización irreversible.
4) Validar datos: score bounds, unique links, consistencia breakdown.
5) Emitir reporte final con severidad y recomendación go/no-go.

SALIDA:
- Informe QA final (findings por severidad, evidencia, bloqueantes, residual risk).
