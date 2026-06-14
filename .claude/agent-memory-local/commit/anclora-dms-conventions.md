---
name: anclora-dms-conventions
description: DMS naming and schema conventions for field_vault placeholders, party roles, and namespace organization
metadata:
  type: reference
---

# DMS Conventions

## Field Vault Key Naming

Field vault keys in `real_estate_deal_folders.field_vault` must match **exact template placeholder names** used in Jinja/Liquid templates. Common patterns:

- `deal.*` (folder_reference, operation_type, signing_date, signing_place, notary_name, price, price_total, deposit_amount, etc.)
- `property.*` (address, city, cadastral_reference, municipality, energy_rating, habitation_certificate)
- `organization.*` (legal_name, tax_id, roaiib_number)
- `party_1/party_2.*` (full_name, email, phone, address) — also aliased in backend as `fullname`, `name`
- `nda.*` (duration_years, penalty_amount)
- `delivery.*` (datetime, observations)
- `tenant/landlord/guest.*` (permanent_address — shared across role types)
- `keys.*`, `supply.*`, `inventory.*` (detailed property handover and state)

## Party Roles & Role Labels

- `compraventa` (real estate sale): buyer/seller roles
- `alquiler_temporada` (long-term rental): landlord/tenant roles (NOT seller/buyer)
- `alquiler_turístico` (tourist booking): landlord/guest roles (NOT seller/buyer)

Backend: `_party_to_context()` maps roles to Spanish labels via `role_label` field:

```python
role_labels = {
    "buyer": "Comprador", "seller": "Vendedor", "agent": "Agente",
    "landlord": "Arrendador", "tenant": "Arrendatario", "guest": "Huésped",
    "guarantor": "Avalista", "co_buyer": "Cocomprador", "co_seller": "Covendedor",
    "notary": "Notario",
}
```

## Namespace Organization (Wizard & Drawer)

`GenerateDocumentWizard.tsx` and `FolderFieldVaultDrawer.tsx` share:

- `FIELD_I18N`: object mapping `"namespace.field"` → language-keyed label/placeholder pairs (es/ca/en/de)
- `NS_LABEL` (Wizard): fallback translations for namespace prefixes (booking, delivery, deal, nda, etc.)
- `NS_DISPLAY` (Drawer): human-readable namespace display names per language
- `NS_ORDER` (Drawer): array controlling section order in vault drawer

When adding new fields:

1. Add to `FIELD_I18N` with all 4 language translations
2. If new namespace, add to `NS_LABEL` and `NS_DISPLAY` (all 4 languages)
3. If new namespace, add to `NS_ORDER` in drawer (typically before "agent", "organization", "document")

## Test Seed (066\_dms\_test\_seed.sql)

Seed creates 3 folders with correct party roles and field_vault keys pre-populated for end-to-end testing:

- Uses ON CONFLICT...DO UPDATE for idempotent re-runs (can fix wrong roles/keys by re-running)
- Parties require both `id` and folder linking via `folder_id`
- Primary party set via `primary_party_id` on folder after parties inserted
