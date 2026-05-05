PROMPT: Implementa el bloque Backend de `ANCLORA-CSL-001`.

CONTEXTO:
- Usa shared context.
- Mantén compatibilidad con `surface_m2` y contratos existentes.

TAREAS:
1) Extender modelos/schemas de properties con:
- `useful_area_m2`, `built_area_m2`, `plot_area_m2`
2) Validar reglas:
- no negativos
- `useful_area_m2 <= built_area_m2`
3) Enforce contract de editabilidad por origen (server-side).
4) Mantener aislamiento por `org_id`.

ALCANCE:
- Solo backend (API/services/models/tests backend).

STOP:
- No tocar migraciones/frontend.
- Entregar lista de archivos y detenerse.
