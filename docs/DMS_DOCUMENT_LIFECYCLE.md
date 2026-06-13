# DMS Document Lifecycle

**Módulo:** Ciclo de vida de documentos generados  
**Última actualización:** 2026-06-14

---

## Estados de un documento generado

```
[draft] ──────────────────────────────────────────────────────────────┐
  │                                                                    │
  ├─ Auto-review (Advisor AI)                                          │
  │    ├─ OK → [approved]                                              │
  │    └─ Risk / Timeout → [review_required]                          │
  │                                                                    │
  ├─ Manual review decision                                            │
  │    ├─ approved / approved_with_conditions → [approved]            │
  │    └─ rejected / changes_required / review_required → [review_required]│
  │                                                                    │
  ├─ Signature flow initiated (requiere status=approved)               │
  │    └─ DocuSeal webhook: submission.completed → [signed]           │
  │                                                                    │
  └─ Retention sweep → [archived]                                      │
         │                                                             │
         └─ (solo si no hay legal hold activo)                        │
                                                                       │
[review_required] ─ edit → [draft] ─────────────────────────────────┘
```

---

## Transiciones de estado

| Origen | Destino | Trigger |
|---|---|---|
| `draft` | `review_required` | Auto-review blocks signing / Advisor timeout |
| `draft` | `approved` | Auto-review OK o manual approval |
| `review_required` | `approved` | Manual review: approved / approved_with_conditions |
| `review_required` | `draft` | Usuario edita el documento (nueva versión) |
| `approved` | `signed` | Webhook DocuSeal `submission.completed` |
| `approved` | `review_required` | Manual review: changes_required |
| `any` | `archived` | Retention sweep (superado plazo de retención) |

---

## Versionado incremental

Cada edición del documento crea una nueva `document_version` sin eliminar las anteriores:

```
document_versions
  v1 (initial generation) — content_md5: abc123
  v2 (manual edit)        — content_md5: def456
  v3 (post-review edit)   — content_md5: ghi789  ← current
```

- El campo `generated_documents.current_version_id` apunta siempre a la última versión
- Las versiones firmadas tienen `immutable = True` — no se puede crear v(n+1) sobre una versión firmada
- El editor en `/dms/documents/[id]/edit` muestra historial de versiones con diff entre ellas

---

## Inmutabilidad post-firma

Cuando el webhook de DocuSeal confirma `submission.completed`:
1. Se actualiza `document_versions.immutable = True` en la versión firmada
2. Se actualiza `generated_documents.status = 'signed'`
3. El PDF firmado se descarga de DocuSeal y se almacena en el bucket `dms-signed`
4. El editor bloquea cualquier edición futura con un aviso visual

---

## Revisión jurídica

### Revisión automática (Advisor AI)
- Trigger: botón "Revisar" en el visor de documento
- Endpoint: `POST /api/dms/generated/{id}/review/auto`
- Servicio: `advisor_contract_validator_service.validate_legal_document()`
- Gates aplicados (bloquean firma automáticamente):
  - Placeholder `{{...}}` sin resolver en el texto
  - Timeout de llamada al AI
  - Respuesta JSON inválida
  - `risk_level = critical`
  - Más de 5 diferencias críticas respecto al canónico
- Flags no bloqueantes:
  - `rag_sources_used < 2` → `human_review_recommended = True`

### Revisión manual
- Endpoint: `POST /api/dms/generated-documents/{id}/review-decisions`
- Decisiones válidas: `approved`, `approved_with_conditions`, `review_required`, `changes_required`, `rejected`
- La decisión `approved_with_conditions` no bloquea la firma pero queda registrada
- Las decisiones `rejected`, `changes_required`, `review_required` bloquean la firma

---

## Cola de revisión jurídica

La vista `/dms/legal-review` muestra los documentos en estado `review_required` pendientes de decisión manual.

Endpoint: `GET /api/dms/legal-review/queue?status=pending&limit=50`

---

## Auditoría

Cada acción sobre el documento queda registrada en el campo `audit_trail` (JSONB) de la tabla correspondiente:

```json
[
  { "event": "dms_document_generated", "user_id": "...", "at": "2026-06-14T10:00:00Z" },
  { "event": "dms_review_auto", "decision": "review_required", "risk_level": "high", "at": "..." },
  { "event": "dms_review_manual", "decision": "approved_with_conditions", "reviewer": "...", "at": "..." },
  { "event": "dms_signature_sent", "envelope_id": "...", "signers": [...], "at": "..." },
  { "event": "dms_signature_completed", "signed_by": "...", "ip": "...", "at": "..." }
]
```
