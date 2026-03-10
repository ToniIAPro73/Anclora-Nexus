---
trigger: always_on
---

# Feature Rules: Source Connectors Unified Ingestion v1

## Normative Priority
1) sdd/core/constitution-canonical.md
2) .agent/rules/workspace-governance.md
3) .agent/rules/anclora-nexus.md
4) sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1.md
5) sdd/features/source-connectors-unified-ingestion/source-connectors-unified-ingestion-spec-v1_1.md

## Rules
- Todo conector debe resolver `connector_name` de forma determinista.
- `dedupe_key` siempre se calcula con `org_id + connector_name + entity_type + external_id`.
- El schema operativo de estados es: `received -> validated -> processed|rejected|failed`.
- Todo error debe persistir `error_code`, `error_message` y `trace_id`.
- La feature incluye seller-side signals dentro del perimetro de ingestion.
- No se permite bypass directo de ingestión si la fuente debe ser trazable.
