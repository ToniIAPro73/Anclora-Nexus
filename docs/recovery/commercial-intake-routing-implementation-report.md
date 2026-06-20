# Implementation Report — Commercial Intake Routing

**Date:** 2026-06-21
**Branch:** feature/intake-access-commercial-separation

---

## Root Issue #1 — `public_router` not registered in production

**Discovery:** During code audit, `backend/main.py` (production entrypoint, used by Render) had no registration of `public_router`. The router existed in `backend/api/routes/public.py` and was registered in `backend/api/main.py` (local dev entrypoint), but NOT in `backend/main.py`.

**Effect:** All `/api/public/*` endpoints were silently 404ing in production. This includes `/api/public/cta/lead`, `/api/public/valuation-requests`, and all public intake endpoints.

**Fix:** Added to `backend/main.py` before the `/health` route:
```python
from backend.api.routes.public import router as public_router
app.include_router(public_router, prefix="/api/public", tags=["Public"])
```

---

## Root Issue #2 — No canonical commercial intake endpoint

**Discovery:** PE Landing called `/api/public/lead-intake` which did not exist in either entrypoint. PE Web called `https://nexus.anclora.group/api/public/cta/lead` as fallback (incorrect for commercial leads).

**Fix:** Added two endpoints to `backend/api/routes/public.py`:
- `POST /intake/commercial-leads` — canonical, validates `intake_domain='commercial_lead'`, routes to `valuation_requests` (for `seller_valuation_request`) or `leads_pipeline` (for other types)
- `POST /lead-intake` — backward-compat alias, delegates to the canonical handler

---

## Root Issue #3 — `AccessRequestSource` included commercial sources

**Discovery:** The Python enum `AccessRequestSource` included `LANDING`, `PRIVATE_ESTATES_LANDING`, `PRIVATE_ESTATES_WEB` — allowing commercial sources to pass validation in access request creation paths.

**Fix:** Removed the three commercial values. The enum now only contains:
- `SYNCXML_LANDING`
- `SYNERGI_APP`
- `DATA_LAB_APP`
- `NEXUS_MANUAL`
- `EXTERNAL_API`

---

## Root Issue #4 — `list_requests()` would return commercial leads

**Discovery:** If `intake_domain` filter was omitted in a `listAccessRequests()` call, the service would return ALL records regardless of domain.

**Fix:** Service now defaults:
```python
if not intake_domain:
    intake_domain = "access_request"
query = query.eq("intake_domain", intake_domain)
```

---

## DB Enforcement

Migration `20260620120000_access_requests_access_only_constraints.sql` adds 7 CHECK constraints to `access_requests`. Pending application to staging and then production.

---

## Routing Map

| Source | intake_domain | routing_target_domain |
|---|---|---|
| syncxml_landing | access_request | access_requests |
| synergi_app | access_request | access_requests |
| data_lab_app | access_request | access_requests |
| nexus_manual | access_request | access_requests |
| external_api | access_request | access_requests |
| private_estates_landing | commercial_lead | valuation_requests / leads_pipeline |
| private_estates_web | commercial_lead | leads_pipeline |
