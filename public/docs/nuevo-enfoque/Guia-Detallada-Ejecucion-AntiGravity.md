# Guía Detallada de Ejecución: Transformación Anclora Nexus en AntiGravity

Esta guía desglosa los pasos técnicos y operativos hiper-específicos para ejecutar las 5 fases de transformación del proyecto Anclora Nexus, basándose estrictamente en las metodologías del cuaderno maestro de NotebookLM de *Mastering AntiGravity and Gravity Claw AI Systems*.

---

## Consideración Arquitectónica Inicial: ¿Greenfield o Brownfield?

Dado que **anclora-nexus** ya cuenta con una base de código (Next.js 15, FastAPI, Supabase, LangGraph), la recomendación estricta de la metodología AntiGravity es adoptar un enfoque **Brownfield (Refactorización y Actualización)** en lugar de reconstruir desde cero (Greenfield). 

Ir de "cero a uno" consume la mayor cantidad de tiempo y tokens. La filosofía de AntiGravity se centra en aprovechar la arquitectura base existente y utilizar agentes de IA como desarrolladores senior para iterar y escalar el código heredado de forma controlada.

**Proceso de Transición Recomendado:**
1. **Transferencia de Contexto:** Lanzar Claude Code (CLI) en el repositorio para que ingiera el código actual y genere un mapa de dependencias actualizado (`architecture.md`), documentando dónde vive FastAPI vs Next.js vs LangGraph.
2. **Estrategia de 3 Pasos (Understand, Plan, Execute):** Antes de programar, poner al agente en "modo plan" para auditar el código existente y redactar Procedimientos Operativos Estándar (SOPs) en formato Markdown. 
3. **RAG sobre Código Legado:** Subir la documentación previa y esquemas de base de datos actuales a NotebookLM, interactuando vía MCP para mantener protegida la ventana de contexto del agente durante la refactorización profunda.

---

## Estado Actual del Plan (Actualizado al 2026-03-10)

Evaluación realizada contrastando esta guía con el código real del repositorio, migraciones Supabase, rutas FastAPI, páginas Next.js, skills operativas, artefactos `ops/` y cobertura de tests disponible en el workspace.

### Resumen Ejecutivo

| Fase | Estado estimado | Lectura ejecutiva |
|------|-----------------|-------------------|
| Fase 1. Inicialización y arquitectura core | **82%** | La base brownfield, memoria persistente del proyecto y arquitectura operativa ya existen. Falta endurecer la disciplina universal `PLANNING -> EXECUTION -> VERIFICATION` en todos los flujos. |
| Fase 2. Capa de inteligencia territorial | **74%** | Ya existe caché operacional de NotebookLM, sync pack validable, endpoints API, control-plane y visualización territorial. Sigue dependiendo de puente externo/manual para la consulta live del notebook. |
| Fase 3. Motor de adquisición de vendedores | **69%** | El modelo seller-side, la ingesta, el scraping FSBO y la importación StateFox están implementados. Falta cerrar conectores live verificables y automatización continua sin depender de snapshots/manualidad. |
| Fase 4. Gravity Claw outreach | **63%** | Ya hay dossier, drafts multicanal, memoria de interacciones, export y supervised send. No existe aún memoria vectorial real ni integración nativa de envío Gmail/WhatsApp con trazabilidad completa. |
| Fase 5. Dashboard y orquestación continua | **76%** | Hay páginas de sellers/intelligence, cron territorial y paneles conectados. Faltan pulir zonas todavía hardcoded, observabilidad end-to-end y validación de despliegue cloud estable. |

### Desarrollo Global Estimado

**Avance global del plan AntiGravity: 73%**

### Evidencia principal encontrada en el repo

- La memoria fundacional existe: `brain.md`, `soul.md`, `CLAUDE.md`, `architecture.md`, `progress.md`, `findings.md`.
- La inteligencia territorial ya tiene soporte persistente en `notebooklm_insights` y runtime en:
  - `supabase/migrations/036_notebooklm_intelligence_cache.sql`
  - `backend/services/notebooklm_service.py`
  - `backend/api/routes/intelligence.py`
  - `frontend/src/components/widgets/RadarTerritorial.tsx`
- El control-plane territorial ya está operable y validable:
  - `scripts/build-notebooklm-sync-pack.mjs`
  - `scripts/validate-notebooklm-sync-pack.mjs`
  - `ops/notebooklm-territorial-sync-status.json`
- El motor seller-side ya tiene persistencia y skills dedicadas:
  - `supabase/migrations/037_nexus_sellers.sql`
  - `supabase/migrations/038_seller_interactions.sql`
  - `backend/skills/seller_signal_ingest.py`
  - `backend/skills/fsbo_scraper.py`
  - `backend/skills/seller_outreach_batch.py`
  - `backend/skills/whale_dossier.py`
- La orquestación continua ya está bosquejada y parcialmente integrada:
  - `backend/api/routes/skills.py`
  - `frontend/src/app/api/cron/territorial-pipeline/route.ts`
  - `frontend/src/app/api/cron/weekly/route.ts`
- Hay puente StateFox para captación/importación:
  - `scripts/statefox-live-capture.mjs`
  - `backend/services/statefox_bridge_service.py`
  - `frontend/src/app/(dashboard)/intelligence/statefox-bridge/page.tsx`

### Qué falta por fase para considerarla "cerrada"

#### Fase 1
- Aplicar un patrón homogéneo y verificable de `task_boundary` en todos los skills/rutas críticas, no solo a nivel documental.
- Actualizar documentación técnica que ya ha quedado desalineada del código real (por ejemplo, arquitectura/migraciones/features activas).
- Consolidar definitivamente el entrypoint backend y eliminar ambigüedades heredadas entre rutas/paquetes legacy.

#### Fase 2
- Sustituir la dependencia operativa de snapshots/manualidad de NotebookLM por un proceso reproducible estable con runbook, ventana de frescura y responsabilidad operativa clara.
- Ampliar cobertura territorial real del sync pack a todas las zonas objetivo prioritarias.
- Cerrar el flujo CMA/insight automático por nueva propiedad o zona caliente, no solo consumo pasivo del caché.

#### Fase 3
- Verificar en entorno real el scraping live de Firecrawl/Idealista y su coste/rate-limit.
- Automatizar ingestion live desde StateFox y otras fuentes sin depender de pegado manual o capturas locales.
- Endurecer enriquecimiento de contacto, deduplicación avanzada y controles legales/compliance por fuente.

#### Fase 4
- Implementar memoria semántica real (pgvector/Pinecone o equivalente) para reanudación contextual de conversaciones.
- Crear el cuaderno privado por seller Whale y conectar ese flujo con el dossier de captación.
- Integrar supervised send con clientes/canales reales y feedback de entrega/apertura/resultado.

#### Fase 5
- Sustituir bloques hardcoded aún presentes en la UI seller/intelligence por datos backend vivos.
- Añadir observabilidad operacional: salud de cron, último run, errores, latencia y cobertura de ingestión.
- Verificar despliegue productivo completo de cron cloud y de la cadena 1 -> 5 con datos reales.

### Orden de relevancia para llegar al 100% productivo

1. **Cerrar el pipeline territorial y seller-side end-to-end con fuentes reales**: scraping/importación live, persistencia, scoring, dossier y drafts sobre datos de mercado frescos.
2. **Eliminar dependencias manuales críticas de NotebookLM/StateFox**: hoy el sistema funciona, pero no es todavía autónomo ni plenamente reproducible.
3. **Conectar el outreach a canales reales con modo supervisado**: el valor comercial no se captura del todo mientras los drafts no se conviertan en envíos trazables.
4. **Añadir memoria semántica por seller y contexto histórico accionable**: esto es lo que convierte el workbench actual en un verdadero Gravity Claw.
5. **Completar observabilidad y operación cloud**: cron fiable, estados, alertas, reintentos y métricas operativas.
6. **Limpiar UI/documentación residual hardcoded o desalineada**: importante para confianza operativa, aunque no es el principal cuello de botella.
7. **Ejecutar una pasada completa de QA reproducible**: backend tests, frontend build, smoke tests sobre cron y rutas críticas en entorno preparado.

### Backlog post-GO recomendado

Backlog formal para el tramo `GO -> 100% productivo`:
`public/docs/nuevo-enfoque/Backlog-Post-GO-100-Productivo.md`

### Plan de Ejecución 30 / 60 / 90 Días

Backlog ejecutable asociado:
`public/docs/Nuevo_enfoque/Backlog-Entrega-Productiva-30-60-90.md`

#### Horizonte 0-30 días: pasar de "parcialmente operativo" a "operación verificable"

**Objetivo:** cerrar el circuito mínimo de producción con datos reales y eliminar los puntos más frágiles del sistema.

**Entregables obligatorios**
- Pipeline territorial ejecutable de punta a punta en cloud:
  - ingestión seller-side,
  - sync de inteligencia territorial,
  - batch de outreach supervisado.
- Runbook operativo único para:
  - refresco NotebookLM,
  - importación StateFox,
  - ejecución cron,
  - recuperación ante fallo.
- Sustitución de los bloques territoriales hardcoded del frontend sellers por consumo de backend real.
- Smoke test manual reproducible de la cadena:
  - fuente -> seller -> insight -> dossier -> draft -> supervised send.

**Trabajo técnico**
1. Endurecer `frontend/src/app/api/cron/territorial-pipeline/route.ts` como flujo oficial de orquestación.
2. Habilitar un origen live prioritario y uno fallback:
   - prioritario: Firecrawl o StateFox importado con contrato estable,
   - fallback: snapshot versionado.
3. Añadir status operativo visible en dashboard:
   - última ejecución,
   - estado,
   - errores,
   - volumen de sellers creados,
   - volumen de insights sincronizados.
4. Conectar `send-supervised` a mailto / wa.me de forma consistente para uso diario.
5. Preparar entorno QA reproducible con dependencias backend instalables y comando de test documentado.

**Criterio de salida**
- Toni puede ejecutar el pipeline completo una vez al día sin tocar código ni depender de inspección manual del repo.

#### Horizonte 31-60 días: pasar de "operación verificable" a "operación escalable"

**Objetivo:** reducir intervención manual y elevar calidad comercial del outreach.

**Entregables obligatorios**
- Integración live estable de al menos una fuente externa de sellers.
- Cobertura territorial ampliada a todas las zonas prioritarias.
- Dossier y drafts con contexto por seller más rico y reutilizable.
- Panel operacional con métricas de rendimiento comercial y de sistema.

**Trabajo técnico**
1. Automatizar captura/importación StateFox o consolidar Firecrawl como fuente primaria verificable.
2. Añadir enriquecimiento de contacto:
   - email,
   - teléfono,
   - WhatsApp,
   - señales de motivación normalizadas.
3. Introducir scoring más robusto:
   - peso por zona,
   - tiempo en mercado,
   - precio,
   - fuente,
   - señales de urgencia.
4. Implementar memoria histórica útil por seller:
   - mínimo v1 sin vector si hace falta,
   - idealmente ya con store semántico real.
5. Sustituir contenido mock residual en notificaciones y paneles secundarios.

**Criterio de salida**
- El sistema genera y prioriza oportunidades con una calidad suficientemente alta como para sostener un flujo semanal continuo de contacto comercial.

#### Horizonte 61-90 días: pasar de "escalable" a "100% productivo"

**Objetivo:** convertir Anclora Nexus en un sistema autónomo, observable y defendible en producción real.

**Entregables obligatorios**
- Memoria semántica real por seller y conversación.
- Outreach supervisado integrado con trazabilidad de envío/resultado.
- Observabilidad completa de pipelines y costes.
- QA técnica y operativa formal con criterios de aceptación cerrados.

**Trabajo técnico**
1. Implementar pgvector/Pinecone o equivalente para memoria contextual real.
2. Crear cuaderno privado o equivalente de inteligencia por Whale seller y conectarlo al workbench.
3. Integrar canal de correo real con borrador o envío supervisado trazable.
4. Añadir alertado operativo:
   - cron caído,
   - sync territorial caducado,
   - scraping sin cobertura,
   - hard stop finops.
5. Ejecutar hardening final:
   - tests backend,
   - build frontend,
   - pruebas de regresión,
   - prueba de datos reales,
   - revisión legal/compliance de scraping y tratamiento de datos.

**Criterio de salida**
- La aplicación opera con autonomía diaria, datos frescos, outreach accionable y trazabilidad suficiente para considerarse un sistema productivo real.

### Backlog priorizado inmediato

1. Reemplazar oportunidades territoriales hardcoded de sellers por datos backend.
2. Formalizar el cron territorial como pipeline oficial desplegado.
3. Cerrar una integración live verificable de captación seller-side.
4. Conectar supervised send a canales reales utilizables por Toni.
5. Preparar entorno de test backend reproducible y ejecutar QA mínima.
6. Diseñar la memoria semántica v1 para sellers Whale.

---

## Fase 1: Inicialización y Arquitectura Core (Framework BLAST)

Utilizaremos el framework **BLAST** (Blueprint, Link, Architect, Stylize, Trigger) con una arquitectura de 3 capas (Arquitectura, Navegación, Herramientas).

### 1.1 Setup del Entorno y "Protocolo Cero"
1. Abre AntiGravity IDE.
2. Crea el espacio de trabajo: *File -> Open Folder -> New Folder* (`anclora-nexus`).
3. Activa el modo **Planning** (usando Claude 3.7 Sonnet Thinking o Gemini 3.1 Pro High).
4. **Ejecuta el Protocolo Cero (Prompt):**
   > *"Identity: You are a System Pilot. Your mission is to build deterministic, self-healing automations in AntiGravity using the BLAST framework (Blueprint, Link, Architect, Stylize, Trigger) operating within a 3-layer architecture. Execute Protocol Zero: Initialize the project memory. Create `task_plan.md` (phases, goals, checklists), `findings.md` (research, discoveries, constraints), `progress.md` (what is done, errors), and a core markdown constitution file. Await my input for the Blueprint."*

### 1.2 Configuración de los Archivos de Sistema Persistentes
Para evitar la pudrición del contexto ("context rot"), crea y define los siguientes archivos en la raíz del proyecto:
*   **`brain.md` (ADN del Negocio / Inteligencia Territorial):** La única fuente de verdad. Define el perfil de Toni Amengual, el ICP (vendedores Suroeste de Mallorca), normativas locales, flujos de adquisición y métricas clave.
*   **`claude.md` (Constitución del Proyecto):** Restricciones y reglas duras. Especifica el stack tecnológico (Next.js 15, FastAPI, Supabase, LangGraph), la regla de "Data First", los directorios clave y los criterios de validación exitosa.
*   **`soul.md` (Comportamiento del Agente):** Personalidad del sistema. Ejemplo: *"Sé crítico, desafía mis ideas creativamente, no seas adulador, piensa en la pregunta detrás de la pregunta y siempre piensa 7 pasos por delante."*

### 1.3 Arquitectura de 3 Capas
Define el "North Star" de Anclora Nexus instruyendo al agente: *"El North Star es un sistema de inteligencia territorial. Integraciones: NotebookLM MCP. Payload: Un panel interactivo de inteligencia."*
Dividir la lógica en:
1.  **Arquitectura:** POEs (Procedimientos Operativos Estándar) técnicos en markdown.
2.  **Navegación:** La capa de razonamiento que enruta datos.
3.  **Herramientas:** Scripts atómicos y testeables.

---

## Fase 2: Capa de Inteligencia Territorial (Integración NotebookLM MCP)

Usaremos NotebookLM como motor RAG global de costo cero para memoria a largo plazo.

### 2.1 Configuración de MCP
1.  En AntiGravity: *MCP Servers -> View raw config*.
2.  **Prompt:** *"Añade la configuración del servidor MCP no oficial de NotebookLM a este archivo `@mcp_config.json`. Necesito capacidades para listar, crear, consultar cuadernos y generar artefactos."*
3.  Autentícate en Google en la ventana de Chrome generada por el MCP para registrar los tokens de sesión.

### 2.2 Ingesta de Datos Base
1.  Crea dos carpetas locales: `@notebook_to_add` y `@notebook_added`.
2.  Coloca aquí los informes de Idealista, IBESTAT, Consell de Mallorca, etc.
3.  **Prompt:** *"Crea un nuevo cuaderno en NotebookLM llamado 'Inteligencia Territorial Suroeste Mallorca 2026'. Añade cada archivo de la carpeta `@notebook_to_add` como fuente en ese cuaderno. Si fallas subiendo un PDF, crea un script en Python para convertir el PDF a texto plano de forma local e inyéctalo nuevamente. Una vez completado, mueve los archivos a `@notebook_added`."*

### 2.3 Despliegue de Agentes Paralelos (Agent Swarm)
Abre el **Agent Manager** de AntiGravity y levanta 3 terminales concurrentes:
1.  **Terminal 1 (Data Strategist):** *"Usa el NotebookLM MCP. Consulta el cuaderno 'Inteligencia Territorial Suroeste Mallorca 2026' y extrae las 5 vulnerabilidades/oportunidades territoriales más críticas. Guarda esto en `vulnerabilidades.md`."*
2.  **Terminal 2 (Artifact Synthesizer):** *"Usa el NotebookLM MCP. Genera un Audio Overview (Podcast) y un informe de Inteligencia Competitiva basado en los datos del Agente 1, y descárgalos al espacio de trabajo."*
3.  **Terminal 3 (Full-Stack Dev):** *"Lee `vulnerabilidades.md`. Construye un dashboard interactivo local (HTML/React) que visualice esta inteligencia en tiempo real. Usa los lineamientos de diseño de la marca especificados en `claude.md`."*

---

## Fase 3: Motor de Adquisición de Vendedores (Scraping y BD)

El objetivo es extraer señales tempranas de mercado antes que la competencia.

### 3.1 Activación de MCPs de Scraping y Base de Datos
*   **Supabase MCP:** Configúralo en el menú de MCP de AntiGravity con tu `access_token`.
*   **Firecrawl MCP / Apify MCP:** Para web scraping. Configura `mcp_config.json` con la API key de Firecrawl.

### 3.2 Generación de Tablas con Lenguaje Natural
En lugar de escribir SQL a mano, usamos el agente.
*   **Prompt:** *"Utiliza el Supabase MCP para crear una tabla llamada 'Nexus_Sellers'. Necesito columnas para ID, Nombre_Empresa/Propietario, Website_URL/Anuncio, Datos_Extraidos y Estado_Contacto. Ejecuta el SQL necesario directamente."*

### 3.3 Creación del SKILL (`seller_acquisition_skill.md`)
Crea el archivo `.agents/skills/seller_acquisition_skill.md`. 
*   **Contenido:** Define el ciclo `PLANNING` → `EXECUTION` → `VERIFICATION`. Instruye explícitamente al agente para utilizar Firecrawl MCP para rastrear portales, parsear propiedades FSBO (For Sale By Owner) o estancadas, y enviar el JSON de resultados directamente a la tabla `Nexus_Sellers` mediante el Supabase MCP.

---

## Fase 4: Gravity Claw Outreach (Estrategia "Whale")

Descarte de automatización masiva; hiper-personalización basada en análisis profundo del vendedor.

### 4.1 Despliegue de Gravity Claw y Pinecone
1.  Configura el backend LangGraph (Gravity Claw) con el token de Telegram y OpenRouter (Claude 3.5 Sonnet / 3 Opus).
2.  **Pinecone MCP:** Conecta este MCP para memoria histórica. Usa el modelo `multilingual-e5-large` (1536 dimensiones) para que el agente vectorice todas las comunicaciones prestando atención a matices de ventas a largo plazo.

### 4.2 Auditoría RAG Específica por Vendedor (NotebookLM Dynamico)
Por cada lead VIP (Whale) capturado:
*   **Prompt:** *"Por cada nuevo vendedor de alto potencial en Supabase, utiliza el NotebookLM MCP para crear un nuevo cuaderno privado. Ingiere su anuncio o datos extraídos como fuentes. Ejecuta una investigación profunda sobre los cuellos de botella actuales de su estrategia de venta territorial."*

### 4.3 Redacción y Outreach Asistido por Zapier
1.  Conecta **Zapier MCP** para interactuar con Gmail de forma segura.
2.  **Prompt:** *"Revisa la tabla Nexus_Sellers. Para el vendedor X, extrae los insights de su NotebookLM y usa el Zapier MCP para guardar un borrador de correo en mi Gmail ofreciendo una auditoría de mercado o estrategia de valoración gratuita basada en los problemas de conversión detectados."*

---

## Fase 5: Dashboard Vibecoding y Orquestación Continua (Modal)

Panel de control para Toni y automatización "always-on".

### 5.1 Diseño Frontend Rápido ("Vibecoding")
1.  Crea la carpeta `design_inspo` y sube referencias visuales de UI premium y modo oscuro.
2.  Descarga e instala la habilidad "UI/UX Pro Max" en tu entorno.
3.  **Prompt:** *"Basado en la carpeta design_inspo y el SKILL UI/UX Pro Max, vibecodea un dashboard en Next.js/Tailwind. Debe tener una tabla de datos conectada a Supabase que muestre leads de la Fase 3, un botón para desencadenar el outreach de la Fase 4, y métricas LAPS."*

### 5.2 Refactorización de Calidad (Claude Code CLI)
1.  Abre la terminal en el proyecto y lanza `claude`.
2.  **Prompt:** *"Audita el código del dashboard generado. Verifica que la conexión a Supabase utilice las variables de entorno correctas. Realiza una estrategia de 3 pasadas (Comprender, Planificar, Ejecutar). Si todo está correcto, usa `claude commit --auto`."* 
*(Usa `/compact` si la ventana de contexto se sobrecarga).*

### 5.3 Implementación de Trigger Perpetuo (Modal)
Para que las Fases 2 y 3 no dependan de que tu equipo esté encendido:
1.  Obtén el código de arranque ("Quick Start") de `modal.com` y cárgalo en AntiGravity.
2.  **Prompt:** *"Utiliza este código de Modal para autenticarte. Toma el script de scraping de Firecrawl (Fase 3) y la consulta a NotebookLM, y configúralos como un Cron Job u Horario Programado en Modal para que se ejecuten en la nube cada 24 horas y actualicen Supabase en segundo plano."*
