# Spec v1 - Cost Governance Foundation

Feature ID: `ANCLORA-CGF-001`

## 1. Problema
Anclora Nexus ya integra varias capacidades de alto valor (prospection, matching, intelligence, observability), pero no existe una capa unificada de control de coste por tenant y por capability.

Sin este control:
- No se conoce el coste marginal por lead/match/oportunidad.
- No hay limites automaticos por organizacion.
- La operacion puede degradar por sobreconsumo silencioso.

## 2. Objetivos funcionales
1. Definir presupuesto mensual por organizacion.
2. Registrar consumo por capability y timestamp.
3. Exponer estado de presupuesto (ok/warning/hard-stop).
4. Disparar alertas segun umbral configurable.
5. Proveer datos para dashboard ejecutivo de coste.

## 3. Capacidades (capability_code)
Valores iniciales:
- `ingestion`
- `scoring`
- `matching`
- `automation`
- `intelligence`
- `feeds_export`

## 4. Contrato funcional

### 4.1 Presupuesto por organizacion
- Cada org tiene:
  - `monthly_budget_eur`
  - `warning_threshold_pct` (default 80)
  - `hard_stop_threshold_pct` (default 100)
  - `hard_stop_enabled` (default true)

### 4.2 Registro de consumo
- Cada evento de consumo guarda:
  - org_id
  - capability_code
  - provider (si aplica)
  - units
  - cost_eur
  - request_id / trace_id
  - created_at

### 4.3 Politica de guardrails
- Si consumo >= warning threshold: alerta `warning`.
- Si consumo >= hard-stop threshold y `hard_stop_enabled=true`: bloquear operaciones no criticas de alto coste.
- Operaciones permitidas en hard-stop:
  - login/auth
  - lectura basica de dashboard
  - consulta de estado de presupuesto

## 5. API v1

### 5.1 GET `/api/finops/budget`
Retorna presupuesto y consumo acumulado del mes actual.

### 5.2 PATCH `/api/finops/budget`
Permite actualizar umbrales y presupuesto (owner/manager).

### 5.3 GET `/api/finops/usage`
Lista consumo con filtros:
- capability
- from/to
- min_cost

### 5.4 GET `/api/finops/alerts`
Lista alertas de presupuesto por org.

### 5.5 POST `/api/finops/usage/log` (internal/service)
Inserta evento de consumo desde servicios internos.

## 6. Seguridad y permisos
- Aislamiento estricto por `org_id`.
- Owner/Manager:
  - lectura y ajuste de presupuesto.
- Agent:
  - solo lectura de estado agregado (sin detalle sensible de coste proveedor).
- Endpoints internos de logging protegidos por service credentials.

## 7. No-regresion
- No romper rutas actuales de prospection/matching/leads/properties.
- Si no hay presupuesto configurado, usar defaults seguros.
- Si finops falla, fallback a modo observability-only (no bloqueo) bajo flag de emergencia.

## 8. KPIs de aceptacion
- Cobertura de consumo >95% en capacidades activas.
- Cero accesos cross-org.
- Alertas warning/hard-stop emitidas correctamente.
- Tiempos de respuesta p95:
  - budget < 150ms
  - usage list < 300ms con paginacion.
