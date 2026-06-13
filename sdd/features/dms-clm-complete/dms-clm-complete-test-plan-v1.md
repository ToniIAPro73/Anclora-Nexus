# DMS/CLM Complete — Plan de Tests v1

**Feature:** `dms-clm-complete`  
**Última actualización:** 2026-06-14

---

## Estrategia de cobertura

| Capa | Herramienta | Cobertura objetivo |
|---|---|---|
| Backend (Python) | Pytest + FastAPI TestClient | Rutas, servicios, gates |
| Frontend (React/TS) | Vitest + React Testing Library | Componentes y flujos UI |
| Integración E2E | Playwright (si aplica) | Flujo crítico DMS |
| Catálogo | validate_templates.py | 198 variantes Markdown |

---

## Suites de tests backend existentes

### `test_dms_clm_features.py` (17 tests) ✅

| Test | Qué verifica |
|---|---|
| `test_review_decision_all_valid_values_accepted[approved]` | Decisión "approved" aceptada |
| `test_review_decision_all_valid_values_accepted[approved_with_conditions]` | Decisión "approved_with_conditions" aceptada |
| `test_review_decision_all_valid_values_accepted[review_required]` | Decisión "review_required" aceptada |
| `test_review_decision_all_valid_values_accepted[changes_required]` | Decisión "changes_required" aceptada |
| `test_review_decision_all_valid_values_accepted[rejected]` | Decisión "rejected" aceptada |
| `test_review_decision_invalid_value_rejected` | Decisión desconocida → 422 |
| `test_rejected_decision_blocks_signing` | Rejected/changes/review → `block_signing=True` |
| `test_approved_with_conditions_does_not_block_signing` | approved_with_conditions → `block_signing=False` |
| `test_signature_flow_clm_payload_accepted` | Payload CLM multi-signer aceptado → 201 |
| `test_signature_flow_legacy_single_signer_still_accepted` | Payload legacy single-signer → 201 |
| `test_signature_flow_rejected_document_blocked` | Documento en review_required → 409 |
| `test_legal_review_queue_returns_list` | GET /legal-review/queue devuelve lista enriquecida |
| `test_legal_review_queue_filtered_by_status` | Filtro `status=pending` se propaga a la query |
| `test_docuseal_webhook_clm_completed_marks_document_signed` | Webhook completed → status=signed en documento |
| `test_docuseal_webhook_invalid_sig_returns_401` | Firma HMAC inválida → 401 |
| `test_retention_sweep_requires_api_key` | Sin API key → 403 |
| `test_retention_sweep_with_valid_key` | Con API key → sweep ejecutado, orgs procesadas |

### Otros suites backend DMS existentes ✅

- `test_dms_routes.py`
- `test_dms_template_library.py`
- `test_dms_generation_service.py`
- `test_dms_document_lifecycle.py`
- `test_dms_advisor_validator.py`
- `test_dms_legal_review_validator.py`
- `test_dms_encryption.py`

Validación final ejecutada sobre los 8 módulos anteriores:

```text
60 passed, 14 warnings
```

---

## Suites de tests frontend existentes

### `GenerateDocumentWizard.test.tsx` (8 tests) ✅

| Test | Qué verifica |
|---|---|
| Renders step 1 on open | Wizard muestra selección de plantilla |
| Next button disabled until template selected | Guardián UX |
| Advances to step 2 after selecting | Navegación entre steps |
| Generate button disabled when missing fields unfilled | Guardián de campos |
| Generate button enabled after all fields filled | Habilitación al completar |
| Calls generateDocument with correct payload + fires onSuccess | Happy path completo |
| Closes when X button is clicked | Cierre del modal |
| Shows empty state when no templates | Estado vacío |

---

## Tests de gates Advisor AI (nuevos)

Los siguientes escenarios deben cubrirse en `test_dms_advisor_validator.py`:

| Escenario | Comportamiento esperado |
|---|---|
| Texto con `{{placeholder_sin_completar}}` | `block_signing=True`, `gate_blocked_reason=pending_placeholders` |
| Timeout en llamada a Advisor AI | `block_signing=True`, `gate_blocked_reason=timeout`, `advisor_available=False` |
| Advisor AI devuelve lista en lugar de objeto JSON | `block_signing=True`, `gate_blocked_reason=invalid_json_shape` |
| AI devuelve `risk_level=critical` | `block_signing=True` forzado por gate, `gate_flags` incluye `critical_risk` |
| AI devuelve >10 diferencias críticas | `block_signing=True`, `gate_flags` incluye `divergent_translation` |
| AI devuelve `rag_sources_used=0` | `human_review_recommended=True`, `gate_flags` incluye `insufficient_rag_sources` |
| AI devuelve `rag_sources_used=3` | Sin flags de RAG |
| Happy path (aprobado, sin flags) | `block_signing=False`, `advisor_available=True` |

---

## Checklist de validación de catálogo

Ejecutar: `python backend/seeds/validate_templates.py`

| Check | Criterio de éxito |
|---|---|
| 198 ficheros presentes | 18 familias × 11 idiomas |
| Front matter YAML válido | `template_key`, `language`, `document_type` presentes |
| `template_key` único por idioma | Sin duplicados |
| Placeholders en snake_case | Regex `\{\{[a-z][a-z0-9_.]*\}\}` |
| Sin `{{...}}` sin cerrar | Regex para detectar marcadores rotos |
| Paridad de traducciones | 0 advertencias de placeholders entre idiomas |

---

## Criterios de aceptación de tests

1. Todos los tests backend DMS/CLM pasan: 60 tests verificados
2. Todos los tests frontend pasan: `npx vitest run src/components/dms/`
3. validate_templates.py sale con código 0 y 0 advertencias
4. Typecheck TypeScript limpio: `npx tsc --noEmit`
5. Sin errores de lint: `npx eslint src/`
6. Build de producción Next.js completo: `npm run build`

---

## Plan de E2E (si Playwright disponible)

```
Flujo: Generar → Revisar → Firmar

1. Navegar a /dms
2. Abrir wizard, seleccionar plantilla "Arras penitenciales"
3. Rellenar campos faltantes
4. Generar documento → verificar redirección a /dms/documents/{id}
5. Enviar a revisión jurídica
6. Aprobar revisión
7. Iniciar flujo de firma (mock DocuSeal)
8. Simular webhook de firma completada
9. Verificar estado "signed" en el documento
```
