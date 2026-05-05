PROMPT: Implementa backend governance de `ANCLORA-CDLG-001`.

CONTEXTO:
- Usa `feature-content-design-and-localization-governance-shared-context.md`.

TAREAS:
1) Añadir validaciones backend necesarias para contratos globales (si aplica al flujo).
2) Exponer utilidades/servicios para auditoría de i18n y terminología (sin romper contratos existentes).
3) Añadir tests backend de contrato.
4) Documentar limitaciones de v1.

REGLAS:
- Leer `.env` + `frontend/.env.local` al inicio para validar entorno.
- No asumir `project_ref`.
- No dejar scripts temporales al final.

SALIDA:
- Cambios backend + tests + breve reporte técnico.

PARADA:
- Detener al cerrar backend y tests.

