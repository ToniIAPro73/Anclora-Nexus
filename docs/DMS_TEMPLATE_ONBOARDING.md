# DMS Template Onboarding

**Guía:** Cómo añadir una nueva plantilla al catálogo  
**Audiencia:** Desarrolladores y gestores de contenido  
**Última actualización:** 2026-06-14

---

## Prerrequisitos

- Acceso al repositorio `anclora-nexus`
- Python 3.11+ con `pyyaml` instalado
- Acceso de escritura a Supabase (para el seed SQL)

---

## Paso 1 — Crear el fichero Markdown

Nombra el fichero siguiendo la convención:

```
backend/seeds/templates/{lang}/tpl-{tipo}.{lang}.md
```

Ejemplo: `backend/seeds/templates/es/tpl-contrato-parking.es.md`

### Estructura mínima

```markdown
---
template_key: contrato-parking
name: Contrato de arrendamiento de plaza de parking
document_type: contrato_arrendamiento
language: es
jurisdiction: España
version: 1.0
ape_codes: ["6832"]
description: Contrato para el arrendamiento de plaza de garaje o parking.
legal_basis: "Ley de Arrendamientos Urbanos (LAU) Art. 2"
---

# CONTRATO DE ARRENDAMIENTO DE PLAZA DE PARKING

**De una parte**, {{seller.full_name}}, con DNI {{seller.nif}}, en adelante **ARRENDADOR**.

**De otra parte**, {{buyer.full_name}}, con DNI {{buyer.nif}}, en adelante **ARRENDATARIO**.

## OBJETO

El ARRENDADOR cede el uso de la plaza de parking situada en {{property.address}}, plaza número {{property.parking_number}}.

## PRECIO

El precio del arrendamiento se fija en {{contract.monthly_rent}} euros/mes.

## DURACIÓN

El contrato tendrá una duración de {{contract.duration_months}} meses, desde {{contract.start_date}} hasta {{contract.end_date}}.

---

*Firmado en {{contract.signing_city}}, a {{contract.date}}.*

ARRENDADOR: _________________________ ARRENDATARIO: _________________________
```

---

## Paso 2 — Validar el front matter y placeholders

```bash
python backend/seeds/validate_templates.py
```

Errores comunes:
- `template_key` duplicado → cambia el key
- Placeholder con mayúsculas → usar solo snake_case
- Front matter con campos faltantes → añadir `template_key`, `language`, `document_type`

---

## Paso 3 — Crear traducciones (opcional)

Si la plantilla debe estar disponible en otros idiomas:

1. Duplica el fichero ES a cada idioma: `tpl-contrato-parking.en.md`
2. Traduce el contenido respetando los placeholders (no los traduzcas)
3. Actualiza el front matter: `language: en`, `name: "Parking space rental agreement"`
4. Mantén el mismo `template_key`

---

## Paso 4 — Regenerar el seed SQL

```bash
python backend/seeds/build_template_seed.py
```

Esto actualiza:
- `backend/seeds/document_templates_seed.sql` — SQL de inserción idempotente
- `backend/seeds/template_manifest.json` — Índice con hashes SHA-256

---

## Paso 5 — Aplicar en base de datos

### Entorno de desarrollo (local)
```bash
psql $DATABASE_URL -f backend/seeds/document_templates_seed.sql
```

### Supabase (remoto)
1. Abrir Supabase Dashboard → SQL Editor
2. Pegar el contenido de `document_templates_seed.sql`
3. Ejecutar

El SQL usa `ON CONFLICT ... DO NOTHING` en las versiones y `ON CONFLICT ... DO UPDATE` en la plantilla principal — es seguro ejecutarlo múltiples veces.

---

## Paso 6 — Publicar la plantilla

Una vez aplicado el seed, la plantilla queda en estado `draft`. Para publicarla:

1. Navegar a `/dms/templates` en la UI
2. Seleccionar la nueva plantilla
3. Verificar el checklist de publicación
4. Pulsar "Publicar"

O vía API:
```bash
curl -X POST https://api.tudominio.com/api/dms/templates/{template_id}/publish \
  -H "Authorization: Bearer $TOKEN"
```

---

## Paso 7 — Verificar en el wizard de generación

1. Crear un expediente de prueba
2. Abrir el wizard de generación (`/dms` → icono Sparkles)
3. Verificar que la nueva plantilla aparece con estado `published`
4. Generar un documento de prueba
5. Verificar que todos los placeholders se resuelven correctamente

---

## Checklist de onboarding

- [ ] Fichero Markdown creado con front matter completo
- [ ] `template_key` único en el catálogo
- [ ] Placeholders en snake_case y dentro del namespace correcto
- [ ] `validate_templates.py` pasa sin errores
- [ ] Traducciones creadas (mínimo ES + EN)
- [ ] Seed SQL regenerado y aplicado
- [ ] Plantilla publicada en UI
- [ ] Documento de prueba generado correctamente
- [ ] Revisión jurídica completada (antes de uso en producción)

---

## Troubleshooting

### "Plantilla no aparece en el wizard"
- Verificar que `status = 'published'` en `document_templates`
- Verificar que tiene al menos una `document_template_version`

### "Placeholder no se resuelve"
- El placeholder debe existir en el contexto del expediente
- Verificar que el nombre está en el CRM (partes, propiedad)
- Si es un campo personalizado, añadirlo al `generation_payload` en la solicitud

### "Error 422 al generar"
- Algún placeholder no está disponible → el endpoint `preview-missing-fields` muestra cuáles faltan
- El wizard de generación los solicita al usuario antes de generar
