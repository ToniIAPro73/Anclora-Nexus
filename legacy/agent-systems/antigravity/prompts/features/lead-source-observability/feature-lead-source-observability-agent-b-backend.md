PROMPT: Implementa bloque Backend de `ANCLORA-LSO-001`.

CONTEXTO:
- Usa `.antigravity/prompts/feature-lead-source-observability-shared-context.md`.
- DB contract definido por Agent A.

TAREAS:
1) Ajustar create/list/update leads para nuevos campos de origen.
2) Validar dominio de valores en backend.
3) Mantener compatibilidad con `source` legacy.
4) Si está en alcance: endpoint público de captura CTA con validación mínima.

ALCANCE:
- Solo `backend/**` (+ spec técnica backend si necesario).

STOP:
- No tocar migraciones/frontend.
- Entregar lista de archivos tocados y detenerse.

