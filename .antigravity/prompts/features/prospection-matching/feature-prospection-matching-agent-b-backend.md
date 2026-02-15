PROMPT: Implementa backend para `ANCLORA-PBM-001` usando contrato DB/API congelado.

CONTEXTO:
- `.antigravity/prompts/feature-prospection-matching-shared-context.md`
- Migraciones de Agent A ya definidas.

LECTURAS:
1) sdd/features/prospection-matching-spec-v1.md
2) sdd/features/prospection-matching-test-plan-v1.md
3) .agent/rules/feature-prospection-matching.md

TAREAS:
1) Endpoints CRUD de prospected properties.
2) Endpoints CRUD de buyer profiles.
3) Endpoints de matching:
- recompute
- list
- update status/notes
4) Servicio de scoring con breakdown explicable.
5) Validación de permisos por rol + org isolation.
6) Errores consistentes (400/401/403/404/409/422/500) y mensajes claros.

CRITERIOS DE ACEPTACIÓN:
- Contrato API estable y documentado.
- Sin fugas cross-org.
- Score reproducible y acotado [0,100].
- Logs funcionales para auditoría comercial.

SALIDA:
- Código backend + tests unit/integration mínimos + guía de prueba manual.
