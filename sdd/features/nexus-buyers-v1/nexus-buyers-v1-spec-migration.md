# Migration - ANCLORA-NBUY-001 v1.0

Migración asociada:

- `supabase/migrations/046_nexus_buyers_intake_v1.sql`

## Cambios

- extensión de `buyer_profiles` con fuente, referral, scores y `intelligence_pack_id`
- índices por fuente y pack

## Rollout

1. aplicar migración `046`
2. validar `POST /api/prospection/buyers`
3. validar `/prospection-unified`
4. enlazar buyers con packs multi-tenant cuando proceda
