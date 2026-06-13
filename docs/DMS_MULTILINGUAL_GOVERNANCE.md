# DMS Multilingual Governance

**Módulo:** Gobernanza multilingüe del catálogo de plantillas  
**Idiomas soportados:** 11 (es, en, ca, fr, de, it, pt, nl, sv, da, no)  
**Última actualización:** 2026-06-14

---

## Estructura del catálogo multilingüe

```
backend/seeds/templates/
  es/   — Español (canónico, 18 plantillas)
  en/   — English (18 plantillas)
  ca/   — Català (18 plantillas)
  fr/   — Français (18 plantillas)
  de/   — Deutsch (18 plantillas)
  it/   — Italiano (18 plantillas)
  pt/   — Português (18 plantillas)
  nl/   — Nederlands (18 plantillas)
  sv/   — Svenska (18 plantillas)
  da/   — Dansk (18 plantillas)
  no/   — Norsk (18 plantillas)
```

Total: 198 variantes.

---

## Jerarquía canónica

El español (`es`) es el idioma **canónico de referencia**:
- Es la fuente de verdad para placeholders y estructura de cláusulas
- Las traducciones no pueden añadir ni eliminar placeholders respecto al canónico
- Los cambios estructurales se realizan primero en ES, luego se propagan a otros idiomas

Campo `is_canonical: true` solo en versiones ES.

---

## Relación entre idiomas

```
Template ES (canónico)
  └── document_template_versions.is_canonical = TRUE
        ├── Template EN  (traducción, is_canonical = FALSE)
        ├── Template CA  (traducción, is_canonical = FALSE)
        └── ... (resto de idiomas)
```

Todas las variantes comparten el mismo `template_id` pero con `language` diferente en `document_template_versions`.

---

## Criterios de calidad para traducciones

### Placeholders
- Idénticos al canónico ES (mismo nombre, mismo namespace)
- No se traducen los placeholders: `{{buyer.full_name}}` es igual en todos los idiomas
- El validador detecta placeholders añadidos o eliminados en una traducción

### Terminología jurídica
El fichero `backend/seeds/legal_translation_glossary.json` define la terminología estándar por idioma:

```json
{
  "es": { "buyer": "comprador/compradora", "seller": "vendedor/vendedora", ... },
  "en": { "buyer": "buyer", "seller": "seller", ... },
  "de": { "buyer": "Käufer", "seller": "Verkäufer", ... }
}
```

Las traducciones deben respetar los términos del glosario, especialmente en cláusulas de responsabilidad.

### Coherencia estructural
- El número de cláusulas principales debe ser igual al canónico (±1)
- Las cláusulas de cumplimiento legal (AML, RGPD, identificación de partes) son obligatorias en todos los idiomas
- Las referencias a leyes locales son la única excepción válida a la estructura canónica

---

## Proceso de incorporación de una nueva variante

1. **Partir del canónico ES** como plantilla base
2. Traducir respetando la terminología del glosario
3. Verificar que los placeholders son idénticos
4. Validar con `python backend/seeds/validate_templates.py`
5. Revisar con asesor jurídico local (si la jurisdicción lo requiere)
6. Subir como nueva versión vía UI de biblioteca o seed SQL

---

## Detección de traducción divergente (Advisor AI Gate)

El gate `divergent_translation` de `advisor_contract_validator_service.py` compara el documento generado con el canónico ES y bloquea la firma si:
- Hay más de 5 diferencias críticas (cláusulas eliminadas, cambios críticos)
- El total de diferencias supera el umbral de `_DIVERGENCE_DIFF_THRESHOLD * 2`

Esto previene que traducciones con errores graves lleguen a firma.

---

## Cobertura y monitoring

La UI de la biblioteca de plantillas incluye la **Matriz de cobertura multilingüe** que muestra:
- Qué familias tienen variante en cada idioma
- Estado de validación de cada variante
- Hashes SHA-256 para detectar modificaciones no autorizadas

---

## Añadir un idioma nuevo

1. Crear directorio `backend/seeds/templates/{código-iso}/`
2. Traducir las 18 plantillas siguiendo el naming: `tpl-{tipo}.{lang}.md`
3. Añadir el código a la lista `LANGUAGES` en:
   - `backend/seeds/build_template_seed.py`
   - `frontend/src/app/(dashboard)/dms/templates/page.tsx`
4. Añadir la entrada al glosario `legal_translation_glossary.json`
5. Ejecutar `python backend/seeds/validate_templates.py`
6. Generar seed: `python backend/seeds/build_template_seed.py`
7. Aplicar seed SQL en Supabase
