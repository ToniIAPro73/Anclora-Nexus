---
name: origin-aware-editability-policy
description: Implement and maintain field editability by entity origin for leads and properties in Anclora Nexus.
---

# Skill: Origin Aware Editability Policy

## When to use
- Any change in lead/property edit forms.
- Any change in `source_system`, `source_portal`, `match_score`, or capture fields.
- Any hardening around provenance traceability.

## Mandatory checks
1) Apply a centralized policy helper (do not duplicate rules inline).
2) Sanitize outbound payloads to remove locked fields.
3) Show UX reason when a field is locked.
4) Keep i18n complete in `es/en/de/ru`.

## Canonical files
- `frontend/src/lib/origin-editability.ts`
- `frontend/src/components/modals/LeadFormModal.tsx`
- `frontend/src/components/modals/PropertyFormModal.tsx`
- `frontend/src/lib/i18n/translations.ts`
- `sdd/features/origin-aware-editability-policy/*`
