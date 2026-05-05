PROMPT: Implementa el bloque Frontend de `ANCLORA-CSL-001`.

CONTEXTO:
- Usa shared context.
- Aplica UX premium sin romper diseño existente.

TAREAS:
1) Integrar selector de moneda (independiente del idioma).
2) Formatear importes con reglas:
- EUR `1.234,56 €`
- GBP `£1,234.56`
- USD `$1,234.56`
- DEM `1.234,56 DM`
- RUB `1 234,56 ₽`
3) Mostrar superficies con unidad adecuada (`m2`/`sq ft`).
4) Ajustar cards de propiedades para evitar solapes de estado/título.
5) Reflejar origen y reglas de edición (bloqueos/disabled) según contrato backend.

ALCANCE:
- Solo frontend.

STOP:
- No tocar backend/migraciones.
- Entregar archivos tocados y detenerse.
