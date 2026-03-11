# Smoke Test - ANCLORA-NBUY-001

Objetivo: validar en menos de 10 minutos que `Nexus Buyers v1` está operativo tras aplicar la migración `046`.

## Checks

1. Crear buyer `partner_referral`
- ir a `/prospection-unified`
- crear un buyer con `source_type=partner_referral` y `source_platform=exp_agent`
- `PASS` si aparece en la cola de buyers con scores `intent/trust/capacity`

2. Crear buyer `crm_reactivation`
- crear un buyer con `source_type=crm_reactivation`
- `PASS` si el resumen por fuente incrementa `CRM reactivation`

3. Crear buyer `web_inbound`
- crear un buyer con `source_type=web_inbound`
- `PASS` si el resumen por fuente incrementa `Web inbound`

4. Validar API
- `GET /api/prospection/buyers?source_type=partner_referral`
- `PASS` si responde `200` y devuelve al menos un buyer

5. Validar workspace
- `GET /api/prospection/workspace`
- `PASS` si `buyer_source_summary` refleja los tres tipos de fuente

## Resultado

- `GO` si pasan los 5 checks
- `CONDITIONAL GO` si falla solo uno menor de UI pero API y persistencia están correctas
- `NO-GO` si falla creación de buyers o el workspace no refleja fuentes
