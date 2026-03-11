# Spec - ANCLORA-MTIP-001 v1.0

## Problema

La inteligencia territorial del repo estaba operando como un único pack global asociado al notebook del Suroeste de Mallorca 2026. Eso impedía que un mismo tenant mantuviera varios documentos de inteligencia por zona y dificultaba el salto posterior a buyer-side intelligence.

## Objetivo

Introducir un catálogo de `intelligence_packs` por tenant, con pack activo resoluble en runtime y uso opcional de `pack_id` en endpoints territoriales.

## Alcance

- tabla `intelligence_packs`
- fallback legacy seguro si no hay catálogo persistido
- endpoints:
  - `GET /api/intelligence/packs`
  - `POST /api/intelligence/packs`
  - `PATCH /api/intelligence/packs/{pack_id}`
- soporte `pack_id` opcional en:
  - `GET /api/intelligence/territorial-insights`
  - `GET /api/intelligence/territorial-summary`
  - `GET /api/intelligence/vulnerabilidades`
- nueva card en `/intelligence`

## Campos del pack

- `pack_key`
- `pack_label`
- `notebook_id`
- `notebook_name`
- `market_scope`
- `zone_scope`
- `language_code`
- `source_mode`
- `status`
- `is_default`
- `metadata`
- `last_synced_at`

## Reglas de UX

- usar `surface-primary` para el frame principal del catálogo
- usar `surface-secondary` para cada pack y para el formulario de alta
- todo texto largo/técnico debe ir dentro de `surface-copy-safe`
- todas las cadenas nuevas deben entrar en i18n

## Compatibilidad

- si no hay filas en `intelligence_packs`, el sistema sigue exponiendo el pack legacy del Suroeste como fallback sintético
- el control-plane territorial actual no se elimina ni se reescribe en esta versión

## Criterio de salida

Un tenant puede ver más de un pack, activar uno sin borrar otro y consultar el resumen territorial contra el pack activo sin mezclar datos de otro tenant.
