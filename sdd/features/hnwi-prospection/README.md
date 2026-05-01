# ANCLORA-HNWI-001: HNWI Prospection System

**Sistema de Prospección de Alto Valor para Anclora Private Estates**

---

## 📋 Descripción General

Este feature implementa un sistema profesional, ético y escalable para la prospección de compradores y vendedores de alto poder adquisitivo (HNWIs) interesados en propiedades de lujo en Mallorca.

El sistema prioriza métodos **zero/low-cost** y **open source**, integrándose nativamente con el stack existente de Anclora Nexus (n8n, email supervised/native, FinOps, Source Observatory).

---

## 🎯 Objetivos

- Generar leads de alto valor de forma sistemática y escalable
- Automatizar el scoring y la cualificación de leads
- Integrar outreach `email-first` para leads HNWI cualificados
- Mantener trazabilidad completa y cumplimiento GDPR
- Operar sin depender de portales MLS (StateFox, Inmovila, Idealista)

---

## 🏗️ Arquitectura

```
Señales (LinkedIn, FB, Reddit, Google Alerts)
        ↓
n8n Workflow v2 (Parser + Scoring)
        ↓
Anclora Nexus (/api/ingestion/leads)
        ↓
Scoring + Clasificación (Hot / Warm / Cold)
        ↓
Email Qualification / Draft Preparation (solo leads Hot con email verificado)
        ↓
FinOps + Source Observatory
```

---

## 📁 Estructura de Archivos

```
sdd/features/hnwi-prospection/
├── hnwi-prospection-INDEX.md
├── hnwi-prospection-spec-v1.md
├── hnwi-prospection-spec-migration.md
├── hnwi-prospection-test-plan-v1.md
├── GATE_FINAL_ANCLORA_HNWI_001.md
├── README.md
├── CHANGELOG.md
├── hnwi-prospection-shared-context.md
├── hnwi-prospection-master-parallel.md
├── hnwi-prospection-orchestration-guide.md
└── artifacts/
    ├── Guia_HNWI_Prospeccion_Anclora_Private_Estates_2026.docx
    ├── n8n_hnwi_prospection_workflow.json
    └── n8n_hnwi_prospection_workflow_v2.json
```

---

## 🚀 Inicio Rápido

1. **Importar Workflow n8n**
   - Descargar `artifacts/n8n_hnwi_prospection_workflow_v2.json`
   - Importar en n8n
   - Configurar variables de entorno
   - Usar `PUBLIC_CTA_ORG_ID` como `org_id` por defecto del workflow

2. **Aplicar Migraciones**
   - Ejecutar las migraciones HNWI y `lead_interactions` en Supabase

3. **Comenzar Prospección**
   - Seguir la guía `artifacts/Guia_HNWI_Prospeccion_Anclora_Private_Estates_2026.docx`
   - Usar las búsquedas Boolean optimizadas

---

## 📊 Métricas Objetivo (Mes 3)

- 40-60 leads contactados por semana
- 15-25 conversaciones iniciadas
- 8-12 leads Hot por semana
- 4-6 conversaciones iniciadas por email por semana

---

## 📚 Documentación Relacionada

- [Guía Completa (Word)](./artifacts/Guia_HNWI_Prospeccion_Anclora_Private_Estates_2026.docx)
- [Especificación Técnica](hnwi-prospection-spec-v1.md)
- [Workflow n8n v2](./artifacts/n8n_hnwi_prospection_workflow_v2.json)

---

**Versión**: 1.0  
**Fecha**: Mayo 2026  
**Owner**: ToniIAPro73 + Grok Team

---

*Este feature forma parte del ecosistema Anclora Nexus.*
