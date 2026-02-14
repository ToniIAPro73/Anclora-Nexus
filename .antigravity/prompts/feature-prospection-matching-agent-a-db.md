PROMPT: Implementa el bloque DB de `ANCLORA-PBM-001`.

CONTEXTO:
- Usa `.antigravity/prompts/feature-prospection-matching-shared-context.md`.
- Respeta contrato congelado por Orquestador.

LECTURAS:
1) sdd/features/prospection-matching-spec-migration.md
2) sdd/features/prospection-matching-spec-v1.md
3) .agent/rules/feature-prospection-matching.md

TAREAS:
1) Crear migraciones SQL para:
- prospected_properties
- buyer_profiles
- property_buyer_matches
- match_activity_log
2) Añadir índices, FKs, unique(property_id,buyer_id), checks score [0,100].
3) Garantizar isolation por org_id en todas las tablas.
4) Añadir columnas/auditoría mínima (created_at, updated_at, created_by si aplica).
5) Preparar rollback y script de validación post-migración.

CRITERIOS DE ACEPTACIÓN:
- Migración idempotente.
- Sin colisión con esquema actual.
- Constraints y rendimiento base validados.
- Documento de “cómo verificar local/cloud”.

SALIDA:
- SQL migrations + notas de verificación + riesgos DB.
