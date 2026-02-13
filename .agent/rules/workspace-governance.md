---
trigger: always_on
---

---
trigger: always_on
---

# Workspace Governance — Anclora Nexus (SDD v2)

## Jerarquía normativa (orden de prioridad)
1) `constitution-canonical.md` (NORMA SUPREMA)
2) `sdd/core/product-spec-v0.md` (producto/core)
3) `sdd/core/spec-core-v1.md` (arquitectura/core)
4) `sdd/features/<feature>/spec-<feature>-vX.md` (feature scope)
5) `.agent/skills/**/SKILL.md` (instrucciones operativas)
6) `.antigravity/prompts/*.md` (prompts de ejecución)

Si hay conflicto: gana el nivel superior.

## Regla clave: core vs feature
- El CORE no se modifica “porque sí”.
- Toda feature nueva vive en `sdd/features/<feature>/`.
- Si una feature necesita cambiar core:
  - se crea `spec-core-v2.md` (nueva versión)
  - se documenta el cambio en `sdd/core/CHANGELOG.md`

## Anti-conflicto (obligatorio)
- Nunca editar specs antiguos: solo versionar (v1, v2…).
- Nunca meter reglas de una feature dentro de reglas globales.
- Nunca hardcodear `org_id` o roles en frontend/backend.
- Nunca tocar audit_log histórico (append-only).

## Estilo de ejecución SDD
1) Leer docs (core + feature).
2) Plan.
3) Implementar mínimo viable.
4) Tests / verificación.
5) Walkthrough final: archivos + comandos + checks.

## Nota operativa
Mantener compatibilidad con archivos legacy del root (v0):
- `spec.md`
- `product-spec-v0.md`
- `constitution-canonical.md`
Pero la fuente oficial SDD v2 vive en `sdd/`.
