---
trigger: always_on
---

# Feature Rules: Currency & Surface Localization v1

## Normative hierarchy
1) `constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `sdd/features/currency-surface-localization/currency-surface-localization-spec-v1.md`

## Immutable rules

- Keep org isolation by `org_id` on all queries and updates.
- Currency selection is presentation-only in v1, never mutating stored amounts.
- Never infer currency from language; both controls are independent.
- Surface canonical storage remains in `m2`.
- `useful_area_m2` cannot exceed `built_area_m2` when both exist.
- Origin-based read-only fields must be enforced server-side, not only in UI.

## Compliance notes

- Do not expose sensitive acquisition metadata unnecessarily.
- Maintain backward compatibility with legacy `surface_m2` until deprecation phase.
