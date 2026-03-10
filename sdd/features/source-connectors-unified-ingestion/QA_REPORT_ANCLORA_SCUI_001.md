# QA Report: ANCLORA-SCUI-001

## Result
`PASS WITH ENVIRONMENT LIMITATION`

## Coverage reviewed
- app FastAPI monta rutas de ingestion
- servicio alineado con schema SQL de `029`
- seller-side signals incluidos en perimeter de ingestion
- filtros operativos de eventos

## Limitaciones
- no se ejecuto `pytest` en este entorno
- no se validaron credenciales reales de Supabase
