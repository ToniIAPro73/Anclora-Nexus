# Source Connectors Unified Ingestion - INDEX

Feature ID: `ANCLORA-SCUI-001`  
Version: `1.0`  
Status: `Specification Phase`  
Priority: `ALTA`

## Objetivo
Unificar la ingestión de fuentes externas (portales, social, CTA, imports) bajo un contrato interno único, versionado y con trazabilidad operativa.

## Documentos
1. `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1.md`
2. `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-migration.md`
3. `sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-test-plan-v1.md`

## Alcance v1
- Conectores normalizados para propiedades y leads.
- Contrato de payload canónico.
- Cola de ingestión con estados.
- Idempotencia y deduplicación inicial.
- Observabilidad por fuente.

## Fuera de alcance
- Scraping agresivo/no autorizado.
- ETL histórico masivo.
- Reconciliación semántica avanzada (v2 con entity resolution).
