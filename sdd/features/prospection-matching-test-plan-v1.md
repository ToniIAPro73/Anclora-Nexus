# TEST PLAN: PROSPECTION & BUYER MATCHING V1

**Versión**: 1.0  
**Coverage Target**: Backend 85% | Frontend 80% | DB 100%

---

## 1. ESTRATEGIA GENERAL

Pirámide:
- Unit tests: scoring, validaciones, normalización.
- Integration tests: endpoints + persistencia.
- E2E tests: flujo completo property -> buyer -> match -> activity.

---

## 2. SCOPE DE VALIDACIÓN

1. **Property Prospection**
- alta y edición de propiedades prospectadas,
- cálculo de `high_ticket_score`,
- filtros por canal/zona/precio.

2. **Buyer Prospection**
- alta y edición de compradores,
- validación de presupuesto y preferencias.

3. **Matching Engine**
- cálculo de `match_score`,
- desglose de puntuación,
- actualización de estado de match.

4. **Compliance**
- bloqueo de fuentes no permitidas,
- trazabilidad de `source` y `source_url`,
- no ejecución de acciones irreversibles sin intervención humana.

---

## 3. CRITERIOS DE ÉXITO

- `high_ticket_score` y `match_score` siempre en rango [0,100].
- No hay matches duplicados para mismo par property-buyer.
- No hay fugas entre organizaciones (`org_id` isolation).
- Los top matches son consultables por score y estado.
- Registro de actividad comercial por vínculo operativo.

