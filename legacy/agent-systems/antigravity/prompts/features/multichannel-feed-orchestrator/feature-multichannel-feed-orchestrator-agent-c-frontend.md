# Agent C - Frontend Prompt (ANCLORA-MFO-001)

Objetivo:
- Entregar pantalla operativa completa `/feed-orchestrator` para validar/publicar feeds.
- Integrar cliente API y configuracion por canal.

Requisitos UI:
- KPIs de canales/candidatos/listos/errores.
- Selector de canal + estado.
- Acciones `Validar`, `Publicar`, `Dry-run`.
- Panel de configuracion (`is_enabled`, `max_items_per_run`).
- Historial de runs con feedback visible.

Gobernanza:
- i18n completo `es/en/de/ru`.
- Sin hardcoded criticos para flujo principal.
- Botones protegidos durante ejecucion para evitar doble dispatch.
