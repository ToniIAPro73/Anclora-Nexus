# Origin Aware Editability Policy v1 - Spec Migration

## Estado
No se requiere migración SQL para v1.

## Justificación
La feature v1 se implementa en capa de presentación y contrato de saneo de payload, reutilizando columnas existentes (`source_system`, `source_portal`, `match_score`).

## Nota de evolución (v2)
Si se mueve enforcement a backend, se evaluará:
- tabla de políticas versionadas por org,
- auditoría de intentos de edición bloqueada,
- endpoint de contrato de editabilidad por entidad/origen.
