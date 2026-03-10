# QA Report - ANCLORA-SMSR-001 v1.1

Estado: `PASS`

## Cobertura validada
- migración vectorial
- rebuild con embeddings
- retrieval híbrido
- integración en `whale_dossier`
- superficie en seller drawer

## Evidencia
- `pytest` backend verde sobre memoria seller-side y rutas sellers
- `npm run frontend:lint`
- `npm run frontend:build`

## Riesgo residual
- el modo vectorial depende de credenciales válidas de Cloudflare embeddings en el entorno objetivo
