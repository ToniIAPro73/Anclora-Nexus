# TEST PLAN: PROPERTY ORIGIN UNIFICATION V1

**Feature ID**: ANCLORA-POU-001

## 1. Objetivo

Verificar trazabilidad de origen y visualización unificada en `Propiedades`.

## 2. Matriz de pruebas

1. Alta manual:
- Crear propiedad con `source_system=manual`.
- Ver badge `Alta manual`.

2. Alta widget:
- Crear/inyectar propiedad con `source_system=widget`.
- Ver badge `Prospección automática`.

3. Alta PBM:
- Crear/inyectar propiedad con `source_system=pbm`.
- Ver badge `Prospección + Match`.

4. Portal:
- Asignar `source_portal=idealista`.
- Ver badge `Idealista`.

5. Enlace de match:
- Propiedad con 2 matches.
- UI muestra buyer top, max `%`, y comisión máxima.

6. Sin match:
- No debe romper layout; mostrar fallback.

7. Seguridad:
- Org A no ve datos de org B.

## 3. No regresión

1. Crear/editar/borrar propiedades sigue operativo.
2. `Propiedades` no degrada tiempos de carga perceptibles.

