# Prompt - Territorial Sync Control Plane v1.2

Objetivo: convertir el refresh territorial de NotebookLM en una operacion reproducible y recuperable sin conocimiento tacito del operador.

Checklist:
1. Confirmar que el manifiesto declara owner operativo, cadencia, runbooks y fallback.
2. Actualizar `raw.json` desde NotebookLM MCP sin editar el pack final manualmente.
3. Ejecutar `build`, `validate` y `ops-summary`.
4. Exponer por API el estado enriquecido con `freshness_state`, `next_refresh_due_at`, `runbook_status` y `next_action`.
5. Mostrar en UI owner, frescura, fallback y runbooks.
6. Corregir referencias legacy de paths a `public/docs/nuevo-enfoque/...`.
7. No cerrar el bloque si el refresh sigue dependiendo de memoria verbal del operador.

Criterio de cierre:
- `ops/notebooklm-territorial-sync-status.json` queda alineado con el manifiesto operativo.
- cualquier operador puede saber que hacer mirando API/UI/runbook sin inspeccion manual del repo.
- `/intelligence` muestra owner, frescura, runbooks, fallback y siguiente accion.
