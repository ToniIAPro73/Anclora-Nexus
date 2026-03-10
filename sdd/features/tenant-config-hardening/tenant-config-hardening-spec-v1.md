# ANCLORA-TCH-001 v1

## Objetivo

Reducir deuda de `single-tenant v0` sin activar multitenancy completo.

## Alcance

- sacar `DEFAULT_ORG_ID` hardcoded de rutas críticas
- centralizar fallback legacy en config + servicio compartido
- impedir fallback silencioso en `get_org_id` salvo habilitación explícita
- scopear `prospection_weekly` por `org_id`

## Contrato

- `backend/api/deps.get_org_id` no degrada a `fixed_org_id` salvo `ALLOW_LEGACY_ORG_FALLBACK=true`
- `backend/services/org_context_service.py` es la única pieza autorizada para fallback legacy
- skills legacy deben llamar `resolve_legacy_org_id(...)`

## Implementación

- backend only
- sin cambio de esquema
