# Rule - ANCLORA-NBUY-001

## Objetivo

Convertir buyers en una capability operativa real, empezando por tres fuentes prioritarias:

- `partner_referral`
- `crm_reactivation`
- `web_inbound`

## Reglas obligatorias

1. Todo buyer debe seguir scopeado por `org_id`.
2. Las nuevas fuentes buyer-side deben persistirse como contrato explícito, no como texto libre en `notes`.
3. Si el buyer referencia inteligencia territorial/comercial, debe poder enlazarse a `intelligence_pack_id`.
4. Todo frame/card nuevo de esta feature debe usar `surface-primary` o `surface-secondary`.
5. Toda copy nueva debe entrar en i18n.
6. La UI de intake buyer-side debe ser compatible con los contratos `page-title`, `page-subtitle` y `surface-copy-safe`.

## No hacer

- No crear scraping buyer-side agresivo o no compliant.
- No romper `/prospection` ni `/prospection-unified`.
- No mezclar buyers de distintos tenants ni asumir un único pack de inteligencia global.
