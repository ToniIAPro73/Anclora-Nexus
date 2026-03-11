# Migration Spec - ANCLORA-SPA-001

Migracion: `049_synergi_partner_admissions.sql`

## Tabla

- `partner_admissions`

## Campos clave

- `org_id`
- `full_name`
- `email`
- `service_category`
- `service_summary`
- `coverage_areas`
- `languages`
- `sustainability_focus`
- `status`
- `review_notes`
- `reviewed_by_user_id`
- `reviewed_at`
- `decision_email_sent_at`

## Indices

- `(org_id, created_at desc)`
- `(org_id, status)`
- `(org_id, service_category)`
- `GIN(coverage_areas)`
- `GIN(languages)`
