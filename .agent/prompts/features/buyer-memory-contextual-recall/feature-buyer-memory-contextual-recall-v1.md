Objetivo: abrir `ANCLORA-BMCR-001` como memoria contextual buyer-side reutilizando el patrón de seller memory.

Alcance:
- tabla `buyer_memory_records`
- rebuild desde perfil, matches y activity log
- `GET /api/prospection/buyers/{buyer_id}/memory`
- `POST /api/prospection/buyers/{buyer_id}/memory/rebuild`
- preview en `/prospection-unified`
- tests + QA + gate

Restricciones:
- sin pantalla nueva en v1
- sin copy hardcoded fuera de i18n
- con redacción PII obligatoria
