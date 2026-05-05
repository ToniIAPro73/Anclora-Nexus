# Agent B - Backend Prompt (ANCLORA-OAEP-001)

Objetivo:
- Aplicar enforcement server-side de editabilidad por origen en leads y propiedades.
- Exponer contrato de policy para consumo UI.

Contrato minimo:
- `PATCH /api/leads/{lead_id}` con scope por org y saneo de payload.
- `GET /api/policy?entity=lead|property&source_system=...`
- `GET /api/policy/leads/{lead_id}`
- `GET /api/policy/properties/{property_id}`

Restricciones:
- Bloquear sobrescritura de campos protegidos en origen no manual.
- Mantener compatibilidad con rutas y servicios existentes.
