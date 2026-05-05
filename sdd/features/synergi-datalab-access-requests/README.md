# Synergi/Data Lab Access Requests — SDD Index

## Feature

Centralized access request system for Anclora Synergi and Anclora Data Lab, managed from Anclora Nexus.

## Goal

Nexus becomes the operational source of truth for access requests:

```text
Landing / Synergi app / Data Lab app
        ↓
Nexus Access Requests
        ↓
Admin review in Nexus
        ↓
Approve / reject
        ↓
User email
        ↓
Approved users receive an invite/account creation link
```

## Repositories

### Phase 1

- `ToniIAPro73/Anclora-Nexus`
- `ToniIAPro73/anclora-private-estates-landing`

### Later phases

- `ToniIAPro73/Anclora-Private-Estates`
- Synergi app
- Data Lab app

## Documents

- [`spec-v1.md`](./spec-v1.md): domain model, API contract, backend/frontend scope and acceptance criteria.
- [`implementation-plan-nexus.md`](./implementation-plan-nexus.md): implementation sequence for Nexus.
- [`prompt-nexus-implementation.md`](./prompt-nexus-implementation.md): ready-to-use prompt for Codex/Gemini/Claude.

## Core decision

Access requests must be stored and resolved in Nexus, not independently inside Synergi or Data Lab.

Valid products:

```ts
type AccessRequestProduct = "synergi" | "data_lab";
```

Valid sources:

```ts
type AccessRequestSource = "landing" | "synergi_app" | "data_lab_app";
```

`private_estates_web` is intentionally excluded as a source. If a user clicks from Private Estates into Synergi/Data Lab and then submits a request, the source is the destination app.

## Phase 1 outcome

- Public Nexus endpoint receives Synergi/Data Lab access requests.
- Requests are persisted with `pending` status.
- Cloudflare Turnstile is verified server-side.
- Internal admin notification/email is triggered.
- Existing public lead/valuation intake must not regress.
