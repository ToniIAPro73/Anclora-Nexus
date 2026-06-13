# DMS Template Governance

**Módulo:** Gobernanza del catálogo de plantillas  
**Última actualización:** 2026-06-14

---

## Catálogo canónico

El catálogo define **18 familias de documentos** identificadas por `template_key`. Cada familia tiene:
- Una versión canónica en español (`language: es`)
- Hasta 10 traducciones adicionales
- Una serie de versiones incrementales dentro de cada idioma

### Familias canónicas

| `template_key` | Tipo de operación |
|---|---|
| `arras-penitenciales` | Compraventa (señal) |
| `contrato-compraventa` | Compraventa |
| `oferta-compra` | Compraventa |
| `contrato-reserva-senal` | Compraventa (reserva) |
| `nota-encargo` | Intermediación |
| `mandato-exclusiva` | Intermediación |
| `contrato-temporada` | Alquiler temporal |
| `contrato-arrendamiento` | Alquiler habitual |
| `contrato-alquiler-turistico` | Alquiler turístico |
| `recibo-fianza` | Arrendamiento |
| `acta-entrega-llaves` | Cualquiera |
| `inventario-estado-inmueble` | Arrendamiento / Venta |
| `hoja-visita` | Intermediación |
| `kyc-identificacion-cliente` | Cumplimiento AML/KYC |
| `declaracion-origen-fondos` | Cumplimiento AML |
| `informacion-privacidad-cliente` | RGPD |
| `acuerdo-confidencialidad` | Cualquiera |
| `generico` | Uso libre |

---

## Ciclo de vida de una plantilla

```
[draft] → revisión legal → [review_required] → aprobada → [published] → obsoleta → [deprecated]
```

### Estado `draft`
- Recién creada o con versión subida sin revisión
- No aparece en el wizard de generación
- Editable

### Estado `published`
- Ha superado revisión jurídica
- Disponible para generar documentos
- No se puede eliminar directamente

### Estado `deprecated`
- Retirada (retire workflow)
- Los documentos ya generados no se ven afectados
- No aparece para nuevos expedientes

---

## Proceso de publicación (checklist)

Antes de marcar una plantilla como `published`, verificar:

1. **Versión subida**: existe al menos una `document_template_version`
2. **Hash SHA-256**: `content_md5` calculado y almacenado
3. **Placeholders validados**: todos en snake_case (`{{buyer.full_name}}` no `{{BUYER NAME}}`)
4. **Front matter completo**: `template_key`, `language`, `document_type`, `version`
5. **Revisión jurídica**: validada por asesor especializado en la jurisdicción
6. **Sin texto literal en campos variables**: el contenido no hardcodea datos de partes
7. **Cláusulas obligatorias presentes**: según `operation_document_matrix.json`

---

## Placeholders

Los placeholders siguen la convención `{{namespace.campo}}`:

| Namespace | Ejemplos |
|---|---|
| `buyer` | `{{buyer.full_name}}`, `{{buyer.nif}}`, `{{buyer.address}}` |
| `seller` | `{{seller.full_name}}`, `{{seller.nif}}` |
| `property` | `{{property.address}}`, `{{property.cadastral_ref}}`, `{{property.price}}` |
| `agent` | `{{agent.name}}`, `{{agent.license_number}}` |
| `contract` | `{{contract.date}}`, `{{contract.price_text}}`, `{{contract.deposit}}` |
| `notary` | `{{notary.name}}`, `{{notary.location}}` |
| `org` | `{{org.name}}`, `{{org.license}}` |

**Reglas:**
- Solo snake_case: `[a-z][a-z0-9_.]*`
- Sin espacios, sin guiones
- Sin mayúsculas
- Usar punto como separador de namespace
- Placeholders no resueltos bloquean la generación (gate pre-AI)

---

## Versionado semántico de plantillas

El campo `version` en el front matter sigue SemVer simplificado:

| Cambio | Versión |
|---|---|
| Corrección tipográfica / estilo | patch (1.0 → 1.0.1) |
| Nuevo campo opcional / cláusula informativa | minor (1.0 → 1.1) |
| Nuevo campo obligatorio / cambio de cláusula esencial | major (1.0 → 2.0) |

Un cambio **major** requiere nueva revisión jurídica completa antes de publicar.

---

## Aprobación y auditoría

Cada decisión de publicación o retirada queda registrada con:
- `reviewer_id` (usuario que la tomó)
- `decided_at` (timestamp ISO 8601)
- `notes` (justificación)

Los cambios de estado generan una entrada en el audit log de la tabla `generated_documents` cuando afectan a documentos ya generados.

---

## Herramientas de mantenimiento

```bash
# Validar catálogo completo
python backend/seeds/validate_templates.py

# Regenerar SQL seed e índice de hashes
python backend/seeds/build_template_seed.py

# Dry run (no escribe ficheros)
python backend/seeds/build_template_seed.py --dry-run

# Solo un idioma
python backend/seeds/build_template_seed.py --lang de
```
