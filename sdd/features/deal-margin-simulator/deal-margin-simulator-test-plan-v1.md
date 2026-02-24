# Test Plan - Deal Margin Simulator v1

## Objective
Validate feature contract, org/role scope, UX behavior and governance constraints.

## Test Layers
- Unit:
  - Core service logic and validators.
  - Contract serializers/deserializers.
- Integration:
  - API behavior by role (owner, manager, agent).
  - DB interaction and migration compatibility.
- Frontend:
  - Loading/empty/error/success states.
  - i18n rendering (es/en/de/ru) and no hardcoded strings.

## Mandatory Scenarios
1. Access scope isolation by org_id.
2. Correct behavior under missing/partial data.
3. Deterministic response contract and sort order.
4. Observability events produced for key actions.
5. No P0 visual/functional regressions.

## Exit Criteria
- 0 open P0 and P1 defects.
- Contract checks pass.
- QA report issued and linked to feature folder.
