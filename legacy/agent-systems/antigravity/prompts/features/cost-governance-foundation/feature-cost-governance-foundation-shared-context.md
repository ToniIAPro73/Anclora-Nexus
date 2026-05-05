# SHARED CONTEXT: Cost Governance Foundation v1

Feature ID: `ANCLORA-CGF-001`

## Contexto de negocio
Anclora Nexus necesita control de coste por tenant para escalar sin degradar margen operativo.

## Objetivo tecnico comun
Implementar presupuesto mensual por organizacion, eventos de consumo por capability y alertas warning/hard-stop.

## Reglas comunes
- Cumplir `constitution-canonical.md`, `workspace-governance.md`, `anclora-nexus.md`.
- Aislamiento estricto por `org_id`.
- No romper endpoints actuales.
- Cada agente debe parar en su bloque.
