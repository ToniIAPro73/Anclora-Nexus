# Source Connectors Unified Ingestion - INDEX

Feature ID: `ANCLORA-SCUI-001`  
Version: `1.2`  
Status: `Released`  
Priority: `ALTA`

## Objetivo
Unificar la ingestión de fuentes externas (portales, social, CTA, imports) bajo un contrato interno único, versionado y con trazabilidad operativa.

## Documentos
1. `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1.md`
2. `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1_1.md`
3. `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1_2.md`
4. `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-migration.md`
5. `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-test-plan-v1.md`
6. `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-test-plan-v1_1.md`
7. `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-test-plan-v1_2.md`
8. `sdd/features/source-connectors-unified-ingestion/QA_REPORT_ANCLORA_SCUI_001.md`
9. `sdd/features/source-connectors-unified-ingestion/QA_REPORT_ANCLORA_SCUI_001_v1_2.md`
10. `sdd/features/source-connectors-unified-ingestion/GATE_FINAL_ANCLORA_SCUI_001.md`
11. `sdd/features/source-connectors-unified-ingestion/GATE_FINAL_ANCLORA_SCUI_001_v1_2.md`

## Alcance actual
- Conectores normalizados para propiedades, leads y seller signals.
- Contrato de payload canónico.
- Cola de ingestión con estados.
- Idempotencia y deduplicación inicial.
- Observabilidad por fuente.
- Source runner seller-side con prioridad live y fallback snapshot trazable.

## Fuera de alcance
- Scraping agresivo/no autorizado.
- ETL histórico masivo.
- Reconciliación semántica avanzada (v2 con entity resolution).
