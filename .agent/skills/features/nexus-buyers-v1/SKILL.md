---
name: nexus-buyers-v1
description: Implementa intake buyer-side, scoring operativo minimo y visibilidad en prospection usando referrals, CRM reactivation y web inbound.
---

## Leer primero

1. `sdd/features/nexus-buyers-v1/nexus-buyers-v1-spec-v1.md`
2. `sdd/features/multi-tenant-intelligence-packs/multi-tenant-intelligence-packs-spec-v1.md`
3. `sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md`
4. `sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md`
5. `.agent/rules/feature-nexus-buyers-v1.md`

## Metodo

1. Extender `buyer_profiles` con fuente, referral, scores y `intelligence_pack_id`.
2. Computar defaults de `intent_score`, `trust_score`, `capacity_score` y `motivation_score` si no llegan informados.
3. Exponer filtros y resumen buyer-side en prospection.
4. Añadir un panel de intake buyer-side en `/prospection-unified`.
5. Cerrar con tests backend y lint/build frontend.
