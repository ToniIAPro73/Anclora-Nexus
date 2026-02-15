---
trigger: always_on
---

# Feature Rules: Lead Source Observability v1

## Jerarquía normativa
1) `constitution-canonical.md`  
2) `.agent/rules/workspace-governance.md`  
3) `.agent/rules/anclora-nexus.md`  
4) `sdd/features/lead-source-observability/lead-source-observability-spec-v1.md`

## Reglas inmutables

- Mantener aislamiento por `org_id` en todas las queries.
- No perder compatibilidad con `source` legacy durante transición.
- Validar dominio de campos de origen en backend.
- No hardcodear orígenes fuera del contrato.
- Auditar cambios de origen manuales (si se permiten).

## Reglas de compliance

- Registrar origen sin almacenar datos personales innecesarios en `source_referrer`.
- Si hay endpoint público, incluir mitigaciones anti abuso (rate limit/captcha/token).
- Mantener trazabilidad de `captured_at` e `ingestion_mode`.

