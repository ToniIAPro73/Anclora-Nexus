# MASTER PROMPT: Property Origin Unification v1 (Agents A/B/C/D)

Feature ID: `ANCLORA-POU-001`

Usar contexto común:
- `.antigravity/prompts/feature-property-origin-unification-shared-context.md`

## Agent A — DB & Migrations
- Aplicar migraciones `020` y `021`.
- Validar constraints, índices y backfill.
- Reportar queries de verificación local/cloud.
- **No tocar backend/frontend/docs fuera de DB**.

## Agent B — Backend API & Services
- Adaptar create/list/update de properties para `source_system` y `source_portal`.
- Validar dominio de ambos campos.
- Mantener compatibilidad con legacy `notes`.
- **No crear ni modificar migraciones SQL**.
- **No tocar UI/frontend**.

## Agent C — Frontend UX
- Modal de propiedad: origen + portal.
- Tarjetas de `Propiedades`: badges de origen/portal + buyer potencial + match + comisión.
- Mantener layout responsive sin solapes.

## Agent D — Testing & QA
- Tests unit/integration para DB + backend + frontend.
- Validar no regresión de CRUD y multitenancy.
- Checklist final GO/NO-GO.

## Merge Criteria
- Contrato DB/API consistente.
- Sin regresiones funcionales.
- Sin bloqueantes P0/P1.

## Stop Conditions (obligatorio)
- Cada agente debe detenerse al completar su bloque y devolver:
  1) lista de archivos modificados
  2) checklist de aceptación de su bloque
  3) “handoff” al siguiente agente
- Si detecta trabajo fuera de alcance, debe **parar** y reportarlo, no implementarlo.

## Commit Policy (obligatoria)
- 1 prompt = 1 commit.
- No squashing entre agentes durante ejecución.
- Mensajes sugeridos:
  - `feat(POU-001/A): db migration and rollback`
  - `feat(POU-001/B): backend source fields support`
  - `feat(POU-001/C): frontend origin and match signals`
  - `test(POU-001/D): qa validation and regression report`

## Orden de ejecución
1) Agent A (secuencial, primero).
2) Agent B + Agent C (en paralelo, solo cuando A esté mergeado).
3) Agent D (tras merge de B y C).
4) Gate final.
