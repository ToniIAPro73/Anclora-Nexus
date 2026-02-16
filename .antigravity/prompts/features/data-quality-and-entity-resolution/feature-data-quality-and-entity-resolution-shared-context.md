# SHARED CONTEXT: Data Quality and Entity Resolution v1

Feature ID: `ANCLORA-DQER-001`

## Contexto de negocio
Anclora necesita consolidar calidad y deduplicación para mejorar conversión comercial y evitar ruido operativo en leads/properties provenientes de múltiples fuentes.

## Objetivo técnico común
Implementar issues de calidad, candidatos de deduplicación y resolución de entidades con trazabilidad completa, aislamiento por org y decisiones auditables.

## Reglas comunes
- Cumplir `constitution-canonical.md`, `workspace-governance.md`, `anclora-nexus.md`.
- Aislamiento estricto por `org_id`.
- No realizar merges irreversibles por defecto.
- Cada agente se detiene en su bloque.
