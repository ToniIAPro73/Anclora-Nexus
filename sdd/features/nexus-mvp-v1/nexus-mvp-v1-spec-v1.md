# SPEC — NEXUS MVP V1 (v1)

## 0. Meta
- Feature: `nexus-mvp-v1`
- Version: `v1`
- Depends on:
  - `sdd/core/constitution-canonical.md`
  - `product-spec-v0.md`
  - `spec.md`
  - `.agent/rules/anclora-nexus.md`

## 1. Objetivo

Definir `Anclora Nexus` como una herramienta interna de arranque para el vertical `Real Estate`, centrada en generar pipeline real mediante captacion de propietarios, captacion de compradores y seguimiento disciplinado de oportunidades, sin dispersar la experiencia en modulos no esenciales para esta fase.

## 2. Alcance

- Incluye:
  - `Dashboard` como lectura diaria de pipeline.
  - `Leads` como superficie operativa de buyers mientras persista el naming tecnico actual.
  - `Sellers` como pipeline de captacion de propietarios.
  - `Properties` como inventario operativo conectado a sellers y buyers.
  - `Tasks` como sistema obligatorio de siguiente accion.
  - `Prospection Unified` como capa ligera de priorizacion y matching.
  - `Intelligence` solo si actua como extension ligera del flujo anterior.
  - simplificacion de sidebar y priorizacion visual del recorrido MVP.

- No incluye:
  - eliminacion de funcionalidades existentes.
  - retirada de rutas backend o frontend fuera del MVP.
  - rediseño total del shell.
  - ampliacion de features ejecutivas, de red de partners, de quality o de observabilidad.

## 3. Principio operativo

Toda superficie principal del MVP debe ayudar a responder al menos una de estas preguntas:

- que propietarios debo captar o seguir hoy
- que compradores debo captar o seguir hoy
- que propiedades tengo en captacion o activas
- que siguiente accion debo ejecutar ahora
- que match comercial merece prioridad

Si una feature no ayuda de forma directa a una de esas preguntas, no debe estar en la navegacion principal de `MVP v1`.

## 4. Modulos activos en la navegacion principal

## 4.1 Core

- `/dashboard`
- `/leads`
- `/sellers`
- `/properties`
- `/tasks`

## 4.2 Intelligence ligera

- `/prospection-unified`
- `/intelligence`

Nota:

- `Leads` puede seguir usando el naming tecnico actual mientras el modelo y las traducciones no se hayan migrado a `Buyers`.
- `Intelligence` solo debe mantenerse visible si no compite con el foco operativo principal.

## 5. Modulos preservados pero fuera del MVP visible

Las siguientes superficies quedan preservadas en codigo y rutas, pero fuera de la sidebar principal:

- `/team`
- `/prospection`
- `/opportunity-ranking`
- `/ingestion`
- `/data-quality`
- `/feed-orchestrator`
- `/partner-network`
- `/partner-admissions`
- `/data-lab-access`
- `/automation-alerting`
- `/command-center`
- `/deal-margin-simulator`
- `/source-observatory`

Tambien quedan fuera del relato central del producto:

- `/profile`
- `/settings`

Estas rutas pueden seguir existiendo y usarse cuando proceda, pero no deben presentarse como el centro del producto en esta etapa.

## 6. Restriccion de rollout

`Nexus MVP v1` no permite borrar funcionalidades existentes salvo decision explicita posterior.

El mecanismo correcto para reducir alcance es:

1. ocultar de navegacion principal
2. marcar como `deferred`, `non-mvp` o `secondary`
3. preservar compatibilidad de rutas y contratos siempre que sea razonable

## 7. Cambios en frontend

- rutas:
  - simplificar sidebar para reflejar el MVP
  - mantener la identidad visual y el sistema actual de idiomas y temas

- componentes:
  - `frontend/src/components/layout/Sidebar.tsx` es la primera superficie contractual

- UX minima:
  - lectura rapida
  - muy pocos puntos de decision
  - continuidad visual con la app actual
  - ninguna sensacion de “producto amputado”

## 8. Cambios en backend

- no exige cambios obligatorios de backend en v1
- cualquier cambio backend debe reforzar sellers, buyers/leads, properties, tasks o priorizacion ligera

## 9. Cambios en datos

- no requiere nuevas tablas para formalizar el MVP
- se permite reutilizar estructuras existentes mientras soporten el flujo operativo

## 10. Reglas de producto

- ninguna nueva feature entra en sidebar principal si no mejora captacion, seguimiento o conversion
- no usar el MVP como excusa para introducir nuevos workstreams laterales
- la complejidad debe ir detras de la necesidad operativa real, no delante

## 11. Criterios de aceptacion

- la sidebar principal expone solo el flujo MVP acordado
- ninguna feature existente del repo ha sido eliminada por este recorte
- la app mantiene su estilo visual actual
- la app mantiene su compatibilidad con idiomas y temas existentes
- el recorrido diario del usuario puede hacerse desde `dashboard`, `leads`, `sellers`, `properties` y `tasks`
- `prospection-unified` queda como apoyo y no como centro narrativo del producto

## 12. Criterio de exito

`Nexus MVP v1` se considera bien definido si permite orientar toda la evolucion proxima del repo hacia:

- generar pipeline
- no perder seguimiento
- mover oportunidades por estados reales
- evitar dispersion producto antes de tiempo
