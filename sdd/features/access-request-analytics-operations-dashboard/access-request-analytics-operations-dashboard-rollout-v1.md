# ANCLORA-ARAN-001 Rollout v1

## Rollout

1. Deploy backend analytics summary endpoint.
2. Deploy frontend dashboard and attention queue.
3. Monitor endpoint latency and attention item volume.
4. Confirm reviewers use attention queue without regression to review/lifecycle actions.

## Rollback

1. Revert frontend dashboard components if UI issues appear.
2. Revert backend endpoint if analytics behavior regresses.
3. Existing list/detail/review/lifecycle endpoints remain independent and can continue operating.

## Operational Notes

- Analytics are bounded to a recent sample in v1.
- Historical requests outside the sample are not represented in dashboard totals.
- Audit-derived email status may be `unknown` for older terminal requests without email audit events.
