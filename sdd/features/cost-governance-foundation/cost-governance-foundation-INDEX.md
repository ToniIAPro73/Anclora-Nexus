# Cost Governance Foundation - INDEX

Feature ID: `ANCLORA-CGF-001`  
Version: `1.0`  
Status: `Specification Phase`  
Priority: `CRITICA`

## Objetivo
Construir la base de gobierno de coste para Anclora Nexus, con presupuesto por tenant, trazabilidad de consumo por capability y guardrails operativos para evitar sobrecoste.

## Documentos de esta feature
1. `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-v1.md`
2. `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-migration.md`
3. `sdd/features/cost-governance-foundation/cost-governance-foundation-test-plan-v1.md`

## Alcance v1
- Modelo de datos FinOps base.
- Presupuesto mensual por organizacion.
- Atribucion de consumo por modulo (ingestion, scoring, matching, automation, intelligence).
- Hard stops y soft limits.
- Panel operativo minimo de coste y alertas.

## Fuera de alcance v1
- Facturacion externa automatica.
- Prediccion avanzada de coste (ML forecasting).
- Optimizacion multi-proveedor automatica.

## Dependencias
- Multitenancy activo.
- Rutas backend autenticadas con `org_id`.
- Feature flags para rollout seguro.

## Entrega esperada
- Migraciones SQL + rollback.
- Endpoints backend de presupuesto/consumo/alertas.
- UI de monitorizacion en settings/dashboard.
- QA funcional y de no-regresion.
