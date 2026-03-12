# Spec v1

## Objetivo
Permitir acceso externo controlado a `Data Lab` sin exponer el catálogo live completo como superficie pública abierta.

## Flujo
1. El usuario solicita acceso desde `/private-area/data-lab`.
2. Nexus registra la solicitud en `data_lab_access_requests`.
3. Un usuario interno revisa la solicitud desde `/data-lab-access`.
4. Si se aprueba, se genera `data_lab_access_workspaces.access_token`.
5. El solicitante accede al workspace externo de `Data Lab`.

## Contratos
- perfiles: `partner | client | investor | other`
- scopes: `market_brief | partner_intelligence | client_pack | strategic_overview`
- tiers: `limited | standard | strategic`
- aislamiento por `org_id`

## No incluido en v1
- permisos por pack individual
- export documental automatizado
- métricas avanzadas del workspace
