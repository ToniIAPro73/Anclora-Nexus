# Master Prompt — Access Request Admin Console Hardening & Operations

Feature ID: ANCLORA-ARCO-001  
Branch: `sdd/access-request-admin-console-operations`  
Target base branch: `main`  
Repository: `~/projects/anclora-nexus`  
Execution mode: inspect → create SDD → implement end-to-end → validate → commit → push → PR.

---

## 0. Role

You are acting as a senior full-stack engineer, product-minded internal tools designer, and security reviewer for Anclora Nexus.

Your task is to implement the feature **Access Request Admin Console Hardening & Operations** end-to-end.

You must follow existing repository conventions, SDD governance, internal app design contracts, and the visual language already present in Anclora Nexus.

Work with minimal-change discipline. Do not perform broad rewrites. Do not introduce unrelated abstractions. Preserve working behavior unless the feature requires a controlled change.

---

## 1. Project context

Anclora Nexus is the internal control plane/backoffice for Anclora operations.

It manages access request review flows for products such as:

- Anclora Synergi
- Anclora Data Lab

Recently merged work:

- PR #7 — `synergi-datalab-access-requests`
- PR #8 — `authenticated reviewer identity`
- PR #9 — `server-auth cookie options typing`
- PR #10 — `access-request-admin-hardening`

PR #10 already implemented this important security baseline:

```text
approve/reject no longer trust reviewed_by from frontend
reviewed_by is derived from get_current_user().id
service persists reviewed_by from authenticated reviewer identity
audit actor_id uses the same authenticated reviewer identity
```

This new feature must build on that baseline.

---

## 2. Feature objective

Create a more complete and operationally mature admin console for `access_requests`.

The goal is not only to enforce permissions, but to improve the internal review workflow across security, traceability, filtering, decision UX, and operational clarity.

Target flow:

```text
access request received
        ↓
admin console list with useful filters and counters
        ↓
admin opens complete request detail
        ↓
backend enforces reviewer/admin permission
        ↓
approve/reject remains identity-safe
        ↓
audit trail is visible or retrievable
        ↓
UI shows clear state, errors, and decision history
        ↓
QA/gate documents prove the feature is safe
```

---

## 3. Must inspect before designing

Before writing SDD or implementation code, inspect the actual repository.

Run and review at least:

```bash
cd ~/projects/anclora-nexus

git branch --show-current
git status --short

find docs sdd .agent backend frontend -maxdepth 4 -type f \
  | grep -Ei "contract|standard|design|internal|access.*request|audit|role|profile|permission|navbar|layout|table|modal|panel|badge" \
  | sort \
  | sed -n '1,260p'
```

Also inspect relevant files directly:

```bash
sed -n '1,260p' README.md
sed -n '1,260p' docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md 2>/dev/null || true
sed -n '1,260p' docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md 2>/dev/null || true
sed -n '1,260p' docs/standards/UI_MOTION_CONTRACT.md 2>/dev/null || true
sed -n '1,260p' docs/standards/MODAL_CONTRACT.md 2>/dev/null || true
sed -n '1,260p' docs/standards/LOCALIZATION_CONTRACT.md 2>/dev/null || true
```

Inspect Anclora internal UI patterns already used by the app:

```bash
find frontend/src -type f \
  | grep -Ei "layout|dashboard|access-requests|table|panel|dialog|modal|badge|card|button|toast|alert|i18n" \
  | sort \
  | sed -n '1,260p'
```

Inspect access request backend/frontend implementation:

```bash
sed -n '1,300p' backend/api/routes/access_requests.py
sed -n '1,420p' backend/services/access_request_service.py
sed -n '1,260p' backend/models/access_requests.py
sed -n '1,320p' backend/tests/test_access_request_review_routes.py
sed -n '1,440p' backend/tests/test_access_request_review_service.py
sed -n '1,320p' frontend/src/lib/access-requests-api.ts
sed -n '1,360p' 'frontend/src/app/(dashboard)/access-requests/page.tsx'
```

Inspect available auth/profile/role structures:

```bash
grep -RniE "user_profiles|role|roles|permission|permissions|is_admin|admin|reviewer|org_id|get_org_id|get_current_user" backend frontend/src \
  --exclude-dir=__pycache__ \
  --exclude-dir=node_modules \
  | sed -n '1,320p'
```

Inspect audit/event structures:

```bash
grep -RniE "audit|audit_event|_log_audit_event|access_request\." backend frontend/src \
  --exclude-dir=__pycache__ \
  --exclude-dir=node_modules \
  | sed -n '1,320p'
```

If there are references to a local Anclora vault or external `anclora-design-system`, inspect what is locally available. Do not hallucinate contracts. If the Bóveda or design system is not locally mounted, use repository contracts and existing UI as source of truth, and document the limitation in QA.

---

## 4. Design-contract requirements

The screen design must remain in tune with the rest of the application.

Use these sources in order of priority:

1. Existing Nexus UI patterns in `frontend/src`.
2. Repository standards under `docs/standards/`.
3. SDD contracts under `sdd/contracts/`.
4. Agent rules under `.agent/rules/`.
5. Bóveda Anclora and `anclora-design-system`, only if locally available or explicitly referenced by the repo.

Nexus is an Internal app. Preserve:

- internal/backoffice feel;
- dark operational UI if that is current contract;
- restrained premium visual language;
- clear hierarchy;
- no decorative redesign;
- accessible contrast;
- consistent table, panel, dialog, badge, button and spacing patterns;
- existing localization pattern;
- existing route/layout conventions.

Do not import a new component library unless the app already uses it.

Do not create a visually disconnected screen.

---

## 5. Feature scope

Implement a complete but controlled feature including these workstreams.

### 5.1 SDD package

Create:

```text
sdd/features/access-request-admin-console-operations/access-request-admin-console-operations-INDEX.md
sdd/features/access-request-admin-console-operations/access-request-admin-console-operations-spec-v1.md
sdd/features/access-request-admin-console-operations/access-request-admin-console-operations-backend-contract-v1.md
sdd/features/access-request-admin-console-operations/access-request-admin-console-operations-frontend-contract-v1.md
sdd/features/access-request-admin-console-operations/access-request-admin-console-operations-test-plan-v1.md
sdd/features/access-request-admin-console-operations/QA_REPORT_ANCLORA_ARCO_001.md
sdd/features/access-request-admin-console-operations/GATE_FINAL_ANCLORA_ARCO_001.md
```

The SDD must be created before implementation and updated after validation.

### 5.2 Backend permission enforcement

Implement permission enforcement for approve/reject operations.

Goal:

```text
401 unauthenticated
403 authenticated but not authorized
404 request not found
409 invalid transition
```

Rules:

- Backend must be source of truth.
- Frontend role checks are optional UX only, not security.
- Use existing `user_profiles` or equivalent if available.
- Prefer minimal helper/dependency in backend rather than broad RBAC framework.
- Restrict approve/reject to explicitly allowed role(s), e.g. `admin`, `reviewer`, `owner`, or existing project-specific role names discovered in code/schema/docs.
- Do not invent a database schema if avoidable.
- If role data is unavailable in current code, implement a safe, minimal check using current available profile fields and document the assumption. If no reliable role field exists, create a small backend abstraction ready for future role fields, but avoid a migration unless the repo already has a migration pattern and the need is clear.

Potential implementation shapes, depending on current code:

```python
async def require_access_request_reviewer(current_user=Depends(get_current_user)):
    ...
```

or:

```python
async def get_current_reviewer_context(...):
    return ReviewerContext(user_id=current_user.id, org_id=org_id, role=role)
```

Keep it simple.

### 5.3 Backend audit trail retrieval

If audit events are already written to a table/service, expose a read endpoint for a single request:

```text
GET /api/access-requests/{request_id}/audit
```

Expected behavior:

- scoped by `org_id`;
- requires authenticated user;
- ideally requires same reviewer/admin permission as review operations, or at least internal access permission consistent with list/detail;
- returns ordered audit events;
- includes event type, actor, timestamp, metadata if available;
- does not leak cross-org data.

If current audit storage is not queryable or not implemented as a persistent table, document this and implement the smallest useful alternative only if safe. Do not fake audit data.

### 5.4 Backend list filters

Improve `GET /api/access-requests` with useful filters only if they fit the current service and data shape.

Recommended filters:

```text
status
product
source
email
created_from
created_to
limit
```

Optional only if simple and safe:

```text
search
```

Rules:

- Preserve existing query params.
- Preserve default limit behavior.
- Avoid inefficient or unsupported Supabase query patterns unless already used.
- Add tests for new filters if implemented.

### 5.5 Frontend admin console improvements

Improve the access requests page as an internal operations console.

Expected UX improvements:

- clear pending/approved/rejected counters if data is available client-side;
- filters for status/product/source if supported by API;
- refresh action remains available;
- detail panel shows relevant operational fields clearly;
- approve/reject actions only shown or enabled for `pending` requests;
- reject requires `rejection_reason`;
- 403/409/404 errors are communicated clearly;
- audit trail visible in detail if endpoint is implemented;
- loading/empty/error states remain clear;
- UI remains aligned with Nexus internal style.

Do not introduce a full dashboard rewrite.

Do not degrade localization. If strings are centralized in i18n dictionaries, add keys consistently across active languages or follow the existing fallback convention.

### 5.6 Tests

Add/update tests for:

Backend:

- authorized reviewer/admin can approve;
- unauthorized authenticated user gets 403;
- unauthenticated user gets 401 if route path allows it to be tested;
- invalid transition remains 409;
- request not found remains 404;
- approve/reject still derive `reviewed_by` from auth context;
- audit endpoint returns scoped events if implemented;
- filters work if implemented.

Frontend:

- TypeScript/build stays valid;
- lint passes;
- if component tests exist for access request UI, update them.

Do not add fragile tests that require real external services.

---

## 6. Expected files

Likely backend files:

```text
backend/api/deps.py
backend/api/routes/access_requests.py
backend/models/access_requests.py
backend/services/access_request_service.py
backend/tests/test_access_request_review_routes.py
backend/tests/test_access_request_review_service.py
```

Potential new backend tests:

```text
backend/tests/test_access_request_admin_operations_routes.py
backend/tests/test_access_request_permissions.py
```

Likely frontend files:

```text
frontend/src/app/(dashboard)/access-requests/page.tsx
frontend/src/lib/access-requests-api.ts
frontend/src/components/access-requests/AccessRequestDetailPanel.tsx
frontend/src/components/access-requests/AccessRequestsTable.tsx
frontend/src/components/access-requests/AccessRequestDecisionDialog.tsx
frontend/src/lib/i18n* or equivalent localization files
```

Likely SDD files:

```text
sdd/features/access-request-admin-console-operations/*
```

Do not modify more files unless inspection proves it is necessary.

---

## 7. Implementation guidance

### 7.1 Backend permission check

Prefer explicit naming and simple behavior.

Possible role names must come from actual repo data/docs. Do not assume if code says otherwise.

If `user_profiles` has a role-like field, use it.

Example pattern only if compatible with actual code:

```python
ACCESS_REQUEST_REVIEW_ROLES = {"admin", "reviewer", "owner"}

async def require_access_request_reviewer(
    org_id: str = Depends(get_org_id),
    current_user=Depends(get_current_user),
):
    profile = fetch user profile scoped by current_user.id and org_id
    if profile role not in ACCESS_REQUEST_REVIEW_ROLES:
        raise HTTPException(status_code=403, detail="ACCESS_REQUEST_REVIEW_FORBIDDEN")
    return current_user
```

Make the exact implementation fit the repository.

Avoid circular dependency between `get_org_id` and profile lookup.

### 7.2 Access request route

Approve/reject must remain like this conceptually:

```python
current_user = Depends(require_access_request_reviewer)
...
reviewer_id=current_user.id
```

or equivalent reviewer context:

```python
reviewer_context = Depends(require_access_request_reviewer)
...
reviewer_id=reviewer_context.user_id
```

Do not reintroduce `reviewed_by` in request models.

### 7.3 Audit endpoint

Only implement using real stored audit events.

Potential route:

```python
@router.get("/{request_id}/audit", response_model=list[AccessRequestAuditEventResponse])
async def list_access_request_audit(...):
    return await access_request_service.list_audit_events(...)
```

Use existing table/service if present.

If audit table naming is unclear, inspect `_log_audit_event` implementation and tests.

### 7.4 Frontend API

Extend API client functions carefully.

Potential additions:

```ts
export interface AccessRequestAuditEvent { ... }
export async function getAccessRequestAudit(requestId: string): Promise<AccessRequestAuditEvent[]> { ... }
```

For filters:

```ts
export interface AccessRequestFilters {
  status?: AccessRequestStatus
  product?: AccessRequestProduct
  source?: AccessRequestSource
  email?: string
  created_from?: string
  created_to?: string
  limit?: number
}
```

Use existing request helper/fetch/auth pattern.

### 7.5 Frontend UI

Keep visual design in sync with existing components.

Preferred improvements:

- compact filter bar above table;
- status/product/source selects styled like existing controls;
- small operational counters using existing card/badge pattern;
- detail panel section for audit/history if available;
- disable or hide actions for non-pending requests;
- show backend 403 as an authorization message, not a generic crash.

No visual overengineering.

---

## 8. Validation commands

First inspect scripts:

```bash
cd ~/projects/anclora-nexus
cat package.json 2>/dev/null || true
cat frontend/package.json 2>/dev/null || true
cat backend/pyproject.toml 2>/dev/null || true
cat backend/requirements.txt 2>/dev/null || true
```

Run relevant backend tests. Use the local venv pattern if needed:

```bash
cd ~/projects/anclora-nexus
PYTHONPATH=. backend/venv/bin/pytest backend/tests/test_access_request_review_routes.py backend/tests/test_access_request_review_service.py
```

If new backend test files are added, include them explicitly:

```bash
PYTHONPATH=. backend/venv/bin/pytest \
  backend/tests/test_access_request_review_routes.py \
  backend/tests/test_access_request_review_service.py \
  backend/tests/test_access_request_admin_operations_routes.py \
  backend/tests/test_access_request_permissions.py
```

Run frontend checks using canonical scripts:

```bash
cd ~/projects/anclora-nexus
npm run frontend:lint
npm run build
```

or, if project requires frontend folder:

```bash
cd ~/projects/anclora-nexus/frontend
npm run lint
npm run build
```

Run static sanity checks:

```bash
cd ~/projects/anclora-nexus

echo "== Ensure reviewed_by is not client-supplied =="
grep -Rni "reviewed_by" frontend/src \
  --exclude-dir=node_modules \
  | sed -n '1,220p'

echo "== Ensure service does not use decision.reviewed_by =="
grep -Rni "decision.reviewed_by" backend frontend/src \
  --exclude-dir=__pycache__ \
  --exclude-dir=node_modules \
  || true

echo "== Permission-related code =="
grep -RniE "ACCESS_REQUEST|FORBIDDEN|reviewer|permission|role" backend/api backend/services backend/models backend/tests \
  --exclude-dir=__pycache__ \
  | sed -n '1,260p'
```

Acceptance:

- no `decision.reviewed_by` remains;
- frontend must not send `reviewed_by` in approve/reject payloads;
- permission check exists server-side;
- tests verify 403 for unauthorized users;
- build/lint pass or limitations are honestly documented.

---

## 9. SDD QA update

After implementation and validation, update:

```text
sdd/features/access-request-admin-console-operations/QA_REPORT_ANCLORA_ARCO_001.md
sdd/features/access-request-admin-console-operations/GATE_FINAL_ANCLORA_ARCO_001.md
```

QA report must include:

- actual implementation summary;
- contracts inspected;
- whether Bóveda/design-system sources were available;
- files changed;
- tests/checks executed;
- pass/fail results;
- known caveats;
- confirmation whether SQL migration was needed;
- confirmation that UI remains aligned with Internal app contracts.

Final gate must only check items actually verified.

---

## 10. Git workflow

Start from the current branch:

```bash
cd ~/projects/anclora-nexus
git branch --show-current
git status --short
```

Expected:

```text
sdd/access-request-admin-console-operations
```

Before commit:

```bash
git status --short
git diff --stat
git diff -- backend frontend/src sdd/features/access-request-admin-console-operations .agent/prompts/features/access-request-admin-console-operations | sed -n '1,520p'
```

Do not commit unrelated changes.

Commit after successful validation:

```bash
git add \
  backend \
  frontend/src \
  sdd/features/access-request-admin-console-operations

git commit -m "feat: harden access request admin console operations"
```

If the prompt file was created locally or changed, include it only if appropriate:

```bash
git add .agent/prompts/features/access-request-admin-console-operations/feature-access-request-admin-console-operations-master.md
```

Push:

```bash
git push origin sdd/access-request-admin-console-operations
```

Open PR:

```bash
gh pr create \
  --base main \
  --head sdd/access-request-admin-console-operations \
  --title "feat: harden access request admin console operations" \
  --body "$(cat <<'EOF'
## Summary

- Adds server-side permission enforcement for access request approve/reject operations.
- Improves access request admin console operations, filters, decision UX, and/or audit visibility according to implemented scope.
- Keeps reviewer identity derived from backend auth context.
- Aligns UI with Anclora Internal app contracts and existing Nexus design patterns.
- Adds/updates SDD docs, QA report, and final gate for ANCLORA-ARCO-001.

## Validation

- [ ] Backend access request tests pass
- [ ] Permission-denied path returns 403
- [ ] Frontend lint passes
- [ ] Frontend build passes
- [ ] Static grep confirms no `decision.reviewed_by` dependency remains
- [ ] No unnecessary SQL migration added
- [ ] UI reviewed against Internal app contracts / existing Nexus patterns

## SDD

Feature: ANCLORA-ARCO-001 — Access Request Admin Console Hardening & Operations
EOF
)"
```

Only mark validation items as checked if actually executed and passed.

---

## 11. Quality bar

Before final response:

```bash
git status --short
```

must be clean after commit.

The PR must not include:

- `.env` files;
- secrets;
- build outputs;
- `node_modules`;
- `__pycache__`;
- unrelated feature files;
- broad refactors outside the scope.

---

## 12. Final response format

When finished, report:

1. branch name;
2. PR URL;
3. commit SHA;
4. changed files;
5. implementation summary;
6. contracts inspected;
7. validation commands and results;
8. caveats/manual follow-up;
9. whether the working tree is clean.

Do not claim checks passed if they were not executed.

---

## 13. Important constraints

- Do not reintroduce client-supplied `reviewed_by`.
- Do not bypass backend permission enforcement with frontend-only logic.
- Do not create fake audit data.
- Do not add DB migration unless there is a clear, documented need.
- Do not redesign the app visually.
- Do not ignore localization patterns.
- Do not weaken existing auth/org scoping.
- Keep the screen consistent with the rest of Nexus and Anclora Internal contracts.
- Keep scope complete but controlled.
