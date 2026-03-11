Objetivo: abrir `ANCLORA-NBUY-001` como v1 operativa de buyers sobre la base existente de prospection.

Fuentes prioritarias:
- `partner_referral`
- `crm_reactivation`
- `web_inbound`

Entregables:
- migracion de buyer intake
- modelos y servicio backend
- filtros API buyer-side
- panel de intake y visibilidad en `/prospection-unified`
- i18n
- tests
- spec + QA + gate

Restricciones:
- no romper el matching existente
- no tocar scraping buyer-side fuera de canales compliant
- permitir enlace opcional a `intelligence_pack_id`
