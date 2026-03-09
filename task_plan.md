# Task Plan — AntiGravity Transformation Execution

Fecha de actualización: 2026-03-08
Estado general: en ejecución

## Objetivo

Cerrar de forma operativa las 5 líneas prioritarias derivadas de:
- `public/docs/Nuevo_enfoque/Plan-Transformacion-AntiGravity-Anclora-Nexus.md`
- `public/docs/Nuevo_enfoque/Guia-Detallada-Ejecucion-AntiGravity.md`

## Fases activas

### 1. Memoria operativa del proyecto
- [x] Validar contexto del repo y estado de fases 1-5
- [x] Crear `task_plan.md`
- [x] Crear `findings.md`
- [x] Crear `progress.md`

### 2. Ingesta seller-side
- [x] Exponer un flujo ejecutable para ingerir señales de vendedores
- [x] Añadir snapshot local verificable para pruebas end-to-end
- [x] Persistir señales normalizadas en `nexus_sellers`

### 3. Sync NotebookLM
- [x] Exponer un runner API para `notebooklm_sync`
- [x] Sincronizar inteligencia territorial hacia `notebooklm_insights`
- [x] Dejarlo consumible por cron cloud
- [x] Priorizar un sync pack derivado del notebook territorial activo

### 4. Outreach asistido
- [x] Exponer ejecución batch para dossier + email draft
- [x] Generar borradores solo para sellers priorizados
- [x] Guardar salida en `seller_interactions`

### 5. Orquestación cloud
- [x] Añadir cron dedicado al pipeline territorial
- [x] Encadenar ingestión, sync territorial y outreach batch
- [x] Verificar rutas y documentación

## Criterio de cierre

Se considera cerrado cuando exista un flujo verificable:
1. leer señales seller-side,
2. guardarlas en Supabase,
3. sincronizar inteligencia territorial,
4. generar drafts de outreach,
5. dejar un cron cloud apuntando a rutas reales del backend.

## Estado fase 2

Fase 2 queda al 98%:
- NotebookLM territorial 2026 ya es la fuente principal configurada.
- El cron territorial consume primero un sync pack derivado del notebook real.
- `vulnerabilidades.md` queda como fallback operativo, no como fuente primaria.
- Existe ya un runbook reproducible y un script de build del sync pack.
- El 2% restante depende de automatizar la captura live desde MCP sin intervención humana sobre la sesión autenticada.
