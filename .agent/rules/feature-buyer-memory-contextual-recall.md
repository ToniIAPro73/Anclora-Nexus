# Rule - ANCLORA-BMCR-001

## Objetivo

Dar continuidad contextual a buyers reutilizando el patrón de `seller_memory`, pero derivando la memoria desde `buyer_profiles`, `property_buyer_matches` y `match_activity_log`.

## Reglas obligatorias

1. La memoria buyer-side debe estar scopeada por `org_id` y `buyer_id`.
2. El contenido persistido debe redaccionar PII sensible.
3. La UI no crea una pantalla nueva en esta versión; la memoria se expone primero como highlights en `prospection-unified`.
4. Toda copy nueva debe entrar en i18n.
5. Debe existir ruta explícita para `search` y `rebuild`.
