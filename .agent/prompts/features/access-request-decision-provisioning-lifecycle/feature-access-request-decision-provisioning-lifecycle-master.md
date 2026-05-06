# Master Prompt — Access Request Decision Provisioning & Lifecycle

Feature ID: ANCLORA-ARDP-001  
Branch: `sdd/access-request-decision-provisioning-lifecycle`  
Base: `main`  
Repo: `~/projects/anclora-nexus`  
Mode: inspect → create SDD → implement end-to-end → validate → commit → push → create PR.  
Important: **do not merge the PR**.

## 1. Role

Act as senior full-stack engineer, internal-tools product designer, security reviewer, and SDD operator for Anclora Nexus.

Implement a major feature: **Access Request Decision Provisioning & Lifecycle**.

This feature must make the access request module more operational after approve/reject: lifecycle visibility, safe invitation/provisioning intent, decision-email status, retry flow, auditability, and admin UI clarity.

Keep changes controlled. Do not perform broad rewrites. Do not redesign the app from scratch.

## 2. Current baseline

Recent work already merged into `main`:

- Access requests for Synergi/Data Lab.
- Authenticated reviewer identity.
- Server auth cookie typing.
- Access request admin hardening.
- Access request admin console operations.

Current baseline should already include:

- `approve/reject` derive `reviewed_by` from backend auth context.
- Frontend does not send `reviewed_by`.
- Server-side permission enforcement exists for approve/reject.
- Non-reviewers get 403.
- Missing auth gets 401.
- Audit endpoint exists for access requests.
- Admin console has filters and audit visibility.

This feature must build on that baseline.

## 3. Business objective

Target lifecycle:

```text
pending request
  → authorized reviewer approves/rejects
  → backend prepares decision lifecycle state
  → approval prepares safe provisioning/invitation intent when supported
  → decision email is sent or marked retryable
  → admin console shows lifecycle/email/provisioning status
  → admin can retry failed decision email safely
  → audit log records lifecycle events
```

This is a major feature, not a small refactor.

## 4. Inspect first

Before writing SDD or code, inspect the repo. Do not guess.

Run:

```bash
cd ~/projects/anclora-nexus
git branch --show-current
git status --short
git log --oneline --decorate -7
```

Expected branch:

```text
sdd/access-request-decision-provisioning-lifecycle
```

Inspect contracts and design sources:

```bash
sed -n '1,260p' README.md
sed -n '1,260p' docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md 2>/dev/null || true
sed -n '1,260p' docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md 2>/dev/null || true
sed -n '1,260p' docs/standards/UI_MOTION_CONTRACT.md 2>/dev/null || true
sed -n '1,260p' docs/standards/MODAL_CONTRACT.md 2>/dev/null || true
sed -n '1,260p' docs/standards/LOCALIZATION_CONTRACT.md 2>/dev/null || true
find sdd/contracts .agent/rules -type f -maxdepth 4 -print 2>/dev/null | sort | sed -n '1,240p'
```

Inspect Bóveda and design system if locally available:

```bash
for path in ~/projects/anclora-design-system ~/projects/boveda-anclora ~/projects/anclora-boveda ~/projects/anclora-vault ~/Boveda-Anclora ~/Bóveda-Anclora; do
  echo "== $path =="
  if [ -d "$path" ]; then
    find "$path" -maxdepth 4 -type f | grep -Ei "README|contract|internal|design|token|component|surface|modal|table|badge|form|accessibility|admin" | sort | sed -n '1,160p'
  else
    echo "not found"
  fi
done
```

If Bóveda or `anclora-design-system` is not available, do not hallucinate. Use repo contracts and existing Nexus UI as source of truth. Document the limitation in QA.

Inspect current access request implementation:

```bash
sed -n '1,360p' backend/api/routes/access_requests.py
sed -n '1,560p' backend/services/access_request_service.py
sed -n '1,360p' backend/models/access_requests.py
sed -n '1,360p' backend/api/deps.py
sed -n '1,420p' backend/tests/test_access_request_review_routes.py
sed -n '1,560p' backend/tests/test_access_request_review_service.py
sed -n '1,420p' backend/tests/test_access_request_permissions.py
sed -n '1,460p' 'frontend/src/app/(dashboard)/access-requests/page.tsx'
sed -n '1,420p' frontend/src/lib/access-requests-api.ts
sed -n '1,420p' frontend/src/components/access-requests/AccessRequestDetailPanel.tsx
sed -n '1,420p' frontend/src/lib/i18n/translations.ts
```

Find primitives:

```bash
grep -RniE "membership|invite|invitation|email|notification|resend|retry|decision_email|audit_log|audit|provision|onboard|UserRole|verify_org_membership" backend frontend/src sdd docs .agent --exclude-dir=__pycache__ --exclude-dir=node_modules | sed -n '1,520p'
```

## 5. Design and contract rules

Use this priority order:

1. Existing Nexus UI patterns.
2. `docs/standards/*`.
3. `sdd/contracts/*`.
4. `.agent/rules/*`.
5. Local Bóveda and `anclora-design-system`, only if actually available.

Preserve Internal app style:

- dark operational UI;
- restrained premium feel;
- existing surfaces, cards, tables, badges, forms, dialogs and spacing;
- existing localization strategy;
- existing auth/org scoping;
- no new UI library;
- no disconnected redesign.

## 6. Create SDD first

Create this package before implementation:

```text
sdd/features/access-request-decision-provisioning-lifecycle/access-request-decision-provisioning-lifecycle-INDEX.md
sdd/features/access-request-decision-provisioning-lifecycle/access-request-decision-provisioning-lifecycle-spec-v1.md
sdd/features/access-request-decision-provisioning-lifecycle/access-request-decision-provisioning-lifecycle-backend-contract-v1.md
sdd/features/access-request-decision-provisioning-lifecycle/access-request-decision-provisioning-lifecycle-frontend-contract-v1.md
sdd/features/access-request-decision-provisioning-lifecycle/access-request-decision-provisioning-lifecycle-test-plan-v1.md
sdd/features/access-request-decision-provisioning-lifecycle/access-request-decision-provisioning-lifecycle-rollout-v1.md
sdd/features/access-request-decision-provisioning-lifecycle/QA_REPORT_ANCLORA_ARDP_001.md
sdd/features/access-request-decision-provisioning-lifecycle/GATE_FINAL_ANCLORA_ARDP_001.md
```

SDD must define:

- problem;
- objective;
- out of scope;
- backend contract;
- frontend contract;
- lifecycle state model;
- retry policy;
- audit events;
- migration decision;
- rollout/rollback;
- test plan;
- acceptance criteria.

Update QA and Gate after validation.

## 7. Feature scope

Implement safely according to what the current architecture supports.

### 7.1 Lifecycle state

Formalize lifecycle visibility around existing fields first.

Likely inputs:

```text
status
reviewed_by
reviewed_at
admin_notes
rejection_reason
decision_email
invite_token
invite_expires_at
updated_at
audit events
```

Prefer no migration. If schema changes are unavoidable, document why and follow existing migration conventions.

Possible derived lifecycle object:

```text
request_id
status
decision_status
provisioning_status
email_status
reviewed_by
reviewed_at
invite_expires_at
retry_available
last_event_at
```

Expose it by enriching `AccessRequestResponse` or by adding:

```text
GET /api/access-requests/{request_id}/lifecycle
```

Choose the smaller and safer option after inspection.

### 7.2 Approval provisioning/invitation intent

On approval, prepare safe provisioning/invitation intent if supported by current fields/services.

Allowed approaches:

- reuse existing invite fields;
- create invite token only if current schema supports it;
- set invite expiry if supported;
- log lifecycle audit event;
- avoid duplicate invite/provisioning side effects.

Do not create real accounts unless a clear existing service supports it.

### 7.3 Decision email retry

Implement retry endpoint if feasible:

```text
POST /api/access-requests/{request_id}/decision-email/retry
```

Rules:

- requires same reviewer permission as approve/reject;
- allowed only after decision, never for pending;
- retry should not change `status`, `reviewed_by`, `reviewed_at`, or `rejection_reason`;
- retry sends/re-sends decision email using existing service logic;
- provider failure must not rollback decision;
- return 409 when retry is not allowed;
- log retry/sent/failed audit events.

### 7.4 Admin UI

Add lifecycle section to the access request detail area.

Show:

- decision status;
- reviewer and reviewed date;
- provisioning/invite status;
- decision email status;
- retry button when allowed;
- success/error messages;
- audit remains visible;
- localized messages;
- styling aligned with existing Nexus classes.

Potential new component if helpful:

```text
frontend/src/components/access-requests/AccessRequestLifecyclePanel.tsx
```

## 8. Security rules

- Do not reintroduce client-supplied `reviewed_by`.
- Do not rely on frontend-only permission checks.
- Preserve org scoping.
- Do not fake audit data.
- Do not create duplicate provisioning or invite side effects.
- Do not leak provider errors or secrets.
- Mutations must enforce reviewer permission.

## 9. Likely files

Backend:

```text
backend/api/routes/access_requests.py
backend/models/access_requests.py
backend/services/access_request_service.py
backend/api/deps.py
backend/tests/test_access_request_review_routes.py
backend/tests/test_access_request_review_service.py
backend/tests/test_access_request_permissions.py
backend/tests/test_access_request_decision_lifecycle.py
backend/tests/test_access_request_decision_email_retry.py
```

Frontend:

```text
frontend/src/lib/access-requests-api.ts
frontend/src/app/(dashboard)/access-requests/page.tsx
frontend/src/components/access-requests/AccessRequestDetailPanel.tsx
frontend/src/components/access-requests/AccessRequestLifecyclePanel.tsx
frontend/src/components/access-requests/AccessRequestDecisionDialog.tsx
frontend/src/components/access-requests/AccessRequestsTable.tsx
frontend/src/lib/i18n/translations.ts
```

Do not modify unrelated files.

## 10. Validation

Inspect scripts:

```bash
cd ~/projects/anclora-nexus
cat package.json 2>/dev/null || true
cat frontend/package.json 2>/dev/null || true
cat backend/pyproject.toml 2>/dev/null || true
cat backend/requirements.txt 2>/dev/null || true
```

Run backend tests:

```bash
cd ~/projects/anclora-nexus
PYTHONPATH=. backend/venv/bin/pytest \
  backend/tests/test_access_request_review_routes.py \
  backend/tests/test_access_request_review_service.py \
  backend/tests/test_access_request_permissions.py
```

Include new lifecycle/retry tests if created:

```bash
PYTHONPATH=. backend/venv/bin/pytest \
  backend/tests/test_access_request_review_routes.py \
  backend/tests/test_access_request_review_service.py \
  backend/tests/test_access_request_permissions.py \
  backend/tests/test_access_request_decision_lifecycle.py \
  backend/tests/test_access_request_decision_email_retry.py
```

Run frontend:

```bash
cd ~/projects/anclora-nexus
npm run frontend:lint
npm run build
```

Static checks:

```bash
cd ~/projects/anclora-nexus

grep -Rni "decision.reviewed_by" backend frontend/src --exclude-dir=__pycache__ --exclude-dir=node_modules || true

grep -Rni "reviewed_by" frontend/src --exclude-dir=node_modules | sed -n '1,260p'

grep -RniE "lifecycle|retry|decision_email|provisioning|invite|ACCESS_REQUEST|FORBIDDEN" backend frontend/src sdd/features/access-request-decision-provisioning-lifecycle --exclude-dir=__pycache__ --exclude-dir=node_modules | sed -n '1,420p'
```

Browser smoke if tooling exists. If blocked, document honestly in QA and PR.

## 11. QA and Gate

Update:

```text
sdd/features/access-request-decision-provisioning-lifecycle/QA_REPORT_ANCLORA_ARDP_001.md
sdd/features/access-request-decision-provisioning-lifecycle/GATE_FINAL_ANCLORA_ARDP_001.md
```

QA must include:

- contracts inspected;
- Bóveda/design-system availability;
- implementation summary;
- files changed;
- commands and results;
- caveats;
- migration decision;
- rollout/rollback notes;
- browser smoke status.

Gate must only mark verified items complete.

## 12. Git and PR workflow

Before commit:

```bash
cd ~/projects/anclora-nexus
git status --short
git diff --stat
git diff -- backend frontend/src sdd/features/access-request-decision-provisioning-lifecycle .agent/prompts/features/access-request-decision-provisioning-lifecycle | sed -n '1,720p'
```

Commit only after validation:

```bash
git add backend frontend/src sdd/features/access-request-decision-provisioning-lifecycle
git commit -m "feat: add access request decision provisioning lifecycle"
```

If the prompt file changed locally, include it only if appropriate:

```bash
git add .agent/prompts/features/access-request-decision-provisioning-lifecycle/feature-access-request-decision-provisioning-lifecycle-master.md
```

Push:

```bash
git push origin sdd/access-request-decision-provisioning-lifecycle
```

Create PR:

```bash
gh pr create \
  --base main \
  --head sdd/access-request-decision-provisioning-lifecycle \
  --title "feat: add access request decision provisioning lifecycle" \
  --body "$(cat <<'EOF'
## Summary

- Adds access request decision lifecycle/provisioning visibility.
- Adds safe decision email retry flow where supported by current architecture.
- Preserves backend-authenticated reviewer identity and server-side reviewer permission enforcement.
- Adds lifecycle audit events using real audit mechanisms.
- Updates access request admin UI with lifecycle, provisioning, email, and retry state.
- Adds SDD package, QA report, and final gate for ANCLORA-ARDP-001.

## Validation

- [ ] Backend access request tests pass
- [ ] Lifecycle/retry tests pass
- [ ] Frontend lint passes
- [ ] Frontend build passes
- [ ] Static grep confirms no `decision.reviewed_by` dependency remains
- [ ] Frontend does not send `reviewed_by` in approve/reject payloads
- [ ] New mutation endpoints enforce reviewer permission
- [ ] Retry blocked when not allowed
- [ ] No unnecessary SQL migration added
- [ ] UI reviewed against Internal app contracts / Nexus patterns
- [ ] Browser visual smoke completed or documented as blocked

## SDD

Feature: ANCLORA-ARDP-001 — Access Request Decision Provisioning & Lifecycle
EOF
)"
```

Only check validation boxes that actually passed. Do not merge.

## 13. Final response required

Report:

1. branch;
2. PR URL;
3. commit SHA;
4. changed files;
5. implementation summary;
6. contracts inspected;
7. validation commands/results;
8. migration decision;
9. browser smoke status;
10. caveats;
11. clean working tree status.

## 14. Hard constraints

- Do not merge.
- Do not reintroduce `reviewed_by` as client input.
- Do not bypass backend permissions.
- Do not fake audit data.
- Do not create real user accounts unless existing service clearly supports it.
- Do not create duplicate invite/provisioning effects.
- Do not add SQL migration unless unavoidable and documented.
- Do not redesign UI from scratch.
- Do not ignore localization.
- Do not weaken org scoping.
- Do not commit secrets, env files, build outputs, dependencies, cache files, or unrelated changes.
