# DMS Template Reconciliation Audit

**Fecha:** 2026-06-13  
**Rama:** feat/nexus-dms-clm-complete  
**Estado:** Auditoría inicial completada

---

## Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Familias objetivo (catálogo canónico) | 18 |
| Familias existentes en seeds/es/ | 14 |
| Familias faltantes | 4 |
| Idiomas objetivo | 11 |
| Idiomas con al menos 1 plantilla | 1 (es) |
| Variantes objetivo | 198 |
| Variantes existentes | 14 |
| Variantes a crear | 184 |
| Inconsistencias de placeholder | 3 tipos detectados |
| Front matter incompleto | 14/14 plantillas |

---

## Fuentes auditadas

| Fuente | Descripción | Estado |
|---|---|---|
| A — seeds/templates/es/ | 14 plantillas Markdown ES | Parcial: faltan 4 familias, front matter incompleto |
| B — Pack DOCX premium | 18 familias referencia | No importado como Markdown; requiere extracción |
| C — Pack multidioma | Estructura 11 idiomas | No existe en repo; a crear |
| D — Manifest y matrices | Catálogo y control | No existe en repo; a crear |

---

## Catálogo canónico definitivo (18 familias)

| Nº | template_key | ape_code | operation_type | Fuente A | Fuente B | Estado |
|---:|---|---|---|---|---|---|
| 1 | arras-penitenciales | APE-SALE-ARRAS-001 | compraventa | ✅ | ✅ | draft — front matter incompleto |
| 2 | contrato-compraventa | APE-SALE-PRIVATE-002 | compraventa | ✅ | ✅ | draft — front matter incompleto |
| 3 | oferta-compra | APE-SALE-OFFER-003 | compraventa | ✅ | ✅ | draft — front matter incompleto |
| 4 | contrato-reserva-senal | APE-SALE-RESERVE-004 | compraventa | ✅ | ✅ | draft — front matter incompleto |
| 5 | nota-encargo | APE-AGENCY-OPEN-005 | captacion_intermediacion | ✅ | ✅ | draft — front matter incompleto |
| 6 | contrato-temporada | APE-LEASE-SEASON-006 | alquiler_temporada | ✅ | ✅ | draft — front matter incompleto |
| 7 | contrato-arrendamiento | APE-LEASE-HOME-007 | alquiler_residencial | ✅ | ✅ | draft — front matter incompleto |
| 8 | contrato-alquiler-turistico | APE-TOUR-STAY-008 | alquiler_turistico | ✅ | ✅ | draft — front matter incompleto |
| 9 | recibo-fianza | APE-LEASE-DEPOSIT-009 | alquiler_temporada,alquiler_residencial | ✅ | ✅ | draft — front matter incompleto |
| 10 | acta-entrega-llaves | APE-HANDOVER-010 | compraventa,alquiler_temporada,alquiler_turistico | ✅ | ✅ | draft — front matter incompleto |
| 11 | mandato-exclusiva | APE-AGENCY-EXCL-011 | captacion_intermediacion | ✅ | ✅ | draft — front matter incompleto |
| 12 | kyc-identificacion-cliente | APE-COMPLIANCE-KYC-012 | general | ✅ | ✅ | draft — front matter incompleto |
| 13 | acuerdo-confidencialidad | APE-NDA-013 | general | ✅ | ✅ | draft — front matter incompleto |
| 14 | generico | APE-GENERIC-014 | general | ✅ | ✅ | draft — front matter incompleto |
| 15 | hoja-visita | APE-VISIT-015 | compraventa,alquiler_temporada,alquiler_turistico | ❌ | ✅ | **FALTA CREAR** |
| 16 | inventario-estado-inmueble | APE-INVENTORY-016 | compraventa,alquiler_temporada,alquiler_turistico | ❌ | ✅ | **FALTA CREAR** |
| 17 | informacion-privacidad-cliente | APE-PRIVACY-017 | general | ❌ | ✅ | **FALTA CREAR** |
| 18 | declaracion-origen-fondos | APE-COMPLIANCE-SOF-018 | general,compraventa | ❌ | ✅ | **FALTA CREAR** |

---

## Inconsistencias de placeholders detectadas

| Placeholder encontrado | Placeholder canónico | Archivos afectados |
|---|---|---|
| `buyer.fullname` | `buyer.full_name` | arras-penitenciales, contrato-compraventa, oferta-compra, contrato-reserva-senal |
| `seller.fullname` | `seller.full_name` | arras-penitenciales, contrato-compraventa |
| `agent.fullname` | `agent.full_name` | todas las plantillas ES |
| `landlord.fullname` | `landlord.full_name` | contrato-temporada, contrato-arrendamiento |
| `tenant.fullname` | `tenant.full_name` | contrato-temporada, contrato-arrendamiento |
| `guest.fullname` | `guest.full_name` | contrato-alquiler-turistico |

---

## Campos faltantes en front matter

Todas las 14 plantillas ES actuales carecen de:

- `ape_code`
- `phase`
- `status` (tienen `legal_review_status` pero no `status`)
- `signable`
- `requires_legal_review`
- `requires_advisor_validation`
- `translation_status`
- `source_language`
- `source_version`
- `locale`
- `effective_from` / `effective_until`

---

## Decisiones canónicas

1. **Placeholder canónico:** `entity.full_name` (snake_case, no camelCase)
2. **Front matter**: añadir campos faltantes según esquema §10 del prompt maestro
3. **Familia duplicada**: `contrato-arrendamiento` absorbe `alquiler_temporada`; cada uno tiene `template_key` propio pero comparten algunas cláusulas
4. **Sistema vs organización**: las 18 familias base serán `system_template = true`; las creadas por usuario `system_template = false`
5. **Publicación**: ninguna variante se publica automáticamente; todas inician como `draft`
6. **Idiomas sin revisión humana**: estado `machine_translated`; bloqueadas para firma

---

## Acciones pendientes

- [ ] Corregir front matter de las 14 plantillas ES
- [ ] Normalizar placeholders (alias legacy en rendering service)
- [ ] Crear 4 familias faltantes en ES
- [ ] Crear 154+ variantes en 10 idiomas restantes
- [ ] Crear template_manifest.json
- [ ] Crear operation_document_matrix.json
- [ ] Crear legal_translation_glossary.json
- [ ] Ampliar CHECK constraint en migración 003
- [ ] Añadir tablas faltantes (signature_flows, legal_holds, dossier_exports)
