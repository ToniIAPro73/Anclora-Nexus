# Agent C - Frontend Prompt (ANCLORA-OAEP-001)

Objetivo:
- Integrar politica de editabilidad por origen en modales de leads y propiedades.
- Bloquear campos segun policy y sanear payload antes de persistir.

Requisitos UI:
- Mensaje visible cuando existan campos bloqueados.
- Soporte de traducciones en `es/en/de/ru`.
- Sin regresion en flujos manuales (entidades `manual` totalmente editables).

Requisitos tecnicos:
- Reutilizar helper central (`origin-editability.ts`).
- No duplicar reglas inline en componentes.
