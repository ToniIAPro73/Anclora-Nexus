# Manual de Usuario - Anclora Nexus

Este directorio contiene el Manual de Usuario oficial de Anclora Nexus en dos formatos:

## 📄 Archivos Disponibles

| Archivo | Formato | Idioma | Tamaño | Descripción |
|---------|---------|--------|--------|-------------|
| `MANUAL_USUARIO_ANCLORA_NEXUS.md` | Markdown | 🇪🇸 ES | ~53 KB | Versión Markdown español |
| `MANUAL_USUARIO_ANCLORA_NEXUS.docx` | Word | 🇪🇸 ES | 1.9 MB | Versión Word español con logo, screenshots y branding |
| `MANUAL_USUARIO_ANCLORA_NEXUS_EN.md` | Markdown | 🇬🇧 EN | ~48 KB | English Markdown version |
| `MANUAL_USUARIO_ANCLORA_NEXUS_EN.docx` | Word | 🇬🇧 EN | 1.9 MB | English Word version with logo, screenshots and branding |
| `GOOGLE_DOCS_URLS.md` | Referencia | Multi | ~2 KB | URLs de acceso a Google Docs (después del upload) |
| `assets/screenshots/` | PNG | Visual | 672 KB | 17 capturas de pantalla de la aplicación |

## 🎯 Uso

### Para Usuarios Finales

**Español (ES):**
- **Leer online:** Abre `MANUAL_USUARIO_ANCLORA_NEXUS.md` en GitHub o cualquier visor markdown
- **Descargar Word:** Descarga `MANUAL_USUARIO_ANCLORA_NEXUS.docx` para uso offline o impresión

**English (EN):**
- **Read online:** Open `MANUAL_USUARIO_ANCLORA_NEXUS_EN.md` in GitHub or any markdown viewer
- **Download Word:** Download `MANUAL_USUARIO_ANCLORA_NEXUS_EN.docx` for offline use or printing

**Google Docs (Both languages):**
- Consulta `GOOGLE_DOCS_URLS.md` para enlaces directos (requiere upload previo)

### Para Desarrolladores

El manual se genera automáticamente mediante la feature **ANCLORA-UMG-001** (User Manual Generator).

## 🔄 Regenerar el Manual

Si la aplicación ha cambiado (nuevas funcionalidades, cambios en UI, etc.), puedes regenerar el manual:

```bash
# Generar manual español (ES)
python3 scripts/generate-user-manual.py

# Traducir a inglés (EN)
export GROQ_API_KEY=your_key_here
python3 scripts/translate-manual.py

# Generar DOCX español
python3 scripts/convert-manual-to-docx.py --lang es

# Generar DOCX inglés
python3 scripts/convert-manual-to-docx.py --lang en

# Capturar screenshots reales (requiere servidor corriendo)
python3 scripts/capture-screenshots.py
```

**Flujo completo:**
1. ✅ Genera versión Markdown español (`.md`)
2. ✅ Traduce a inglés con LLM (Groq llama-3.3-70b)
3. ✅ Convierte ambos a DOCX (`.docx`) con logo, screenshots y branding Anclora

### Subir a Google Docs

Para crear/actualizar la versión en Google Docs:

```bash
python3 scripts/upload-to-google-docs.py
```

**Primera vez:**
- Requiere configurar credenciales de Google Drive API
- Consulta: [`GOOGLE_DOCS_SETUP.md`](./GOOGLE_DOCS_SETUP.md) para guía paso a paso

**Ejecuciones posteriores:**
- Usa credenciales guardadas (automático)
- Actualiza el documento existente

### Requisitos

```bash
# Para generación local (MD + DOCX)
pip install python-docx Pillow lxml

# Para traducción ES → EN
pip install groq

# Para screenshots automáticos
pip install playwright
playwright install chromium

# Para upload a Google Docs
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
```

## 📋 Contenido del Manual

El manual cubre **100% de la aplicación**:

### Sección CORE (5 módulos)
- Dashboard
- Leads
- Properties
- Tasks
- Team

### Sección INTELLIGENCE (5 módulos)
- Prospection studio (legacy)
- Prospection operativa
- Seller Pipeline
- Opportunity Ranking
- Intelligence

### Sección OPERATIONS (7 módulos)
- Ingestion
- Data Quality
- Feed Orchestrator
- Automation & Alerting
- Command Center
- Deal Margin Simulator
- Source Observatory

### Header Components (6 componentes)
- Search
- Notifications
- Currency Selector
- Language Selector
- Unit Selector
- User Menu

### Contenido Adicional
- Casos de uso por rol (Owner, Manager, Agent)
- Rutinas diarias recomendadas
- Troubleshooting y errores comunes
- FAQ
- Matriz de permisos
- Glosario de términos
- Atajos de teclado

## 🏗️ Arquitectura de la Feature

La feature **ANCLORA-UMG-001** implementa:

### Skills Phase 1 (✅ Implementadas)
1. **manual-content-analyzer:** Analiza código (Sidebar, Header, páginas) para extraer funcionalidades
2. **manual-structure-builder:** Construye estructura jerárquica del manual
3. **manual-format-exporter:** Exporta a formatos Markdown y DOCX con branding

### Skills Phase 2 (✅ Implementadas)
4. **screenshot-capturer:** Captura automática de pantallas con Playwright (✅ demo + real)
5. **manual-translator:** Traducción ES → EN con Groq LLM + glossario (✅ completo)
6. **google-docs-converter:** Upload a Google Docs (✅ completo)
7. **video-tutorial-generator:** Videos tutoriales con AI voiceover (📝 especificado, ⏳ pendiente)

### Documentación
- `sdd/features/user-manual-generator/user-manual-generator-INDEX.md` - Índice de feature
- `sdd/features/user-manual-generator/user-manual-generator-spec-v1.md` - Especificación técnica completa
- `sdd/features/user-manual-generator/PHASE2_IMPLEMENTATION_PLAN.md` - Plan Phase 2
- `sdd/features/user-manual-generator/rules/user-manual-rules.md` - Reglas de generación
- `sdd/features/user-manual-generator/prompts/user-manual-prompt.md` - Prompts para AntiGravity
- `sdd/features/user-manual-generator/test-plan-v1.md` - Plan de testing

## 🎨 Branding

El manual DOCX incluye:

- **Portada profesional** con logo y branding Anclora
- **Colores corporativos:**
  - Navy: #192350 (títulos principales)
  - Gold: #D4AF37 (títulos secundarios, highlights)
  - White Soft: #F5F5F0 (backgrounds)
- **Tipografías:**
  - Headings: Georgia (aproximación a Playfair Display)
  - Body: Arial (aproximación a Inter)
- **Tabla de contenidos** (auto-actualizable en Word)
- **Pie de página** con marca Anclora Nexus

## 📊 Estadísticas

- **Versión actual:** 1.2.3
- **Fecha de generación:** 2026-03-10
- **Idiomas disponibles:** 2 (Español, English)
- **Caracteres totales ES:** 52,446
- **Caracteres totales EN:** 48,770
- **Páginas estimadas (DOCX):** ~30-35 páginas
- **Screenshots incluidos:** 17 (672 KB total)
- **Cobertura:** 100% de funcionalidades (17 módulos sidebar + 6 componentes header)
- **Tokens usados en traducción:** 36,282 (Groq llama-3.3-70b-versatile)

## 🔐 Confidencialidad

Este manual contiene información interna de Anclora Private Estates:
- ⚠️ **NO compartir** fuera de la organización sin autorización
- ⚠️ **NO publicar** en repositorios públicos
- ✅ Uso interno para equipo Anclora y partners autorizados

## 📞 Contacto

Para modificaciones del manual o reportar errores:

- **Owner:** Toni Amengual (toni@anclora.com)
- **Tech Lead:** Crear issue en repo interno
- **Soporte:** tech@anclora.com

---

© 2026 Anclora Private Estates. Todos los derechos reservados.
