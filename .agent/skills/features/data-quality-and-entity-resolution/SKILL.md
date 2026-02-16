---
name: feature-data-quality-and-entity-resolution
description: "Implementación de Data Quality and Entity Resolution v1 bajo SDD."
---

# Skill - Data Quality and Entity Resolution v1

## Lecturas obligatorias
1) `constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-INDEX.md`
5) `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-v1.md`
6) `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-migration.md`
7) `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-test-plan-v1.md`

## Método
1. Congelar contrato de calidad + resolución.
2. DB primero (issues/candidatos/log).
3. Backend de recompute y resolución.
4. UI de observabilidad y workflow de revisión.
5. QA con validación de entorno e i18n.

## Reglas clave
- `org_id` obligatorio en todo flujo.
- Nada de auto-merge irreversible sin evidencia y log.
- `similarity_score` explicable (signals JSON).
- Toda acción de resolución debe quedar en `dq_resolution_log`.
