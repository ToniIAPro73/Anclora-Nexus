Objetivo: abrir `ANCLORA-MTIP-001` para que cada tenant pueda gestionar multiples documentos/packs de inteligencia territorial o comercial por zona sin perder aislamiento.

Entregables obligatorios:
- migracion `intelligence_packs`
- servicio backend para listado, creacion, activacion y fallback legacy
- endpoints API de catalogo y resolucion de `pack_id`
- UI en `/intelligence` para visualizar y activar packs
- i18n completo
- tests backend
- spec, test plan, QA y gate final

Reglas:
- no romper el control-plane territorial actual
- mantener compatibilidad con el notebook legacy del Suroeste
- usar contratos `page-title`, `surface-primary`, `surface-secondary`, `surface-copy-safe`
- no introducir copy hardcoded nueva fuera de i18n
