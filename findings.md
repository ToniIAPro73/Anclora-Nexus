# Findings — AntiGravity Execution

Fecha de actualización: 2026-03-08

## Hallazgos clave

1. La arquitectura base ya estaba más avanzada de lo que reflejaba el estado verbal del plan:
   - `nexus_sellers` existe.
   - `seller_interactions` existe.
   - `notebooklm_insights` existe.
   - el widget `Radar Territorial` ya consume datos reales del backend.

2. NotebookLM MCP está operativo y autenticado, pero el backend de producción no puede invocarlo directamente.
   - El patrón correcto sigue siendo puente externo o snapshot operativo.
   - Se dejó alineado el notebook activo `Inteligencia Territorial Suroeste Mallorca 2026`.
   - Para acercar Fase 2 al 95%, el cron territorial debe priorizar un sync pack generado desde el notebook real y no depender de `vulnerabilidades.md` como fuente principal.
   - El repo ya dispone de manifiesto de queries, raw source expected shape y script de build del sync pack para regeneración consistente.

3. Había una incoherencia de ejecución:
   - el frontend ya tenía un cron semanal en `frontend/src/app/api/cron/weekly/route.ts`
   - pero la app FastAPI principal no exponía una ruta funcional equivalente dentro del paquete `backend/api/routes/`
   - además coexistían `backend/api/routes.py` y `backend/api/routes/`, lo que complica imports directos.

4. El outreach asistido ya existía parcialmente:
   - `POST /api/sellers/{seller_id}/generate-dossier`
   - `backend/skills/whale_dossier.py`
   - faltaba batch execution para operar la fase 4 en serie.

5. La “ingesta real” de scraping externo no está cerrada:
   - no hay integración efectiva con Firecrawl/Apify hoy
   - para cerrar el circuito end-to-end se necesita un conector operativo verificable
   - se resuelve en esta iteración con snapshot estructurado + skill de normalización + cron.

## Restricciones relevantes

- `NotebookLM MCP` depende de sesión web de Google.
- La automatización 100% autónoma sigue bloqueada por esa dependencia de sesión.
- `Supabase Cloud` ya está linkado y la migración 039 fue aplicada.
- No conviene reescribir migraciones históricas.
- Para un pipeline robusto, el cron debe llamar solo a rutas backend reales y estables.
