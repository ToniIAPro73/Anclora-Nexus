# Environment setup — Nexus SyncXML pilot review

Configure these variables in Render/Vercel/local backend environment.

```env
RESEND_API_KEY=
RESEND_FROM=
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

- Nexus currently has SMTP-native email transport in `backend/services/email_delivery_service.py`; configure `SMTP_HOST`, `SMTP_FROM_EMAIL`, `SMTP_USERNAME`, `SMTP_PASSWORD` when using SMTP.
- `RESEND_*` variables are documented for deployment parity, but Resend delivery requires wiring a Resend transport or using the SyncXML-side smoke script.
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

Real Supabase writes are blocked unless `ALLOW_REAL_SUPABASE_WRITE=true`.

Deployment checklist:

1. Configure Hermes worker variables and redeploy Hermes.
2. Configure Nexus variables and redeploy Nexus.
3. Configure SyncXML variables and redeploy SyncXML.
4. Check `/health` on Nexus and `/ready` on Hermes.
5. Submit a pilot request from SyncXML.
6. Verify `access_requests` and `tasks.task_type=syncxml_pilot_review`.
7. Approve manually in Nexus.
8. Confirm SyncXML creates `PilotUser`.
9. Confirm acceptance email contains `/login`, email and temporary password.
10. Confirm login succeeds.
