# SPEC: CURRENCY & SURFACE LOCALIZATION V1

**Feature ID**: ANCLORA-CSL-001  
**Version**: 1.0  
**Status**: Specification Phase

## 1. Problem

Property commercial data is currently inconsistent across markets:

1. Currency format is mixed or duplicated in some views.
2. Currency selection is not explicitly independent from language.
3. Surface is modeled as a single value, without business distinction.
4. There is no explicit contract for editability by entity origin.

## 2. Goals v1

1. Add market-oriented currency localization for property amounts.
2. Introduce explicit surface fields required by premium real-estate operations.
3. Define editable/read-only rules by origin for properties and contacts.
4. Keep compatibility with existing records and avoid regressions.

## 3. Functional Scope

### 3.1 Currency selector

Currencies in scope:

- EUR (default)
- GBP
- USD
- DEM
- RUB

Formatting examples:

- EUR: `1.234,56 €`
- GBP: `£1,234.56`
- USD: `$1,234.56`
- DEM: `1.234,56 DM`
- RUB: `1 234,56 ₽`

Rule:

- Language and currency must be independent toggles.

### 3.2 Surface model

Property fields:

- `useful_area_m2` (required where applicable)
- `built_area_m2` (required)
- `plot_area_m2` (optional)

Presentation:

- EUR/DEM/RUB: default display in `m2`
- GBP/USD: default display in `sq ft` with on-the-fly conversion from stored `m2`

Conversion:

- `1 m2 = 10.7639 sq ft`

### 3.3 Origin-based editability contract

Entity: properties

- `origin_type='manual'`: all commercial fields editable.
- `origin_type='widget_prospection'`: editable commercial enrichment fields; source trace fields read-only.
- `origin_type='pbm_prospection'`: editable commercial enrichment fields; source and scoring provenance read-only.

Entity: contacts/leads

- `origin_system='manual'`: all CRM fields editable.
- `origin_system in ('cta_web','import','partner','social','referral')`:
  - source attribution fields read-only.
  - relationship/commercial fields editable.

## 4. API contract changes (v1)

1. Property create/update payload accepts:
- `useful_area_m2`
- `built_area_m2`
- `plot_area_m2`

2. Property list/detail response returns:
- normalized surface trio above.
- origin metadata required for UI rules.

3. Validation:
- No negative areas.
- logical checks:
  - `useful_area_m2 <= built_area_m2` when both exist.

## 5. UI contract changes (v1)

1. Global currency selector in header.
2. All property prices use centralized formatter.
3. Property cards/forms show:
- useful area
- built area
- plot area (if present)
4. Origin badge visible and consistent in properties and contacts.
5. Editing controls disabled/hidden according to origin contract.

## 6. Acceptance criteria

1. Currency rendering is consistent and no duplicated symbols appear.
2. Surface values are captured and displayed with proper unit conversion.
3. Origin-based edit rules are enforced in backend and reflected in UI.
4. Existing records continue working after migration/backfill.
5. No multitenancy or auth regressions.

## 7. Out of scope v1

1. Historical FX conversion by date.
2. Automatic market price feed integration.
3. Dynamic unit auto-detection by user geolocation.
