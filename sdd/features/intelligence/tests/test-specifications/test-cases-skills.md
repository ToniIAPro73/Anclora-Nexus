# Test Cases: Intelligence Skills

## lead_intake (8+ Cases)
1. **TC-SKL-LI-01**: Intake exitoso con datos completos.
2. **TC-SKL-LI-02**: Clasificación prioridad 5 para lead con alto presupuesto.
3. **TC-SKL-LI-03**: Error de validación en Email malformado.
4. **TC-SKL-LI-04**: Manejo de duplicados (Email ya existente en DB).
5. **TC-SKL-LI-05**: Generación de resumen de lujo exitosa.
6. **TC-SKL-LI-06**: Reintento exitoso tras fallo temporal de Supabase.
7. **TC-SKL-LI-07**: Registro en audit log con payload correcto.
8. **TC-SKL-LI-08**: Fallo crítico: DB caído, el skill retorna diagnóstico claro.

## prospection_weekly (8+ Cases)
9. **TC-SKL-PW-01**: Generación de lista de matching exitosa.
10. **TC-SKL-PW-02**: Match score > 0.8 cuando presupuesto y zona coinciden.
11. **TC-SKL-PW-03**: Manejo de leads sin criterios de búsqueda definidos.
12. **TC-SKL-PW-04**: Limite de 10 propiedades por lead respetado.
13. **TC-SKL-PW-05**: Verificación de zona Son Ferrer / Calvià solamente.
14. **TC-SKL-PW-06**: Timeout en LLM processing; fallback a matching heurístico.
15. **TC-SKL-PW-07**: Persistencia de la corrida de prospección en `agent_executions`.
16. **TC-SKL-PW-08**: Caso vacío: No hay leads activos, el skill retorna status informativo.

## recap_weekly (4+ Cases)
17. **TC-SKL-RW-01**: Resumen dominical generado con datos reales de la semana.
18. **TC-SKL-RW-02**: Verificación de KPIs (leads nuevos, prospecciones).
19. **TC-SKL-RW-03**: Tono de lujo detectado en el output (Keywords check).
20. **TC-SKL-RW-04**: Error: Fecha de consolidación en el futuro lanza excepción.
