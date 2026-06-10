# SyncXML pilot review flow
 
### Auto-approval control

Auto-approval is governed by `SYNCXML_PILOT_AUTO_APPROVE` together with the staging safety guards. By default it is disabled. Even if the flag is `true`, Nexus must stay fail-closed and only allow real approval/provisioning when all of these are true:

- `APP_ENV=production`
- `SYNCXML_ENV=production`
- `ALLOW_REAL_SUPABASE_WRITE=true`
- `USE_SYNTHETIC_DATA_ONLY=false`

If any of those conditions is not met, Nexus must block real writes and return a controlled `REAL_SUPABASE_WRITE_BLOCKED` response instead of creating pilot users or mutating real approval state.

Nexus receives SyncXML controlled pilot requests through:

`POST /api/internal/webhooks/syncxml-pilot`

The webhook requires a bearer token matching `SYNCXML_WEBHOOK_SECRET` or the legacy `NEXUS_INTERNAL_API_KEY`.

Flow:

1. Validate request payload.
2. Persist as `access_requests.product = syncxml` and `source = syncxml_landing`.
3. Send structured scoring request to Hermes worker.
4. By default, all requests create a manual review task. Auto-approval is disabled unless `SYNCXML_PILOT_AUTO_APPROVE=true` is explicitly set and the environment is explicit production-safe for real writes.
5. Reject only clear low-score rejected cases or missing mandatory pilot conditions.
6. Send all ambiguous, duplicate, production, real-data or automation-failure cases to manual review.
7. Create `tasks.task_type = syncxml_pilot_review` with badge `SyncXML · Piloto controlado`.

Hermes recommendations are advisory. Nexus remains the decision authority.
