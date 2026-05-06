# Master Prompt — Access Request Analytics & Operations Dashboard

Feature ID: ANCLORA-ARAN-001  
Branch: `sdd/access-request-analytics-operations-dashboard`  
Base: `main`  
Repo: `~/projects/anclora-nexus`  
Mode: inspect → create SDD → implement → validate → commit → push → PR.  
Do not merge.

## Role

Act as senior full-stack engineer, analytics engineer, internal-tools product designer, security reviewer, and SDD operator.

Implement **Access Request Analytics & Operations Dashboard** end-to-end. This must be a meaningful feature, not a small tweak.

Goal: evolve the access request console from a review tool into an operational control surface with KPIs, aging signals, attention queue, and clear visibility.

## Baseline

`main` already includes:

- access request review flow;
- backend-derived `reviewed_by`;
- server-side reviewer permission enforcement;
- audit endpoint;
- lifecycle/provisioning/email retry flow;
- admin console filters, audit and lifecycle visibility.

Build on that. Do not reintroduce client-supplied `reviewed_by`.

## Inspect first

Run:

```bash
cd ~/projects/anclora-nexus
git branch --show-current
git status --short
git log --oneline --decorate -8
```

Expected branch:

```text
sdd/access-request-analytics-operations-dashboard
```

Inspect contracts:

```bash
sed -n '1,260p' README.md
sed -n '1,260p' docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md 2>/dev/null || true
sed -n '1,260p' docs/standards/LOCALIZATION_CONTRACT.md 2>/dev/null || true
sed -n '1,260p' docs/standards/MODAL_CONTRACT.md 2>/dev/null || true
sed -n '1,260p' docs/standards/UI_MOTION_CONTRACT.md 2>/dev/null || true
find sdd/contracts .agent/rules -type f -maxdepth 4 -print 2>/dev/null | sort | sed -n '1,220p'
```

Inspect Bóveda/design-system if available:

```bash
for path in ~/projects/anclora-design-system ~/projects/boveda-anclora ~/projects/anclora-boveda ~/projects/anclora-vault ~/Boveda-Anclora ~/Bóveda-Anclora; do
  echo "== $path =="
  [ -d "$path" ] && find "$path" -maxdepth 4 -type f | grep -Ei "README|contract|internal|design|token|component|dashboard|kpi|table|badge|form|accessibility" | sort | sed -n '1,160p' || echo "not found"
done
```

If unavailable, do not invent contracts. Use repo contracts and current Nexus UI. Document limitation in QA.

Inspect current implementation:

```bash
sed -n '1,420p' backend/api/routes/access_requests.py
sed -n '1,720p' backend/services/access_request_service.py
sed -n '1,420p' backend/models/access_requests.py
find backend/tests -type f | grep -Ei "access_request" | sort
sed -n '1,520p' 'frontend/src/app/(dashboard)/access-requests/page.tsx'
sed -n '1,520p' frontend/src/lib/access-requests-api.ts
find frontend/src/components/access-requests -maxdepth 1 -type f -print
sed -n '1,520p' frontend/src/lib/i18n/translations.ts
```

Search primitives:

```bash
grep -RniE "analytics|summary|metric|kpi|attention|aging|audit_log|lifecycle|decision_email|retry_available|invite|reviewed_at|created_at|source|product|status" backend frontend/src sdd docs .agent --exclude-dir=__pycache__ --exclude-dir=node_modules | sed -n '1,520p'
```

## Create SDD first

Before implementation, create:

```text
sdd/features/access-request-analytics-operations-dashboard/access-request-analytics-operations-dashboard-INDEX.md
sdd/features/access-request-analytics-operations-dashboard/access-request-analytics-operations-dashboard-spec-v1.md
sdd/features/access-request-analytics-operations-dashboard/access-request-analytics-operations-dashboard-backend-contract-v1.md
sdd/features/access-request-analytics-operations-dashboard/access-request-analytics-operations-dashboard-frontend-contract-v1.md
sdd/features/access-request-analytics-operations-dashboard/access-request-analytics-operations-dashboard-test-plan-v1.md
sdd/features/access-request-analytics-operations-dashboard/access-request-analytics-operations-dashboard-rollout-v1.md
sdd/features/access-request-analytics-operations-dashboard/QA_REPORT_ANCLORA_ARAN_001.md
sdd/features/access-request-analytics-operations-dashboard/GATE_FINAL_ANCLORA_ARAN_001.md
```

SDD must define problem, objective, scope, out of scope, backend/frontend contracts, KPI definitions, attention queue, security/org-scoping, performance limits, migration decision, rollout/rollback, tests and acceptance criteria.

## Backend scope

Add org-scoped analytics.

Recommended endpoint:

```text
GET /api/access-requests/analytics/summary
```

Add route before `/{request_id}` dynamic routes.

Recommended response:

```text
total_requests
pending_count
approved_count
rejected_count
cancelled_count
requests_by_product
requests_by_source
pending_older_than_24h
pending_older_than_72h
average_review_time_hours
decision_email_failed_count
decision_email_unknown_count
retry_available_count
provisioning_attention_count
generated_at
attention_items
```

Attention items should cover:

```text
pending older than 24h/72h
decision email failed
decision email unknown on terminal request
retry available
approved but provisioning not invite_ready
```

Suggested item shape:

```text
request_id
reason
severity
status
product
source
email
created_at
reviewed_at
age_hours
```

Security:

- require auth;
- preserve org scoping;
- prefer existing reviewer/manager permission for analytics;
- never expose cross-org data.

Performance:

- avoid unbounded scans;
- bounded recent sample is acceptable if documented, e.g. 500 records;
- date math must be UTC-safe;
- average review time uses valid `created_at` + `reviewed_at` only.

## Frontend scope

Enhance existing access requests page.

Add:

- KPI cards;
- product/source breakdown;
- compact attention queue;
- click attention item to open/fetch request detail;
- loading/error/empty states;
- refresh tied to current refresh flow;
- localized strings.

Prefer new components only if useful:

```text
frontend/src/components/access-requests/AccessRequestOperationsDashboard.tsx
frontend/src/components/access-requests/AccessRequestAttentionQueue.tsx
```

Use existing Nexus classes/patterns. No new UI library. No visual redesign.

## Likely files

Backend:

```text
backend/api/routes/access_requests.py
backend/models/access_requests.py
backend/services/access_request_service.py
backend/tests/test_access_request_analytics.py
```

Frontend:

```text
frontend/src/lib/access-requests-api.ts
frontend/src/app/(dashboard)/access-requests/page.tsx
frontend/src/components/access-requests/AccessRequestOperationsDashboard.tsx
frontend/src/components/access-requests/AccessRequestAttentionQueue.tsx
frontend/src/lib/i18n/translations.ts
```

Do not modify unrelated files.

## Validation

Run backend tests:

```bash
cd ~/projects/anclora-nexus
PYTHONPATH=. backend/venv/bin/pytest \
  backend/tests/test_access_request_analytics.py \
  backend/tests/test_access_request_review_routes.py \
  backend/tests/test_access_request_review_service.py \
  backend/tests/test_access_request_permissions.py \
  backend/tests/test_access_request_decision_lifecycle.py \
  backend/tests/test_access_request_decision_email_retry.py
```

Run frontend:

```bash
npm run frontend:lint
npm run build
```

Static checks:

```bash
grep -Rni "decision.reviewed_by" backend frontend/src --exclude-dir=__pycache__ --exclude-dir=node_modules || true
grep -Rni "reviewed_by" frontend/src --exclude-dir=node_modules | sed -n '1,260p'
grep -RniE "analytics|attention|aging|average_review|pending_older|retry_available|decision_email_failed" backend frontend/src sdd/features/access-request-analytics-operations-dashboard --exclude-dir=__pycache__ --exclude-dir=node_modules | sed -n '1,520p'
```

Browser smoke if tooling exists. If blocked, document honestly in QA and PR.

## QA and Gate

Update:

```text
sdd/features/access-request-analytics-operations-dashboard/QA_REPORT_ANCLORA_ARAN_001.md
sdd/features/access-request-analytics-operations-dashboard/GATE_FINAL_ANCLORA_ARAN_001.md
```

QA must include contracts inspected, Bóveda/design-system availability, implementation summary, files changed, commands/results, caveats, performance/data-limit decision, migration decision, rollout/rollback and browser smoke status.

Gate must only mark verified checks.

## Git and PR

Before commit:

```bash
git status --short
git diff --stat
git diff -- backend frontend/src sdd/features/access-request-analytics-operations-dashboard .agent/prompts/features/access-request-analytics-operations-dashboard | sed -n '1,760p'
```

Commit only if validation is acceptable:

```bash
git add backend frontend/src sdd/features/access-request-analytics-operations-dashboard
git commit -m "feat: add access request analytics operations dashboard"
git push origin sdd/access-request-analytics-operations-dashboard
```

Create PR, but do not merge:

```bash
gh pr create --base main --head sdd/access-request-analytics-operations-dashboard --title "feat: add access request analytics operations dashboard" --body "ANCLORA-ARAN-001 — Access Request Analytics & Operations Dashboard. Includes SDD, backend analytics summary, frontend operations dashboard, validation results, and documented caveats. Do not merge until reviewed."
```

## Final report required

Report branch, PR URL, commit SHA, changed files, implementation summary, contracts inspected, validation commands/results, performance/data-limit decision, migration decision, browser smoke status, caveats, and clean working tree status.

## Hard constraints

- Do not merge.
- Do not reintroduce client-supplied `reviewed_by`.
- Do not bypass backend permissions or org scoping.
- Do not fake analytics.
- Do not add a UI library.
- Do not redesign from scratch.
- Do not ignore localization.
- Do not add SQL migration unless unavoidable and documented.
- Do not commit unrelated files.
