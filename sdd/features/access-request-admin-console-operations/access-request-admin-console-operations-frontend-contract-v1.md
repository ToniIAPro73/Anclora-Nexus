# Access Request Admin Console Operations — Frontend Contract v1

Feature ID: ANCLORA-ARCO-001  
Status: Draft

## Data Contract

The client never sends:

- `org_id`
- `reviewed_by`

The API client may send only supported list filters:

- `status`
- `product`
- `source`
- `email`
- `created_from`
- `created_to`
- `limit`

## UI Contract

The page remains an internal operations console:

- dark operational UI;
- existing dashboard layout;
- no landing/hero redesign;
- existing access request table/detail/dialog components;
- visible loading/empty/error/success states;
- all new strings in i18n dictionaries for `es/en/de/ru`;
- long names, emails, IDs and audit metadata must wrap safely.

## Expected Additions

- Source filter.
- Email filter.
- Audit trail block in the detail panel when events are loaded.
- Clear errors for:
  - `403`: insufficient permission;
  - `404`: request not found;
  - `409`: already reviewed / invalid transition.

## Action Rules

- Approve/reject buttons are shown only for `pending` requests.
- Reject dialog disables submit until `rejection_reason` is non-empty.
- Frontend role checks are not security; backend permission is authoritative.

## Visual Sources

Use existing Nexus primitives:

- `surface-primary`
- `surface-secondary`
- `surface-copy-safe`
- `btn-action`
- `btn-create`
- `ui-input`
- `ui-select`
- `ui-textarea`

No new component library.
