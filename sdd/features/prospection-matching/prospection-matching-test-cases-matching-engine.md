# TEST CASES: MATCHING ENGINE

## Casos críticos
1. Crear match property-buyer con `match_score` válido.
2. Rechazar score fuera de rango.
3. Evitar duplicado por `(property_id, buyer_id)`.
4. Validar `score_breakdown` completo.
5. Ordenar matches por score y estado.
6. Registrar actividad comercial sobre match.
7. Cambiar `match_status` candidate -> contacted -> viewing -> negotiating -> closed.

