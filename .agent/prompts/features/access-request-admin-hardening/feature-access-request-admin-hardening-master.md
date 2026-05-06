# Master Prompt — Access Request Admin Hardening

Feature ID: ANCLORA-ARAH-001  
Branch: `sdd/access-request-admin-hardening`  
Target base branch: `main`  
Repository: `~/projects/anclora-nexus`  
Execution mode: end-to-end implementation with local verification before commit, push, and PR.

---

## 0. Role

You are acting as a senior full-stack engineer and internal security reviewer for Anclora Nexus.

Your task is to implement the full feature **Access Request Admin Hardening** end-to-end, following the existing project conventions, SDD documentation, tests, and minimal-change discipline.

You must work carefully, avoid unnecessary refactors, preserve current behavior, and harden the approve/reject flow for `access_requests`.

---

## 1. Context

Anclora Nexus is the internal operational/control plane for Anclora. It manages access request review flows for Synergi and Data Lab.

Recent merged PRs on `main`:

- PR #7 — `synergi-datalab-access-requests`
- PR #8 — `authenticated reviewer identity`
- PR #9 — `server-auth cookie options typing`

Current feature branch:

```bash
sdd/access-request-admin-hardening
```

The current issue is that approve/reject operations for `access_requests` still rely on `reviewed_by` supplied by the frontend payload. This is not acceptable for an internal admin decision flow because the client can spoof reviewer identity.

The backend already has authentication dependency support:

```python
from backend.api.deps import get_current_user
```

`get_current_user` returns a user object with `.id`.

Existing pattern found in the repo:

```python
actor_user_id=current_user.id
```

---

## 2. Feature objective

Harden `approve` and `reject` for `access_requests` so that:

```text
frontend does NOT send reviewed_by
        ↓
FastAPI route gets current_user via get_current_user
        ↓
route derives reviewer_id from current_user.id
        ↓
service receives reviewer_id explicitly
        ↓
DB reviewed_by = reviewer_id
        ↓
audit actor_id = reviewer_id
```

The backend must be the source of truth for reviewer identity.

---

## 3. Non-negotiable requirements

1. Do not trust `reviewed_by` from frontend payload.
2. Do not require `reviewed_by` in approve/reject request bodies.
3. Derive reviewer identity from `get_current_user().id`.
4. Persist `reviewed_by` using authenticated reviewer identity.
5. Use the same authenticated identity as audit `actor_id`.
6. Keep `rejection_reason` required and non-empty for reject.
7. Do not introduce a database migration unless strictly necessary. It should not be necessary.
8. Do not change the public intake flow.
9. Do not alter unrelated SDD features.
10. Do not perform broad UI redesign.
11. Keep changes minimal and targeted.
12. Run relevant checks before commit.
13. Do not commit if tests/checks fail without documenting the failure.
14. Do not push or open PR until local validation has been run.

---

## 4. Existing SDD documents

Read these first:

```text
sdd/features/access-request-admin-hardening/access-request-admin-hardening-INDEX.md
sdd/features/access-request-admin-hardening/access-request-admin-hardening-spec-v1.md
sdd/features/access-request-admin-hardening/access-request-admin-hardening-test-plan-v1.md
sdd/features/access-request-admin-hardening/QA_REPORT_ANCLORA_ARAH_001.md
sdd/features/access-request-admin-hardening/GATE_FINAL_ANCLORA_ARAH_001.md
```

Update the QA report and final gate after implementation and validation.

---

## 5. Files likely to change

Expected backend files:

```text
backend/api/routes/access_requests.py
backend/models/access_requests.py
backend/services/access_request_service.py
backend/tests/test_access_request_review_routes.py
backend/tests/test_access_request_review_service.py
```

Expected frontend files:

```text
frontend/src/app/(dashboard)/access-requests/page.tsx
frontend/src/lib/access-requests-api.ts
```

Expected SDD files to update at the end:

```text
sdd/features/access-request-admin-hardening/QA_REPORT_ANCLORA_ARAH_001.md
sdd/features/access-request-admin-hardening/GATE_FINAL_ANCLORA_ARAH_001.md
```

Do not modify more files unless inspection proves it is necessary.

---

## 6. Required implementation details

### 6.1 Backend route changes

File:

```text
backend/api/routes/access_requests.py
```

For approve:

Current shape is expected to be similar to:

```python
@router.post("/{request_id}/approve", response_model=AccessRequestResponse)
async def approve_access_request(
    request_id: str,
    decision: AccessRequestReviewDecision,
    org_id: str = Depends(get_org_id),
    _user=Depends(get_current_user),
):
    ...
```

Change it to use the authenticated user explicitly:

```python
@router.post("/{request_id}/approve", response_model=AccessRequestResponse)
async def approve_access_request(
    request_id: str,
    decision: AccessRequestReviewDecision,
    org_id: str = Depends(get_org_id),
    current_user=Depends(get_current_user),
):
    try:
        return await access_request_service.approve_request(
            org_id=org_id,
            request_id=request_id,
            decision=decision,
            reviewer_id=current_user.id,
        )
    ...
```

For reject, apply the same pattern:

```python
reviewer_id=current_user.id
```

Keep list/get endpoints unchanged unless needed.

### 6.2 Backend model changes

File:

```text
backend/models/access_requests.py
```

Current model is expected to include:

```python
class AccessRequestReviewDecision(BaseModel):
    reviewed_by: str
    admin_notes: Optional[str] = None

    @field_validator("reviewed_by")
    @classmethod
    def validate_reviewed_by(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("reviewed_by is required")
        return value.strip()
```

Change to:

```python
class AccessRequestReviewDecision(BaseModel):
    admin_notes: Optional[str] = None
```

Keep reject validation:

```python
class AccessRequestRejectDecision(AccessRequestReviewDecision):
    rejection_reason: str
```

Keep the `rejection_reason` validator.

Do not remove `reviewed_by` from response models if it is used to display historical review state. `reviewed_by` should remain in response/read models if currently present.

### 6.3 Backend service changes

File:

```text
backend/services/access_request_service.py
```

Expected current signatures:

```python
async def approve_request(
    self,
    org_id: str,
    request_id: str,
    decision: AccessRequestReviewDecision,
) -> Dict[str, Any]:
```

Change to:

```python
async def approve_request(
    self,
    org_id: str,
    request_id: str,
    decision: AccessRequestReviewDecision,
    reviewer_id: str,
) -> Dict[str, Any]:
```

Then replace:

```python
"reviewed_by": decision.reviewed_by
actor_id=decision.reviewed_by
```

with:

```python
"reviewed_by": reviewer_id
actor_id=reviewer_id
```

Apply the same pattern to `reject_request`.

Optional defensive validation:

If consistent with project style, add a minimal guard inside the service:

```python
if not reviewer_id.strip():
    raise ValueError("reviewer_id is required")
```

Only add this if it does not complicate tests. The route should normally guarantee it through auth.

### 6.4 Frontend API contract changes

File:

```text
frontend/src/lib/access-requests-api.ts
```

Find the approve/reject payload types.

Expected current type may look like:

```ts
export interface AccessRequestReviewDecision {
  reviewed_by: string
  admin_notes?: string
}
```

Change to:

```ts
export interface AccessRequestReviewDecision {
  admin_notes?: string
}
```

For reject, keep:

```ts
export interface AccessRequestRejectDecision extends AccessRequestReviewDecision {
  rejection_reason: string
}
```

Do not remove `reviewed_by` from response/read types if the UI displays it.

### 6.5 Frontend page changes

File:

```text
frontend/src/app/(dashboard)/access-requests/page.tsx
```

Remove construction and sending of `reviewed_by` in approve/reject calls.

Expected current code may include:

```ts
reviewed_by: reviewerIdentity,
```

Remove it from both approve and reject payloads.

If `reviewerIdentity` exists only for this payload and is no longer used, remove it and any now-unused imports/hooks/variables.

Do not remove UI display of `request.reviewed_by` in details/history.

---

## 7. Tests to update

### 7.1 Route tests

File:

```text
backend/tests/test_access_request_review_routes.py
```

Expected changes:

- Mock user must expose `.id`.
- Approve request body must not include `reviewed_by`.
- Reject request body must not include `reviewed_by`.
- Assertions should verify service is called with `reviewer_id=USER_ID` or equivalent.

Example target behavior:

```python
json={"admin_notes": "Approved"}
```

and:

```python
json={"rejection_reason": "Not enough information"}
```

If mocks assert the exact service call, include:

```python
reviewer_id=USER_ID
```

### 7.2 Service tests

File:

```text
backend/tests/test_access_request_review_service.py
```

Expected changes:

- Instantiate `AccessRequestReviewDecision` without `reviewed_by`.
- Pass `reviewer_id="admin-user"` explicitly to service calls.
- Assert updated record has `reviewed_by == "admin-user"`.
- Assert audit event uses `actor_id == "admin-user"`.
- Remove tests expecting `AccessRequestReviewDecision(reviewed_by="")` validation failure.
- Keep tests validating empty `rejection_reason`.

Example target service call:

```python
await service.approve_request(
    org_id="org-test",
    request_id="request-test",
    decision=AccessRequestReviewDecision(admin_notes="Looks good"),
    reviewer_id="admin-user",
)
```

For reject:

```python
await service.reject_request(
    org_id="org-test",
    request_id="request-test",
    decision=AccessRequestRejectDecision(rejection_reason="Not a fit"),
    reviewer_id="admin-user",
)
```

---

## 8. Validation commands

Run from repository root unless the project structure requires otherwise.

First inspect available scripts:

```bash
cat package.json 2>/dev/null || true
cat backend/pyproject.toml 2>/dev/null || true
cat backend/requirements.txt 2>/dev/null || true
cat frontend/package.json 2>/dev/null || true
```

Then run targeted backend tests:

```bash
cd ~/projects/anclora-nexus
pytest backend/tests/test_access_request_review_routes.py backend/tests/test_access_request_review_service.py
```

If the project expects running from `backend/`, use:

```bash
cd ~/projects/anclora-nexus/backend
pytest tests/test_access_request_review_routes.py tests/test_access_request_review_service.py
```

Run frontend checks using the available scripts. Preferred, if present:

```bash
cd ~/projects/anclora-nexus/frontend
npm run lint
npm run build
```

If root scripts exist and are canonical, use them instead:

```bash
cd ~/projects/anclora-nexus
npm run frontend:lint
npm run build
```

Also run a final static grep check:

```bash
cd ~/projects/anclora-nexus

echo "== reviewed_by writes/usages =="
grep -Rni "reviewed_by" backend frontend/src \
  --exclude-dir=__pycache__ \
  --exclude-dir=node_modules \
  | sed -n '1,260p'

echo "== service decision.reviewed_by should be absent =="
grep -Rni "decision.reviewed_by" backend frontend/src \
  --exclude-dir=__pycache__ \
  --exclude-dir=node_modules \
  || true
```

Acceptance for grep:

- `decision.reviewed_by` should not appear in backend service code.
- Frontend approve/reject payloads should not include `reviewed_by`.
- Response/display references to `reviewed_by` may remain.

---

## 9. SDD update after validation

After implementation and checks, update:

```text
sdd/features/access-request-admin-hardening/QA_REPORT_ANCLORA_ARAH_001.md
sdd/features/access-request-admin-hardening/GATE_FINAL_ANCLORA_ARAH_001.md
```

The QA report must include:

- commands executed;
- pass/fail result;
- any known limitations;
- confirmation that no SQL migration was needed;
- confirmation that frontend no longer sends `reviewed_by`.

The final gate must mark completed items only if actually verified.

Do not mark checks as done if not run.

---

## 10. Git workflow

Before coding, confirm branch:

```bash
cd ~/projects/anclora-nexus
git branch --show-current
git status --short
```

Expected branch:

```text
sdd/access-request-admin-hardening
```

After implementation and validation:

```bash
git status --short
git diff --stat
git diff -- backend/api/routes/access_requests.py backend/models/access_requests.py backend/services/access_request_service.py
git diff -- backend/tests/test_access_request_review_routes.py backend/tests/test_access_request_review_service.py
git diff -- frontend/src/lib/access-requests-api.ts 'frontend/src/app/(dashboard)/access-requests/page.tsx'
git diff -- sdd/features/access-request-admin-hardening
```

If the diff is correct and checks pass, commit:

```bash
git add \
  backend/api/routes/access_requests.py \
  backend/models/access_requests.py \
  backend/services/access_request_service.py \
  backend/tests/test_access_request_review_routes.py \
  backend/tests/test_access_request_review_service.py \
  frontend/src/lib/access-requests-api.ts \
  'frontend/src/app/(dashboard)/access-requests/page.tsx' \
  sdd/features/access-request-admin-hardening/QA_REPORT_ANCLORA_ARAH_001.md \
  sdd/features/access-request-admin-hardening/GATE_FINAL_ANCLORA_ARAH_001.md

git commit -m "feat: derive access request reviewer from auth context"
```

If the prompt file itself is modified, include it only if necessary.

Push:

```bash
git push origin sdd/access-request-admin-hardening
```

Open PR to `main`:

```bash
gh pr create \
  --base main \
  --head sdd/access-request-admin-hardening \
  --title "feat: harden access request admin review identity" \
  --body "$(cat <<'EOF'
## Summary

- Derives access request reviewer identity from the authenticated backend user.
- Removes `reviewed_by` from approve/reject client payloads.
- Persists and audits reviewer identity using `current_user.id`.
- Updates backend/frontend contracts and tests.
- Updates SDD QA and final gate for ANCLORA-ARAH-001.

## Validation

- [ ] Backend route/service tests pass
- [ ] Frontend lint passes
- [ ] Frontend build passes
- [ ] Static grep confirms no `decision.reviewed_by` dependency remains
- [ ] No SQL migration required

## SDD

Feature: ANCLORA-ARAH-001 — Access Request Admin Hardening
EOF
)"
```

Only mark PR checklist items as checked if the corresponding commands actually passed.

---

## 11. PR quality bar

Before opening PR, ensure:

```bash
git status --short
```

is clean after commit.

Ensure PR is not polluted with unrelated changes.

Ensure no secret values, local config, `.env`, build output, cache files, or `__pycache__` files are committed.

---

## 12. Expected final response from the implementation agent

When finished, provide a concise final report with:

1. branch name;
2. files changed;
3. implementation summary;
4. validation commands and results;
5. commit SHA;
6. push status;
7. PR URL;
8. any caveats or manual follow-up.

Do not claim success for checks that were not executed.

---

## 13. Important constraints

- Minimal changes only.
- No broad refactor.
- No schema migration.
- No unrelated UI changes.
- Do not weaken auth.
- Do not remove historical `reviewed_by` display.
- Do not trust frontend identity.
- Keep route/service tests aligned with the new contract.
- Keep SDD artifacts updated honestly.
