# Implementation Report — Anclora Intake Contract v1

**Date:** 2026-06-20  
**Scope:** 7 repositories  
**Branch (Nexus):** feat/anclora-intake-contract-v1  
**No remote deployments made.**

---

## Final Delivery Matrix

| Repo | Change applied | Contract role | Tests | No deploy | Pending risk |
|---|---|---|---|---|---|
| anclora-nexus | Python model, migration 072, access_requests service+routes, internal webhooks (+2 new endpoints), frontend label fix, TS types, i18n | Consumer | 40 passed (23 contract + 17 syncxml) | ✅ | Migration must be applied to Supabase |
| anclora-syncxml | `/api/pilot/request` emits v1 envelope with idempotency_key | Emitter | No new tests (existing pilot flow) | ✅ | None |
| anclora-private-estates-landing | `lead-intake.ts` builds v1 envelope from intent mapping | Emitter | No new tests | ✅ | None |
| anclora-private-estates | `ContactSection.tsx` emits v1 envelope with commercial_lead domain | Emitter | No new tests | ✅ | None |
| anclora-synergi | New `nexus-intake-forward.ts`; partner-admission route uses `after()` to forward | Emitter | No new tests (fire-and-forget) | ✅ | Requires `NEXUS_BASE_URL` + `NEXUS_INTERNAL_API_KEY` env vars in Synergi Vercel project |
| anclora-data-lab | New `nexus-intake-forward.ts`; access-request route uses `after()` to forward | Emitter | No new tests (fire-and-forget) | ✅ | Requires `NEXUS_BASE_URL` + `NEXUS_INTERNAL_API_KEY` env vars in Data Lab Vercel project |
| Bóveda (contracts) | `ANCLORA_INTAKE_CONTRACT_V1.md` canonical spec + changelog | Reference | N/A | ✅ | None |

---

## Root Issues Resolved

### 1. Semantic ambiguity across entry points

**Before:** `source='landing'` was reused across SyncXML, Synergi, and PE Landing with no way to distinguish origin or routing intent.

**After:** 8 canonical `IntakeSource` values. Migration 072 backfills historical `landing` records to per-product values using CASE on `product`.

### 2. SyncXML mislabeled as "Synergi" in Nexus UI

**Before:** `productLabel()` in `AccessRequestsTable.tsx` had `return 'Synergi'` as fallback, so any non-`data_lab` product (including syncxml) showed as "Synergi".

**After:** `PRODUCT_LABELS` record covers all 3 products explicitly. Unknown products return `'No reconocido'`.

### 3. No canonical routing contract

**Before:** Each service had its own ad-hoc routing logic, inconsistently applied.

**After:** `resolve_routing(domain, request_type) → RoutingTargetDomain` in `backend/models/intake_contract.py` is the single source of truth. 9 routing tests verify the table.

### 4. Synergi and Data Lab submissions not visible in Nexus access_requests

**Before:** Synergi and Data Lab each wrote to their own Neon DBs without forwarding to Nexus.

**After:** Both apps call `after(() => forwardToNexus(...))` after successful local persistence. Two new Nexus webhook endpoints (`/api/internal/webhooks/synergi-admission`, `/api/internal/webhooks/data-lab-access`) receive and deduplicate these payloads.

---

## Files Modified

### anclora-nexus

| File | Change |
|---|---|
| `backend/models/intake_contract.py` | NEW — canonical Python model, 5 enums, `AncloraIntakeV1`, `resolve_routing()` |
| `supabase/migrations/072_anclora_intake_contract_v1.sql` | NEW — adds 6 columns to `access_requests`, backfill, indexes |
| `backend/api/internal_webhooks.py` | +2 endpoints: `synergi-admission`, `data-lab-access`; +helper `_upsert_intake_access_request()` |
| `backend/models/access_requests.py` | New sources, new optional response fields |
| `backend/services/access_request_service.py` | v1 fields on create; `request_type` + `intake_domain` filters on list |
| `backend/services/syncxml_pilot_service.py` | v1 fields in `record_data` |
| `backend/api/routes/access_requests.py` | `request_type` + `intake_domain` query params |
| `frontend/src/components/access-requests/AccessRequestsTable.tsx` | `PRODUCT_LABELS` record fix; `sourceLabel()` extended |
| `frontend/src/lib/access-requests-api.ts` | New source values, v1 types on `AccessRequest` |
| `frontend/src/lib/i18n/translations.ts` | 4 new source translation keys in all 4 locales |
| `backend/tests/test_intake_contract.py` | NEW — 23 tests |
| `docs/api/anclora-intake-contract-v1.md` | NEW — API reference |
| `docs/recovery/anclora-intake-contract-v1-test-evidence.md` | NEW |
| `docs/recovery/anclora-intake-contract-v1-migration-plan.md` | NEW |
| `docs/recovery/anclora-intake-contract-v1-implementation-report.md` | NEW (this file) |

### anclora-syncxml

| File | Change |
|---|---|
| `src/app/api/pilot/request/route.ts` | v1 fields + `idempotency_key` added to normalized payload |

### anclora-private-estates-landing

| File | Change |
|---|---|
| `src/lib/lead-intake.ts` | v1 types, `buildLeadIntakePayload()` generates idempotency key and v1 fields |

### anclora-private-estates

| File | Change |
|---|---|
| `src/sections/ContactSection.tsx` | v1 envelope fields added to form submission payload |

### anclora-synergi

| File | Change |
|---|---|
| `src/lib/nexus-intake-forward.ts` | NEW — `buildSynergiAdmissionIntakePayload()` + `forwardSynergiAdmissionToNexus()` |
| `src/app/api/partner-admission/route.ts` | `after()` forward added after successful Neon persistence |

### anclora-data-lab

| File | Change |
|---|---|
| `src/lib/nexus-intake-forward.ts` | NEW — `buildDataLabAccessIntakePayload()` + `forwardDataLabAccessToNexus()` |
| `src/app/api/access-request/route.ts` | Rewritten to add `after()` forward |

### Bóveda (contracts)

| File | Change |
|---|---|
| `docs/contracts/ANCLORA_INTAKE_CONTRACT_V1.md` | NEW — canonical spec |
| `docs/contracts/ANCLORA_INTAKE_CONTRACT_V1_CHANGELOG.md` | NEW — v1.0.0 entry |

---

## Binding Decisions (non-negotiable, preserved)

- **SyncXML is an independent commercializable product** — never falls back to "Synergi"
- **PE Landing and PE web are commercial surfaces** — their entries are `commercial_lead`, not `access_request`
- **No silent product fallbacks** — unknown products surface as "No reconocido" in UI
- **AI cannot make final autonomous decisions** on access, rejection, provisioning, KYC, or sensitive data
- **`SYNCXML_PILOT_AUTO_APPROVE=false`** remains the safe default
- **Commercial leads require human review** before any irreversible action

---

## Security Confirmations

- No `git reset --hard`, `git clean -fd`, or `git push --force` used
- No `DROP TABLE`, `TRUNCATE`, or unfiltered `DELETE` in migration 072
- No remote deployment to Render, Vercel, or Supabase production
- No remote secrets changed
- `ALLOW_REAL_SUPABASE_WRITE` not set
- No real emails sent or real users provisioned

---

## Pre-Deploy Checklist

Before applying migration 072 to the Nexus Supabase:
1. Take a snapshot/backup of `access_requests` and `lead_intake` tables
2. Run migration in a staging environment first
3. Verify backfill results: `SELECT source, COUNT(*) FROM access_requests GROUP BY source;`
4. Verify `request_type` populated: `SELECT request_type, COUNT(*) FROM access_requests GROUP BY request_type;`

Before deploying Synergi and Data Lab:
1. Add `NEXUS_BASE_URL` and `NEXUS_INTERNAL_API_KEY` to each Vercel project's environment variables
2. Confirm `NEXUS_INTERNAL_API_KEY` matches the value in Nexus Render environment
3. The forward is fire-and-forget — missing env vars log a warning and skip silently (safe)
