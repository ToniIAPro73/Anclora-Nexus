# Origin Aware Editability Policy v1 - Spec Migration

## Estado
No se requiere migracion SQL para v1.

## Justificación
La feature v1 se implementa en capa de presentacion y backend application layer, reutilizando columnas existentes (`source_system`, `source_portal`, `match_score`).
Incluye enforcement server-side y endpoints de policy sin alterar schema.

## Nota de evolución (v2)
Para evolucion futura se evaluara:
- tabla de políticas versionadas por org,
- auditoría de intentos de edición bloqueada,
- endpoint de contrato de editabilidad por entidad/origen.
