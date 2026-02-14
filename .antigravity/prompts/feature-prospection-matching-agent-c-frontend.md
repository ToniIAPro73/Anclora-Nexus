PROMPT: Implementa frontend mínimo funcional para `ANCLORA-PBM-001`.

CONTEXTO:
- `.antigravity/prompts/feature-prospection-matching-shared-context.md`
- Consumir contrato API congelado de Agent B.

LECTURAS:
1) sdd/features/prospection-matching-spec-v1.md
2) sdd/features/prospection-matching-test-plan-v1.md
3) .agent/rules/anclora-nexus.md

TAREAS:
1) Vista de propiedades prospectadas (listado, detalle, filtros).
2) Vista de compradores prospectados (perfil, requisitos, presupuesto, zonas).
3) Vista de matches con score + breakdown + acciones comerciales.
4) Estados de carga, vacío, error, éxito.
5) UX de priorización (orden por match_score/high_ticket_score).
6) Bloquear acciones no permitidas por rol.

CRITERIOS DE ACEPTACIÓN:
- Flujo Owner/Manager completo.
- Mensajes accionables (sin errores crudos).
- Sin scroll/overflow roto en vistas principales.
- Consistencia visual con diseño actual Anclora.

SALIDA:
- Código frontend + evidencias de flujo + checklist UX.
