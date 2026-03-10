# Migration — ANCLORA-TCH-001

No requiere migración SQL.

El rollout es de configuración:
- `LEGACY_SINGLE_TENANT_ORG_ID`
- `ALLOW_LEGACY_ORG_FALLBACK`

Default recomendado en producción:
- `ALLOW_LEGACY_ORG_FALLBACK=false`
