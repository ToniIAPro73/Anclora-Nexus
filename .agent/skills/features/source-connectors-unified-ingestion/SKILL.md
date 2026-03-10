---
name: feature-source-connectors-unified-ingestion
description: "Implementación de Source Connectors Unified Ingestion v1 bajo SDD."
---

# Skill - Source Connectors Unified Ingestion v1

## Lecturas obligatorias
1) `constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `.agent/rules/feature-source-connectors-unified-ingestion.md`
5) `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-INDEX.md`
6) `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1.md`
7) `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1_1.md`
8) `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1_2.md`
9) `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-migration.md`
10) `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-test-plan-v1.md`
11) `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-test-plan-v1_1.md`
12) `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-test-plan-v1_2.md`

## Método
1. Congelar contrato canónico.
2. DB primero (eventos + conectores).
3. Backend de ingestión idempotente.
4. UI/observabilidad operativa mínima.
5. QA de dedupe y aislamiento.
6. Resolver prioridad live y fallback snapshot sin bypass de trazabilidad.

## Reglas clave
- `org_id` obligatorio en todo flujo.
- Dedupe determinístico por `dedupe_key`.
- Trazabilidad completa de error (`error_code`, `error_message`, `trace_id`).
- Sin scraping no autorizado.
- Toda fuente seller-side trazable debe poder entrar por el perimetro de ingestion.
