# SyncXML pilot review flow
 
### Auto-approval control

Auto-approval is governed by the `SYNCXML_PILOT_AUTO_APPROVE` environment variable (default: `false`). When `false`, all eligible requests result in a `syncxml_pilot_review` task. When `true`, Nexus will automatically approve requests with high scores (>= 85) that do not mention production or real data use.

Nexus receives SyncXML controlled pilot requests through:

`POST /api/internal/webhooks/syncxml-pilot`

The webhook requires a bearer token matching `SYNCXML_WEBHOOK_SECRET` or the legacy `NEXUS_INTERNAL_API_KEY`.

Flow:

1. Validate request payload.
2. Persist as `access_requests.product = syncxml` and `source = syncxml_landing`.
3. Send structured scoring request to Hermes worker.
4. By default, all requests create a manual review task. Auto-approval is disabled unless SYNCXML_PILOT_AUTO_APPROVE=true is explicitly set for clear low-risk cases with `decision=approve`, `score >= 85` and no risk flags.
5. Reject only clear low-score rejected cases or missing mandatory pilot conditions.
6. Send all ambiguous, duplicate, production, real-data or automation-failure cases to manual review.
7. Create `tasks.task_type = syncxml_pilot_review` with badge `SyncXML · Piloto controlado`.

Hermes recommendations are advisory. Nexus remains the decision authority.
