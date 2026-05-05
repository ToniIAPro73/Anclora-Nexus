PROMPT: Implementa frontend governance de `ANCLORA-CDLG-001`.

CONTEXTO:
- Usa `feature-content-design-and-localization-governance-shared-context.md`.

TAREAS:
1) Aplicar contrato i18n en textos nuevos/modificados (`es`, `en`, `de`, `ru`).
2) Reforzar consistencia visual:
- tipografía y espaciados coherentes,
- evitar scroll vertical innecesario por layout.
3) Reforzar contrato de botones:
- creación: patrón `btn-create`,
- acción no-creación: patrón `btn-action` + emoji elegante.
4) Ajustar navegación para escalabilidad (sidebar/header).
5) Añadir pruebas o checks de no-regresión frontend.

REGLAS:
- No introducir textos hardcodeados fuera del sistema i18n.
- No mezclar idiomas en una misma sesión UI.
- No dejar scripts temporales al final.

SALIDA:
- Cambios frontend + traducciones + evidencias.

PARADA:
- Detener tras frontend + i18n + no-regresión.

