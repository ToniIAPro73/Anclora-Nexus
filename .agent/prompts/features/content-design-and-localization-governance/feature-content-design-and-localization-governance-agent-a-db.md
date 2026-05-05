PROMPT: Ejecuta bloque DB de `ANCLORA-CDLG-001`.

CONTEXTO:
- Usa `feature-content-design-and-localization-governance-shared-context.md`.
- Esta feature no requiere schema DB en v1.

TAREAS:
1) Verificar si existe necesidad real de tablas/config persistente para gobernanza de contenido.
2) Si no es necesario, emitir decisión explícita: `DB_NOT_REQUIRED_V1`.
3) Entregar SQL opcional de verificación (solo lectura) para confirmar entorno activo.

SALIDA:
- Nota técnica DB: requerido/no requerido.
- Si no requerido: rationale y riesgos.

PARADA:
- Detener tras la nota DB (sin tocar tablas/migraciones).

