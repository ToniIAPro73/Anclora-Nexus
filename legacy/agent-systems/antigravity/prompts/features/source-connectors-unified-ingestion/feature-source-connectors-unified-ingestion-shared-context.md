# SHARED CONTEXT: Source Connectors Unified Ingestion v1

Feature ID: `ANCLORA-SCUI-001`

## Contexto
Anclora Nexus necesita una capa de conectores estable para incorporar fuentes externas sin acoplar la app a cada proveedor.

## Objetivo
Implementar contrato canónico, ingestión idempotente y observabilidad de eventos por org/fuente.

## Reglas
- Cumplir constitution + governance + anclora rules.
- Aislamiento por `org_id`.
- Un agente no invade el alcance del siguiente.
