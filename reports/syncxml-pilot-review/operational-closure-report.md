# Nexus SyncXML pilot review operational closure

Date: 2026-05-31

## 1. Initial state

Nexus already persisted SyncXML pilot leads and created manual review tasks. The remaining gap was manual reviewer action handling: approve, reject or request more information, with provisioning delegated to SyncXML.

## 2. Changes applied

- Added protected routes under `/api/syncxml-pilot/{request_id}` for approve, reject and request-more-info.
- Added SyncXML internal provisioning client using `SYNCXML_INTERNAL_API_URL` and `SYNCXML_INTERNAL_API_SECRET`.
- Added acceptance and more-info email builders with SyncXML-specific pilot constraints.
- Added task UI panel for `syncxml_pilot_review` tasks with Hermes score, decision, flags and credential/email status.
- Added source/product labels and filters for `syncxml` and `syncxml_landing`.
- Added dry-run smoke scripts for email content and manual review task payloads.

## 3. Resolved items

- Reviewers can approve a pending SyncXML request from Nexus.
- Approval calls SyncXML to create or rotate a pilot user before sending credentials.
- Rejection sends a controlled rejection reason.
- More-info action keeps the request pending and sends an explanatory email.
- Credential/email failures return the request to manual review with metadata for operators.

## 4. Still requiring secrets or external access

- Supabase service role and real schema access.
- Native SMTP/Resend-compatible email transport.
- SyncXML internal endpoint URL and shared secret.
- Authenticated reviewer account with the `access_request_reviewer` capability.

## 5. Required variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PUBLIC_CTA_ORG_ID` or `LEGACY_SINGLE_TENANT_ORG_ID`
- `SYNCXML_INTERNAL_API_URL`
- `SYNCXML_INTERNAL_API_SECRET`
- `SYNCXML_APP_URL`
- `SYNCXML_LOGIN_URL`
- SMTP/native email variables used by the existing email transport.

## 6. Tests executed

- `python3 -m py_compile backend/services/syncxml_pilot_service.py backend/api/routes/syncxml_pilot.py backend/api/main.py backend/services/access_request_email_service.py backend/config.py`
- `SUPABASE_URL=... backend/.venv/bin/python -m pytest backend/tests/test_syncxml_pilot_tasks.py -q`
- `npm run lint` in `frontend/`
- `npm run build` in `frontend/`

## 7. Test results

- Python compile: passed.
- Targeted pytest: passed, 1 test.
- Frontend lint: passed with one pre-existing warning in `frontend/src/app/login/page.tsx` for unused `portalKey`.
- Frontend production build: passed. Next.js emitted dynamic route prerender notices for existing cookie-dependent routes, then completed successfully.

## 8. Smoke tests

- `backend/scripts/smoke_syncxml_email.py` passed in dry-run mode.
- `backend/scripts/smoke_syncxml_pilot_task.py` passed in dry-run mode and refused real Supabase writes without `ALLOW_REAL_SUPABASE_WRITE=true`.

## 9. Visual QA

- Build-level validation confirms the task UI compiles with the new SyncXML panel and action controls.
- Browser visual confirmation of `/tasks` with a real `syncxml_pilot_review` task is still pending because it requires authenticated Nexus data.

## 10. Manual testing

- Recommended manual flow: open a real `syncxml_pilot_review` task, approve, confirm SyncXML credentials returned, check acceptance email, reject another test lead, request more info on a third lead.
- This was not executed end-to-end because production/staging credentials were not provided.

## 11. Risks

- Supabase table constraints must accept the task metadata fields used by `syncxml_pilot_review`.
- Real email failure paths should be observed once SMTP/Resend is configured.
- The browser reload after task action is simple but can be refined later into optimistic state refresh.

## 12. Commit and PR recommendation

Create one scoped Nexus PR for SyncXML pilot review operations, including backend routes, UI actions, smoke scripts and docs. Link it to the SyncXML PR because approval depends on the internal provisioning endpoint.
