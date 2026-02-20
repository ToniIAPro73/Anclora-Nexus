---
name: role-scoped-workspace-visibility
description: Implementa visibilidad por rol para owner/manager/agent en leads, tasks y properties, con asignación explícita por usuario y hardening de seguridad vía RLS.
---

# Skill — Role Scoped Workspace Visibility

## Lecturas obligatorias
1) `sdd/core/constitution-canonical.md`
2) `sdd/features/multitenant/spec-multitenant-v1.md`
3) `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-INDEX.md`
4) `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-spec-v1.md`
5) `.agent/rules/feature-role-scoped-workspace-visibility.md`

## Instrucciones
- Implementar primero contrato de datos (`assigned_user_id`).
- Aplicar RLS antes de depender de filtrado frontend.
- Ajustar backend de intake para asignación explícita.
- Ajustar frontend para no consultar fuera de scope.
- Entregar migration + walkthrough + test plan.

## Stop rules
- No mezclar cambios cosméticos o de branding.
- No romper compatibilidad de owner/manager.
