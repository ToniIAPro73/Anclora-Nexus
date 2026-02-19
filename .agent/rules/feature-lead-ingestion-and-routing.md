trigger: always_on
---

# Feature Rules — Lead Ingestion and Routing (ANCLORA-LIR-001)

## Scope
- Capture contacts from multiple origins (manual, cta_web, import, referral, partner, social).
- Normalize origin metadata before persistence.
- Route every new lead to an operational owner (agent/owner) using deterministic policy.
- Emit an in-app operational alert for web CTA leads.

## Mandatory Rules
- Preserve `source` (legacy) and enforce normalized fields:
  - `source_system`
  - `source_channel`
  - `source_detail`
  - `ingestion_mode`
- Routing policy for `cta_web`:
  1. Pick least busy active `agent`.
  2. If tie, route to `owner`.
  3. If no active agents, route to `owner`.
- Routing decision must be persisted in lead metadata (`notes.routing`).
- Every routing execution must remain auditable through the existing agent/audit flow.

## Non-Goals
- No new UI product surface in Nexus dashboard for this feature yet.
- No schema-breaking migrations required for v1.
