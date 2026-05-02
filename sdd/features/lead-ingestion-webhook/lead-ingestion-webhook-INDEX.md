# Lead Ingestion Webhook - INDEX
## Feature SDD (Software Design Document)

---

## 📋 Descripción General

Esta feature implementa el **endpoint de ingesta de leads** en Anclora Nexus y la conexión del formulario de Seller Intake a n8n.

---

## 🎯 Objetivos

- Crear endpoint robusto para recibir leads de múltiples fuentes
- Validar datos con Pydantic
- Guardar en Supabase con trazabilidad completa
- Conectar formulario de Landing a webhook de n8n

---

## 🏗️ Arquitectura

```
Formulario de Landing (React)
        ↓
Webhook n8n (/webhook/unified-lead-intake)
        ↓
Endpoint Nexus (POST /api/ingestion/leads)
        ↓
Validación Pydantic + Guardado en Supabase
```

---

## 📁 Estructura de Archivos

```
anclora-nexus/sdd/features/lead-ingestion-webhook/
├── lead-ingestion-webhook-INDEX.md (este archivo)
├── lead-ingestion-webhook-shared-context.md
├── lead-ingestion-webhook-spec-v1.md
├── lead-ingestion-webhook-spec-migration.md
├── lead-ingestion-webhook-test-plan-v1.md
├── lead-ingestion-webhook-master-parallel.md
└── GATE_FINAL_LEAD_INGESTION_WEBHOOK.md
```

---

**Versión**: 1.0  
**Fecha**: Mayo 2026  
**Owner**: ToniIAPro73 + Grok Team

---

*Esta feature forma parte del ecosistema Anclora Nexus.*