---
trigger: always_on
---

# Feature Rules: Tenant Config Hardening v1

## Normative Priority
1) sdd/core/constitution-canonical.md
2) .agent/rules/workspace-governance.md
3) .agent/rules/anclora-nexus.md
4) sdd/features/tenant-config-hardening/tenant-config-hardening-spec-v1.md

## Implementation Rules
- No introducir un programa multi-tenant completo en este bloque.
- El fallback legacy solo puede vivir en un servicio compartido y auditable.
- Las rutas autenticadas deben preferir siempre `org_id` de perfil/dependencia.
- No se aceptan UUID hardcoded de tenant en rutas productivas.
