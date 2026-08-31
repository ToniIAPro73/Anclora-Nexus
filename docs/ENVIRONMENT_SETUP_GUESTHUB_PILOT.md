# Environment setup — Nexus GuestHub pilot review

> Renamed 2026-08: Anclora SyncXML → Anclora GuestHub. Canonical env names are
> `GUESTHUB_*`; the backend accepts the legacy `SYNCXML_*` names as fallback during
> the transition. Persisted DB values and webhook paths stay legacy (no data migration).

Configure these variables in Render/Vercel/local backend environment.

```env
APP_ENV=staging
GUESTHUB_ENV=staging
ALLOW_REAL_SUPABASE_WRITE=false
USE_SYNTHETIC_DATA_ONLY=true
GUESTHUB_PILOT_AUTO_APPROVE=false
RESEND_API_KEY=
RESEND_FROM=
RESEND_REPLY_TO=
ADMIN_EMAILS=antonio@anclora.com
HERMES_WORKER_URL=
HERMES_WORKER_API_KEY=
GUESTHUB_APP_URL=
GUESTHUB_LOGIN_URL=
GUESTHUB_WEBHOOK_SECRET=
GUESTHUB_INTERNAL_API_URL=
GUESTHUB_INTERNAL_API_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Repo-specific notes:

- Nexus uses Resend when `RESEND_API_KEY` and `RESEND_FROM` are configured.
- SMTP remains available as fallback by configuring `SMTP_HOST`, `SMTP_FROM_EMAIL`, `SMTP_USERNAME`, `SMTP_PASSWORD`.
- `GUESTHUB_INTERNAL_API_URL` should point to `https://<guesthub-domain>/api/internal/pilot-users` (currently the legacy `anclora-syncxml.vercel.app` deployment until the owner decides the new domain).
- Cross-repo secret pairing: Nexus `GUESTHUB_INTERNAL_API_SECRET` must match the GuestHub product's `GUESTHUB_INTERNAL_API_SECRET` (legacy `SYNCXML_INTERNAL_API_SECRET` on both sides during the transition).
- Cross-repo secret pairing: Nexus `GUESTHUB_WEBHOOK_SECRET` must match the GuestHub product's `NEXUS_GUESTHUB_WEBHOOK_SECRET` (legacy `SYNCXML_WEBHOOK_SECRET` ↔ `NEXUS_SYNCXML_WEBHOOK_SECRET` during the transition).

Smoke tests:

```bash
DRY_RUN=true python3 backend/scripts/smoke_guesthub_email.py
DRY_RUN=false SMOKE_EMAIL_TO=toni@example.com python3 backend/scripts/smoke_guesthub_email.py
python3 backend/scripts/smoke_guesthub_pilot_task.py
ALLOW_REAL_SUPABASE_WRITE=true python3 backend/scripts/smoke_guesthub_pilot_task.py
```

Real Supabase writes are blocked unless all of these are true:

- `APP_ENV=production`
- `GUESTHUB_ENV=production` (legacy `SYNCXML_ENV`)
- `ALLOW_REAL_SUPABASE_WRITE=true`
- `USE_SYNTHETIC_DATA_ONLY=false`

In staging, preview and development, keep `GUESTHUB_PILOT_AUTO_APPROVE=false` and treat the flow as review-only.

Deployment checklist:

1. Configure Hermes worker variables and redeploy Hermes.
2. Configure Nexus variables and redeploy Nexus.
3. Configure GuestHub variables and redeploy GuestHub.
4. Check `/health` on Nexus and `/ready` on Hermes.
5. Submit a pilot request from GuestHub.
6. Verify `access_requests` and `tasks.task_type=syncxml_pilot_review` (legacy value, unchanged).
7. Approve manually in Nexus only in an environment explicitly allowed for real writes.
8. Confirm GuestHub creates `PilotUser` only after those guards are intentionally enabled.
9. Confirm acceptance email contains `/login`, email and temporary password only in the approved real-write flow.
10. Confirm login succeeds.
