# Test Evidence — Anclora Intake Contract v1

**Date:** 2026-06-20  
**Branch:** feat/anclora-intake-contract-v1

---

## Contract validation tests (`test_intake_contract.py`)

```
23 passed in 0.44s
```

### Section A — Valid combinations (6 tests)

| Test | Contract combination | Result |
|---|---|---|
| `test_syncxml_pilot_valid` | SyncXML landing + pilot_request + syncxml | PASS |
| `test_data_lab_access_valid` | Data Lab app + access_request + data_lab | PASS |
| `test_synergi_admission_valid` | Synergi app + partner_admission + synergi | PASS |
| `test_pe_landing_seller_valuation_valid` | PE Landing + seller_valuation_request + null | PASS |
| `test_pe_web_buyer_lead_valid` | PE web + buyer_lead + null | PASS |
| `test_pe_web_vacation_rental_interest_valid` | PE web + vacation_rental_management_interest + null | PASS |

### Section B — Invalid combinations that must be rejected (8 tests)

| Test | Rule | Result |
|---|---|---|
| `test_syncxml_landing_with_synergi_product_rejected` | Rule 3: source-product coherence | PASS |
| `test_syncxml_landing_with_null_product_rejected` | Rule 1+3: null product on access_request | PASS |
| `test_commercial_lead_with_target_product_rejected` | Rule 2: target_product must be null for commercial_lead | PASS |
| `test_pe_landing_cannot_create_access_request` | Rule 6: PE sources are commercial-only | PASS |
| `test_pe_web_cannot_create_access_request` | Rule 6: PE sources are commercial-only | PASS |
| `test_wrong_request_type_for_access_domain_rejected` | Domain-type coherence | PASS |
| `test_wrong_request_type_for_commercial_domain_rejected` | Domain-type coherence | PASS |
| `test_access_request_requires_target_product` | Rule 1: access_request needs target_product | PASS |

### Section C — Routing table (9 tests)

| Test | Routing result | Result |
|---|---|---|
| `test_routing_access_request_goes_to_access_requests` | `access_requests` | PASS |
| `test_routing_seller_valuation_goes_to_valuations` | `valuations` | PASS |
| `test_routing_buyer_lead_goes_to_buyers` | `buyers` | PASS |
| `test_routing_seller_lead_goes_to_leads` | `leads` | PASS |
| `test_routing_vacation_rental_goes_to_leads` | `leads` | PASS |
| `test_routing_property_inquiry_goes_to_leads` | `leads` | PASS |
| `test_routing_pe_landing_seller_never_goes_to_access_requests` | not `access_requests` | PASS |
| `test_routing_pe_web_buyer_never_goes_to_access_requests` | not `access_requests` | PASS |
| `test_routing_vacation_rental_interest_never_goes_to_access_requests` | not `access_requests` | PASS |

---

## SyncXML Pilot router + decision matrix tests (`test_syncxml_pilot_routes.py`)

```
31 passed — NO REGRESSION
```

Combined run: **40 passed, 0 failed.**

---

## TypeScript type check — `anclora-nexus/frontend`

```
npx tsc --noEmit → clean (0 errors)
```

---

## UI Bug verification

**Before fix:**

```typescript
export function productLabel(product: AccessRequestProduct): string {
  if (product === 'data_lab') return 'Data Lab'
  return 'Synergi'  // ← BUG: syncxml rendered as 'Synergi'
}
```

**After fix:**

```typescript
const PRODUCT_LABELS: Record<AccessRequestProduct, string> = {
  syncxml: 'SyncXML',
  synergi: 'Synergi',
  data_lab: 'Data Lab',
}

export function productLabel(product: AccessRequestProduct): string {
  return PRODUCT_LABELS[product] ?? 'No reconocido'
}
```

A SyncXML access request now correctly renders as `SyncXML` instead of `Synergi`. Unknown products render as `No reconocido` instead of silently being mislabeled.

---

## Migration dry-run status

`072_anclora_intake_contract_v1.sql` is forward-only (additive):
- All `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` — no existing data removed
- Backfill is idempotent `UPDATE ... WHERE column IS NULL`
- `lead_intake` ALTER is wrapped in `DO $$ IF EXISTS $$` — safe if table doesn't exist yet
- **Not applied to any remote database in this session**
