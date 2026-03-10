# Test Plan — ANCLORA-TCH-001

- validar que `/sellers` consume `org_id` vía dependencia
- validar helper `resolve_legacy_org_id`
- validar que skills legacy dejan de usar UUIDs hardcoded
- validar que `prospection_weekly` usa lecturas scopeadas por `org_id`
