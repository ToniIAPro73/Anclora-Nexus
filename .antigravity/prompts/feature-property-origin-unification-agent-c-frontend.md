PROMPT: Implementa el bloque Frontend de `ANCLORA-POU-001`.

CONTEXTO:
- Usa `.antigravity/prompts/feature-property-origin-unification-shared-context.md`.
- Backend/DB contract ya definido.

LECTURAS:
1) `sdd/features/property-origin-unification/property-origin-unification-spec-v1.md`
2) `sdd/features/property-origin-unification/property-origin-unification-test-plan-v1.md`
3) `.agent/rules/anclora-nexus.md`

TAREAS:
1) Modal de propiedades:
- campo `origen` (`manual`, `widget`, `pbm`)
- campo `portal/fuente` (texto o select)
2) Página `Propiedades`:
- badges de origen legible
- badge portal
- mostrar buyer potencial / `% match` / comisión cuando haya data
3) Layout:
- evitar solapes
- responsive limpio
4) Mantener comportamiento actual de edición/borrado/paginación.

CRITERIOS:
- UX clara en un vistazo.
- Sin regresión visual.
- Lint/typecheck del frontend en verde.

SALIDA:
- Cambios UI + evidencia de validación.

