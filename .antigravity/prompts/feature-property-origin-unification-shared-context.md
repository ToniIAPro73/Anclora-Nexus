# SHARED CONTEXT: Property Origin Unification v1

## Contexto de negocio
Anclora Nexus necesita que cualquier propiedad en la vista `Propiedades` tenga trazabilidad inmediata de origen y señales comerciales clave.

## Objetivo técnico común
Unificar origen de propiedad y visibilidad de matching en una sola ficha:

- Origen normalizado (`manual`, `widget`, `pbm`)
- Portal fuente opcional (`idealista`, `fotocasa`, `facebook`, `instagram`, etc.)
- Buyer potencial, `% match`, y comisión estimada cuando existan vínculos.

## Reglas comunes
- Cumplir `constitution-canonical.md`, `workspace-governance.md`, `anclora-nexus.md`.
- Mantener aislamiento por `org_id` en backend y queries.
- No romper CRUD existente de propiedades.
- Mantener compatibilidad temporal con datos legacy en `notes`.

