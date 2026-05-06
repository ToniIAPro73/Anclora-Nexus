# Access Request Admin Console Operations — Test Plan v1

Feature ID: ANCLORA-ARCO-001  
Status: Draft

## Backend

Run:

```bash
PYTHONPATH=. backend/venv/bin/pytest \
  backend/tests/test_access_request_review_routes.py \
  backend/tests/test_access_request_review_service.py \
  backend/tests/test_access_request_admin_operations_routes.py \
  backend/tests/test_access_request_permissions.py
```

Required cases:

- authorized owner/manager can approve;
- unauthorized agent receives `403`;
- missing auth receives `401`;
- invalid transition remains `409`;
- missing request remains `404`;
- approve/reject derive reviewer from auth context;
- audit endpoint returns scoped real audit log rows;
- filters pass through and service filters by org/source/email/date.

## Frontend

Run:

```bash
npm run frontend:lint
npm run build
```

Required checks:

- TypeScript/build valid;
- no approve/reject payload includes `reviewed_by`;
- new strings exist for active locales;
- UI remains on existing Nexus primitives.

## Static Checks

```bash
grep -Rni "reviewed_by" frontend/src --exclude-dir=node_modules | sed -n '1,220p'
grep -Rni "decision.reviewed_by" backend frontend/src --exclude-dir=__pycache__ --exclude-dir=node_modules || true
grep -RniE "ACCESS_REQUEST|FORBIDDEN|reviewer|permission|role" backend/api backend/services backend/models backend/tests --exclude-dir=__pycache__ | sed -n '1,260p'
```

Acceptance:

- no `decision.reviewed_by`;
- no client-supplied `reviewed_by`;
- backend permission check exists;
- unauthorized route path covered.
