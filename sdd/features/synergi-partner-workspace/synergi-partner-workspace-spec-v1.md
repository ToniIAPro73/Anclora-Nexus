# ANCLORA-SPW-001 · Spec v1

Objetivo:
- Dar a un partner aprobado una superficie operativa real sin exigir todavía auth externa completa.

Decisiones:
- acceso controlado por `invite token`
- workspace solo para admisiones `accepted`
- el partner puede enviar oportunidades y referrals desde el portal

Componentes:
- tabla `synergi_partner_workspaces`
- tabla `synergi_partner_opportunities`
- `GET /api/public/partner-workspace`
- `POST /api/public/partner-workspace/opportunities`
- `/private-area/partner/workspace`

