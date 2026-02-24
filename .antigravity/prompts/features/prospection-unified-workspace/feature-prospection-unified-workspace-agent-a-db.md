# Agent A - DB Prompt (ANCLORA-PUW-001)

Objetivo:
- Validar necesidad real de migracion para PUW v1.
- Confirmar que tablas y campos actuales cubren workspace y acciones rapidas.
- Definir indices opcionales de soporte si la latencia lo requiere.

Validaciones:
1) Compatibilidad de `properties`, `buyer_profiles`, `property_buyer_matches`, `tasks`.
2) Viabilidad de trazabilidad sin tabla nueva obligatoria.
3) Plan de rollback en caso de aplicar indices adicionales.
