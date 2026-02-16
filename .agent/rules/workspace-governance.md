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

## Baseline obligatorio para QA/Gate (todas las features)
- Referencia normativa: `.antigravity/prompts/features/_qa-gate-baseline.md`.
- Referencia de entrega completa: `.antigravity/prompts/features/_feature-delivery-baseline.md`.
- Es obligatorio para cualquier nuevo `agent-d-qa` y `gate-final`:
  1) Validar entorno leyendo `.env` y `frontend/.env.local`.
  2) Verificar que `SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_URL` apuntan al mismo proyecto.
  3) Prohibido asumir o hardcodear `project_ref` fuera de `.env*`.
  3.1) Reportar siempre el `project_ref` efectivo derivado de `.env*` y su evidencia.
  3.2) Si aparece otro `project_ref` en QA/Gate: `QA_INVALID_ENV_SOURCE` y QA invalido.
  4) Validar i18n completa en `es`, `en`, `de`, `ru` para texto nuevo/modificado.
  5) Validar que la migracion de la feature esta aplicada antes de B/C/D.
  5.1) QA debe confirmar explicitamente las migraciones SQL verificadas como aplicadas.
  5.2) Sin evidencia de migraciones aplicadas no se puede emitir GO.
  6) Validar calidad visual en vistas principales (sin solapes, overflow ni scroll innecesario en desktop).
  7) Validar escalabilidad de navegacion (sidebar usable con crecimiento de modulos y controles globales siempre accesibles).
- Si falla cualquiera:
  - `ENV_MISMATCH` -> NO-GO.
  - `I18N_MISSING_KEYS` -> NO-GO.
  - `MIGRATION_NOT_APPLIED` -> NO-GO.
  - `VISUAL_REGRESSION_P0` -> NO-GO.
  - `NAVIGATION_SCALABILITY_BROKEN` -> NO-GO.

## Nota operativa
Mantener compatibilidad con archivos legacy del root (v0):
- `spec.md`
- `product-spec-v0.md`
- `constitution-canonical.md`
Pero la fuente oficial SDD v2 vive en `sdd/`.
