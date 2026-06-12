# QA Real Estate DMS Module

Fecha: 2026-06-12

## Archivos modificados

- `.env.example`
- `backend/config.py`
- `backend/models/dms.py`
- `backend/api/routes/dms.py`
- `backend/services/advisor_contract_validator_service.py`
- `backend/tests/test_dms_routes.py`
- `backend/tests/test_dms_advisor_validator.py`
- `backend/tests/test_dms_document_lifecycle.py`
- `frontend/src/lib/dms-api.ts`
- `frontend/src/app/(dashboard)/dms/page.tsx`
- `frontend/src/components/layout/Sidebar.tsx`
- `docs/REAL_ESTATE_DMS_MODULE.md`
- `docs/REAL_ESTATE_DOCUMENT_CHECKLISTS.md`
- `docs/QA_REAL_ESTATE_DMS_MODULE.md`

## Cobertura funcional

- Documentacion funcional del DMS creada.
- Checklist documental inicial para Espana / Baleares creado.
- Variables DMS, DocuSeal y Advisor AI documentadas sin secretos.
- Endpoint `POST /api/dms/documents/{document_id}/validate` creado.
- Servicio `AdvisorContractValidatorService` creado con timeout, auth interna y fallback seguro.
- Upload endurecido con validacion de folder/org, MIME, tamano, SHA-256 y cifrado.
- Download verifica org/membership y no expone `storage_path` en workspace.
- Signature flow bloquea documentos `rejected` e inmutables.
- Webhook DocuSeal verifica HMAC y marca firmado/inmutable.
- UI DMS accesible desde sidebar con crear expediente, subir, validar y enviar a firma.
- Cliente frontend `frontend/src/lib/dms-api.ts` creado.

## Tests ejecutados

```bash
backend/.venv/bin/pytest backend/tests/test_dms_encryption.py backend/tests/test_dms_routes.py backend/tests/test_dms_advisor_validator.py backend/tests/test_dms_document_lifecycle.py -q
```

Resultado: OK, 17 passed.

```bash
cd frontend && npm run lint
```

Resultado: OK.

```bash
cd frontend && npx tsc --noEmit
```

Resultado: OK.

```bash
backend/.venv/bin/pytest backend/tests -q
```

Resultado: 675 passed, 2 failed.

Fallos no relacionados con DMS:

- `backend/tests/test_automation_service.py::test_reconcile_operational_alerts_resolves_missing_candidates`
- `backend/tests/test_cloud_ops_service.py::test_cloud_ops_summary_reports_runtime_and_heartbeats`

Ambos fallan en expectativas de alertas/heartbeats cloud/territoriales existentes; no tocan DMS.

```bash
backend/.venv/bin/pytest -q
```

Resultado: fallo de collection preexistente por colision de nombre:

- `backend/tests/test_fsbo_scraper.py`
- `ops/test_fsbo_scraper.py`

Pytest importa ambos como `test_fsbo_scraper`.

```bash
cd frontend && npm run typecheck
cd frontend && npm test
```

Resultado: no existen scripts `typecheck` ni `test` en `frontend/package.json`. Equivalente ejecutado: `npx tsc --noEmit`.

## Decisiones tecnicas

- Se mantuvieron rutas existentes (`/api/dms/folders`, `/api/dms/documents/upload`, `/api/dms/folders/{folder_id}/documents`, `/api/dms/webhooks/docuseal`).
- Se anadio validacion Advisor AI sin bloquear todo el DMS si Advisor no responde.
- Advisor caido deja `compliance_status=pending`, salvo que haya `block_signing=true`.
- Se usa stream autenticado para download; signed URL queda como mejora futura.
- El flujo DocuSeal crea un envelope placeholder `pending-*`; llamada real al proveedor queda pendiente para no introducir credenciales ni llamadas externas.
- La UI usa acciones directas y estados visibles, sin pantalla de marketing.

## Riesgos y pendientes

- Falta integracion real DocuSeal API para crear envelope/template.
- Falta tabla de checklist documental operativo para bloquear faltantes criticos por `operation_type`.
- Parser avanzado depende de MinerU y puede estar desactivado.
- El stream de descarga debe evolucionar a URL temporal si Supabase Storage lo soporta en produccion.
- No se anadieron tests frontend porque el repo no define script `test`; se verifico lint y typecheck directo.
- Memanto remoto sigue limitado por Moorcheh 429, por lo que no se pudo guardar cierre persistente.

## Como probar manualmente

1. Configurar `NEXUS_DOCUMENT_ENCRYPTION_KEY` con 32 bytes hex.
2. Configurar `NEXUS_DMS_BUCKET`.
3. Levantar backend y frontend.
4. Entrar en dashboard y abrir `DMS`.
5. Crear expediente de compraventa.
6. Subir un PDF permitido.
7. Validar con Advisor AI.
8. Verificar estado `approved`, `pending` o `rejected`.
9. Confirmar que `rejected` deshabilita/impide firma.
10. Simular webhook DocuSeal con HMAC valido y verificar documento inmutable.

## Limitaciones legales

El checklist y la validacion automatica no sustituyen revision de abogado, notaria, gestoria ni asesor especializado. En produccion, cada checklist debe validarse por jurisdiccion, tipo de operacion y normativa vigente.
