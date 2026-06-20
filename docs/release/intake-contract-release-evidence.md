# Release Evidence — Anclora Intake Access/Commercial Separation

**Date:** 2026-06-21
**Scope:** 3 repositories (anclora-nexus, anclora-private-estates-landing, anclora-private-estates)
**Branch (Nexus):** feature/intake-access-commercial-separation (→ development → staging → production → main)
**No remote deployments made in this session.**

---

## What Changed

### Problem Addressed

1. `access_requests` table was receiving commercial leads from PE Landing and PE Web — violating domain separation
2. `backend/main.py` never registered `public_router`, making all `/api/public/*` endpoints unreachable in production (silent 404s)
3. No canonical commercial intake endpoint existed
4. UI showed "Landing (legado)" source filter and "Producto" column label

### Solution Delivered

| Layer | Change |
|---|---|
| Backend model | `AccessRequestSource` enum cleaned: LANDING, PRIVATE_ESTATES_LANDING, PRIVATE_ESTATES_WEB removed |
| Backend service | `list_requests()` defaults to `intake_domain='access_request'` — commercial leads never appear in access-requests view |
| Backend routes | New `POST /api/public/intake/commercial-leads` (canonical) + `POST /api/public/lead-intake` (alias) |
| Backend main | `public_router` registered in `backend/main.py` (production entrypoint) — critical gap closed |
| DB migration | `supabase/migrations/20260620120000_access_requests_access_only_constraints.sql` — 7 CHECK constraints enforcing access-only at DB level |
| Frontend labels | `accessRequestsColumnProduct`: "Producto" → "Producto destino" (ES, EN, DE, CA) |
| Frontend filters | Removed "Landing (legado)" option; added "Nexus manual" and "External API"; passes `intake_domain: 'access_request'` |
| PE Landing | `DEFAULT_PUBLIC_LEAD_INTAKE_PATH` → `/api/public/intake/commercial-leads` |
| PE Web | `ContactSection.tsx` fallback URL → `/api/public/intake/commercial-leads` |

---

## Files Modified

### anclora-nexus

| File | Change |
|---|---|
| `backend/main.py` | Added `public_router` import + `include_router` |
| `backend/models/access_requests.py` | Removed 3 commercial enum values |
| `backend/services/access_request_service.py` | `list_requests()` defaults to access_request domain |
| `backend/api/routes/public.py` | New `/intake/commercial-leads` endpoint + `/lead-intake` alias |
| `frontend/src/lib/i18n/translations.ts` | Column label updated in 4 locales |
| `frontend/src/lib/access-requests-api.ts` | AccessRequestSource type cleaned; intake_domain filter |
| `frontend/src/app/(dashboard)/access-requests/page.tsx` | Source filter + intake_domain param |
| `frontend/src/components/access-requests/AccessRequestsTable.tsx` | sourceLabel() map cleaned |
| `supabase/migrations/20260620120000_access_requests_access_only_constraints.sql` | NEW forward-only migration |
| `backend/tests/test_access_domain_separation.py` | NEW — 17 separation tests |

### anclora-private-estates-landing

| File | Change |
|---|---|
| `src/lib/lead-intake.ts` | Endpoint URL updated to `/api/public/intake/commercial-leads` |

### anclora-private-estates

| File | Change |
|---|---|
| `src/sections/ContactSection.tsx` | Fallback URL updated to `/api/public/intake/commercial-leads` |

---

## Quality Gates

| Gate | Status | Detail |
|---|---|---|
| pytest (key suites) | ✅ PASS | 67 passed, 0 failed |
| test_access_domain_separation | ✅ PASS | 17/17 passed |
| tsc --noEmit (anclora-nexus/frontend) | ✅ PASS | 0 errors |
| tsc --noEmit (anclora-private-estates-landing) | ✅ PASS | 0 errors |
| tsc --noEmit (anclora-private-estates) | ✅ PASS | 0 errors |
| STAGING_INDEPENDENCE_GATE | ⏸ BLOCKED | Manual verification required |

---

## Security Confirmations

- No `git reset --hard`, `git clean -fd`, or `git push --force` used
- No `DROP TABLE`, `TRUNCATE`, or unfiltered `DELETE` in migration
- No remote deployment to Render, Vercel, or Supabase production
- No secrets exposed in frontend code
- Migration is forward-only (additive CHECK constraints only)
- `SYNCXML_PILOT_AUTO_APPROVE=false` unchanged

---

## Pending Manual Actions

1. **STAGING_INDEPENDENCE_GATE**: Verify that Supabase staging URL ≠ production URL before applying migration
2. **Apply migration to staging**: `supabase db push --db-url "$STAGING_DB_URL"` after backup
3. **Verify constraints in staging**: `SELECT constraint_name FROM information_schema.table_constraints WHERE table_name='access_requests' AND constraint_type='CHECK';`
4. **Apply to production**: After STAGING_RELEASE_GATE = PASS, with explicit stakeholder approval

---

## Binding Product Decisions (reconfirmed)

- **SyncXML is an independent commercializable product** — never falls back to "Synergi"
- **PE Landing and PE Web are commercial surfaces only** — their entries are `commercial_lead`, not `access_request`
- **`SYNCXML_PILOT_AUTO_APPROVE=false`** is the safe default — never set to true in production
- **AI cannot make autonomous decisions** on access, rejection, provisioning, KYC, or compliance
