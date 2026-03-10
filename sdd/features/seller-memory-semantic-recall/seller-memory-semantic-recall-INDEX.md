# Seller Memory Semantic Recall - INDEX

## Feature

- ID: `ANCLORA-SMSR-001`
- Version: `v1`
- Scope: convertir historial seller-side en memoria semantica reutilizable y explicable

## Artifacts

- Spec: `sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-spec-v1.md`
- Migration: `sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-spec-migration.md`
- Test plan: `sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-test-plan-v1.md`
- QA Report: `sdd/features/seller-memory-semantic-recall/QA_REPORT_ANCLORA_SMSR_001.md`
- Gate Final: `sdd/features/seller-memory-semantic-recall/GATE_FINAL_ANCLORA_SMSR_001.md`
- Rules: `.agent/rules/feature-seller-memory-semantic-recall.md`
- Skill: `.agent/skills/features/seller-memory-semantic-recall/SKILL.md`
- Prompt: `.antigravity/prompts/features/seller-memory-semantic-recall/feature-seller-memory-semantic-recall-v1.md`

## Runtime Notes

- Fuente canonica: `seller_interactions`
- Persistencia derivada: `seller_memory_records`
- Retrieval: scoring explicable con redaccion de PII y fallback deterministico
