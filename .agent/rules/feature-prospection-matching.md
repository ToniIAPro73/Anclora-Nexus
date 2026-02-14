---
trigger: always_on
---

# Feature Rules: Prospection & Buyer Matching v1

## Jerarquía normativa
1) `constitution-canonical.md`  
2) `.agent/rules/workspace-governance.md`  
3) `.agent/rules/anclora-nexus.md`  
4) `sdd/features/prospection-matching-spec-v1.md`

Si hay conflicto: gana el nivel superior.

## Propósito de la feature
Construir captación de inmuebles premium + captación de compradores + motor de vínculo con score explicable, maximizando probabilidad de comisión sin violar reglas de cumplimiento.

## Reglas inmutables de implementación
- No scraping no autorizado. Priorizar APIs/canales permitidos.
- No automatizar contacto externo irreversible sin paso humano.
- Mantener trazabilidad: toda fuente debe registrar `source` y `source_url`.
- Mantener auditabilidad de cambios de score/estado.
- No tocar core sin versionado explícito en `sdd/core/`.
- No hardcodear org_id ni roles.

## Reglas de scoring
- `high_ticket_score` y `match_score` en rango 0-100.
- Score siempre explicable vía `score_breakdown`.
- Cualquier cambio de fórmula debe versionarse (v1 -> v1.1).

## Reglas de seguridad y datos
- Isolation por `org_id` obligatorio en todas las queries.
- `property_buyer_matches` debe tener `unique(property_id, buyer_id)`.
- Mantener principio de reversibilidad para acciones comerciales.

