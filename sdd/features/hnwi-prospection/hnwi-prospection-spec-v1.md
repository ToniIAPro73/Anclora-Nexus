# HNWI Prospection v1 – Especificación Completa (ANCLORA-HNWI-001)

## 1. Objetivo del Documento
Este documento define la especificación completa de la feature **ANCLORA-HNWI-001 – Sistema de Prospección de Alto Valor (HNWI)** para Anclora Private Estates.

El objetivo es construir un pipeline profesional, ético y escalable de generación, cualificación y nurturing de leads de alto poder adquisitivo interesados en propiedades de lujo en Mallorca, utilizando exclusivamente métodos zero/low-cost y open source, e integrándose nativamente con el stack existente de Anclora Nexus.

## 2. Alcance

### 2.1 In-Scope
- Prospección de **compradores HNWI** (internacionales y nacionales)
- Prospección de **vendedores HNWI** (FSBO y perfiles de alto valor)
- Integración con outreach `email-first` y envío supervisado por email
- Scoring automático de leads
- Ingesta en `/api/ingestion/leads`
- Métricas en Source Observatory y FinOps
- Automatización mediante n8n

### 2.2 Out-of-Scope (Fase 1)
- Integración con StateFox, Inmovila o Idealista (no disponible actualmente)
- Publicidad pagada (Meta Ads, Google Ads, etc.)
- CRM externo (se usa Nexus como fuente de verdad)

## 3. Buyer Persona (Detallado)

### 3.1 Arquetipo Principal
**“El Inversor Lifestyle Premium”**

- **Edad**: 45 – 68 años
- **Patrimonio Neto**: €1.8M – €12M+
- **Nacionalidades prioritarias**:
  - Alemana (35-40%)
  - Británica (20-25%)
  - Nórdica (15%)
  - Americana (10-12%)
  - Francesa/Suiza (8-10%)
  - Española Elite (5-8%)

- **Zonas de interés prioritarias**:
  - Andratx
  - Calvià (incluyendo Bendinat e Illetas)
  - Son Vida
  - Deià / Valldemossa
  - Puerto Portals / Portixol

### 3.2 Motivaciones Principales
1. Lifestyle mediterráneo + seguridad
2. Inversión con yield (ETV 6-9% neto)
3. Legado familiar
4. Diversificación patrimonial fuera del país de origen
5. Privacidad y exclusividad

### 3.3 Pain Points
- Dificultad para encontrar propiedades **off-market** de calidad
- Falta de transparencia y asesoramiento independiente
- Preocupación por burocracia española
- Miedo a comprar algo que no se revalorice o tenga problemas de alquiler
- Necesidad de servicio integral desde el extranjero

## 4. Estrategias de Prospección

### 4.1 Principio 80/20
- **LinkedIn**: 50-60% del esfuerzo (canal principal)
- **Facebook Groups**: 20%
- **Reddit + Foros**: 15%
- **Google Alerts + Pasivo**: 5-10%

### 4.2 Tácticas por Canal

**LinkedIn (Principal)**
- Búsquedas Boolean avanzadas diarias
- Publicación de contenido de alto valor (2-3 posts/semana)
- Outreach de 2º grado (comentar → conectar → mensaje)
- Uso controlado de Dux-Soup (máx. 35-40 acciones/día)

**Facebook Groups**
- Publicación de 1 post de valor por semana
- Monitorización activa de posts con intención (“busco villa”, “vendo finca”)
- Respuesta con valor + oferta de ayuda neutra

**Reddit + Foros**
- Respuestas de alto valor en r/mallorca, r/ExpatFIRE, ExpatExchange, InterNations

### 4.3 Estrategias por Nacionalidad (Resumen)

| Nacionalidad   | Canal Principal     | Mensaje Clave                              |
|----------------|---------------------|--------------------------------------------|
| Alemana        | LinkedIn + FB       | Yields + privacidad + calidad construcción |
| Británica      | LinkedIn + Reddit   | Lifestyle + golf + comunidad               |
| Nórdica        | LinkedIn            | Sostenibilidad + diseño moderno            |
| Americana      | LinkedIn            | Servicio integral + gestión alquiler       |
| Francesa/Suiza | LinkedIn (discreto) | Confidencialidad + trato personalizado     |

## 5. Arquitectura del Sistema

### 5.1 Componentes Principales
- **Signal Sources**: LinkedIn, Facebook Groups, Reddit, Google Alerts
- **Ingestion Layer**: n8n workflows (v2 recomendado)
- **Core Backend**: Anclora Nexus (`/api/ingestion/leads`)
- **Qualification Engine**: LLM (Groq) + reglas de scoring
- **Outreach Channel**: Email supervised/native email cuando exista SMTP
- **Observability**: FinOps + Source Observatory

### 5.2 Flujo de Datos
1. Detección de señal (manual o semi-automática)
2. Enriquecimiento (email, nacionalidad, zona)
3. Scoring automático (0-100)
4. Ingesta en Nexus
5. Si Hot (≥70) y `email_verified=true` → Preparación automática de brief + email draft

## 6. Contratos de API

### 6.1 Endpoint de Ingesta (Existente)
`POST /api/ingestion/leads`

**Campos HNWI relevantes**:
- `connector_name`: `"hnwi-prospection:<channel>"`
- `source_system`: `"social"`
- `source_channel`: valor válido del contrato actual
- `hnwi_source_channel`: `"linkedin" | "facebook" | "reddit" | "google-alert" | "other"`
- `nationality`
- `zone_interest`
- `qualification_score` (0-100)
- `qualification_tier` (`hot` | `warm` | `cold`)
- `email_verified`

**Resolución de `org_id` en automatizaciones**:
- El workflow debe priorizar `PUBLIC_CTA_ORG_ID` como valor por defecto del tenant.
- `ORG_ID` solo se usa como fallback secundario en entornos legacy.
- Si el item ya trae `org_id`, ese valor prevalece.

### 6.2 Evento FinOps
Cada lead generado genera un `UsageEvent` con:
- `capability_code`: `"hnwi_prospection"`
- `provider`: `"manual" | "n8n" | "google-alert"`
- `org_id`
- `metadata`: `{ channel, nationality, score }`

## 7. Scoring HNWI (Reglas Iniciales)

Puntuación base (0-100):

- Presupuesto ≥ €2M → +30
- Zona prioritaria (Andratx, Calvià, Son Vida, Deià) → +25
- Nacionalidad prioritaria (Alemana, Británica, Nórdica, Americana) → +20
- Intención explícita (“busco”, “looking for”, “interested”) → +25
- Email verificado → +10

**Clasificación**:
- ≥ 70 → **Hot**
- 45-69 → **Warm** → Entra en nurturing
- < 45 → **Cold** → Se guarda para seguimiento posterior

**Regla de outreach**:
- `Hot + email_verified=true` → preparar email automáticamente
- `Hot + sin email verificado` → enriquecimiento manual

## 8. Integración con Email

Cuando un lead es clasificado como **Hot** y tiene `email_verified=true`, el sistema prepara automáticamente:

- `lead_brief`
- `email_draft`
- payload de `send-supervised/email` para revisión o envío nativo si SMTP está configurado

## 9. Métricas y Observabilidad

### 9.1 KPIs Principales
- Leads generados por semana
- Tasa de conversión (Contactado → Ingresado)
- % de leads Hot
- Tasa de respuesta por canal y nacionalidad
- Tiempo medio desde detección hasta primer contacto

### 9.2 Dashboard Recomendado (Source Observatory)
- Resumen general (KPIs)
- Rendimiento por canal
- Distribución por nacionalidad
- Evolución temporal (últimos 30 días)
- Calidad de leads (distribución de scores)
- Alertas automáticas (baja tasa de respuesta, exceso de leads Hot sin contacto, etc.)

## 10. Consideraciones Legales y Éticas

- Cumplimiento estricto del **GDPR**
- Solo se contacta perfiles con **intención pública clara**
- Primer contacto siempre con **valor** (nunca pitch directo)
- Opción clara de “no contactar más” en todos los mensajes
- Registro completo de fuente y consentimiento implícito en Nexus

## 11. Roadmap de Implementación

**Fase 0 (Semanas 1-2)**: Setup + prospección manual + ingestión básica
**Fase 1 (Semanas 3-6)**: Automatización n8n v2 + scoring + email-first outreach
**Fase 2 (Semanas 7-12)**: Optimización por canal + dashboard + escalabilidad

---

**Fin de la Especificación v1**

*Este documento será la base para la implementación completa de la feature ANCLORA-HNWI-001.*
