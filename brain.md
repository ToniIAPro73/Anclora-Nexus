# brain.md — ADN del Negocio: Anclora Nexus

Única fuente de verdad sobre el negocio, el territorio y el contexto estratégico de Toni Amengual. Este archivo se inyecta en el sistema prompt de los agentes para mantener coherencia entre sesiones.

---

## 1. Perfil del Owner

**Nombre:** Toni Amengual
**Empresa:** Anclora Private Estates
**Franquicia:** eXp Realty Spain (agente independiente)
**Especialización:** Inmobiliaria de lujo, Suroeste de Mallorca
**Situación:** Agente a tiempo parcial (jornada completa en CGI)
**Principio operativo:** "Cada hora invertida debe acortar el camino al siguiente mandato."

### Métricas de Éxito Personales
- Captaciones conseguidas por mes (objetivo: 1-2 mandatos exclusivos/mes)
- Tiempo de respuesta a nuevos leads (objetivo: < 15 minutos)
- Tasa de respuesta de propietarios contactados
- Pipeline activo: propiedades en estado `listed` o `under_offer`

---

## 2. Empresa: Anclora Private Estates

**Marca:** Anclora Private Estates by eXp Realty Spain
**Propuesta de valor:** Inteligencia territorial + red global eXp
**Ventaja competitiva:** Sistema IA para detectar vendedores motivados antes que la competencia
**Modelo de negocio:** Honorarios por intermediación inmobiliaria (seller-side prospecting)

### eXp Global Spain — Puntos Clave para el Discurso
- Franquicia 100% online con presencia en 24+ países
- Comisiones competitivas para agentes independientes
- Acceso a compradores internacionales (red global)
- Soporte 24/7 vía plataforma cloud
- Sin cuotas de oficina física

---

## 3. Territorio Target: Suroeste de Mallorca

### Zonas Primarias

| Municipio | Código Postal | Perfil de Mercado |
|-----------|--------------|-------------------|
| Andratx | 07150-07157 | Lujo consolidado, villas con vistas al mar |
| Calvià | 07180, 07181 | Premium, golf, expatriados |
| Port Adriano | 07160 | Superyates, ultra-lujo |
| Son Ferrer | 07180 | Emerging, mercado estancado = oportunidad |
| Santa Ponça | 07180 | Familias europeas, mercado activo |
| Paguera | 07160 | Turismo de calidad, propietarios maduros |

### Perfil del Propietario Ideal (ICP — Ideal Client Profile)

**Señales de propietario motivado:**
- Propiedad en mercado > 6 meses sin vender (estancada)
- FSBO (For Sale By Owner) sin agente formal
- Segunda residencia vacacional con bajo rendimiento de alquiler
- Propietario internacional (no residente) con necesidad de liquidez
- Herencia reciente o proceso de divorcio (señales de urgencia)
- Propiedad con precio significativamente superior al mercado (overpriced)

**Perfil demográfico:**
- Edad: 50-75 años
- Nacionalidad: Alemán, Británico, Escandinavo, Español (familias consolidadas)
- Motivación de venta: Jubilación, traslado, herencia, mantenimiento costoso
- Rango de precio: €500.000 - €5.000.000+

---

## 4. Inteligencia de Mercado

### Fuentes de Datos a Monitorizar
- **Idealista** — Precios por zona, tiempo en mercado, anomalías de precio
- **Fotocasa** — Propiedades FSBO y portales complementarios
- **IBESTAT** — Estadísticas de turismo e inmigración Islas Baleares
- **Aena** — Vuelos privados e internacionales (indicador de demanda premium)
- **Consell de Mallorca** — Normativas urbanísticas, licencias turísticas (ETVD)
- **Catastro** — Valoraciones, referencias catastrales, titularidad

### KPIs de Mercado Relevantes
- Precio €/m² por zona y tipo de propiedad
- Días promedio en mercado (DOM) por zona
- Descuento promedio entre precio inicial y precio de venta
- Ratio de absorción del inventario
- Volumen de transacciones por trimestre

### Normativas Clave (Suroeste Mallorca)
- **ETVD** (Estancias Turísticas en Vivienda de Uso Residencial): licencias limitadas
- **Zonas de saturación turística**: restricciones en Calvià y Andratx
- **Plan Territorial de las Islas Baleares**: protección de zonas naturales (ANEI)
- **Decreto 20/2015**: regula arrendamientos turísticos en Baleares

---

## 5. Flujo de Adquisición de Vendedores (Seller-Side Prospecting)

### Pipeline de Prospección
```
SEÑAL DETECCIÓN
    ↓
Lead cualificado por IA (prioridad 1-5)
    ↓
Contacto inicial personalizado (email/WA/llamada)
    ↓
Auditoría de mercado gratuita (propuesta de valor)
    ↓
Reunión presencial en propiedad
    ↓
Propuesta de mandato exclusivo
    ↓
Firma de mandato (ÉXITO)
```

### Criterios de Priorización (Risk Scoring adaptado)

**Fórmula:** `priority = (budget × 0.35) + (urgency × 0.25) + (property_fit × 0.25) + (source_quality × 0.15)`

| Factor | Peso | Escala |
|--------|------|--------|
| Presupuesto / Valor de propiedad | 35% | 0.1 (< €200k) → 1.0 (> €2M) |
| Urgencia de venta | 25% | 0.1 (sin urgencia) → 1.0 (urgente) |
| Encaje con zona target | 25% | 0.1 (fuera zona) → 1.0 (zona premium) |
| Calidad de la fuente | 15% | 0.1 (cold) → 1.0 (referido directo) |

**Escala de prioridad final:**
- **Prioridad 5** (0.80-1.0): Whale — responder en < 15 min
- **Prioridad 4** (0.60-0.79): Alto valor — responder en < 2h
- **Prioridad 3** (0.40-0.59): Potencial — responder en < 24h
- **Prioridad 2** (0.20-0.39): Seguimiento — responder en < 48h
- **Prioridad 1** (0.0-0.19): Frío — nurturing a largo plazo

---

## 6. Skills Operativos del Sistema

### lead_intake (Activo)
- **Trigger:** Formulario web → webhook
- **Duración objetivo:** < 30 segundos
- **Output:** Resumen IA + prioridad 1-5 + copy email + copy WhatsApp
- **LLM:** GPT-4o-mini (resumen) + Claude Sonnet (copy)

### prospection_weekly (Activo)
- **Trigger:** Cada domingo 18:00h (cron n8n) o manual desde dashboard
- **Zonas:** Andratx (07150-07157), Calvià (07180), Son Ferrer, Santa Ponça
- **Criterios:** Precio > €500.000, tipo villa/casa, señales de estancamiento
- **Output:** 10-20 propiedades priorizadas + CMA + copy de carta de captación
- **LLM:** GPT-4o (copy de captación)

### recap_weekly (Activo)
- **Trigger:** Cada domingo 20:00h (cron n8n) o manual
- **Período:** Últimos 7 días
- **Output:** Métricas semana + gaps detectados + top 3 acciones próxima semana
- **LLM:** Claude Sonnet (insights cualitativos)

### dossier_generator (Diferido Q2 2026)
- PDF profesional de captación con datos de mercado, valoración IA, propuesta

---

## 7. Propuesta de Valor para Propietarios

**Argumento principal:**
> "Tengo acceso a compradores internacionales que no aparecen en los portales tradicionales. Mi sistema analiza el mercado del Suroeste de Mallorca en tiempo real y tengo compradores cualificados buscando exactamente propiedades como la suya."

**Puntos de apoyo:**
1. Red global eXp — compradores en 24+ países
2. Auditoría de mercado gratuita (CMA profesional)
3. Estrategia de precio basada en datos reales de mercado
4. Marketing premium (fotografía, video, difusión internacional)
5. Sin cuotas hasta la firma (solo comisión en éxito)

---

## 8. Dashboard — Métricas Clave a Visualizar

| Métrica | Frecuencia | Widget |
|---------|------------|--------|
| Leads nuevos esta semana | Tiempo real | QuickStats |
| Leads activos por prioridad | Tiempo real | LeadsPulse |
| Tasa de respuesta (< 15 min) | Diaria | QuickStats |
| Propiedades en pipeline | Tiempo real | PropertyPipeline |
| Mandatos activos | Semanal | QuickStats |
| Ejecuciones de agentes IA | Tiempo real | AgentStream |

---

## 9. Contexto Competitivo

**Competidores directos en Suroeste Mallorca:**
- Engel & Völkers (Andratx, Santa Ponça)
- Knight Frank (Calvià, Andratx)
- Lucas Fox (Mallorca portfolio)
- Agencias locales independientes

**Ventaja diferencial de Anclora Nexus:**
- Detección de vendedores motivados **antes** de que publiquen en portales
- Análisis CMA automático por zona para cualquier propiedad
- Respuesta a leads en < 15 minutos (competidores: horas o días)
- Red global eXp para compradores internacionales no accesibles por agencias locales

---

## 10. Límites Operativos Constitucionales (v0)

| Límite | Valor | Tabla |
|--------|-------|-------|
| Leads procesados por día | 50 | `constitutional_limits.max_daily_leads` |
| Tokens LLM por día | 100,000 | `constitutional_limits.max_llm_tokens_per_day` |
| Duración máxima de tarea | 60 minutos | Hardcoded en StateGraph |
| Agentes paralelos | 2 | Hardcoded en orquestador |

Estos límites son **hard stops** — el sistema bloquea automáticamente y notifica cuando se alcanzan.
