# Test Cases: Governor Component

## Decision Logic (Strategic vs Operative)
1. **TC-GOV-01**: Query ambigua dispara solicitud de clarificación (Strategic).
2. **TC-GOV-02**: Query directa de base de datos se clasifica como Operative.
3. **TC-GOV-03**: Solicitud de análisis de mercado dispara modo Strategic.
4. **TC-GOV-04**: Manejo de `org_id` inválido en la decisión inicial.

## Input Validation (Schemas)
5. **TC-GOV-05**: Rechazo de query vacía.
6. **TC-GOV-06**: Rechazo de query superior a 2000 caracteres (Limit check).
7. **TC-GOV-07**: Validación de metadatos de usuario presentes en el input.

## Error Scenarios
8. **TC-GOV-08**: LLM Timeout; el Governor debe retornar un error estructurado.
9. **TC-GOV-09**: Respuesta malformada del LLM (JSON inválido); fallback a parser robusto.
10. **TC-GOV-10**: No se encuentran herramientas disponibles para la query.

## Refinement Logic
11. **TC-GOV-11**: Feedback del usuario integra correctamente en el re-planning.
12. **TC-GOV-12**: Verificación de límites constitucionales (Tokens/Daily limit).
13. **TC-GOV-13**: Detección de intentos de jailbreak en la query.
14. **TC-GOV-14**: Priorización de skills específicos basado en keywords.
15. **TC-GOV-15**: Caso éxito: Plan generado con 2+ pasos lógicos.
