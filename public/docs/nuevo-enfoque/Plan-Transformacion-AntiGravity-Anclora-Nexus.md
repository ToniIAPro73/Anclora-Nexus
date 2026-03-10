# Transformación de Anclora Nexus: Ecosistema AntiGravity para Agente Independiente eXp

**Objetivo:** Evolucionar Anclora Nexus de un CRM tradicional a un **Sistema Operativo de IA Territorial** (Ventaja Competitiva para Toni Amengual en el Suroeste de Mallorca), centrado en la Inteligencia Territorial y la Captación de Vendedores (Seller-Side Prospecting).

Este documento detalla el plan paso a paso utilizando **exclusivamente** las herramientas, habilidades (skills) y metodologías del ecosistema **AntiGravity y Gravity Claw**, basándose en el cuaderno maestro de NotebookLM y el contexto estratégico del proyecto.

---

## Fase 1: Inicialización y Arquitectura Core (Framework BLAST)

AntiGravity no es un simple ejecutor de prompts, es un entorno de desarrollo agéntico. Para construir la base de la transformación, aplicaremos el framework **BLAST** (Blueprint, Links, Architect, Stylize, Trigger).

### Paso 1: Configuración del Entorno y Reglas Globales
*   **Herramienta:** AntiGravity (Agent Workspace).
*   **Acción:** 
    *   Definir el contexto fundacional inyectando los documentos estratégicos (`Vision-Objetivo`, `Roadmap`, `Auditoria`) en los archivos de sistema de AntiGravity (`brain.md` y `soul.md`).
    *   Establecer el ICP (Ideal Client Profile): Propietarios en el Suroeste de Mallorca (Andratx, Calvià), propuesta de valor de eXp Global Spain y normativas locales.
    *   En `claude.md`, definir los criterios de éxito técnicos (ej. resiliencia de datos, latencia) y restricciones (GDPR compliance estricto).

### Paso 2: Implementación del Patrón `task_boundary`
*   **Herramienta:** AntiGravity (Core System).
*   **Acción:** Para cada nuevo agente o automatización desarrollada, forzar el ciclo de tres pasos: **PLANNING → EXECUTION → VERIFICATION**. Esto garantiza que la lógica de captación inmobiliaria sea determinista y auditable, controlando la naturaleza probabilística del LLM.

---

## Fase 2: Capa de Inteligencia Territorial (Memoria Extendida)

Para dominar el mercado del Suroeste de Mallorca, Anclora Nexus necesita un "Cerebro Digital" con conocimiento persistente sobre el territorio.

### Paso 1: Ingesta de Datos Base en NotebookLM
*   **Herramienta:** NotebookLM (UI / Web).
*   **Acción:** Subir los documentos de inteligencia local: informes de precios de Idealista, tendencias turísticas de IBESTAT, datos del aeropuerto de Aena (vuelos privados/internacionales) y normativas del Consell de Mallorca.

### Paso 2: Integración MCP (Model Context Protocol)
*   **Herramienta:** AntiGravity + `mcp_notebooklm`.
*   **Acción:** Conectar AntiGravity a NotebookLM usando el servidor MCP. Esto permite que Anclora Nexus consulte dinámicamente el cuaderno maestro mediante la herramienta `mcp_notebooklm_notebook_query`.

### Paso 3: Agente Investigador Paralelo (CMA Automático)
*   **Herramienta:** AntiGravity Agent Manager.
*   **Acción:** Crear un agente concurrente cuya tarea exclusiva sea consultar NotebookLM cada vez que el sistema detecte una nueva propiedad o zona caliente. El agente extraerá un Análisis Comparativo de Mercado (CMA) sin obstruir la ventana de contexto del agente principal de código.

---

## Fase 3: Motor de Adquisición de Vendedores (Señales Tempranas)

El núcleo de la ventaja competitiva es detectar propietarios motivados antes de que salgan al mercado masivo (FSBOs, propiedades estancadas).

### Paso 1: Scraping Inteligente y Ético
*   **Herramienta:** AntiGravity + MCP de Firecrawl / Apify.
*   **Acción:** Desarrollar un *Skill* determinista en AntiGravity que ejecute rastreos programados en fuentes públicas y permitidas (buscando señales como anomalías de precios o tiempo en mercado). 

### Paso 2: Persistencia y Modelo de Datos
*   **Herramienta:** AntiGravity + MCP de Supabase + Claude Sonnet 3.5.
*   **Acción:** Instruir a AntiGravity para generar las migraciones SQL necesarias en Supabase (usando `mcp_supabase-mcp-server_apply_migration`). Se deben crear tablas para almacenar los leads de vendedores enriquecidos con la data de los rastreos, unificando el modelo de datos para evitar divergencias entre DB y UI.

### Paso 3: Limpieza y Normalización
*   **Herramienta:** Claude Code (CLI).
*   **Acción:** Ejecutar operaciones de limpieza de datos crudos (JSONs) a través de scripts de Python orquestados por Claude Code, preparando los leads para el pipeline de prospección.

---

## Fase 4: Gravity Claw para Prospección y Outreach ("Whale Strategy")

Conversión de datos fríos en mandatos mediante hiper-personalización a escala.

### Paso 1: Memoria Semántica de Interacciones
*   **Herramienta:** MCP de Pinecone (o Supabase pgvector).
*   **Acción:** Vectorizar toda interacción, email o nota de reunión con propietarios potenciales. Gravity Claw usará este contexto histórico para retomar conversaciones meses después con precisión milimétrica.

### Paso 2: Generación Dinámica de Propuestas
*   **Herramienta:** AntiGravity Document Skills (`SKILL.md`).
*   **Acción:** Crear una habilidad específica para generar dossiers de captación. Al identificar un prospecto de alto valor ("Whale"), Gravity Claw compilará un informe del mercado local utilizando los datos extraídos de NotebookLM vía MCP, exportándolo como un PDF o presentación profesional.

### Paso 3: Outreach Automatizado (Borradores)
*   **Herramienta:** MCP de Zapier / n8n / Herramientas nativas de Email.
*   **Acción:** Configurar a Gravity Claw para redactar correos de seguimiento hiper-contextualizados (ej. "He analizado el mercado actual en Son Ferrer y su propiedad destaca por..."). Los correos se guardarán como borradores en Gmail/Outlook para la validación y envío final por parte de Toni.

---

## Fase 5: Dashboard de Comando (UI/UX Vibecoding)

Visualización y orquestación del embudo de operaciones.

### Paso 1: Frontend "Vibecoding" del Centro de Comando
*   **Herramienta:** AntiGravity (con Gemini 2.5 Pro o similar para UI rápida).
*   **Acción:** Generar los componentes React/Tailwind (siguiendo las reglas de Next.js 15 y Tailwind de Anclora Nexus) para el nuevo "Radar Territorial" y el pipeline de vendedores. Enfatizar la velocidad de iteración visual dictada por "vibecoding".

### Paso 2: Refinamiento de Componentes
*   **Herramienta:** Claude Code.
*   **Acción:** Refactorizar la UI generada, asegurando que los componentes se conecten correctamente con las APIs de FastAPI y los datos en tiempo real de Supabase. Aplicar la estrategia de 3 pasadas: Comprender → Planificar → Ejecutar.

### Paso 3: Cron Jobs Perpetuos (El agente que no duerme)
*   **Herramienta:** Modal (o Vercel Cron).
*   **Acción:** Desplegar los scripts de extracción y las rutinas de IA de la Fase 3 a una infraestructura serverless (Modal) orquestada desde AntiGravity, asegurando que el motor de señales del mercado trabaje 24/7 sin intervención manual.

---

*Documento generado a través de la síntesis estratégica del cuaderno maestro de NotebookLM "Mastering AntiGravity and Gravity Claw AI Systems" y los archivos de visión del proyecto Anclora Nexus.*
