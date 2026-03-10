# Test Plan - Source Performance Observatory v1.1

1. Verify overview aggregates operational status, freshness and entity coverage.
2. Verify ranking includes degradation/freshness context.
3. Verify trends expose processed, failed and created counts.
4. Verify `/source-observatory` renders summary, scorecards and trends with the new contract.
5. Verify frontend build does not emit the deprecated `middleware` warning after migrating to `proxy`.
