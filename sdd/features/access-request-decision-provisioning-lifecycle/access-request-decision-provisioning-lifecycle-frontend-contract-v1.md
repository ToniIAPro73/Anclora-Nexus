# ANCLORA-ARDP-001 Frontend Contract v1

## API Client

Add lifecycle types:

- `AccessRequestLifecycle`
- `AccessRequestDecisionStatus`
- `AccessRequestProvisioningStatus`
- `AccessRequestEmailStatus`

Add functions:

- `getAccessRequestLifecycle(requestId)`
- `retryAccessRequestDecisionEmail(requestId)`

Approve/reject payload types remain reviewer-safe and must not include `reviewed_by`.

## Admin Console UX

The access request detail area displays:

- decision status;
- reviewer identity and reviewed timestamp;
- provisioning/invite status;
- invite expiry when present;
- decision email status;
- retry action when lifecycle says retry is available;
- retry loading and error states;
- audit trail remains visible and unchanged.

## Design Constraints

- Use existing Nexus internal surfaces, tables, badges, controls, and spacing.
- Keep dark operational UI.
- Add localized strings consistently across active locale dictionaries.
- Do not add a component library.
- Do not redesign the page from scratch.

## Error UX

Map backend errors to clear admin copy:

- `401`: authentication required.
- `403`: reviewer permission required.
- `404`: request no longer available.
- `409`: lifecycle transition/retry is not allowed.
