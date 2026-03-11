# Spec - ANCLORA-SPA-001 v1

## Objetivo

Abrir el primer bloque funcional de `Synergi` como red curada de partners, con alta publica y revision interna.

## Alcance v1

### Publico

- formulario de solicitud en `/private-area/partner`
- campos de identidad, categoria, servicios, cobertura, idiomas y sostenibilidad
- alta publica en `/api/public/partner-admissions`

### Interno

- pagina `/partner-admissions`
- resumen operativo
- listado de solicitudes
- detalle y notas de revision
- cambio de estado:
  - `submitted`
  - `under_review`
  - `accepted`
  - `rejected`

### Persistencia

- tabla `partner_admissions`
- aislamiento por `org_id`
- trazabilidad de decision y notificacion

## Reglas

1. `Synergi` empieza como admision curada, no como directorio abierto.
2. `eco` debe existir como categoria de partner desde v1.
3. La comunicacion posterior al applicant debe permitir `smtp` y fallback `mailto`.

## Dependencias futuras

- `ANCLORA-SPW-001`
- `ANCLORA-BPNM-001`
