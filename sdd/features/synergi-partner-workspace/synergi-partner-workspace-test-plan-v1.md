# Test Plan · ANCLORA-SPW-001

1. Aceptar una admisión partner crea un workspace con `launch_url`.
2. `GET /api/public/partner-workspace?token=...` devuelve el workspace.
3. El primer acceso cambia `workspace_status` a `active`.
4. `POST /api/public/partner-workspace/opportunities` registra una oportunidad.
5. `/private-area/partner/workspace` muestra perfil, próximos pasos y oportunidades.

