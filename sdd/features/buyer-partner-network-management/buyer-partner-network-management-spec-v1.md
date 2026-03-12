# ANCLORA-BPNM-001 · Spec v1

Objetivo:
- Dar a Nexus una consola interna para gestionar partners aprobados de Synergi conectados al flujo buyer-side.

Capacidades:
- `GET /api/partners/network`
- `GET /api/partners/network/summary`
- `PATCH /api/partners/network/{workspace_id}`
- `/partner-network`

Persistencia:
- extiende `synergi_partner_workspaces` con estado relacional, trust, flags y notas internas.

