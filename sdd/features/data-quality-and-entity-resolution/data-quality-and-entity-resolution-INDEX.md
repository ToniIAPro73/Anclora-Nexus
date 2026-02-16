# Data Quality and Entity Resolution - INDEX

Feature ID: `ANCLORA-DQER-001`  
Version: `1.0`  
Status: `Specification Phase`  
Priority: `ALTA`

## Objetivo
Introducir una capa de calidad de dato y resolución de entidades para consolidar duplicados de leads y propiedades entre múltiples fuentes, con trazabilidad y reglas auditables por organización.

## Documentos
1. `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-v1.md`
2. `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-migration.md`
3. `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-test-plan-v1.md`

## Alcance v1
- Reglas de calidad (completitud, formato, coherencia) para leads/properties.
- Motor de deduplicación determinista + score de similitud.
- Resolución de entidades con merge seguro y reversible.
- Log de decisiones de resolución y trazabilidad de origen.
- Observabilidad básica de calidad por org.

## Fuera de alcance
- Resolución semántica avanzada basada en LLM.
- Auto-merge irreversible sin aprobación humana.
- Reconciliación histórica masiva de toda la base en un único batch.
