# ANCLORA-ARAN-001 Frontend Contract v1

## API Client

Add:

- `AccessRequestAnalyticsSummary`
- `AccessRequestAttentionItem`
- `getAccessRequestAnalyticsSummary(limit?: number)`

## UI

Add an operations dashboard to the existing access request page:

- KPI cards for total, pending, aging, retry/email attention, and average review time.
- Product/source breakdowns using compact internal panels.
- Attention queue with severity, reason, applicant email, status, product/source and age.
- Clicking an attention item opens/fetches the request detail in the existing detail panel.
- Refresh loads list and analytics.
- Loading/error/empty states are visible and localized.

## Design Rules

- Use existing Nexus internal classes and surfaces.
- Keep dark operational style.
- No new UI library.
- No broad redesign.
- Text must use existing i18n pattern across `es/en/de/ru`.

## Security Rules

- Frontend does not send `org_id`.
- Frontend does not send `reviewed_by`.
- Backend permission failures surface as existing access request auth/permission messages.
