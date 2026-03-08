# SKILL: NotebookLM Territorial Brain

**Versión:** 1.0
**Fecha creación:** 2026-03-08
**Notebook ID:** `452e73bc-8c2a-42ec-a34f-d0219fc8995a`
**Notebook Name:** Anclora Nexus Territorial Brain

---

## Propósito

Este skill documenta el uso del cuaderno "Anclora Nexus Territorial Brain" en NotebookLM como capa de inteligencia RAG (Retrieval-Augmented Generation) para el sistema Anclora Nexus.

**Función principal:** Proteger la ventana de contexto de Claude Code durante tareas largas de análisis territorial. En lugar de cargar todos los documentos en contexto, Claude Code consulta el notebook via MCP y recibe respuestas sintetizadas.

---

## Fuentes Actuales en el Notebook (7)

| Fuente | Contenido | Añadida |
|--------|-----------|---------|
| brain.md — ADN del Negocio | ICP, territorio, métricas, límites constitucionales | 2026-03-08 |
| soul.md — Comportamiento del Agente | Principios razonamiento, protocolos, Golden Rules | 2026-03-08 |
| Inteligencia Inmobiliaria SW Mallorca 2026 | Datos precios, turismo, scoring zonas, infraestructura | 2026-03-08 |
| Benchmark Competitivo CRMs | Análisis Witei/DataVenues/Follow Up Boss vs Anclora | 2026-03-08 |
| Visión Objetivo v2.0 | Estrategia territorio-first, roadmap v0-v3, gaps técnicos | 2026-03-08 |
| Auditoría Técnica Anclora Nexus | Estado actual, gaps críticos, orden de batalla | 2026-03-08 |
| Plan Transformación AntiGravity | 5 fases BLAST, NotebookLM MCP, Nexus Sellers | 2026-03-08 |

---

## Ciclo Operativo: PLANNING → EXECUTION → VERIFICATION

### PLANNING
Antes de consultar el notebook, definir:
1. ¿Qué información territorial necesito?
2. ¿Para qué zona o propietario específico?
3. ¿Qué acción concreta se tomará con los resultados?

### EXECUTION
Usar `mcp__notebooklm__notebook_query` con:
- `notebook_id`: `452e73bc-8c2a-42ec-a34f-d0219fc8995a`
- `query`: pregunta específica y accionable (ver queries estándar abajo)
- Resultado → guardar en archivo Markdown apropiado

### VERIFICATION
1. ¿La respuesta incluye datos concretos (€/m², porcentajes, fechas)?
2. ¿Identifica zonas específicas del Suroeste de Mallorca?
3. ¿Propone acciones accionables para Toni?
4. ¿Los datos son coherentes con el contexto conocido del mercado?

---

## Queries Estándar (Templates)

### Query 1: Vulnerabilidades/Oportunidades Territoriales
```
¿Cuáles son las 5 vulnerabilidades u oportunidades territoriales más críticas para
un agente inmobiliario en el Suroeste de Mallorca (Andratx, Calvià, Son Ferrer,
Santa Ponça) en 2026? Incluye: (1) descripción, (2) datos concretos,
(3) zonas afectadas, (4) señal de detección automatizada, (5) acción para Toni.
```
→ Output: `public/docs/vulnerabilidades.md`

### Query 2: CMA Automático por Zona
```
Dame un Análisis Comparativo de Mercado (CMA) para [ZONA]. Incluye: precio €/m²
actual, tendencia 12 meses, DOM promedio, perfil de compradores, nivel de
competencia, y argumentario de captación para propietario en esta zona.
```
→ Output: incluir en propuesta de captación / dossier del seller

### Query 3: Pitch de Captación por Zona
```
Necesito un argumento de captación para un propietario en [ZONA] con una propiedad
de [TIPOLOGÍA] valorada en aprox. [PRECIO]. ¿Qué datos de mercado y señales
locales puedo usar para convencerle de firmar exclusiva con eXp Global Spain?
```
→ Output: script de llamada / WhatsApp / email de contacto inicial

### Query 4: Auditoría de Señal STR
```
¿Qué propietarios de alquileres turísticos en [ZONA] tienen más riesgo de perder
su licencia ETVD? ¿Qué señales de enforcement detectar? ¿Cómo contactarles?
```
→ Output: lista de targets para prospección STR

### Query 5: Análisis de Zona Caliente
```
¿Está [ZONA] actualmente en una ventana de oportunidad para captación?
¿Qué infraestructuras, cambios regulatorios o tendencias de demanda la afectan
en Q1-Q2 2026? ¿Cuál es el timing óptimo para prospectar?
```
→ Output: entrada en Radar Territorial del dashboard

### Query 6: Perfil de Comprador Internacional
```
Dame el perfil detallado del comprador internacional más probable para una propiedad
en [ZONA] de €[PRECIO]. Incluye: nacionalidad predominante, motivaciones,
edad media, canales de búsqueda preferidos, y cómo llegar a ellos desde eXp.
```
→ Output: briefing para argumentario de captación (propietario)

---

## Proceso de Ingesta de Nuevas Fuentes

### 1. Fuentes externas (PDFs, reportes)
Flujo manual:
1. Colocar el archivo en `@notebook_to_add/`
2. Si es PDF: convertir a texto plano con script Python
3. Añadir via `mcp__notebooklm__notebook_add_text` con título descriptivo
4. Mover el archivo a `@notebook_added/`
5. Actualizar la tabla de "Fuentes Actuales" en este SKILL.md

### 2. Documentos del proyecto (actualizaciones)
Si brain.md, soul.md o architecture.md se actualizan significativamente:
1. Leer el documento actualizado
2. Crear nueva fuente en el notebook con el contenido actualizado
3. (Opcional) Eliminar la fuente antigua via `mcp__notebooklm__source_delete`

### 3. Datos de mercado frescos (scraping)
Cuando el sistema de scraping genere nuevos datos territoriales:
1. El skill `notebooklm_sync.py` procesa los datos
2. Los convierte en texto estructurado
3. Los añade como fuente al notebook via MCP
4. Guarda el insight en tabla `notebooklm_insights` de Supabase

---

## Sync con Supabase (Flujo Backend)

NotebookLM MCP solo funciona con sesión de browser — no es invocable desde el backend Python.

**Flujo correcto:**
1. Claude Code (con MCP) consulta NotebookLM
2. Guarda insights en `public/docs/vulnerabilidades.md` (para uso humano)
3. El skill `backend/skills/notebooklm_sync.py` usa LLM para procesar y estructurar
4. Los datos estructurados se guardan en tabla `notebooklm_insights` de Supabase
5. El endpoint `GET /api/intelligence/territorial-insights` sirve desde Supabase

---

## Cuándo Usar Este Skill

✅ **Usar cuando:**
- Se necesita inteligencia territorial para preparar una visita/captación
- Se quiere generar un CMA automático de una zona
- Se está construyendo el pitch para un propietario específico
- Se necesita analizar señales del mercado sin saturar la ventana de contexto
- Se va a implementar una nueva feature del dashboard territorial

❌ **No usar cuando:**
- La información está disponible directamente en brain.md o en los archivos del proyecto
- Se necesita información en tiempo real (los datos del notebook pueden tener lag)
- El notebook no tiene fuentes actualizadas para esa zona específica

---

## Carpetas de Datos Externos

```
@notebook_to_add/   ← Colocar aquí PDFs/docs de Idealista, IBESTAT, Consell, etc.
@notebook_added/    ← Archivos ya añadidos al notebook (histórico)
```

**Tipos de archivos esperados en `@notebook_to_add/`:**
- Informes de precios Idealista por zona (PDF o CSV)
- Boletines estadísticos IBESTAT (turismo, demografía)
- Normativas urbanísticas Consell de Mallorca
- Datos del Colegio de Registradores (compraventas por extranjeros)
- Informes Knight Frank / Engel & Völkers Baleares

---

## Identificador de Output

Todo output generado usando este skill debe incluir:
```
[Generado por Anclora Nexus Agent — notebooklm_territorial_brain]
Fecha: {timestamp}
Notebook: Anclora Nexus Territorial Brain (ID: 452e73bc-8c2a-42ec-a34f-d0219fc8995a)
```
