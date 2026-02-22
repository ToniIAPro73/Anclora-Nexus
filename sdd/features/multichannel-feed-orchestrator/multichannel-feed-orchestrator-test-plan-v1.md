# Test Plan - Multichannel Feed Orchestrator v1

## Objetivo
Validar contratos API, resiliencia de validacion/publicacion y experiencia operativa en UI.

## Backend
1. `GET /api/feeds/workspace`
- Debe devolver lista de canales con status y totales.

2. `POST /api/feeds/channels/{channel}/validate`
- Canal valido: 200 + issues.
- Canal invalido: 404.

3. `POST /api/feeds/channels/{channel}/publish`
- `dry_run=true`: published_count = 0 y resultado estructurado.
- `dry_run=false`: published_count/rejected_count coherentes.

4. `GET /api/feeds/runs`
- Debe devolver lista y total.

## Frontend
1. Carga de pantalla sin error y render de KPIs.
2. Seleccion de canal actualiza panel lateral.
3. Boton Validar carga issues.
4. Boton Publicar y Dry-run muestran feedback.
5. Historial renderiza ejecuciones.

## Criterios QA
- Sin errores TS/Lint en archivos nuevos.
- No ruptura de rutas existentes.
- Mensajes de error legibles para usuario final.
