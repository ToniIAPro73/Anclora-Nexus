# Prompt — StateFox Telegram Bridge v1.1

Implementar un bridge supervisado para importar resultados de StateFox desde Telegram Web hacia el pipeline de prospección con contrato operativo real.

Condiciones:
- destino primario: `properties`
- derivación seller-side solo por señales explícitas
- toda derivación seller-side entra por unified ingestion
- normalizar `source_url`, `zone`, `source_system`, `source_portal` y metadata mínima
- devolver trazabilidad operativa (`trace_id`, `snapshot_id`, conteos por resultado)
- UI con previsualización, feedback de seller candidates e i18n completo
