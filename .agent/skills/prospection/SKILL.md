```markdown
---
name: prospection
description: "Implementar el skill prospection_weekly: generación semanal de lista de propiedades priorizadas con copy de captación y PDF dossier. Usar cuando se pida implementar prospección, captación, dossier, o búsqueda de propiedades."
---

# Skill Prospection Weekly

## Contexto
Lee product-spec-v0.md Sección 3.3 (Skill 2) y Sección 3.1 (US-02).
Zonas target: Andratx (07150, 07157), Calvià (07180, 07181), Son Ferrer (07160).

## Instrucciones

### Paso 1: Skill Python
Crear `backend/skills/prospection.py`:
- Input: zones, criteria (min_price, property_type), exclude_contacted
- V0: cargar datos desde CSV en `backend/data/properties_seed.csv`
- Filtrar propiedades ya en tabla `properties` (evitar duplicados por catastro_ref)
- Rankear por score: ubicación × precio × tipo × novedad
- Generar copy de carta captación para cada propiedad (LLM)
- Generar PDF dossier con reportlab
- Subir PDF a Supabase Storage bucket `dossiers/`
- Crear tasks en tabla `tasks` tipo 'prospection'

### Paso 2: CSV Seed
Crear `backend/data/properties_seed.csv` con 30 propiedades ficticias de Mallorca SW:
- Columnas: address, city, postal_code, property_type, estimated_price, surface_m2, bedrooms, catastro_ref
- Mezcla de villas, apartments, fincas en las zonas target

### Paso 3: n8n Workflow Cron
Crear `n8n/workflows/prospection-weekly.json`:
1. Trigger: Cron (domingos 18:00 Europe/Madrid)
2. HTTP Request → POST backend /agents/prospection_weekly
3. Download PDF desde URL en response
4. Send Email (SMTP o SendGrid) con PDF adjunto a toni@anclora.com

### Paso 4: Dashboard Widget
Widget PropertyPipeline muestra propiedades del último ciclo de prospección con status.

## Criterios de Aceptación
- Genera lista de 10-20 propiedades rankeadas
- PDF legible con dirección, precio estimado, score, copy captación
- Filtra 100% de propiedades ya contactadas
- Cron n8n se ejecuta semanalmente sin intervención
- Tasks creadas correctamente en Supabase
```

---