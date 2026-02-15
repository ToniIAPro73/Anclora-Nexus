# Test Plan v1 - Cost Governance Foundation

Feature ID: `ANCLORA-CGF-001`

## 1. Objetivo
Validar que presupuesto, consumo y alertas por organizacion funcionan correctamente sin regresion funcional.

## 2. Ambito
- DB migration + rollback.
- API FinOps.
- Guardrails de warning/hard-stop.
- Aislamiento por org.
- Integracion dashboard/settings (lectura).

## 3. Tipos de prueba

### 3.1 Unit
- Calculo de porcentaje de consumo mensual.
- Evaluacion de umbrales.
- Reglas de hard-stop y excepciones de operaciones permitidas.

### 3.2 Integration
- CRUD parcial de budget policy.
- Logging de usage event.
- Generacion y resolucion de alertas.
- Verificacion org isolation.

### 3.3 Regression
- Endpoints de prospection/matching/leads/properties sin roturas.
- Login y navegacion base en modo hard-stop.

## 4. Casos criticos
1. Consumo al 79% -> sin alerta.
2. Consumo al 80% -> alerta warning activa.
3. Consumo al 100% con hard-stop enabled -> bloqueo de operaciones de alto coste.
4. Hard-stop disabled -> sin bloqueo, solo alerta.
5. Cross-org access -> 403.
6. Rollback completo sin residuos.

## 5. Datos de prueba
- 2 organizaciones.
- Capabilities con eventos mixtos.
- Mes actual y mes anterior para validar agregacion.

## 6. Criterios GO/NO-GO
GO si:
- 0 defectos P0/P1.
- Checks de aislamiento ok.
- Migracion y rollback pasan.
- API p95 dentro de objetivo.

NO-GO si:
- Hard-stop bloquea operaciones criticas (auth/dashboard base).
- Hay fuga de datos cross-org.
- Inconsistencia entre presupuesto y consumo agregado.
