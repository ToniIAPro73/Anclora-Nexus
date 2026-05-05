# Agent C — Frontend/Admin Prompt

Feature: `synergi-datalab-access-requests`

## Role

You are Agent C. Your responsibility is the Nexus admin UI for reviewing Synergi/Data Lab access requests.

Run this prompt only after Agent A and Agent B are complete and the backend endpoint/API client contract is stable.

## Read first

```text
sdd/features/synergi-datalab-access-requests/README.md
sdd/features/synergi-datalab-access-requests/spec-v1.md
sdd/features/synergi-datalab-access-requests/implementation-plan-nexus.md
sdd/features/synergi-datalab-access-requests/executions/feature-synergi-datalab-access-requests-01-agent-a-db.md
sdd/features/synergi-datalab-access-requests/executions/feature-synergi-datalab-access-requests-02-agent-b-backend.md
.agent/rules/feature-synergi-datalab-access-requests.md
.agent/skills/features/synergi-datalab-access-requests/SKILL.md
.antigravity/prompts/features/synergi-datalab-access-requests/feature-synergi-datalab-access-requests-shared-context.md
```

## Contracts to obey

Before implementing UI, read and follow the applicable UI contracts:

```text
sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md
sdd/contracts/UI-TEXT-FIELD-CONTRACT.md
sdd/contracts/UI-BOOLEAN-FIELD-CONTRACT.md
sdd/contracts/UI-SELECT-FIELD-CONTRACT.md
docs/standards/MODAL_CONTRACT.md
```

Key requirements:

- Use `page-title`, `page-subtitle`, `section-title`, `section-subtitle`.
- Use approved surfaces/cards (`surface-primary`, `surface-secondary`, `surface-copy-safe`) where compatible with existing patterns.
- Use approved field classes (`ui-input`, `ui-textarea`, select/boolean contracts).
- Modal must follow the modal contract: clear header, visible close action, predictable footer actions, no avoidable full-modal scroll.
- No hardcoded UI strings if project i18n patterns are available.

## Objective

Create the Nexus dashboard surface for access request review.

## Target route

Preferred route:

```text
frontend/src/app/(dashboard)/access-requests/page.tsx
```

If the existing app routing convention requires another path, follow existing conventions and document the reason.

## Required UI

### List view

Show a table or card-list with:

```text
created_at
product
source
full_name
email
status
submission_language
actions
```

Filters:

```text
status
product
source
search by email/name
```

Required states:

- loading
- empty
- error
- success/updated

### Detail modal

Open request details in a modal or drawer that follows `docs/standards/MODAL_CONTRACT.md`.

Show:

```text
product
source
status
full_name
email
phone/company if present
service_category/service_summary for Synergi
intended_use/requested_scope for Data Lab
privacy/gdpr state
submission_language
created_at
admin_notes
rejection_reason if present
```

Actions, if backend exists:

```text
approve
reject
revoke
save admin notes
```

If backend approval/rejection endpoints do not exist yet, render read-only review UI and document this as a limitation.

## API client

Create or update:

```text
frontend/src/lib/access-requests-api.ts
```

Expected functions if backend exists:

```ts
listAccessRequests(filters)
getAccessRequest(id)
approveAccessRequest(id, payload)
rejectAccessRequest(id, payload)
revokeAccessRequest(id, payload)
```

If only public intake exists, do not fabricate admin endpoints. Document Agent C as blocked until admin backend exists.

## Sidebar/navigation

If the dashboard sidebar has an operations/admin section, add a navigation item:

```text
Access Requests
```

Only add it if it follows existing sidebar patterns and does not break role-aware navigation.

## Boundaries

- Do not create fake data as production code.
- Do not invent admin endpoints that do not exist.
- Do not modify public landing forms.
- Do not alter seller/buyer/valuation intake flows.
- Do not weaken auth/role scope.

## Tests

Add frontend tests if the project has existing patterns. Minimum coverage:

- page renders
- loading state
- empty state
- error state
- modal opens with details
- action buttons are hidden/disabled if backend actions are unavailable

## Output

Create:

```text
sdd/features/synergi-datalab-access-requests/executions/feature-synergi-datalab-access-requests-03-agent-c-frontend.md
```

Include:

- UI files changed
- contracts followed
- route added
- backend dependencies
- tests run
- visual validation notes desktop/mobile
- limitations
