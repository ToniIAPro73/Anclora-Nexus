# StateFox Telegram Bridge — Test Plan v1.1

1. Verificar `parse_statefox_raw` con señales seller-side y contactos.
2. Verificar `POST /api/intelligence/statefox-bridge/import` con propiedades creadas y sellers derivados.
3. Verificar que la respuesta incluye `trace_id`, `snapshot_id` y conteos seller-side.
4. Verificar que la UI `/intelligence/statefox-bridge` muestra candidatos seller-side y resultado agregado.
