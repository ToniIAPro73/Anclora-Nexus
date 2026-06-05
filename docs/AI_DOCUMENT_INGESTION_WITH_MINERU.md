# AI Document Ingestion With MinerU

## Objetivo

Nexus usa MinerU como capacidad documental transversal, no como parser obligatorio del producto.

Casos donde aporta valor:

- PDF a Markdown para agentes
- DOCX, PPTX y XLSX a texto estructurado
- preparación de documentos para workflows de IA o research packs

## Modo recomendado

- Integracion por wrapper CLI
- Activacion bajo feature flag
- Consumo backend opcional mediante `AdvancedDocumentParser`

## Variables de entorno

```env
ENABLE_MINERU_PARSER=false
MINERU_AGENT_INGEST_PATH=/home/toni/projects/agent-tooling/mineru/bin/mineru-agent-ingest.sh
MINERU_DEFAULT_BACKEND=pipeline
MINERU_OUTPUT_BASE=/home/toni/projects/agent-tooling/mineru/output
MINERU_PARSE_TIMEOUT_MS=180000
```

## Wrapper local

```bash
scripts/ingest-with-mineru.sh ./public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.docx nexus pipeline
```

## Backend helper

- `backend/services/advanced_document_parser.py`

Este servicio:

- no fuerza MinerU si el flag esta desactivado
- parsea la salida estructurada del wrapper
- deja lista la capacidad para futuras rutas internas o skills

## Privacidad

- No commitear documentos ni outputs parseados.
- No activar ingesta productiva de documentos sensibles sin politica de retencion y revision humana.
