# Prompt — StateFox Telegram Bridge v1

Implementar un bridge supervisado para importar resultados de StateFox desde Telegram Web hacia el pipeline de prospección.

Condiciones:
- destino principal: `properties`
- no asumir API oficial
- preservar deep links `startapp` y URLs públicas para deduplicación
- UI con previsualización antes de importar
- i18n completo
- derivación seller-side solo por señales explícitas
- trazabilidad operativa mínima en cada importación
