PROMPT: Orquesta implementación completa de `ANCLORA-SCUI-001 v1.2`.

Objetivo:
- cerrar `BL-next-01`
- priorizar seller-side live source sobre snapshot
- mantener trazabilidad total en `ingestion_events`

Orden:
1) Agent B backend
2) Agent D QA
3) Gate final

Reglas:
- Firecrawl primero si está disponible
- StateFox live capture después
- snapshot solo como fallback explícito
- el cron territorial no puede depender directamente del snapshot si existe ruta live
