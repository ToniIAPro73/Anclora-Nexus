name: tenant-config-hardening
description: Hardens legacy single-tenant org resolution without introducing full multitenancy.
---

# Skill - Tenant Config Hardening v1

## Mandatory Reading
1) sdd/core/constitution-canonical.md
2) sdd/features/tenant-config-hardening/tenant-config-hardening-INDEX.md
3) sdd/features/tenant-config-hardening/tenant-config-hardening-spec-v1.md
4) .agent/rules/feature-tenant-config-hardening.md

## Instructions
- Remove hardcoded org UUIDs from critical routes first.
- Centralize any compatibility fallback in one backend service.
- Prefer explicit config over hidden defaults.
- Keep rollout schema-free and reversible.
