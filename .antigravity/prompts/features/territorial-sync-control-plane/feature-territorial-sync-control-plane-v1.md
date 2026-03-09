# Prompt - Territorial Sync Control Plane v1

Objetivo: asegurar que el sync pack territorial de NotebookLM es trazable, válido y visible operativamente.

Checklist:
1. Confirmar notebook territorial 2026 activo.
2. Actualizar raw source desde NotebookLM MCP.
3. Construir sync pack.
4. Validar consistencia, freshness y trazabilidad.
5. Exponer estado por API.
6. Mostrar estado en UI.
7. Bloquear cron si el pack entra en error.

Criterio de cierre:
- `ops/notebooklm-territorial-sync-status.json` en `ready`
- `GET /api/intelligence/territorial-sync-status` devuelve el mismo contrato
- `/intelligence` muestra el estado del control plane
- el cron territorial rechaza packs inválidos
