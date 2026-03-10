# Spec v1 - Seller Memory Semantic Recall

## Objetivo

Permitir que el sistema reanude conversaciones con sellers usando contexto historico resumido, seguro y recuperable por intencion comercial.

## Alcance

- Construir memoria derivada a partir de `seller_interactions`
- Redactar PII antes de persistir memoria reusable
- Exponer retrieval explicable por seller
- Integrar resumen y top matches en el `SellerDrawer`

## Contrato funcional

1. Cada interaccion relevante puede derivar un `memory_record`.
2. El record almacena:
   - `summary`
   - `redacted_content`
   - `keywords`
   - `semantic_payload`
   - `salience_score`
3. El retrieval debe devolver:
   - `score`
   - `reasons`
   - `matched_keywords`
   - `source_created_at`
4. El workbench debe mostrar:
   - total de memorias
   - resumen recuperado para outreach
   - top recuerdos relevantes

## Reglas de seguridad

- Emails, telefonos y URLs se redactan antes de persistir `redacted_content`.
- La memoria es derivada; no sustituye ni borra el registro transaccional.
- Si la tabla derivada no existe, el workbench responde con estado degradado pero no falla.

## Implementacion v1

- Sin dependencia obligatoria de `pgvector`.
- Se usa resumen semantico deterministico y scoring explicable por tokens, artefacto y recencia.
- Se deja preparada una tabla dedicada para evolucionar a embeddings en una version posterior sin romper contrato.

## Criterios de aceptacion

- Existe endpoint para rebuild y consulta de memoria por seller.
- El workbench usa memoria recuperada para contexto comercial.
- Hay tests backend para sync, retrieval y rutas.
