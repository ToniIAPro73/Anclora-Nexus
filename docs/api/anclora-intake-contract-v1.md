# Anclora Intake Contract v1 — Nexus API Reference

**Schema version:** `anclora-intake-v1`  
**Effective:** 2026-06-20

> **Alias/supersession note (2026-08):** the product formerly known as **Anclora SyncXML**
> (repo `anclora-syncxml`) has been renamed to **Anclora GuestHub** (repo `anclora-guesthub`).
> All wire values in this v1 document — `anclora-syncxml` producer id, `syncxml` /
> `syncxml_landing` enums, `/api/internal/webhooks/syncxml-pilot` path — remain **valid legacy
> identifiers** and continue to be accepted unchanged. A v2 contract (`anclora-intake-v2`)
> with renamed values may follow; until then this v1 document stays the SSOT. Do not change
> wire values in place.

---

## Overview

The Anclora Intake Contract v1 is the canonical envelope that all entry points across the Anclora platform must produce. It eliminates semantic ambiguity between source, request type, target product, and operational routing domain.

Nexus is the **consumer** of this contract. Producers are:

| Producer | Entry point | Contract role |
|---|---|---|
| anclora-syncxml | `/api/pilot/request` | Emitter |
| anclora-synergi | `/api/partner-admission` | Emitter (via Nexus forward) |
| anclora-data-lab | `/api/access-request` | Emitter (via Nexus forward) |
| anclora-private-estates-landing | lead-intake lib | Emitter |
| anclora-private-estates | ContactSection | Emitter |

---

## Internal Webhook Endpoints

All internal webhooks require `Authorization: Bearer <NEXUS_INTERNAL_API_KEY>`.

### POST `/api/internal/webhooks/syncxml-pilot`

Receives a SyncXML pilot request. Processed by `syncxml_pilot_service`.

**Request body:** SyncXML pilot payload (free-form dict, validated by service layer)

**Response:**
```json
{ "status": "accepted", "request_id": "<uuid>" }
```

---

### POST `/api/internal/webhooks/synergi-admission`

Receives a Synergi partner admission forwarded with the v1 contract envelope.

**Required fields:**
- `applicant.email` (string)
- `applicant.name` (string)

**Optional v1 fields honored:**
- `idempotency_key` — deduplicates concurrent or retried forwards
- `source` — defaults to `synergi_app`
- `request_type` — defaults to `partner_admission`

**Response:**
```json
{ "status": "accepted", "request_id": "<uuid>", "idempotent": false }
```

`idempotent: true` when a record with the same `idempotency_key` already existed.

---

### POST `/api/internal/webhooks/data-lab-access`

Receives a Data Lab access request forwarded with the v1 contract envelope.

**Required fields:**
- `applicant.email` (string)
- `applicant.name` (string)

**Optional v1 fields honored:**
- `idempotency_key` — deduplicates concurrent or retried forwards
- `source` — defaults to `data_lab_app`
- `request_type` — defaults to `access_request`

**Response:**
```json
{ "status": "accepted", "request_id": "<uuid>", "idempotent": false }
```

---

## Contract Fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `schema_version` | `"anclora-intake-v1"` | Yes | Literal |
| `intake_domain` | `access_request \| commercial_lead` | Yes | Determines routing table |
| `request_type` | See enum below | Yes | Must be valid for the domain |
| `source` | See enum below | Yes | Canonical source identifier |
| `target_product` | `syncxml \| synergi \| data_lab \| null` | Conditional | Required for `access_request` domain; must be null for `commercial_lead` |
| `service_interest` | string \| null | No | Meaningful for commercial leads |
| `idempotency_key` | UUID string | Recommended | Producer generates once; Nexus deduplicates |
| `routing_target_domain` | See enum below | Yes | Derived from routing table |

### IntakeRequestType values

| Value | Domain |
|---|---|
| `pilot_request` | `access_request` |
| `partner_admission` | `access_request` |
| `access_request` | `access_request` |
| `seller_lead` | `commercial_lead` |
| `buyer_lead` | `commercial_lead` |
| `seller_valuation_request` | `commercial_lead` |
| `vacation_rental_management_interest` | `commercial_lead` |
| `property_inquiry` | `commercial_lead` |
| `general_commercial_inquiry` | `commercial_lead` |

### IntakeSource values

| Value | App | Notes |
|---|---|---|
| `syncxml_landing` | anclora-syncxml | SyncXML pilot request form |
| `synergi_app` | anclora-synergi | Partner admission form |
| `data_lab_app` | anclora-data-lab | Data Lab access request form |
| `private_estates_landing` | anclora-private-estates-landing | Commercial leads only |
| `private_estates_web` | anclora-private-estates | Commercial leads only |
| `nexus_manual` | Nexus admin UI | Manual entries |
| `external_api` | External integrations | API clients |
| `landing` | Legacy | Deprecated — use specific values |

### RoutingTargetDomain values

| Value | Destination |
|---|---|
| `access_requests` | `access_requests` Supabase table |
| `leads` | Commercial leads store |
| `buyers` | Buyer lead store |
| `valuations` | Valuation request store |

---

## Routing Table

Deterministic mapping — no fallbacks, no AI decisions.

| `intake_domain` | `request_type` | `routing_target_domain` |
|---|---|---|
| `access_request` | `pilot_request` | `access_requests` |
| `access_request` | `partner_admission` | `access_requests` |
| `access_request` | `access_request` | `access_requests` |
| `commercial_lead` | `seller_lead` | `leads` |
| `commercial_lead` | `seller_valuation_request` | `valuations` |
| `commercial_lead` | `buyer_lead` | `buyers` |
| `commercial_lead` | `vacation_rental_management_interest` | `leads` |
| `commercial_lead` | `property_inquiry` | `leads` |
| `commercial_lead` | `general_commercial_inquiry` | `leads` |

---

## Semantic Rules (Validation)

1. `access_request` domain requires `target_product != null`
2. `commercial_lead` domain requires `target_product == null`
3. Source-product coherence enforced (e.g. `syncxml_landing` can only produce `target_product=syncxml`)
4. PE sources (`private_estates_landing`, `private_estates_web`) are commercial-only — cannot create `access_request` domain entries
5. `request_type` must be valid for the declared `intake_domain`

---

## AI Policy

AI may assist classification but **cannot make autonomous decisions** on:
- Access grants or rejections
- Provisioning or onboarding
- KYC or compliance verification
- Sensitive data handling

`SYNCXML_PILOT_AUTO_APPROVE=false` is the safe default and must remain so.

---

## Environment Variables (Nexus)

| Variable | Purpose |
|---|---|
| `NEXUS_INTERNAL_API_KEY` | Bearer token for all internal webhook endpoints |
| `SYNCXML_WEBHOOK_SECRET` | Alternative secret accepted for SyncXML endpoint only |
| `SYNCXML_PILOT_AUTO_APPROVE` | Must be `false` (default); never set to `true` in production |

## Environment Variables (Producers)

| Variable | Consumed by |
|---|---|
| `NEXUS_BASE_URL` | anclora-synergi, anclora-data-lab forward libs |
| `NEXUS_INTERNAL_API_KEY` | anclora-synergi, anclora-data-lab forward libs |
