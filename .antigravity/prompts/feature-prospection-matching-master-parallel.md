# MASTER PROMPT: Prospection & Buyer Matching v1 (Agents A/B/C/D)

Usa ejecución paralela con contexto común:
- `.antigravity/prompts/feature-prospection-matching-shared-context.md`

## Agent A — Database & Migrations
- Construir migraciones de tablas nuevas e índices.
- Preparar script de backfill opcional.
- Validar constraints y rendimiento base.

## Agent B — Backend API & Services
- Crear endpoints de prospección, buyers y matches.
- Implementar servicio de scoring con breakdown.
- Incluir validación de permisos y org isolation.

## Agent C — Frontend UX
- Crear vistas mínimas para propiedades prospectadas, buyers y matches.
- Añadir widgets de priorización comercial.
- Manejo de errores y estados de carga.

## Agent D — Testing & QA
- Diseñar y ejecutar tests unit/integration/e2e.
- Validar compliance (fuentes permitidas, aislamiento, rangos score).
- Reporte final de cobertura y riesgos.

## Merge Criteria
- Endpoints y DB compatibles.
- Sin conflictos de contrato de datos.
- Checks de seguridad y constitution OK.

