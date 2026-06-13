# DMS/CLM Complete — Plan de Implementación v1

**Feature:** `dms-clm-complete`  
**Rama:** `feat/nexus-dms-clm-complete`  
**Fecha de creación:** 2026-06-13  
**Estado:** Implementación en curso

---

## Resumen ejecutivo

Implementación del ciclo completo de gestión documental (DMS) y contractual (CLM) para el módulo de inmuebles de Anclora Nexus. Cubre 18 familias de documentos canónicas, 11 idiomas (198 variantes), integración CRM, validación Advisor AI, firma electrónica DocuSeal y retención con legal hold.

---

## Fases de implementación

### Fase 0 — Auditoría y reconciliación del catálogo
**Objetivo:** Diagnosticar el estado actual del catálogo de plantillas.  
**Entregables:**
- `docs/DMS_TEMPLATE_RECONCILIATION_AUDIT.md` ✓

### Fase 1 — Paquete SDD
**Objetivo:** Documentar los requisitos, plan, tareas y QA antes de implementar.  
**Entregables:**
- `sdd/features/dms-clm-complete/dms-clm-complete-INDEX.md` ✓
- `sdd/features/dms-clm-complete/dms-clm-complete-spec-v1.md` ✓
- `sdd/features/dms-clm-complete/dms-clm-complete-plan-v1.md` ✓ (este fichero)
- `sdd/features/dms-clm-complete/dms-clm-complete-tasks-v1.md` ✓
- `sdd/features/dms-clm-complete/dms-clm-complete-test-plan-v1.md` ✓
- `sdd/features/dms-clm-complete/QA_REPORT_DMS_CLM_001.md` ✓
- `sdd/features/dms-clm-complete/GATE_FINAL_DMS_CLM_001.md` ✓

### Fase 2 — Migraciones de base de datos
**Objetivo:** Crear las tablas necesarias para el ciclo CLM completo.  
**Entregables:**
- `backend/scripts/migrations/001_dms_tables.sql` ✓
- `backend/scripts/migrations/002_document_template_library.sql` ✓
- `backend/scripts/migrations/003_dms_clm_complete.sql` ✓

**Tablas creadas:**
- `generated_documents` — documentos generados
- `document_versions` — versiones de cada documento
- `document_signature_flows` — flujos de firma DocuSeal
- `legal_review_decisions` — decisiones de revisión jurídica
- `document_retention_policies` — políticas de retención
- `dossier_exports` — exportaciones de expediente
- `document_templates` — catálogo de plantillas
- `document_template_versions` — versiones de plantillas

### Fase 3 — Catálogo canónico de plantillas
**Objetivo:** 18 familias × 11 idiomas = 198 variantes Markdown.  
**Entregables:**
- `backend/seeds/templates/{lang}/tpl-*.md` (198 ficheros) ✓
- `backend/seeds/template_manifest.json` ✓
- `backend/seeds/operation_document_matrix.json` ✓
- `backend/seeds/legal_translation_glossary.json` ✓

### Fase 4 — Validador de plantillas
**Objetivo:** Herramienta CLI para validar integridad del catálogo.  
**Entregables:**
- `backend/seeds/validate_templates.py` ✓

### Fase 5 — Storage y assets de plantillas
**Objetivo:** Upload al bucket Supabase privado y build del seed SQL.  
**Entregables:**
- `backend/seeds/build_template_seed.py` ✓
- `backend/seeds/upload_template_assets.py` — requiere credenciales Supabase Storage

### Fase 6 — Constructor de contexto CRM
**Objetivo:** Resolver partes, propiedad e idioma desde el expediente CRM.  
**Entregables:**
- `backend/services/dms_context_builder.py` ✓
- `backend/services/dms_template_rendering.py` ✓

### Fase 7 — Servicio de generación de documentos
**Objetivo:** Renderizar plantillas con variables del expediente.  
**Entregables:**
- `backend/api/routes/dms_generated.py` ✓
- Endpoint `POST /api/dms/folders/{id}/generate-document` ✓

### Fase 8 — UI de generación (wizard)
**Objetivo:** Asistente paso a paso para generar documentos desde el frontend.  
**Entregables:**
- `frontend/src/components/dms/GenerateDocumentWizard.tsx` ✓
- Integración en `frontend/src/app/(dashboard)/dms/page.tsx` ✓

### Fase 9 — Biblioteca de plantillas
**Objetivo:** Vista `/dms/templates` con filtros, versiones, validación y publicación.  
**Entregables:**
- `frontend/src/app/(dashboard)/dms/templates/page.tsx` (mejorada) ✓

### Fase 10 — Visor y editor de documentos
**Objetivo:** Visor completo con versionado, revisión y firma.  
**Entregables:**
- `frontend/src/app/(dashboard)/dms/documents/[documentId]/page.tsx` ✓
- `frontend/src/app/(dashboard)/dms/documents/[documentId]/edit/page.tsx` ✓

### Fase 11 — Gates Advisor AI
**Objetivo:** Reforzar los bloqueos del validador automático.  
**Entregables:**
- `backend/services/advisor_contract_validator_service.py` (reforzado) ✓

Gates implementados:
- Timeout → nunca aprueba (`gate_blocked_reason: timeout`)
- JSON inválido → `review_required` (`gate_blocked_reason: invalid_json_shape`)
- Placeholder pendiente `{{...}}` → bloqueo inmediato antes de llamar al AI
- Riesgo crítico → fuerza `block_signing=True`
- Traducción divergente (>5 diferencias críticas) → bloqueo
- Fuentes RAG insuficientes (<2) → `human_review_recommended=True`

### Fase 12 — Revisión jurídica humana
**Objetivo:** Cola de revisión, decisión manual, escalado.  
**Entregables:**
- `backend/api/routes/dms_legal_review.py` ✓
- `GET /api/dms/legal-review/queue` ✓
- Visor en `frontend/src/app/(dashboard)/dms/legal-review/page.tsx` ✓

### Fase 13 — Firma electrónica DocuSeal
**Objetivo:** Enviar documentos a firma y recibir confirmación webhook.  
**Entregables:**
- Endpoint `POST /api/dms/generated-documents/{id}/signature-flows` ✓
- Webhook `POST /api/dms/webhooks/docuseal` ✓
- Multi-signer payload con `signing_level` ✓

### Fase 14 — Exportación de expediente (dossier)
**Objetivo:** ZIP con manifiesto SHA-256, estructura en 11 directorios.  
**Entregables:**
- Endpoints `POST/GET /api/dms/folders/{id}/exports` ✓
- `backend/services/document_retention_service.py` ✓

### Fase 15 — Retención y legal hold
**Objetivo:** Aplicar políticas de retención automáticas via cron.  
**Entregables:**
- `backend/api/internal_webhooks.py` (`/api/internal/webhooks/dms-retention-sweep`) ✓
- `frontend/src/app/api/cron/dms-retention/route.ts` ✓
- Cron entry en `frontend/vercel.json` ✓

### Fase 16 — Tests
**Objetivo:** Cobertura de todas las funcionalidades nuevas.  
**Entregables:**
- `backend/tests/test_dms_clm_features.py` (17 tests) ✓
- `frontend/src/components/dms/GenerateDocumentWizard.test.tsx` (8 tests) ✓

### Fase 17 — Documentación
**Objetivo:** 10 ficheros Markdown de arquitectura, operaciones y QA.  
**Entregables:**
- `docs/DMS_CLM_ARCHITECTURE.md` ✓
- `docs/DMS_TEMPLATE_GOVERNANCE.md` ✓
- `docs/DMS_MULTILINGUAL_GOVERNANCE.md` ✓
- `docs/DMS_DOCUMENT_LIFECYCLE.md` ✓
- `docs/DMS_STORAGE_RETENTION_AND_LEGAL_HOLD.md` ✓
- `docs/DMS_DOSSIER_EXPORT.md` ✓
- `docs/DMS_SIGNATURE_WORKFLOW.md` ✓
- `docs/DMS_TEMPLATE_ONBOARDING.md` ✓
- `docs/DMS_OPERATIONS_RUNBOOK.md` ✓
- `docs/QA_DMS_CLM_COMPLETE.md` ✓
- `docs/DMS_CLM_THREAT_MODEL.md` ✓

---

## Arquitectura de datos

```
document_templates (catálogo)
  └── document_template_versions (versiones de plantilla)
        └── generated_documents (documentos generados por expediente)
              ├── document_versions (versiones del documento)
              ├── legal_review_decisions (revisiones jurídicas)
              ├── document_signature_flows (flujos de firma)
              └── document_retention_policies (políticas de retención)
```

---

## Dependencias externas

| Servicio | Uso | Requerido en |
|---|---|---|
| Supabase Storage | Almacenamiento privado de documentos | Producción |
| DocuSeal | Firma electrónica | Producción (credenciales propias) |
| Advisor AI (anclora-advisor-ai) | Validación jurídica automática | Producción |
| Vercel Cron | Retención automática diaria (03:00 UTC) | Producción |

---

## Decisiones de arquitectura

| Decisión | Opción elegida | Razón |
|---|---|---|
| Formato de plantillas | Markdown con front matter YAML | Versionable en git, renderizable a DOCX/PDF |
| Motor de templates | Jinja2 | Compatibilidad con Python, sintaxis familiar |
| Almacenamiento de firmados | Bucket Supabase `dms-signed` (privado) | Aislamiento de acceso por org |
| Multi-signer | Array `signers[]` con backward compat | DocuSeal soporta múltiples firmantes |
| Retención | Cron Vercel → endpoint interno | Sin dependencia de infra adicional |
| Gates Advisor AI | Pre-validate + post-gates | Separación de concerns, testeable |
