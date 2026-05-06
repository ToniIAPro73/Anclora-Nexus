# ANCLORA-ARDP-001 Rollout v1

## Rollout

1. Deploy backend lifecycle and retry endpoints.
2. Deploy frontend lifecycle panel and retry action.
3. Monitor access request audit events for email retry outcomes.
4. Confirm no unexpected retries or duplicate invite generation.

## Rollback

1. Revert frontend retry affordance if UI issues appear.
2. Revert backend retry/lifecycle endpoints if endpoint behavior regresses.
3. Approval/rejection core behavior remains compatible because no schema migration is introduced.

## Operational Notes

- Retry sends another decision email and records audit events.
- Approval generates only invite intent, not a real product account.
- Existing invite fields are preserved to prevent duplicate provisioning effects.
- Decision email status is derived from audit events, so historical requests without email audit events may show `unknown`.
