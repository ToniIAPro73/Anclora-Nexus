# Environment setup — Nexus SyncXML pilot review

Configure these variables in Render/Vercel/local backend environment.

```env
APP_ENV=staging
SYNCXML_ENV=staging
ALLOW_REAL_SUPABASE_WRITE=false
USE_SYNTHETIC_DATA_ONLY=true
SYNCXML_PILOT_AUTO_APPROVE=false
RESEND_API_KEY=
RESEND_FROM=
RESEND_REPLY_TO=
ADMIN_EMAILS=antonio@anclora.com
HERMES_WORKER_URL=
HERMES_WORKER_API_KEY=
SYNCXML_APP_URL=
SYNCXML_LOGIN_URL=
SYNCXML_WEBHOOK_SECRET=
SYNCXML_INTERNAL_API_URL=
SYNCXML_INTERNAL_API_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

Repo-specific notes:

- Nexus uses Resend when `RESEND_API_KEY` and `RESEND_FROM` are configured.
- SMTP remains available as fallback by configuring `SMTP_HOST`, `SMTP_FROM_EMAIL`, `SMTP_USERNAME`, `SMTP_PASSWORD`.
- `SYNCXML_INTERNAL_API_URL` should point to `https://<syncxml-domain>/api/internal/pilot-users`.
- `SYNCXML_INTERNAL_API_SECRET` must match SyncXML `SYNCXML_INTERNAL_API_SECRET`.
- `SYNCXML_WEBHOOK_SECRET` must match SyncXML `NEXUS_SYNCXML_WEBHOOK_SECRET`.

Smoke tests:

```bash
DRY_RUN=true python3 backend/scripts/smoke_syncxml_email.py
DRY_RUN=false SMOKE_EMAIL_TO=toni@example.com python3 backend/scripts/smoke_syncxml_email.py
python3 backend/scripts/smoke_syncxml_pilot_task.py
ALLOW_REAL_SUPABASE_WRITE=true python3 backend/scripts/smoke_syncxml_pilot_task.py
```

Real Supabase writes are blocked unless all of these are true:

- `APP_ENV=production`
- `SYNCXML_ENV=production`
- `ALLOW_REAL_SUPABASE_WRITE=true`
- `USE_SYNTHETIC_DATA_ONLY=false`

In staging, preview and development, keep `SYNCXML_PILOT_AUTO_APPROVE=false` and treat the flow as review-only.

Deployment checklist:

1. Configure Hermes worker variables and redeploy Hermes.
2. Configure Nexus variables and redeploy Nexus.
3. Configure SyncXML variables and redeploy SyncXML.
4. Check `/health` on Nexus and `/ready` on Hermes.
5. Submit a pilot request from SyncXML.
6. Verify `access_requests` and `tasks.task_type=syncxml_pilot_review`.
7. Approve manually in Nexus only in an environment explicitly allowed for real writes.
8. Confirm SyncXML creates `PilotUser` only after those guards are intentionally enabled.
9. Confirm acceptance email contains `/login`, email and temporary password only in the approved real-write flow.
10. Confirm login succeeds.
