# Multichannel Feed Orchestrator v1

## Contexto
Tras consolidar la prospeccion operativa, el siguiente paso del roadmap es habilitar salida multicanal robusta (XML/JSON) para monetizacion y alcance comercial.

## Problema
La publicacion a portales externos se realiza sin capa unica de validacion/estado, lo que provoca rechazos de feed, iteraciones manuales y poca trazabilidad.

## Objetivo v1
Crear una capa de orquestacion con:
- Vista unificada por canal.
- Validacion previa.
- Publicacion controlada (incluyendo dry-run).
- Historial de ejecuciones.

## Requisitos funcionales
1. Endpoint de workspace por canal con:
- total candidates
- ready to publish
- warnings/errors
- formato del canal
- estado sintetico (healthy/warning/blocked)

2. Endpoint de validacion por canal con lista de issues.

3. Endpoint de publicacion por canal:
- soporte `dry_run`
- maximo de items configurable
- resultado con published/rejected/error_count

4. Endpoint de historial de runs.

5. Pantalla frontend operativa profesional:
- KPIs
- listado de canales
- panel de validacion y acciones
- historial tabular

## Requisitos no funcionales
- Scope obligatorio por `org_id`.
- Mensajeria clara de error.
- Acciones idempotentes a nivel UX (botones bloqueados mientras ejecutan).
- Compatibilidad con esquema actual de tablas.

## Contrato API v1
- `GET /api/feeds/workspace`
- `POST /api/feeds/channels/{channel}/validate`
- `POST /api/feeds/channels/{channel}/publish`
- `GET /api/feeds/runs`

## Reglas de validacion v1
- Campos requeridos por canal: `title`, `price`, `zone/city`, `property_type`.
- `price > 0`.
- `source_url` se marca como warning si falta.

## Riesgos
- Diferencias de esquema entre entornos.
- Ausencia de tablas opcionales (se resuelve con deteccion dinámica).

## Criterio de aceptacion
- Se pueden validar y publicar canales desde la UI sin errores de contrato.
- Se registran runs y se visualizan en historial.
- El owner/manager puede operar la feature con flujo completo.
