# Test Plan v1

## Backend
- serializar `anclora_priorities`
- generar prioridades en workspace con datos mínimos y con shared opportunities

## Frontend
- render de prioridades en `PartnerWorkspaceClient`
- `PrivateAreaShell` premium con variantes `partner` y `data-lab`
- revisión visual de CTA y fields en portales externos

## Validación
- `pytest` partner workspace
- `frontend:lint`
- `frontend:build`
