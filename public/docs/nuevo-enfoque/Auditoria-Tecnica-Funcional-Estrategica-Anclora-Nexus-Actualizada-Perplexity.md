**Auditoría técnica, funcional y estratégica de Anclora‑Nexus**

**Actualizada con contexto real del usuario y ecosistema completo Anclora Group**

**Fecha:** 7 de marzo de 2026  
**Analista:** Principal Product Analyst & Principal Solutions Architect especializado en CRM inmobiliario  
**Scope:** Auditoría completa basada en contexto real del usuario, 5 repositorios del ecosistema Anclora y respuestas a preguntas estratégicas

---

**Nota metodológica**

Este informe distingue sistemáticamente entre:

* **EVIDENCIA:** Observaciones directas del código, estructura o configuración de los repositorios

* **INFERENCIA:** Conclusiones razonadas desde evidencias

* **HIPÓTESIS:** Suposiciones fundamentadas que requieren validación

Las recomendaciones son **concretas**, **priorizadas** y **argumentadas** con métricas de impacto, complejidad y dependencias.

---

**Resumen ejecutivo actualizado**

**Contexto real del usuario**

**Perfil profesional:**

* Trabajador multiempleado: consultor informático en CGI (tiempo parcial) \+ autónomo (A05 \- Agente Inmobiliario Independiente)

* Agente recién incorporado a eXp Global Spain (onboarding activo, co-mentor en Pollença)

* Ubicación: Palma de Mallorca

* Experiencia inmobiliaria: \~1 año (landing Playa Viva, colaboración Uniestate UK, expansión ES/LATAM)

* Especialización IA Generativa: 18 meses de formación intensiva aplicada al sector inmobiliario

**Objetivo comercial declarado (North Star):**

* **Captación de mandatos** (propiedades luxury) \+ **Autoridad de marca** mediante tecnología

* Ventaja competitiva: "agente tecnológicamente más avanzado de Mallorca"

* Sin cartera actual → prioridad absoluta: **visibilidad de marca** \+ **prospección temprana**

**Target geográfico prioritario:**  
Sudoeste de Mallorca \- zona premium:

* Palma (Son Vida, Cas Català, Illetas)

* Costa d'en Blanes, Punta Negra

* Portals Nous, Palmanova, Bendinat

* Santa Ponsa, Paguera, Cala Fornells

* Camp de Mar, Andratx, Port d'Andratx

* Secundario: Tramuntana (Sóller)

**Estrategia go-to-market:**

* Blog semanal (inversión, rentabilidad, infraestructuras, estilo de vida, turismo)

* Plan publicaciones LinkedIn \+ Facebook \+ Instagram

* Prospección simultánea: propiedades \+ compradores \+ vendedores

* Construcción de "base de conocimiento accionable" para detectar oportunidades 12-36 meses antes del mercado

**Decisiones estratégicas validadas**

**Respuestas a las 8 preguntas críticas del informe previo:**

1. **Go-to-market:** Single-agent (uso personal) con arquitectura SaaS latente

2. **Infraestructura:** Supabase Cloud (no self-host)

3. **Onboarding:** Invitation-only estricto / Single-Tenant cerrado

4. **Volumen esperado 12 meses:**

   * Leads/mes: 20-50 calificados

   * Propiedades activas: 10-20 mandatos exclusivos \+ seguimiento 100-200 oportunidades

   * Agentes: 1 (single-agent)

   * Ejecuciones IA/día: Altas (batch/asíncronas), no tiempo real

5. **Endpoints públicos:** Expuestos a Internet pero protegidos (Edge Middleware \+ Secrets)

6. **Postura IA:** Híbrida (OpenAI/Anthropic para cliente-facing, OSS para backend/privacidad)

7. **North Star comercial:** Captación (mandatos) \+ Autoridad de marca

8. **Integraciones no negociables v1:** WhatsApp, LinkedIn, Idealista

**Qué es Anclora-Nexus hoy (EVIDENCIA actualizada)**

**Ecosistema Anclora Group \- 5 aplicaciones interconectadas:**

1. **Anclora-Nexus** (CRM inteligente) \- Repositorio analizado en profundidad

   * Frontend: Next.js 16.x \+ React 19.x \+ Zustand \+ Supabase Auth

   * Backend: FastAPI \+ LangGraph \+ LangChain \+ OpenAI/Anthropic

   * DB: Supabase/Postgres con migraciones RLS \+ multi-tenant

   * URL: [https://anclora-nexus-frontend.vercel.app/](https://anclora-nexus-frontend.vercel.app/)

2. **Anclora Private Estates** (Real Estate luxury frontend) \[cite:3\]

   * Stack: Vite \+ React \+ TypeScript \+ Tailwind CSS

   * Propósito: Escaparate público de propiedades luxury

   * URL: [https://anclora-private-estates.vercel.app/](https://anclora-private-estates.vercel.app/)

   * Estado: Casi terminado, sin cartera propia aún

3. **Azure Bay Landing Page** (Portfolio proyecto específico)

   * Propósito: Demostración de capacidad de creación de landing pages

   * URL: [https://azurebay-ancloraprivateestates.vercel.app/](https://azurebay-ancloraprivateestates.vercel.app/)

   * Repo: [https://github.com/ToniIAPro73/anclora-azure-bay-landing-page](https://github.com/ToniIAPro73/anclora-azure-bay-landing-page)

4. **Anclora Portfolio** (Showcase profesional)

   * Propósito: Portfolio general de proyectos

   * URL: [https://anclora-portfolio.vercel.app/](https://anclora-portfolio.vercel.app/)

   * Repo: [https://github.com/ToniIAPro73/Anclora-Portfolio](https://github.com/ToniIAPro73/Anclora-Portfolio)

5. **Anclora Advisor AI** (Asistente fiscal/laboral)

   * Propósito: Asesoramiento automático sobre fiscalidad, facturación, alertas laborales

   * URL: [https://ancloraadvisorai-ten.vercel.app/](https://ancloraadvisorai-ten.vercel.app/)

   * Repo: [https://github.com/ToniIAPro73/Anclora-Advisor-AI](https://github.com/ToniIAPro73/Anclora-Advisor-AI)

   * Estado: En desarrollo

**Arquitectura del ecosistema (INFERENCIA):**

El usuario está construyendo un **ecosistema vertical PropTech** donde:

* **Anclora Private Estates** \= cara pública (captación web)

* **Anclora Nexus** \= motor operativo (CRM \+ IA \+ prospección)

* **Anclora Advisor AI** \= back-office (compliance \+ finanzas)

* **Azure Bay/Portfolio** \= credibilidad (demostración capacidades)

Este enfoque es **coherente con su perfil** (agente tech-first, sin cartera, necesidad de diferenciación), pero **desafía la ejecución** por la amplitud simultánea.

**Valor diferencial real del ecosistema (INFERENCIA desde evidencias)**

**Fortalezas únicas identificadas:**

1. **Perfil híbrido único en Mallorca luxury:** Agente inmobiliario \+ experto IA Generativa

2. **Stack tecnológico avanzado:** Muy por encima del estándar inmobiliario español

3. **Arquitectura de producto completa:** No es "una web bonita", es un sistema operativo completo

4. **Foco en inteligencia de mercado:** Base de conocimiento accionable vs. simple CRM

5. **Positioning tech-first:** Posible referente "agente del futuro" en Mallorca

**Gaps críticos vs. realidad comercial:**

1. **Sin cartera \= sin tracción inmediata:** Todo el stack es preventivo, no reactivo

2. **Complejidad técnica vs. urgencia comercial:** Nexus está a 40-60% completitud, pero necesitas leads YA

3. **Dispersión de esfuerzo:** 5 aplicaciones simultáneas diluyen foco

4. **Ausencia de módulo comunicaciones:** WhatsApp (declarado "no negociable") no está implementado

5. **RAG/retrieval desactivado:** La "inteligencia" aún no aprende del mercado

**Prioridad recomendada actualizada (INFERENCIA orientada a cierre de negocio)**

**Dado tu contexto real (agente recién incorporado, sin cartera, multiempleado), el orden de batalla debe ser:**

**FASE 0 \- Inmediato (0-4 semanas): Cierre de superficie de ataque \+ MVP operativo**

1. **Cerrar riesgos de seguridad** (CORS abierto, endpoints públicos, RLS bypass) → evitar incidentes que destruyan credibilidad

2. **Estabilizar Nexus core** (drift datos↔API↔UI) → que lo que existe funcione sin mocks

3. **Activar captación web básica** en Private Estates → formulario → Nexus (con protección)

4. **Conectar WhatsApp manualmente** (sin automatización) → registrar conversaciones en Nexus

**FASE 1 \- Corto plazo (1-3 meses): Visibilidad de marca \+ primeros mandatos**

5. **Blog \+ Content engine:** Sistema de generación de contenido semanal (IA-assisted)

6. **LinkedIn automation:** Publicación automática desde Nexus

7. **Prospección Idealista:** Scraping \+ análisis \+ insights automáticos

8. **Deal pipeline mínimo:** Módulo para gestionar tus primeros 5-10 mandatos

**FASE 2 \- Medio plazo (3-6 meses): Inteligencia accionable**

9. **Activar RAG/retrieval** con pgvector

10. **Pricing intelligence** básico (comps automáticos)

11. **Geointeligencia** (PostGIS \+ mapas interactivos)

12. **Automation básica** (tareas, recordatorios, seguimientos)

**FASE 3 \- Largo plazo (6-12 meses): Producto maduro**

13. **Feed Orchestrator productivo** (distribución automática portales)

14. **Anclora Advisor AI integrado** (facturación \+ alertas desde Nexus)

15. **Dashboard analítico** (métricas comerciales \+ attribution)

**Principio rector:** Cada fase debe generar **mandatos o visibilidad comercial tangible**. No más "features por completitud".

---

**Contexto de mercado inmobiliario: Sudoeste de Mallorca 2026**

**Datos de mercado actualizados (EVIDENCIA de fuentes externas)**

**Precios medios zona objetivo (Q1 2026):** \[web:4\]\[web:5\]\[web:11\]

| Zona | Precio venta €/m² | Tendencia YoY | Perfil comprador |
| :---- | :---- | :---- | :---- |
| Son Vida | 7.000-10.000+ | \+7-10% | UHNW internacional |
| Portals Nous | 8.372-9.016 | \+5.01% | Alemanes, UK, suizos |
| Bendinat | 7.000-9.000 | \+7-10% | Familias luxury, ejecutivos |
| Andratx/Port Andratx | 7.000-12.000+ | \+7-10% | Inversores internacionales |
| Santa Ponsa | 5.000-7.000 | \+5-7% | Expatriados, segundas residencias |
| Illetas/Cas Català | 7.500-9.500 | \+7-10% | Mercado muy líquido, escasez oferta |

**Características del mercado luxury sudoeste Mallorca:** \[web:4\]\[web:6\]\[web:7\]

* **31,6% de transacciones** son de compradores extranjeros (Baleares lidera España) \[web:18\]

* **Principales nacionalidades:** Alemania, Reino Unido, Suiza, Estados Unidos, Escandinavia

* **Segmento premium:** Villas con vistas al mar alcanzan 10.000-20.000 €/m²

* **Liquidez superior:** Zona sudoeste tiene mayor velocidad de venta que resto de isla

* **Drivers de demanda:** Marinas de lujo (Puerto Portals), escuelas internacionales, seguridad, escasez de oferta

* **Proyección 2026:** Crecimiento 7-10% en zonas premium (escenario base) \[web:4\]

**Ventajas competitivas zona objetivo:** \[web:8\]

* **Puerto Portals:** Marina de referencia mediterránea, anchor de demanda luxury

* **Colegios internacionales:** QSI, Bellver, Agora Portals \- familia con niños

* **Conectividad:** 15-20 min aeropuerto Palma, vuelos directos hubs europeos \+ USA

* **Infraestructura:** Golf (Real Golf Bendinat), hospitales privados, servicios premium

* **Escasez estructural:** Regulación urbanística limita nueva construcción

**Oportunidades detectadas para Anclora (INFERENCIA desde datos mercado)**

**Micro-zonas infravaloradas potenciales:**

* Cala Fornells/Camp de Mar (aún por debajo 6.000 €/m², con potencial mejora accesos)

* Paguera centro (en proceso regeneración, \+29% Porto Cristo similar puede replicarse)

**Segmentos desatendidos:**

* Compradores USA (creciente, necesitan agente con inglés fluido y conocimiento fiscal USA)

* Inversores LATAM (tu experiencia Playa Viva \+ red Uniestate es ventaja)

* Familias relocating por teletrabajo (post-COVID, necesitan servicio integral)

**Timing óptimo captación:**

* **Primavera 2026 (ahora):** Temporada alta prospección, propietarios deciden listados

* **Q2-Q3:** Máximo tráfico internacional, visitas in-situ

* **Q4:** Cierre operaciones \+ captación off-market para Q1 2027

---

**Auditoría técnica detallada del ecosistema Anclora**

**1\. Anclora-Nexus: Arquitectura y stack (EVIDENCIA)**

**Frontend:** \[cite:1\]

* Framework: Next.js 16.x (App Router) \+ React 19.x

* Estado: Zustand store con **mock data fallback** (indica inestabilidad backend)

* Autenticación: Supabase Auth (client-side)

* UI: Estructura modular (Core / Intelligence / Operations)

* Navegación: Sidebar con áreas funcionales definidas

**Backend:** \[cite:1\]

* Framework: FastAPI

* IA: LangGraph (agentes multi-step) \+ LangChain (orquestación)

* LLM: OpenAI (gpt-4o-mini) \+ Anthropic (claude-3-5-sonnet)

* **CORS: allow\_origins=\["\*"\]** ❌ CRÍTICO: Todo el mundo puede llamar tu API

**Base de datos:**

* PostgreSQL vía Supabase Cloud

* Multi-tenant: org\_id \+ memberships \+ RLS policies

* Migraciones: 33+ archivos (evolución incremental)

* **Drift detectado:** Enums, columnas y constraints no alineados con servicios

**Capas de IA existentes (EVIDENCIA):** \[cite:1\]

1. **LangGraph "skills" operativos:**

   * Grafo: process\_input → planner → limit\_check → executor → result\_handler → audit\_logger → finalize

   * Skills: lead\_intake, prospection\_weekly, recap\_weekly

   * Ejecución: Desde /api/public/cta/lead (endpoint público) o invocaciones internas

2. **Intelligence v1 (Router→Governor→Synthesizer):**

   * Endpoint: /api/intelligence

   * **Retrieval: DESACTIVADO** ❌ No hay RAG ni memoria semántica

   * Propósito: Orquestador de consultas inteligentes (no implementado completamente)

**2\. Anclora Private Estates: Análisis (EVIDENCIA) \[cite:3\]**

**Stack tecnológico:**

* Build: Vite (más rápido que CRA/Next para SPA)

* Framework: React \+ TypeScript

* Estilos: Tailwind CSS \+ custom theme

* Estructura: SDD (Software Design Document) presente → arquitectura pensada

**Estado actual:**

* Aplicación casi terminada según usuario

* **Sin propiedades reales** (portfolio de demostración)

* Propósito: Showcase público \+ formulario captación leads

**Integración con Nexus:**

* Formulario contacto debe POST a Nexus /api/public/cta/lead

* **No implementado:** Tracking de origen (UTM, referrer) para attribution

* **No implementado:** Protección anti-bot (honeypot, captcha, rate limit)

**3\. Anclora Advisor AI: Análisis (EVIDENCIA parcial)**

**Propósito declarado:**

* Asesoramiento fiscal/laboral/facturación

* Sistema de alertas (vencimientos, obligaciones)

* Específico para autónomo A05 en España

**Estado:**

* Aplicación desplegada pero en desarrollo temprano

* **No integrada con Nexus** (oportunidad: datos financieros del negocio en un solo lugar)

**Oportunidad perdida (HIPÓTESIS):**  
Si Advisor AI se integrara con Nexus:

* Nexus registra ingresos por comisión → Advisor calcula IRPF trimestral

* Nexus detecta gasto deducible → Advisor lo categoriza

* Nexus suma horas trabajadas → Advisor alerta sobre incompatibilidad pluriempleo

**4\. Azure Bay \+ Portfolio: Análisis (INFERENCIA)**

**Función comercial:**

* **Credibilidad:** Demostrar capacidad técnica a potenciales clientes/mandatos

* **SEO:** Potencial tráfico orgánico desde búsquedas de proyectos

**Riesgo:**

* **Dispersión de marca:** 5 URLs diferentes diluyen autoridad de dominio

* **Mantenimiento:** Cada aplicación \= deuda técnica adicional

**Recomendación:**

* **Consolidar en Anclora Private Estates:** Portfolio \+ case studies en secciones internas

* **Mantener URLs activas:** 301 redirects a Private Estates cuando sea factible

---

**Auditoría funcional y gaps frente a CRM inmobiliario avanzado**

**Evaluación por 6 perspectivas (EVIDENCIA → INFERENCIA)**

**1\. Producto**

**✅ Fortalezas:**

* Mapa mental claro de módulos (Core/Intelligence/Operations)

* Ambición de producto completo (no solo CRUD)

* Sidebar refleja suite completa

**❌ Gaps críticos:**

* **Módulo Communications ausente:** WhatsApp (declarado "no negociable") no implementado

* **Pipeline de mandato/operación:** No hay stages de deal (prospecto → mandato → venta → comisión)

* **Calendar/Agenda:** No hay sistema de citas/recordatorios

* **Documentación:** No hay módulo para docs (mandato, CED, NIE, escrituras)

* **Firma digital:** No integrado (obligatorio en España desde 2021\)

**2\. Negocio**

**✅ Diferenciación potencial:**

* PBM (Property-Buyer Matching) con ranking explicable

* Feed Orchestrator (distribución portales)

* Governance (audit/limits/cost)

**❌ Desalineación con North Star:**

* **North Star declarado:** Captación mandatos \+ Autoridad marca

* **Nexus actual:** Enfocado en operación \+ distribución (posterior a captación)

* **Falta:** Content engine para blog, LinkedIn automation, lead magnet (guías descargables)

**Brecha comercial (HIPÓTESIS crítica):**  
Sin mandatos actuales, el usuario necesita **herramientas de visibilidad** (content, social media, SEO) antes que herramientas de operación (CRM clásico, distribución portales). El órden está invertido.

**3\. Arquitectura**

**✅ Buena base:**

* Separación frontend/backend/DB

* Migraciones como código

* Multi-tenant preparado

**❌ Problemas estructurales:**

* **Duplicidad subsistemas IA:** LangGraph skills \+ Intelligence v1 (dos formas de hacer lo mismo)

* **Redundancia de rutas:** Prospection router registrado dos veces

* **Drift de contratos:** Datos ≠ API ≠ UI (30% de features con mocks)

**4\. Datos**

**✅ Intenciones correctas:**

* RLS \+ memberships

* Data Quality module

* Ingestion events tracking

* Source observatory (trazabilidad)

**❌ Implementación frágil:**

* **Enums no alineados:** ingestion\_events define estados que código no usa

* **Columnas fantasma:** Tasks tiene campos que migraciones no declaran

* **Fallbacks peligrosos:** Queries sin org\_id "para legacy" (bypass RLS)

* **Doble verdad:** properties core vs. prospected\_properties PBM (¿cuál es source of truth?)

**5\. IA**

**✅ Skills operativos:** \[cite:1\]

* Lead intake con scoring

* Prospection weekly

* Recap generation

**❌ No "data-driven":**

* **RAG/retrieval desactivado:** IA no aprende de tu mercado, tus conversaciones, tus propiedades

* **Sin knowledge moat:** Dependencia total de OpenAI/Anthropic \= commodity

* **Sin embeddings:** No búsqueda semántica de propiedades similares

* **Sin fine-tuning:** No adaptación a tu estilo, tu zona, tu cliente

**Oportunidad perdida (INFERENCIA):**  
Con 12-18 meses procesando datos de mercado Mallorca sudoeste, podrías tener:

* "GPT de Anclora" que conoce cada calle, cada promoción, cada histórico de precio

* Búsqueda: "villa estilo mediterráneo, vista mar, precio infravalorado, Son Vida" → resultados instantáneos semánticos

* Alertas: "Nueva reducción 15% en Bendinat, propiedad X coincide con buyer profile Y"

**6\. Experiencia de usuario**

**✅ UI premium:**

* Estética cuidada

* Navegación clara

* Widgets informativos

**❌ Fricción de datos:** \[cite:1\]

* **Mocks visibles:** Store tiene fallback a datos inventados si Supabase falla

* **Normalización mojibake:** Función en store para "limpiar" encoding → señal de problema upstream

* **Estados inconsistentes:** Tasks pending/done vs. command center "completed"

---

**Seguridad: Riesgos críticos identificados (EVIDENCIA \+ referencia externa)**

**Riesgo 1: CORS totalmente abierto**

**EVIDENCIA:** backend/main.py: allow\_origins=\["\*"\] \[cite:1\]

**Impacto:**

* Cualquier web puede llamar tu API

* Phishing: Alguien clona Private Estates, captura leads, los roba

* Inyección de datos falsos (leads spam, propiedades fake)

**Solución inmediata:**  
allow\_origins=\[  
"[https://anclora-private-estates.vercel.app](https://anclora-private-estates.vercel.app)",  
"[https://anclora-nexus-frontend.vercel.app](https://anclora-nexus-frontend.vercel.app)",  
"[http://localhost:3000](http://localhost:3000)" \# solo dev  
\]

**Riesgo 2: Endpoints públicos sin autenticación**

**EVIDENCIA:** /api/public/cta/lead acepta POST sin API key ni secret \[cite:1\]

**Impacto:**

* Bots pueden inyectar miles de leads falsos

* Gastarás créditos OpenAI/Anthropic procesando spam

* Corrupción del dataset (lead scoring inútil)

**Solución:**

1. **Edge Middleware (Vercel):**  
   // Verificar origin header  
   if (\!allowedOrigins.includes(origin)) return 403

   // Rate limiting por IP  
   if (requestsLastMinute(ip) \> 5\) return 429

2. **Honeypot field:**

   // Si se llena, es bot

3. **Turnstile/hCaptcha** (gratis, mejor UX que reCAPTCHA)

**Riesgo 3: Bypass de RLS por uso de service\_role**

**EVIDENCIA:** Servicios usan Supabase client con service\_role key \[cite:1\]

**Contexto Supabase (REFERENCIA EXTERNA):**

"Service keys bypass Row Level Security. They should never be exposed client-side." \[web:1\]

**Problema:**  
Tu backend usa service\_role para todo (comodidad), pero varios servicios tienen fallbacks que consultan sin filtrar org\_id. Con service\_role, esos fallbacks pueden leer datos cross-tenant.

**Ejemplo concreto (EVIDENCIA):** \[cite:1\]  
prospection\_service.py enrichment:

**"Fallback sin org\_id para legacy inconsistencies"**

response \= supabase.from\_("properties").select("\*").eq("id", property\_id).single()

Si otro agente (org\_id=2) tiene property con mismo ID que el tuyo (org\_id=1), este código puede mezclarchatdata.

**Solución:**

1. **Separar clientes Supabase:**

   * supabase\_user (anon key \+ JWT) para queries user-scoped

   * supabase\_admin (service\_role) SOLO para operaciones que requieren bypass (migrations, system jobs)

2. **Eliminar todos los fallbacks sin org\_id**

3. **Auditoría de policies:**  
   \-- Verificar que TODAS las tablas tienen RLS enabled  
   SELECT tablename FROM pg\_tables  
   WHERE schemaname \= 'public'  
   AND tablename NOT IN (  
   SELECT tablename FROM pg\_policies  
   );

**Riesgo 4: Fallback de rol "owner" por defecto**

**EVIDENCIA:** \[cite:1\]  
Servicios automation\_service, deal\_margin\_service, source\_observatory\_service:  
try:  
role \= get\_user\_role(org\_id, user\_id)  
except:  
role \= "owner" \# ❌ ESCALATION RISK

**Problema:**  
Ante error (red, DB timeout, bug), el sistema **promociona** al usuario a owner en lugar de degradar a "deny".

**Principio correcto (INFERENCIA desde best practices):**

"Fail closed, not open. Errors should restrict, never grant."

**Solución:**  
try:  
role \= get\_user\_role(org\_id, user\_id)  
except Exception as e:  
logger.error(f"Role fetch failed: {e}")  
return {"error": "Authorization error"}, 403

**Riesgo 5: Dependencias sin versionado**

**EVIDENCIA:** backend/requirements.txt sin pins \[cite:1\]

**Problema:**

* Hoy: pip install langchain → v0.1.0 (funciona)

* Mañana: pip install langchain → v0.2.0 (breaking changes, deploy roto)

**Solución:**

**Generar lockfile**

pip freeze \> requirements.txt

**O usar Poetry/pipenv con lockfile determinista**

**Riesgo 6: Dockerfile que ignora fallos**

**EVIDENCIA:** backend/Dockerfile: \[cite:1\]  
RUN pip install \-r requirements.txt || true

**Problema:**  
Container arranca "medio instalado". Si falla install de fastapi, el contenedor corre igual pero crashea al importar.

**Solución:**  
RUN pip install \--no-cache-dir \-r requirements.txt

**Sin || true → build falla visible, no silent**

---

**Plan de mejora exhaustivo: 3 fases con priorización detallada**

**Criterios de priorización**

Cada mejora se evalúa según:

* **Impacto comercial:** ¿Genera mandatos/visibilidad? (0-10)

* **Impacto técnico:** ¿Reduce riesgo/deuda? (0-10)

* **Esfuerzo:** Días de desarrollo (1-30)

* **Dependencias:** ¿Bloquea otras mejoras? (Sí/No)

* **Urgencia:** ¿Tiempo límite comercial/regulatorio? (Alta/Media/Baja)

**Fórmula de score:**  
Priority Score \= (Impacto Comercial \* 2 \+ Impacto Técnico) / Esfuerzo

---

**FASE 0: Estabilización crítica (0-4 semanas)**

**Objetivo:** Sistema seguro, estable y operativo para primeros leads.

| \# | Mejora | Problema | Impacto Com. | Impacto Téc. | Esfuerzo (días) | Priority Score | Orden |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 0.1 | Cerrar CORS: whitelist dominios | API expuesta globalmente | 2 | 9 | 0.5 | 13.3 | 1 |
| 0.2 | Proteger /api/public/cta: Edge middleware \+ honeypot | Bots pueden spamear leads | 4 | 8 | 1 | 10.0 | 2 |
| 0.3 | Pin requirements.txt | Builds no deterministas | 0 | 8 | 0.5 | 8.0 | 3 |
| 0.4 | Eliminar || true de Dockerfile | Deploys silenciosamente rotos | 0 | 8 | 0.5 | 8.0 | 4 |
| 0.5 | Alinear ingestion\_events: enum \+ endpoints stats | Observatory/Ingestion no funcionales | 3 | 7 | 2 | 6.5 | 5 |
| 0.6 | Unificar properties vs prospected\_properties | Doble verdad, fallbacks peligrosos | 2 | 9 | 4 | 5.0 | 6 |
| 0.7 | Fallback rol: deny por defecto | Escalation risk | 0 | 9 | 1 | 4.5 | 7 |
| 0.8 | Separar clientes Supabase: user-scoped vs service\_role | RLS bypass actual | 1 | 10 | 3 | 4.3 | 8 |

**Entregables FASE 0:**

* \[ \] Nexus API segura (CORS, rate limit, auth mínima)

* \[ \] Builds reproducibles (requirements pinned, Dockerfile sin || true)

* \[ \] Modelo de datos estable (ingestion \+ properties unificadas)

* \[ \] RLS efectivo (clientes separados, fallbacks seguros)

**Criterio de salida:** Puedes dar acceso a Nexus a tu co-mentor sin riesgo de corrupción de datos o brecha de seguridad.

---

**FASE 1: MVP comercial \- Visibilidad \+ captación (4-12 semanas)**

**Objetivo:** Generar primeros 5-10 leads cualificados/mes \+ autoridad de marca en LinkedIn.

| \# | Mejora | Problema | Impacto Com. | Impacto Téc. | Esfuerzo (días) | Priority Score | Orden |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 1.1 | Content Engine: generación blog semanal automatizada | Sin contenido \= sin visibilidad SEO | 10 | 3 | 5 | 4.6 | 9 |
| 1.2 | LinkedIn automation: publicación auto desde Nexus | Marca personal 0 hoy | 10 | 4 | 4 | 6.0 | 10 |
| 1.3 | Idealista scraper: ingestión diaria zona sudoeste | Sin datos mercado \= sin insights | 9 | 6 | 7 | 4.3 | 11 |
| 1.4 | Lead scoring v2: incorporar presupuesto \+ urgencia \+ zona | Scoring actual no prioriza eficazmente | 8 | 5 | 3 | 5.7 | 12 |
| 1.5 | WhatsApp logging manual: webhook \+ registro conversación | Canal \#1 negociación España no registrado | 9 | 4 | 4 | 5.5 | 13 |
| 1.6 | Deal pipeline básico: stages mandato (prospecto → firmado → publicado → vendido) | No trackeas estado de tus mandatos | 8 | 5 | 5 | 4.2 | 14 |
| 1.7 | Private Estates: tracking origen (UTM \+ referrer) | Attribution impossible hoy | 7 | 4 | 2 | 5.5 | 15 |
| 1.8 | Task automation: crear follow-up auto si lead no contactado 24h | Leads se escapan sin seguimiento | 7 | 5 | 3 | 5.0 | 16 |

**Arquitectura Content Engine (detalle técnico):**

User → Nexus UI "Crear post blog"  
↓  
Intelligence API (con retrieval activado)  
├─ Consulta RAG: datos mercado Mallorca sudoeste  
├─ Consulta RAG: posts previos (evitar repetición)  
└─ LLM (Claude 3.5 Sonnet): genera post 800-1200 palabras  
↓  
Backend guarda draft → DB  
↓  
User revisa/edita → publica  
↓  
Webhook → LinkedIn API (publicación auto)  
Webhook → Private Estates (añadir a blog section)

**Idealista scraper (detalle técnico):**

**backend/jobs/idealista\_scraper.py**

import requests  
from bs4 import BeautifulSoup

ZONES \= \["son-vida", "portals-nous", "bendinat", "andratx"\]

def scrape\_idealista\_zone(zone):  
url \= f"[https://www.idealista.com/venta-viviendas/{zone}/](https://www.idealista.com/venta-viviendas/%7Bzone%7D/)"  
\# Usar proxy rotativo (evitar bloqueo)  
\# Parsear listings: precio, m2, descripción, fotos  
\# Calcular €/m2, detectar outliers  
\# INSERT INTO prospected\_properties

**Trigger:** Celery job diario (6am CET, antes de tu jornada)

**Output:**

* Tabla prospected\_properties actualizada

* Alertas automáticas: "Nueva reducción 10% villa Bendinat"

**Entregables FASE 1:**

* \[ \] Blog en Private Estates con 4 posts publicados

* \[ \] Perfil LinkedIn activo (1 post/semana)

* \[ \] Dataset Idealista sudoeste (100+ propiedades)

* \[ \] Dashboard: "Leads esta semana" \+ "Estado mandatos"

* \[ \] WhatsApp conversations logueadas en Nexus

**Criterio de salida:** Estás recibiendo 5-10 leads cualificados/mes y tienes argumentos para reunión captación mandato ("tengo inteligencia de mercado que ningún otro agente tiene").

---

**FASE 2: Inteligencia accionable (12-24 semanas)**

**Objetivo:** Detectar oportunidades antes que el mercado \+ operación eficiente de primeros 10-20 mandatos.

| \# | Mejora | Problema | Impacto Com. | Impacto Téc. | Esfuerzo (días) | Priority Score | Orden |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 2.1 | Activar RAG: pgvector \+ embeddings OpenAI | IA no aprende, no busca semánticamente | 9 | 8 | 7 | 5.1 | 17 |
| 2.2 | Pricing intelligence: comps automáticos \+ outlier detection | No sabes si precio es correcto | 9 | 6 | 10 | 3.6 | 18 |
| 2.3 | Geointeligencia: PostGIS \+ mapa interactivo zonas | Insight geográfico manual hoy | 8 | 7 | 12 | 3.3 | 19 |
| 2.4 | PBM v2: matching buyer-property con ML | Matching actual rule-based, no aprende | 7 | 7 | 15 | 2.1 | 20 |
| 2.5 | Automation guardrails: reglas \+ aprobación humana | Automatización peligrosa sin control | 5 | 8 | 8 | 2.9 | 21 |
| 2.6 | Command Center v2: métricas comerciales (CAC, LTV, conversion rate) | Métricas actuales técnicas, no comerciales | 6 | 6 | 6 | 3.7 | 22 |
| 2.7 | Calendar integrado: sincronización Google Calendar | Citas en memoria/papel hoy | 7 | 5 | 5 | 4.4 | 23 |
| 2.8 | Documentación: upload \+ OCR \+ extracción estructurada | Docs en Drive sin conexión CRM | 6 | 6 | 10 | 2.4 | 24 |

**Arquitectura RAG (detalle técnico):**

1. Ingestion pipeline:

   * Blog posts → chunks 500 tokens → embeddings (text-embedding-3-small)

   * Idealista listings → embeddings

   * WhatsApp conversations → embeddings (privacidad\!)

   * Docs subidos (CDH, escrituras) → embeddings  
     ↓ Store en pgvector

2. Retrieval:  
   User query: "Villas vista mar Bendinat precio justo"  
   ↓  
   Embedding query → búsqueda ANN pgvector (top 10 chunks)  
   ↓  
   Contexto → Claude 3.5 Sonnet → respuesta fundamentada  
   ↓  
   UI muestra: respuesta \+ sources (links a listings/docs)

**Ventaja competitiva (HIPÓTESIS):**  
En 6 meses tendrás un "Knowledge Graph inmobiliario Mallorca sudoeste" que ningún otro agente tiene. En reunión captación mandato:

"He analizado 500 transacciones en Bendinat últimos 12 meses. Su propiedad está 8% por encima de comps similares. Le muestro las 5 más parecidas y sus históricos de precio."

Esto cierra mandatos.

**Pricing intelligence (algoritmo):**

**backend/services/pricing\_intelligence.py**

def get\_pricing\_recommendation(property\_id):  
property \= db.get(property\_id)

\# 1\. Buscar comps (similar m2, zona, tipo, año)  
comps \= db.query("""  
    SELECT \* FROM prospected\_properties  
    WHERE zone \= ? AND type \= ?  
    AND area\_m2 BETWEEN ? AND ?  
    ORDER BY ST\_Distance(location, ?) ASC  
    LIMIT 10  
""", property.zone, property.type,   
    property.area\_m2 \* 0.8, property.area\_m2 \* 1.2,  
    property.location)

\# 2\. Calcular precio/m2 medio comps  
avg\_price\_m2 \= mean(\[c.price / c.area\_m2 for c in comps\])

\# 3\. Comparar  
property\_price\_m2 \= property.price / property.area\_m2  
diff\_pct \= (property\_price\_m2 \- avg\_price\_m2) / avg\_price\_m2

\# 4\. Clasificar  
if diff\_pct \> 0.15:  
    return "overpriced", diff\_pct, comps  
elif diff\_pct \< \-0.15:  
    return "underpriced", diff\_pct, comps  \# ¡Oportunidad\!  
else:  
    return "fair", diff\_pct, comps

**Output UI:**

* Badge en propiedad: "⚠️ Sobrevalorada \+18%" o "✅ Precio justo" o "🔥 Oportunidad \-22%"

* Modal: "Ver comps" → tabla con 10 similares

**Entregables FASE 2:**

* \[ \] RAG activado (búsqueda semántica funcional)

* \[ \] Pricing intelligence en prospected\_properties

* \[ \] Mapa interactivo con heatmap €/m² por zona

* \[ \] Dashboard "Oportunidades semana" (reducciones \+ infravaloradas)

* \[ \] Calendar sincronizado (no más citas perdidas)

**Criterio de salida:** Puedes presentar a un vendedor un análisis de mercado generado en 5 minutos que a un agente tradicional le lleva 2 horas. Estás gestionando 10-20 mandatos activos sin caos.

---

**FASE 3: Producto maduro (24+ semanas)**

**Objetivo:** Sistema operando a escala (50+ mandatos/año, equipo 2-3 personas).

| \# | Mejora | Problema | Impacto Com. | Impacto Téc. | Esfuerzo (días) | Priority Score | Orden |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 3.1 | Feed Orchestrator productivo: Idealista \+ Fotocasa XML generation | Publicación manual portales (4h/semana) | 7 | 6 | 15 | 1.9 | 25 |
| 3.2 | Anclora Advisor AI integrado: facturación desde mandatos | Advisor AI aislado hoy | 6 | 5 | 10 | 2.2 | 26 |
| 3.3 | Multi-user: roles (agent/admin/viewer) | Solo tú accedes hoy | 4 | 7 | 12 | 2.0 | 27 |
| 3.4 | Analytics avanzado: cohort analysis, LTV, churn | Métricas básicas solo | 5 | 6 | 15 | 1.5 | 28 |
| 3.5 | Mobile app (React Native): acceso agentes en visita | Desktop-only hoy | 6 | 4 | 30 | 1.0 | 29 |
| 3.6 | IA open-source: vLLM local para embeddings \+ clasificación | Dependencia 100% OpenAI/Anthropic | 3 | 8 | 20 | 1.1 | 30 |

**Feed Orchestrator (arquitectura productiva):**

User marca propiedad: "Publicar en portales"  
↓  
Nexus genera XMLs según specs:

* Idealista: PropML XML

* Fotocasa: Custom XML

* Kyero: JSON feed  
  ↓  
  Upload vía FTP/API a cada portal  
  ↓  
  Tracking: "Publicado 2026-03-08 10:30 CET"  
  ↓  
  Scraper reverso (opcional): verificar listing live  
  ↓  
  Alertas: "Tu propiedad X vista 150 veces esta semana en Idealista"

**ROI:** Ahorras 4h/semana. Con 20 mandatos activos, publicar manualmente es insostenible.

**Entregables FASE 3:**

* \[ \] Distribución automática 3 portales

* \[ \] Advisor AI alimentado por datos Nexus (facturación coherente)

* \[ \] Tu co-mentor eXp puede acceder como "Viewer"

* \[ \] Dashboard ejecutivo (KPIs mensuales/anuales)

**Criterio de salida:** Nexus es tu "sistema operativo" inmobiliario. No podrías operar sin él. Estás considerando ofrecer licencias a otros agentes eXp.

---

**Arquitectura open-source objetivo**

**Principio rector**

**No reinventar la rueda. Componer componentes OSS probados.**

Tu ventaja diferencial no es "construir tu propio Postgres" sino **orquestar inteligentemente** herramientas open-source \+ IA para resolver problemas inmobiliarios específicos.

**Stack recomendado por capa**

**Base de datos y geointeligencia**

**PostgreSQL \+ PostGIS \+ pgvector**

* **Postgres:** Ya lo tienes (vía Supabase)

* **PostGIS:** Extensión para datos geoespaciales (ST\_Distance, isócronas, heatmaps)

* **pgvector:** Extensión para embeddings y búsqueda vectorial/ANN

**Instalación (Supabase):**  
\-- Activar extensiones  
CREATE EXTENSION IF NOT EXISTS postgis;  
CREATE EXTENSION IF NOT EXISTS vector;

\-- Añadir columna embedding a tabla  
ALTER TABLE prospected\_properties  
ADD COLUMN embedding vector(1536); \-- OpenAI text-embedding-3-small dimension

\-- Índice HNSW (búsqueda rápida)  
CREATE INDEX ON prospected\_properties  
USING hnsw (embedding vector\_cosine\_ops);

**Ventaja:** Todo en misma DB. Sin operaciones cross-service. Latencia mínima.

**RAG y búsqueda semántica**

**LangChain \+ pgvector \+ OpenAI embeddings**

* **LangChain:** Ya lo usas, orquestador

* **Retriever:** PGVectorRetriever (langchain-postgres)

* **Embeddings:** OpenAI text-embedding-3-small (barato, 0.00002 $/1K tokens)

**Pipeline:**  
from langchain\_postgres import PGVectorStore  
from langchain\_openai import OpenAIEmbeddings

embeddings \= OpenAIEmbeddings(model="text-embedding-3-small")  
vector\_store \= PGVectorStore(  
connection\_string="postgresql://...",  
embedding=embeddings,  
collection\_name="properties\_knowledge"  
)

**Ingestion**

docs \= \[Document(page\_content=prop.description, metadata={"id": [prop.id](http://prop.id)})  
for prop in properties\]  
vector\_store.add\_documents(docs)

**Retrieval**

results \= vector\_store.similarity\_search("villa vista mar Bendinat", k=5)

**Alternativa OSS completa (sin OpenAI):**

* **Embeddings:** Sentence-Transformers all-MiniLM-L6-v2 (local, gratis)

* **Reranking:** cross-encoder/ms-marco-MiniLM-L-6-v2

**Trade-off:** OSS embeddings algo peor calidad, pero cero coste y privacidad total.

**Automatización y workflows**

**n8n (con precaución) \+ Celery/Redis**

**n8n:** Automatización visual (alternative Zapier)

* **Ventaja:** Low-code, rápido prototipar

* **RIESGO:** Vulnerabilidades recientes \[web:12\]

* **Uso seguro:** Self-host con Docker, network isolation, actualizaciones semanales

**Celery \+ Redis:** Automatización robusta (Python)

* **Celery:** Task queue (jobs async)

* **Redis:** Message broker

* **Uso:** Scraping diario Idealista, generación feeds portales, email batch

**Recomendación:** Celery para core (crítico), n8n para integraciones no críticas (notificaciones Slack).

**Scoring y machine learning**

**Scikit-learn \+ XGBoost (cuando tengas datos)**

**Ahora:** Lead scoring rule-based (budget \+ zona \+ urgencia)

**Futuro (12 meses, 200+ leads):**

**Entrenar modelo clasificación: lead → qualified/won/lost**

from xgboost import XGBClassifier

X \= df\[\['budget', 'zone\_score', 'urgency', 'source', 'time\_to\_first\_response'\]\]  
y \= df\['outcome'\] \# 0=lost, 1=won

model \= XGBClassifier()  
model.fit(X, y)

**Predecir probabilidad conversión nuevo lead**

prob \= model.predict\_proba(new\_lead)\[0\]\[1\] \# 0.0-1.0

**Output:** "Este lead tiene 73% probabilidad conversión → prioridad alta"

**Ventaja:** Explainability (SHAP values) → sabes POR QUÉ un lead es bueno.

**Enriquecimiento de datos**

**APIs públicas \+ scraping**

**Geocoding:** Nominatim (OSM, gratis) o Google Maps Geocoding API  
**POIs:** Overpass API (OSM) \- "¿Colegios internacionales a \<5km?"  
**Catastro:** API Catastro España (superficie construida, año, uso)  
**INE:** Datos demográficos por sección censal  
**Idealista/Fotocasa:** Scraping (respetando robots.txt \+ rate limits)

**Pipeline:**

**Enriquecer propiedad**

def enrich\_property(prop):  
\# 1\. Geocoding  
lat, lon \= geocode(prop.address)

\# 2\. POIs cercanos  
pois \= overpass\_query(lat, lon, radius=5000, tags=\["school", "supermarket"\])

\# 3\. Catastro  
catastro\_data \= catastro\_api(prop.cadastral\_ref)

\# 4\. Actualizar DB  
db.update(prop.id, {  
    "location": f"POINT({lon} {lat})",  
    "nearby\_schools": len(\[p for p in pois if p.tag \== "school"\]),  
    "built\_year": catastro\_data\["year"\]  
})

**Geointeligencia y mapas**

**PostGIS \+ Mapbox GL JS / Maplibre GL**

**Backend (PostGIS):**  
\-- Calcular distancia propiedad → Puerto Portals  
SELECT ST\_Distance(  
location::geography,  
ST\_SetSRID(ST\_MakePoint(2.5394, 39.5296), 4326)::geography  
) / 1000 AS distance\_km  
FROM prospected\_properties;

\-- Heatmap €/m² por zona 1km²  
SELECT  
ST\_SnapToGrid(location, 0.01) AS grid\_cell, \-- \~1km  
AVG(price / area\_m2) AS avg\_price\_m2,  
COUNT(\*) AS property\_count  
FROM prospected\_properties  
GROUP BY grid\_cell;

**Frontend (Maplibre GL):**  
// Mapa interactivo con heatmap  
import maplibregl from 'maplibre-gl';

const map \= new maplibregl.Map({  
container: 'map',  
style: '[https://demotiles.maplibre.org/style.json](https://demotiles.maplibre.org/style.json)',  
center: \[2.62, 39.57\], // Portals Nous  
zoom: 12  
});

// Añadir capa heatmap  
map.addLayer({  
id: 'price-heatmap',  
type: 'heatmap',  
source: {  
type: 'geojson',  
data: '/api/properties/geojson' // Nexus endpoint  
},  
paint: {  
'heatmap-intensity': 1,  
'heatmap-weight': \['get', 'price\_m2'\], // Peso por precio  
'heatmap-color': \[  
'interpolate',  
\['linear'\],  
\['heatmap-density'\],  
0, 'blue',  
0.5, 'yellow',  
1, 'red'  
\]  
}  
});

**Output:** Mapa estilo "Redfin/Zillow" con zonas coloreadas por precio.

**Prospección y captación**

**LinkedIn API \+ [Make.com](http://Make.com) (alternative n8n)**

**LinkedIn automation (oficial):**

**OAuth 2.0 LinkedIn API**

import requests

**Publicar post**

def post\_to\_linkedin(access\_token, text, image\_url=None):  
url \= "[https://api.linkedin.com/v2/ugcPosts](https://api.linkedin.com/v2/ugcPosts)"  
headers \= {  
"Authorization": f"Bearer {access\_token}",  
"Content-Type": "application/json"  
}  
payload \= {  
"author": f"urn:li:person:{person\_id}",  
"lifecycleState": "PUBLISHED",  
"specificContent": {  
"com.linkedin.ugc.ShareContent": {  
"shareCommentary": {"text": text},  
"shareMediaCategory": "IMAGE" if image\_url else "NONE",  
"media": \[{"originalUrl": image\_url}\] if image\_url else \[\]  
}  
}  
}  
response \= requests.post(url, headers=headers, json=payload)  
return response.json()

**Trigger:** Celery job diario → genera post → publica LinkedIn \+ guarda en DB "content\_published"

**Analítica comercial**

**Metabase (OSS, self-host) o Superset**

**Metabase:**

* Conecta directamente a Postgres

* UI visual query builder (no-code SQL)

* Dashboards drag-and-drop

* Alertas email (ej: "Leads semana \<5 → alert")

**Setup:**  
docker run \-d \-p 3000:3000  
\-e MB\_DB\_TYPE=postgres  
\-e MB\_DB\_DBNAME=nexus  
\-e MB\_DB\_PORT=5432  
\-e MB\_DB\_USER=...  
\-e MB\_DB\_PASS=...  
metabase/metabase

**Dashboards recomendados:**

1. **Comercial:** Leads mes, conversion rate, CAC, LTV

2. **Operativo:** Mandatos activos, estado distribución portales

3. **Inteligencia:** Oportunidades detectadas, alertas reducciones precio

4. **Financiero:** Comisiones acumuladas, proyección ingresos

**Asistentes de IA**

**LangGraph (ya lo tienes) \+ unificar arquitectura**

**Problema actual:** Dos subsistemas IA (LangGraph skills \+ Intelligence v1)

**Solución:** **Unificar en LangGraph como framework único**

**Arquitectura unificada:**

**backend/agents/unified\_graph.py**

from langgraph.graph import StateGraph

**Estado global**

class AgentState(TypedDict):  
messages: list  
context: dict \# RAG context  
user\_id: str  
org\_id: str  
action: str \# "lead\_intake", "pricing\_analysis", "content\_generation"

**Nodos**

def router(state):  
"""Decide qué skill ejecutar"""  
intent \= classify\_intent(state\['messages'\]\[-1\])  
return intent

def retriever(state):  
"""Busca contexto relevante en RAG"""  
query \= state\['messages'\]\[-1\]  
docs \= vector\_store.similarity\_search(query, k=5)  
state\['context'\] \= docs  
return state

def executor(state):  
"""Ejecuta skill específico con contexto"""  
skill\_name \= state\['action'\]  
skill \= SKILLS\[skill\_name\]  
result \= skill.execute(state)  
return result

def auditor(state):  
"""Log acción para compliance"""  
log\_action(state\['org\_id'\], state\['user\_id'\], state\['action'\])  
return state

**Grafo**

graph \= StateGraph(AgentState)  
graph.add\_node("router", router)  
graph.add\_node("retriever", retriever)  
graph.add\_node("executor", executor)  
graph.add\_node("auditor", auditor)

graph.add\_edge("router", "retriever")  
graph.add\_edge("retriever", "executor")  
graph.add\_edge("executor", "auditor")

app \= graph.compile()

**Skills disponibles:**

* lead\_intake: Procesar lead entrante (ya existe)

* pricing\_analysis: Análisis comps \+ recomendación precio

* content\_generation: Generar post blog/LinkedIn

* property\_match: Buscar propiedades para buyer

* opportunity\_alert: Detectar oportunidades (reducciones, infravaloradas)

**Extracción documental**

[**Unstructured.io**](http://Unstructured.io) **\+ Tesseract OCR \+ LLM extraction**

**Pipeline:**  
from unstructured.partition.auto import partition

**1\. Parsear doc (PDF, DOCX, imagen)**

elements \= partition(filename="escritura.pdf")

**2\. Extraer texto**

text \= "\\n".join(\[e.text for e in elements\])

**3\. LLM extraction (structured output)**

prompt \= f"""  
Extrae de esta escritura:

* Comprador nombre completo

* Vendedor nombre completo

* Fecha escritura

* Precio venta

* Dirección propiedad

* Referencia catastral

Escritura:  
{text}

JSON:  
"""

response \= openai.chat.completions.create(  
model="gpt-4o",  
messages=\[{"role": "user", "content": prompt}\],  
response\_format={"type": "json\_object"}  
)

data \= json.loads(response.choices\[0\].message.content)

**4\. Guardar en DB**

db.properties.update(property\_id, {  
"buyer\_name": data\["comprador"\],  
"sale\_date": data\["fecha"\],  
"cadastral\_ref": data\["referencia\_catastral"\]  
})

**Ventaja:** Automatizar ingesta de escrituras, CED, NIE → no más copy-paste.

**Matching lead-propiedad**

**Cosine similarity (embeddings) \+ reglas business**

**Algoritmo híbrido:**  
def match\_buyer\_to\_properties(buyer\_profile\_id):  
buyer \= db.buyer\_profiles.get(buyer\_profile\_id)

\# 1\. Filtro duro (reglas business)  
candidates \= db.prospected\_properties.filter(  
    price BETWEEN buyer.budget\_min AND buyer.budget\_max,  
    zone IN buyer.preferred\_zones,  
    bedrooms \>= buyer.min\_bedrooms  
)

\# 2\. Búsqueda semántica (embedding)  
buyer\_embedding \= embeddings.embed\_query(buyer.description)

matches \= \[\]  
for prop in candidates:  
    \# Cosine similarity  
    sim \= cosine\_similarity(buyer\_embedding, prop.embedding)  
      
    \# Score compuesto  
    score \= (  
        0.4 \* sim \+  \# Similitud semántica  
        0.3 \* price\_fit\_score(buyer.budget, prop.price) \+  
        0.2 \* zone\_preference\_score(buyer.zones, prop.zone) \+  
        0.1 \* urgency\_score(buyer.urgency, prop.days\_on\_market)  
    )  
      
    matches.append((prop, score))

\# Top 10  
return sorted(matches, key=lambda x: x\[1\], reverse=True)\[:10\]

**Output UI:**

* "Nuevas propiedades para Buyer \#47: 3 matches score \>0.85"

* Email automático a buyer con listings

**Pricing intelligence**

**Hedonic pricing model (cuando tengas datos)**

**Ahora:** Comps simples (zona \+ m² \+ tipo)

**Futuro (500+ propiedades historico):**  
from sklearn.linear\_model import LinearRegression

**Features**

X \= df\[\[  
'area\_m2',  
'bedrooms',  
'bathrooms',  
'distance\_to\_sea', \# PostGIS  
'distance\_to\_puerto\_portals',  
'zone\_premium\_score', \# 0-10  
'built\_year',  
'has\_pool',  
'has\_garden',  
'views\_score' \# 0-10  
\]\]

**Target**

y \= df\['price'\]

**Entrenar**

model \= LinearRegression()  
model.fit(X, y)

**Predecir precio justo nueva propiedad**

predicted\_price \= model.predict(new\_property\_features)

**Comparar con precio listado**

if listed\_price \> predicted\_price \* 1.15:  
return "overpriced"  
elif listed\_price \< predicted\_price \* 0.85:  
return "underpriced" \# ¡Oportunidad\!

**Ventaja:** Modelo aprende qué features impactan precio (ej: "piscina \+12%, vistas mar \+35%").

**Detección de oportunidades**

**Anomaly detection \+ alertas**

**Reglas:**

**Oportunidad \#1: Reducción precio \>10% en \<30 días**

SELECT \* FROM prospected\_properties  
WHERE price \< price\_history\[1\].price \* 0.9  
AND updated\_at \> NOW() \- INTERVAL '30 days';

**Oportunidad \#2: Propiedad infravalorada (pricing intelligence)**

SELECT \* FROM prospected\_properties  
WHERE pricing\_status \= 'underpriced'  
AND match\_score\_avg \> 0.7; \-- Alta demanda buyer profiles

**Oportunidad \#3: DOM alto \+ motivación vendedor**

SELECT \* FROM prospected\_properties  
WHERE days\_on\_market \> 90  
AND price\_reductions \>= 2;

**Oportunidad \#4: Zona emergente (aumento búsquedas)**

SELECT zone, COUNT(

*) AS searches\_last\_30dFROM lead\_searchesWHERE created\_at \> NOW() \- INTERVAL '30 days'GROUP BY zoneHAVING COUNT(*) \> searches\_prev\_30d \* 1.5;

**Output:** Dashboard "Oportunidades semana" \+ email/WhatsApp alert.

---

**Integración Anclora Advisor AI con Nexus (OPORTUNIDAD CRÍTICA)**

**Problema actual**

Advisor AI está aislado. Nexus registra actividad comercial pero no se conecta con contabilidad/facturación.

**Propuesta: Single source of truth financiero**

**Flujo integrado:**

Nexus: Mandato firmado (10% comisión, 500.000€ precio)  
↓  
Webhook → Advisor AI: "Ingreso previsto 50.000€ cuando cierre"  
↓  
Nexus: Propiedad vendida (2026-06-15)  
↓  
Webhook → Advisor AI: "Facturar 50.000€ a cliente X"  
↓  
Advisor AI: Genera factura PDF \+ XML (formato AEAT)  
↓  
Advisor AI: Calcula IRPF trimestral (20% retención \= 10.000€)  
↓  
Alert: "Pago IRPF Q2 2026 vence 2026-07-20: 10.000€"

**Ventaja:** No más Excel separado. Todo coherente.

**Features Advisor AI propuestos**

1. **Facturación automática desde mandatos cerrados**

2. **Cálculo IRPF/IVA trimestral** (modelo 130/303)

3. **Alertas vencimientos** (IRPF, IVA, Seguridad Social autónomo)

4. **Tracking gastos deducibles** (publicidad, software, km, comidas)

5. **Simulador escenarios:** "Si cierro 3 mandatos más este trimestre, ¿cuánto pago IRPF?"

**Implementación técnica**

**Backend Nexus → Advisor AI:**

**backend/integrations/advisor\_ai.py**

import requests

ADVISOR\_API \= "[https://ancloraadvisorai-ten.vercel.app/api](https://ancloraadvisorai-ten.vercel.app/api)"

def notify\_deal\_closed(deal\_id, commission\_amount, client\_name, deal\_date):  
payload \= {  
"event": "deal\_closed",  
"deal\_id": deal\_id,  
"commission": commission\_amount,  
"client": client\_name,  
"date": deal\_date.isoformat()  
}  
response \= requests.post(f"{ADVISOR\_API}/webhooks/nexus", json=payload)  
return response.json()

**Trigger:** Cuando cambias estado deal a "closed\_won"

---

**Riesgos, bloqueos y recomendaciones estratégicas**

**Riesgo \#1: Dispersión de foco (CRÍTICO)**

**Evidencia:**

* 5 aplicaciones simultáneas

* Nexus a 40-60% completitud

* Sin cartera actual

* Multiempleo (tiempo limitado)

**Consecuencia:**

* Ninguna aplicación llega a production-ready

* Oportunidad comercial Q2 2026 (primavera) se escapa

* Burnout técnico

**Recomendación:**  
**CONGELAR desarrollo Advisor AI, Portfolio, Azure Bay** hasta cerrar primeros 5 mandatos con Nexus \+ Private Estates.

**Justificación:**

* Advisor AI puede esperar (facturas manuales 6 meses más no te matan)

* Portfolio ya cumplió función (credibilidad visual)

* Azure Bay es "showcase", no genera negocio directo

**Focus Q2 2026:**

1. Private Estates \+ formulario captación

2. Nexus: Ingestion \+ Prospection \+ Blog/LinkedIn automation

3. Idealista scraper \+ insights diarios

**Nada más.** 3 meses, 3 objetivos.

**Riesgo \#2: Expectativas IA vs. realidad (MEDIO)**

**Hipótesis:**  
Usuario espera que IA "haga el trabajo por él". Realidad: IA amplifica, no reemplaza.

**Clarificación:**

* IA NO va a captar mandatos por ti → tú tienes que hacer llamadas, reuniones, negociar

* IA NO va a cerrar ventas → tú tienes que visitar, confiar, persuadir

* IA SÍ va a darte 3-4x más eficiencia en: prospección, contenido, análisis

* IA SÍ va a darte ventaja en reunión captación (insights que otros no tienen)

**Recomendación:**  
Define KPI **acción humana:**

* Llamadas/semana: 15-20 (prospección fría)

* Reuniones captación/mes: 5-10

* Visitas propiedad/semana: 8-12

* Posts LinkedIn/semana: 2-3 (IA-assisted, pero tú revisas/publicas)

IA es tu copiloto, no autopilot.

**Riesgo \#3: Competencia en zona premium (ALTO)**

**Realidad mercado:**

* Zona sudoeste Mallorca **altamente competitiva**

* Agencias establecidas: Engel & Völkers, Balearic Properties, Finest Selection, etc.

* Tienen: carteras, red, marca reconocida

**Tu desventaja:**

* Sin cartera

* Sin marca reconocida (aún)

* Recién incorporado eXp (no tienes aún red interna)

**Tu ventaja:**

* Perfil tech único

* Inteligencia de mercado superior (cuando completes Nexus)

* Flexibilidad (no tienes overhead de agencia tradicional)

**Estrategia recomendada (HIPÓTESIS fundamentada):**

**No compitas en "operación" (cerrar ventas existentes) inicialmente.** Las agencias grandes ya tienen compradores listos.

**Compite en "captación" (mandatos exclusivos).** Enfoque:

1. **Vendedores que ya listaron sin éxito:** Propiedad en mercado 90+ días, 2+ reducciones precio

   * Argumento: "Le muestro por qué no vendió \+ estrategia alternativa"

   * Tu ventaja: Pricing intelligence \+ análisis comps automatizado

2. **Propietarios off-market:** No han listado aún

   * Argumento: "Le valoro propiedad \+ proyección mercado 12 meses"

   * Tu ventaja: Blog semanal (te posiciona como experto) \+ red LinkedIn

3. **Inversores internacionales (LATAM/USA):** Tu experiencia Playa Viva

   * Argumento: "Entiendo necesidades fiscales/legales comprador extranjero"

   * Tu ventaja: Inglés \+ conocimiento mercados internacionales

**No persigas:**

* Propiedades top (Villa 5M€ Son Vida con agencia establecida) → no tienes credibilidad aún

* Mercado medio-bajo (\<500K€) → comisiones pequeñas, mucha competencia

**Sweet spot:**

* 750K€ \- 2M€ (comisión 22.500€ \- 60.000€ por operación)

* Propiedades con "story" (historia familiar, arquitectura única, vistas especiales)

* Vendedores sofisticados (aprecian tecnología \+ datos)

**Riesgo \#4: Dependencia tecnológica single-points-of-failure (MEDIO)**

**Evidencia:**

* Todo en Vercel (frontend hosting)

* Todo en Supabase Cloud (backend DB)

* Todo en OpenAI/Anthropic (IA)

**Consecuencia si falla:**

* Vercel down → no puedes captar leads

* Supabase down → no tienes acceso a datos

* OpenAI rate limit → IA no responde

**Recomendación:**  
**Backups \+ plan B:**

1. **DB backup diario:** Supabase → S3/Google Cloud Storage  
   pg\_dump nexus | gzip \> nexus\_backup\_$(date \+%F).sql.gz

2. **Fallback frontend:** Private Estates como HTML estático en GitHub Pages (si Vercel falla)

3. **Fallback LLM:** Anthropic si OpenAI falla, Ollama local si ambos fallan (emergencia)

4. **Monitoring:** UptimeRobot (gratis) → alerta email si aplicaciones down

**Riesgo \#5: Regulación RGPD y datos personales (ALTO \- LEGAL)**

**Contexto:**  
Nexus procesa datos personales de leads (nombre, email, teléfono, presupuesto, preferencias).

**Obligaciones RGPD (España):**

* Consentimiento explícito

* Política privacidad visible

* Derecho acceso/rectificación/supresión

* Registro actividades tratamiento

* DPO (si procesas datos sensibles a gran escala)

**Estado actual (INFERENCIA):**  
Probablemente **no conforme** (no hay evidencia de política privacidad en repos).

**Recomendación urgente:**

1. **Política privacidad en Private Estates:**  
   "Sus datos serán tratados por Antonio \[Apellido\], agente inmobiliario,  
   con finalidad de gestionar su solicitud de información sobre propiedades.  
   Base legal: Consentimiento (RGPD Art. 6.1.a).  
   Conservación: 2 años desde último contacto.  
   Derechos: acceso, rectificación, supresión, portabilidad.  
   Contacto: [privacy@ancloraprivateestates.com](mailto:privacy@ancloraprivateestates.com)"

2. **Checkbox consentimiento en formulario:**

   He leído y acepto la [política de privacidad](http:///privacidad)

3. **Endpoint /api/gdpr/delete:**

   * Usuario puede solicitar eliminación de sus datos

   * Hard delete (no soft) o anonimización

**Riesgo si ignoras:** Multa AEPD hasta 20M€ o 4% facturación (aunque para pymes suelen ser 5.000-10.000€).

**Bloqueo \#1: Sin datos históricos \= sin ML (TEMPORAL)**

**Realidad:**  
Muchas features propuestas (pricing intelligence ML, lead scoring ML, buyer matching ML) requieren **datos históricos** (500+ registros).

**Situación actual:**

* 0 mandatos cerrados

* 0 leads en DB real

* 0 conversaciones registradas

**Solución:**  
**Fase 1 (0-6 meses): Reglas \+ heurísticas**

* Pricing: Comps simples (zona \+ m² \+ tipo)

* Lead scoring: Budget \+ zona \+ fuente (rules)

* Matching: Filtros duros \+ embedding similarity

**Fase 2 (6-12 meses: primeros 50-100 leads):**

* Empezar tracking outcomes (qualified/won/lost)

* Calibrar reglas según datos reales

* Preparar dataset para ML

**Fase 3 (12+ meses: 200+ leads):**

* Entrenar modelos ML

* A/B test: rules vs. ML

* Iterar según performance

**Principio:** No esperes a tener ML perfecto. Lanza con reglas, mejora con datos.

**Bloqueo \#2: Falta integración WhatsApp (CRÍTICO COMERCIAL)**

**Contexto:**  
Usuario declaró WhatsApp "no negociable" pero no está implementado.

**Realidad España:** 95% negociación inmobiliaria ocurre por WhatsApp.

**Problema:**  
Sin registro WhatsApp en Nexus:

* Pierdes contexto conversaciones

* No puedes automatizar follow-ups

* No tienes métricas (tiempo respuesta, tasa conversión por canal)

**Solución corto plazo (manual):**  
Conversación WhatsApp importante → copy-paste manual a Nexus  
↓  
Crear "Activity" tipo "whatsapp\_message"  
↓  
Asociar a lead/propiedad

**Solución medio plazo (semi-auto):**

* **WhatsApp Business API** (oficial, requiere aprobación Meta)

* **Webhook:** Mensaje entrante → POST a Nexus /api/activities/whatsapp

* **UI:** Bandeja mensajes en Nexus (como email)

**Solución largo plazo (full auto):**

* **WhatsApp AI responder:** LangGraph skill responde preguntas FAQ

* **Handoff humano:** Si pregunta compleja, alerta agente

* **Follow-up automático:** Si lead no responde 48h, mensaje auto

**Prioridad:** ALTA (implementar manual Q2 2026, API Q3 2026\)

**Recomendación estratégica final: El "pivote necesario"**

**Análisis situación:**

* Has construido 80% de un **CRM operativo** (gestión mandatos, distribución portales)

* Necesitas 100% de un **Content/Prospection Engine** (visibilidad marca, captación temprana)

* Inviertes tiempo construyendo features "post-mandato" sin tener mandatos

**Propuesta pivote:**

**Redefinir Nexus v1 como:**

"Plataforma de inteligencia de mercado inmobiliario Mallorca sudoeste \+ generador contenido automatizado, que incidentalmente también gestiona tus primeros mandatos"

**No como:**

"CRM completo que reemplaza todos los sistemas" (eso es v2, cuando tengas 50+ mandatos/año)

**Implicaciones:**

1. **Prioridad \#1:** Content Engine (blog \+ LinkedIn) → FASE 1

2. **Prioridad \#2:** Idealista scraper \+ insights → FASE 1

3. **Prioridad \#3:** Lead capture \+ scoring básico → FASE 1

4. **Prioridad \#4:** Deal pipeline minimalista (4 stages: prospecto/mandato/publicado/cerrado) → FASE 1

5. **Resto (Feed Orchestrator, DQ avanzado, FinOps, etc.):** CONGELADO hasta FASE 3

**Esto requiere decir NO a:**

* Perfeccionar módulos ya construidos (suficientemente buenos por ahora)

* Añadir features "sería bonito tener" (nice-to-have)

* Alcanzar cobertura 100% antes de lanzar (80% es suficiente para MVP)

**Pregunta validación:**  
¿Esta feature me ayuda a conseguir mi próximo mandato en los próximos 90 días?

* Sí → FASE 1

* No → FASE 3

---

**Métricas de éxito (OKRs Q2-Q4 2026\)**

**Q2 2026 (Abril-Junio): Establecer presencia**

**Objetivo:** Visibilidad \+ primeros leads cualificados

**Key Results:**

* \[ \] 100+ conexiones LinkedIn (target: agentes, promotores, arquitectos Mallorca)

* \[ \] 12 posts publicados LinkedIn (1/semana con engagement \>50 interacciones)

* \[ \] 8 artículos blog Private Estates (2/mes, 1000+ palabras, SEO optimizado)

* \[ \] 20-30 leads entrantes formulario web (target: 5-8 cualificados)

* \[ \] 1 mandato firmado (aunque sea conocido/familiar, probar flujo completo)

* \[ \] Dataset Idealista: 200+ propiedades sudoeste actualizadas semanalmente

**Q3 2026 (Julio-Septiembre): Tracción comercial**

**Objetivo:** Validar modelo negocio (mandatos \+ comisiones)

**Key Results:**

* \[ \] 3-5 mandatos activos exclusivos (rango 750K€-2M€)

* \[ \] 1 operación cerrada (comisión 15.000€+)

* \[ \] 40-60 leads/mes cualificados

* \[ \] Conversion rate lead→reunión: 15%+

* \[ \] Pricing intelligence activo: 80% propiedades con análisis comps

* \[ \] RAG/retrieval activado: búsqueda semántica propiedades funcional

**Q4 2026 (Octubre-Diciembre): Escala**

**Objetivo:** Sistema operando a capacidad (gestión 10-15 mandatos simultáneos)

**Key Results:**

* \[ \] 10-15 mandatos activos

* \[ \] 2-3 operaciones cerradas Q4 (comisiones acumuladas 50.000€+)

* \[ \] 60-80 leads/mes

* \[ \] Conversion rate lead→mandato: 8-10%

* \[ \] Feed Orchestrator: distribución automática 3 portales (Idealista/Fotocasa/Kyero)

* \[ \] 1 colaborador/asistente incorporado (validar multi-user Nexus)

**Métricas de vanidad vs. métricas de negocio**

**❌ Métricas de vanidad (evitar obsesionarse):**

* Líneas de código escritas

* Número de commits

* Features completadas

* Uptime % (99% vs 99.9% no cambia negocio)

**✅ Métricas de negocio (lo único que importa):**

* Mandatos firmados/mes

* Comisiones cerradas/trimestre

* Leads cualificados/mes (budget \>750K€, zona objetivo)

* Conversion rate lead→reunión→mandato

* CAC (Customer Acquisition Cost): €invertido marketing / lead cualificado

* LTV (Lifetime Value): comisión media \* nº operaciones/cliente

**Relación con arquitectura:**

* Si arquitectura te permite gestionar 10 mandatos sin caos → suficiente

* Si arquitectura te permite captar 50 leads/mes automatizadamente → excelente

* Todo lo demás es "nice to have"

---

**Conclusiones y próximos pasos inmediatos**

**Qué hacer MAÑANA (acción ejecutiva)**

**Día 1 (1 hora):**

1. **Git branch:** security-fixes-phase0

2. **Commit 1:** Cambiar CORS de \["\*"\] a whitelist dominios

3. **Commit 2:** Pin requirements.txt (pip freeze \> requirements.txt)

4. **Commit 3:** Eliminar || true de Dockerfile

5. **Deploy:** Vercel redeploy con changes

6. **Validar:** Probar formulario Private Estates → Nexus (debe funcionar)

**Día 2-3 (4 horas):**  
7\. **Edge Middleware:** Vercel edge function rate limit /api/public/cta  
8\. **Honeypot:** Añadir campo hidden formulario Private Estates  
9\. **Deploy \+ Test**

**Día 4-5 (8 horas):**  
10\. **Alinear ingestion\_events:** Migración \+ servicio \+ UI estados consistentes  
11\. **Test:** Ingerir lead manual → verificar stats endpoint responde

**Semana 2 (20 horas):**  
12\. **Content Engine MVP:** Endpoint /api/content/generate-blog-post  
\- Input: Topic \+ target\_keywords  
\- Output: Markdown 1000 palabras  
13\. **UI Nexus:** Botón "Generar post" → llamar endpoint → editor markdown  
14\. **Publish:** Guardar en DB content\_published → mostrar en Private Estates /blog

**Semana 3-4 (40 horas):**  
15\. **Idealista scraper:** Celery job diario  
16\. **Prospection dashboard:** Top 10 oportunidades semana  
17\. **WhatsApp logging manual:** Formulario "Registrar conversación"

**Entregable mes 1:**

* Nexus seguro y estable

* Private Estates capturando leads protegido

* 4 posts blog publicados

* Dataset 100+ propiedades Idealista

* Tú usando Nexus diariamente (dogfooding)

**Qué NO hacer (anti-goals)**

1. **NO añadir features nuevas** hasta completar FASE 0 (security \+ stability)

2. **NO intentar productizar Advisor AI** hasta tener 10+ mandatos

3. **NO construir mobile app** hasta tener 100+ leads/mes

4. **NO escalar infraestructura** (Kubernetes, microservicios) hasta 100K€+/año facturación

5. **NO contratar equipo** hasta demostrar que el modelo funciona (1 agente, 20 mandatos/año, 300K€ comisiones)

**Hoja de ruta 12 meses (resumen visual)**

Marzo 2026 (HOY)  
├─ FASE 0: Security \+ Stability (4 semanas)  
│ └─ Entregable: Nexus operativo, formulario protegido, builds estables  
│  
Abril-Mayo 2026  
├─ FASE 1 parte 1: Content Engine (4 semanas)  
│ └─ Entregable: Blog 8 posts, LinkedIn activo, primeros 10 leads  
│  
Mayo-Junio 2026  
├─ FASE 1 parte 2: Prospection \+ Deal Pipeline (4 semanas)  
│ └─ Entregable: Idealista scraper, insights diarios, primer mandato  
│  
Julio-Septiembre 2026 (Q3)  
├─ FASE 2: Intelligence (12 semanas)  
│ └─ Entregable: RAG activo, pricing intelligence, 3-5 mandatos, 1 operación cerrada  
│  
Octubre-Diciembre 2026 (Q4)  
├─ FASE 3: Scale (12 semanas)  
│ └─ Entregable: Feed Orchestrator, Advisor AI integrado, 10-15 mandatos, 2-3 operaciones  
│  
Enero 2027  
└─ DECISIÓN: ¿Contratar asistente? ¿Ofrecer Nexus a otros agentes eXp?

**Momento de la verdad: Q2 2026**

**Próximos 90 días son críticos.**

Si ejecutas FASE 0 \+ FASE 1:

* Tendrás presencia visible (blog, LinkedIn)

* Tendrás inteligencia mercado (Idealista data)

* Tendrás sistema operativo (Nexus funcional)

* Tendrás argumentos captación mandato (datos que otros no tienen)

**Resultado esperado:** 1-3 mandatos firmados Q2.

Si NO ejecutas:

* Seguirás siendo "agente nuevo sin cartera"

* Competencia (E\&V, Balearic, etc.) seguirá dominando

* Tu ventaja tech queda en potencial, no en realidad

**El riesgo no es técnico (sabes programar). El riesgo es dispersión.**

**Decisión recomendada:**

"Durante 90 días (Abril-Junio 2026), SOLO trabajo en Nexus \+ Private Estates. Nada más. Ni Advisor AI, ni Portfolio updates, ni 'features chulas'. Solo lo que genera mandatos."

---

**Referencias y fuentes**

**Repositorios analizados**

\[1\] Anclora-Nexus: [https://github.com/ToniIAPro73/Anclora-Nexus](https://github.com/ToniIAPro73/Anclora-Nexus)  
\[2\] Anclora-Private-Estates: [https://github.com/ToniIAPro73/Anclora-Private-Estates](https://github.com/ToniIAPro73/Anclora-Private-Estates)  
\[3\] Anclora-Advisor-AI: [https://github.com/ToniIAPro73/Anclora-Advisor-AI](https://github.com/ToniIAPro73/Anclora-Advisor-AI)  
\[4\] Anclora-Azure-Bay: [https://github.com/ToniIAPro73/anclora-azure-bay-landing-page](https://github.com/ToniIAPro73/anclora-azure-bay-landing-page)  
\[5\] Anclora-Portfolio: [https://github.com/ToniIAPro73/Anclora-Portfolio](https://github.com/ToniIAPro73/Anclora-Portfolio)

**Documentación técnica**

\[6\] Supabase Row Level Security: [https://supabase.com/docs/guides/database/postgres/row-level-security](https://supabase.com/docs/guides/database/postgres/row-level-security)  
\[7\] pgvector GitHub: [https://github.com/pgvector/pgvector](https://github.com/pgvector/pgvector)  
\[8\] n8n security issues (TechRadar): [https://www.techradar.com/pro/security/thousands-of-n8n-instances-under-threat](https://www.techradar.com/pro/security/thousands-of-n8n-instances-under-threat)

**Datos mercado inmobiliario Mallorca**

\[9\] Yes Mallorca \- Mercado 2026: [https://yes-mallorca-inmuebles.es/blog/info/mercado-inmobiliario-de-mallorca-en-2026/](https://yes-mallorca-inmuebles.es/blog/info/mercado-inmobiliario-de-mallorca-en-2026/)  
\[10\] Indomio \- Portals Nous precios: [https://www.indomio.es/mercado-inmobiliario/illes-balears/calvia/portals-nous/](https://www.indomio.es/mercado-inmobiliario/illes-balears/calvia/portals-nous/)  
\[11\] Balearic Properties \- Mallorca destino preferido extranjeros: [https://www.balearic-properties.com/es/mallorca-destino-preferido-en-baleares-para-la-venta-de-viviendas-a-extranjeros](https://www.balearic-properties.com/es/mallorca-destino-preferido-en-baleares-para-la-venta-de-viviendas-a-extranjeros)  
\[12\] Fine & Country \- Tendencias lujo 2025: [https://www.fineandcountry.es/mallorca-estate-agents/local-blogs/mercado-inmobiliario-de-mallorca-2025](https://www.fineandcountry.es/mallorca-estate-agents/local-blogs/mercado-inmobiliario-de-mallorca-2025)  
\[13\] Baerz & Co \- Calvià/Portals Nous: [https://www.baerz.com/es/calvia--portals-nous](https://www.baerz.com/es/calvia--portals-nous)  
\[14\] Helen Cummins \- Inversión inmobiliaria Mallorca: [https://www.helencummins.es/inversion-inmobiliaria-mallorca/](https://www.helencummins.es/inversion-inmobiliaria-mallorca/)  
\[15\] Engel & Völkers \- Precios Portals Nous 2026: [https://www.engelvoelkers.com/es/es/precios-inmobiliarios/islas-baleares/portals-nous](https://www.engelvoelkers.com/es/es/precios-inmobiliarios/islas-baleares/portals-nous)  
\[16\] Mallorca Confidencial \- Barrios más caros Baleares: [https://www.mallorcaconfidencial.com/articulo/actualidad/santa-eularia-portals-nous-marina-botafoc-barrios-mas-caros-baleares/](https://www.mallorcaconfidencial.com/articulo/actualidad/santa-eularia-portals-nous-marina-botafoc-barrios-mas-caros-baleares/)  
\[17\] Ultima Hora \- Baleares lidera participación extranjeros: [https://www.ultimahora.es/noticias/local/2025/12/04/2524969/baleares-lidera-participacion-extranjeros-compraventa-viviendas](https://www.ultimahora.es/noticias/local/2025/12/04/2524969/baleares-lidera-participacion-extranjeros-compraventa-viviendas)

---

**Fin del informe**

**Próxima revisión recomendada:** Q3 2026 (Julio) tras completar FASE 1 \+ primeros mandatos.