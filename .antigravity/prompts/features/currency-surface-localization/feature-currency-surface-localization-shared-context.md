# SHARED CONTEXT: ANCLORA-CSL-001

## Feature
- ID: `ANCLORA-CSL-001`
- Name: Currency & Surface Localization v1

## Objectives
1. Consistent currency formatting for EUR/GBP/USD/DEM/RUB.
2. Currency toggle independent from language.
3. Property surface breakdown (`useful`, `built`, `plot`).
4. Origin-based editability contract enforcement.

## Hard constraints
- Keep multitenant isolation by `org_id`.
- Keep legacy compatibility with `surface_m2` in v1.
- Do not modify unrelated modules.
- Stop after each agent scope.
