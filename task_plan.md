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
- [ ] Exponer un flujo ejecutable para ingerir señales de vendedores
- [ ] Añadir snapshot local verificable para pruebas end-to-end
- [ ] Persistir señales normalizadas en `nexus_sellers`

### 3. Sync NotebookLM
- [ ] Exponer un runner API para `notebooklm_sync`
- [ ] Sincronizar snapshot territorial hacia `notebooklm_insights`
- [ ] Dejarlo consumible por cron cloud

### 4. Outreach asistido
- [ ] Exponer ejecución batch para dossier + email draft
- [ ] Generar borradores solo para sellers priorizados
- [ ] Guardar salida en `seller_interactions`

### 5. Orquestación cloud
- [ ] Añadir cron dedicado al pipeline territorial
- [ ] Encadenar ingestión, sync territorial y outreach batch
- [ ] Verificar rutas y documentación

## Criterio de cierre

Se considera cerrado cuando exista un flujo verificable:
1. leer señales seller-side,
2. guardarlas en Supabase,
3. sincronizar inteligencia territorial,
4. generar drafts de outreach,
5. dejar un cron cloud apuntando a rutas reales del backend.
