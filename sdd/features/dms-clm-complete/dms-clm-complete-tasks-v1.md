# DMS/CLM Complete — Lista de Tareas v1

**Feature:** `dms-clm-complete`  
**Última actualización:** 2026-06-14

---

## Leyenda de estado

| Símbolo | Significado |
|---|---|
| ✅ | Completado |
| ⚠️ | Requiere intervención externa |
| 🔲 | Pendiente de validación en producción |

---

## Fase 2 — Migraciones

| # | Tarea | Estado |
|---|---|---|
| 2.1 | Crear migración 001_dms_tables.sql | ✅ |
| 2.2 | Crear migración 002_document_template_library.sql | ✅ |
| 2.3 | Crear migración 003_dms_clm_complete.sql | ✅ |
| 2.4 | Validar idempotencia (CREATE TABLE IF NOT EXISTS) | ✅ |
| 2.5 | Ejecutar migraciones en entorno dev | ✅ |

## Fase 3 — Catálogo

| # | Tarea | Estado |
|---|---|---|
| 3.1 | Crear 18 plantillas canónicas ES | ✅ |
| 3.2 | Crear 17 traducciones × 10 idiomas (ca, da, de, en, fr, it, nl, no, pt, sv) | ✅ |
| 3.3 | Generar template_manifest.json con hashes SHA-256 | ✅ |
| 3.4 | Generar operation_document_matrix.json | ✅ |
| 3.5 | Generar legal_translation_glossary.json | ✅ |
| 3.6 | Validar placeholders con validate_templates.py | ✅ |
| 3.7 | Revisión jurídica humana de plantillas ES | ⚠️ Requiere abogado |
| 3.8 | Publicar plantillas en tabla document_templates | 🔲 Requiere seed SQL ejecutado |

## Fase 4 — Validador CLI

| # | Tarea | Estado |
|---|---|---|
| 4.1 | Implementar validate_templates.py | ✅ |
| 4.2 | Validar front matter (template_key, language, document_type) | ✅ |
| 4.3 | Detectar placeholders inconsistentes | ✅ |
| 4.4 | Integrar en CI pre-commit | 🔲 |

## Fase 5 — Seeds y storage

| # | Tarea | Estado |
|---|---|---|
| 5.1 | Implementar build_template_seed.py | ✅ |
| 5.2 | Implementar upload_template_assets.py | ⚠️ Requiere credenciales Supabase Storage |
| 5.3 | Crear bucket `dms-templates` (privado) en Supabase | ⚠️ Requiere acceso Supabase |
| 5.4 | Crear bucket `dms-documents` (privado) en Supabase | ⚠️ Requiere acceso Supabase |
| 5.5 | Crear bucket `dms-signed` (privado) en Supabase | ⚠️ Requiere acceso Supabase |

## Fase 6 — Contexto CRM y generación

| # | Tarea | Estado |
|---|---|---|
| 6.1 | Implementar dms_context_builder.py | ✅ |
| 6.2 | Resolver partes (buyer/seller/agent) desde CRM | ✅ |
| 6.3 | Resolver propiedad desde expediente | ✅ |
| 6.4 | Implementar dms_template_rendering.py con Jinja2 | ✅ |
| 6.5 | Renderizado a Markdown → DOCX (python-docx) | ✅ |
| 6.6 | Renderizado a PDF (weasyprint) | ✅ |

## Fase 7 — API de generación

| # | Tarea | Estado |
|---|---|---|
| 7.1 | `POST /api/dms/folders/{id}/generate-document` | ✅ |
| 7.2 | `GET /api/dms/folders/{id}/generate-document/missing-fields` | ✅ |
| 7.3 | `GET /api/dms/generated-documents` (listar por expediente) | ✅ |
| 7.4 | `GET /api/dms/generated-documents/{id}` | ✅ |
| 7.5 | Snapshot de variables en generación | ✅ |
| 7.6 | SHA-256 del contenido generado | ✅ |

## Fase 8 — Wizard UI

| # | Tarea | Estado |
|---|---|---|
| 8.1 | Componente GenerateDocumentWizard.tsx | ✅ |
| 8.2 | Step 1: Selección de plantilla | ✅ |
| 8.3 | Step 2: Campos faltantes con formulario inline | ✅ |
| 8.4 | Step 3: Generando / Hecho | ✅ |
| 8.5 | Integración en /dms/page.tsx | ✅ |
| 8.6 | Navegación a /dms/documents/{id} en éxito | ✅ |

## Fase 9 — Biblioteca de plantillas

| # | Tarea | Estado |
|---|---|---|
| 9.1 | Vista /dms/templates con listado de 18 familias | ✅ |
| 9.2 | Filtros por tipo e idioma | ✅ |
| 9.3 | Panel de detalle con versiones | ✅ |
| 9.4 | Flujo publicar / retirar con guards | ✅ |
| 9.5 | Vista de placeholders de cada plantilla | ✅ |

## Fase 10 — Visor y editor de documentos

| # | Tarea | Estado |
|---|---|---|
| 10.1 | Visor /dms/documents/[id] con metadata | ✅ |
| 10.2 | Listado de versiones con inmutabilidad | ✅ |
| 10.3 | Revisión jurídica inline | ✅ |
| 10.4 | Envío a firma con multi-signer | ✅ |
| 10.5 | Editor /dms/documents/[id]/edit | ✅ |
| 10.6 | Diff entre versiones | ✅ |
| 10.7 | Protección de versión firmada (inmutable) | ✅ |

## Fase 11 — Gates Advisor AI

| # | Tarea | Estado |
|---|---|---|
| 11.1 | Timeout → bloqueo (`gate_blocked_reason: timeout`) | ✅ |
| 11.2 | JSON inválido → `review_required` | ✅ |
| 11.3 | Placeholder pendiente `{{...}}` → bloqueo pre-AI | ✅ |
| 11.4 | Riesgo crítico → `block_signing=True` forzado | ✅ |
| 11.5 | Traducción divergente → bloqueo + acción requerida | ✅ |
| 11.6 | Fuentes RAG insuficientes → `human_review_recommended` | ✅ |

## Fase 12 — Revisión jurídica

| # | Tarea | Estado |
|---|---|---|
| 12.1 | `POST /api/dms/generated-documents/{id}/review-decisions` | ✅ |
| 12.2 | Decisiones ampliadas: approved, approved_with_conditions, review_required, changes_required, rejected | ✅ |
| 12.3 | `GET /api/dms/legal-review/queue` con filtro de estado | ✅ |
| 12.4 | Vista frontend /dms/legal-review | ✅ |
| 12.5 | Auto-review vía Advisor AI | ✅ |

## Fase 13 — Firma electrónica

| # | Tarea | Estado |
|---|---|---|
| 13.1 | `POST /api/dms/generated-documents/{id}/signature-flows` | ✅ |
| 13.2 | Multi-signer con `signing_level` | ✅ |
| 13.3 | Backward compat single-signer | ✅ |
| 13.4 | Webhook `POST /api/dms/webhooks/docuseal` | ✅ |
| 13.5 | HMAC verification de webhook | ✅ |
| 13.6 | Descarga PDF firmado → bucket `dms-signed` | 🔲 Requiere credenciales DocuSeal |
| 13.7 | Inmutabilidad tras firma (`immutable=True`) | ✅ |

## Fase 14 — Exportación dossier

| # | Tarea | Estado |
|---|---|---|
| 14.1 | `POST /api/dms/folders/{id}/exports` | ✅ |
| 14.2 | `GET /api/dms/folders/{id}/exports` | ✅ |
| 14.3 | `GET /api/dms/folders/{id}/exports/{export_id}` | ✅ |
| 14.4 | Generación asíncrona del ZIP con manifiesto SHA-256 | 🔲 Worker background pendiente |
| 14.5 | Estructura ZIP en 11 directorios | 🔲 Requiere Storage |
| 14.6 | Cifrado AES-256 opcional | 🔲 Requiere Storage |

## Fase 15 — Retención

| # | Tarea | Estado |
|---|---|---|
| 15.1 | Servicio `document_retention_service.py` | ✅ |
| 15.2 | `POST /api/internal/webhooks/dms-retention-sweep` | ✅ |
| 15.3 | Route API `/api/cron/dms-retention` (Next.js) | ✅ |
| 15.4 | Cron entry en vercel.json (03:00 UTC) | ✅ |
| 15.5 | Legal hold: bloqueo de archivado | ✅ |

## Fase 16 — Tests

| # | Tarea | Estado |
|---|---|---|
| 16.1 | 60 tests backend DMS/CLM | ✅ |
| 16.2 | 8 tests frontend wizard (`GenerateDocumentWizard.test.tsx`) | ✅ |
| 16.3 | Tests gates Advisor AI | ✅ |
| 16.4 | Catálogo 198 variantes sin warnings de paridad | ✅ |
| 16.5 | Lint, typecheck y build frontend | ✅ |

## Fase 17 — Documentación

| # | Tarea | Estado |
|---|---|---|
| 17.1 | `docs/DMS_CLM_ARCHITECTURE.md` | ✅ |
| 17.2 | `docs/DMS_TEMPLATE_GOVERNANCE.md` | ✅ |
| 17.3 | `docs/DMS_MULTILINGUAL_GOVERNANCE.md` | ✅ |
| 17.4 | `docs/DMS_DOCUMENT_LIFECYCLE.md` | ✅ |
| 17.5 | `docs/DMS_STORAGE_RETENTION_AND_LEGAL_HOLD.md` | ✅ |
| 17.6 | `docs/DMS_DOSSIER_EXPORT.md` | ✅ |
| 17.7 | `docs/DMS_SIGNATURE_WORKFLOW.md` | ✅ |
| 17.8 | `docs/DMS_TEMPLATE_ONBOARDING.md` | ✅ |
| 17.9 | `docs/DMS_OPERATIONS_RUNBOOK.md` | ✅ |
| 17.10 | `docs/QA_DMS_CLM_COMPLETE.md` | ✅ |
| 17.11 | `docs/DMS_CLM_THREAT_MODEL.md` | ✅ |
