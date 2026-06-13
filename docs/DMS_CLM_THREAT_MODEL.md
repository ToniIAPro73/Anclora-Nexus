# DMS/CLM Threat Model

**Módulo:** Análisis de amenazas — Gestión Documental y Contractual  
**Metodología:** STRIDE  
**Última actualización:** 2026-06-14

---

## Activos críticos

| Activo | Descripción | Impacto si comprometido |
|---|---|---|
| Contratos firmados (PDFs) | Documentos con firma electrónica | Muy alto — evidencia legal |
| Variable snapshots (JSONB) | Datos de partes, propiedad, precio | Alto — datos personales + financieros |
| Plantillas canónicas | Ficheros Markdown en Storage | Medio — pérdida de propiedad intelectual |
| Firma HMAC webhook | Secreto `DOCUSEAL_WEBHOOK_SECRET` | Alto — falsificación de estado de firma |
| API key interna | `NEXUS_INTERNAL_API_KEY` | Medio — puede disparar sweeps no autorizados |
| Advisor AI response | Datos de validación jurídica | Medio — decisiones incorrectas de bloqueo |

---

## Análisis STRIDE

### S — Spoofing (Suplantación de identidad)

| Amenaza | Vector | Mitigación |
|---|---|---|
| Suplantación de DocuSeal webhook | POST a `/api/dms/webhooks/docuseal` con payload falso | HMAC-SHA256 con `DOCUSEAL_WEBHOOK_SECRET`; `401` si la firma no coincide |
| Acceso no autorizado a documentos | API sin auth | Supabase RLS por `org_id` + `verify_org_membership` en todos los endpoints |
| Suplantación de llamada a Advisor AI | Respuesta manipulada del servicio | SAFE_FAILURE_RESULT bloquea si la respuesta es inválida; gates no confían en el AI ciegamente |
| Uso del endpoint interno sin API key | POST a `/api/internal/*` | `NEXUS_INTERNAL_API_KEY` en header `Authorization: Bearer` |

### T — Tampering (Manipulación de datos)

| Amenaza | Vector | Mitigación |
|---|---|---|
| Modificar contrato firmado | Editar `document_versions` donde `immutable=True` | Inmutabilidad a nivel de aplicación + RLS; una vez `signed`, el editor bloquea edición |
| Alterar hash SHA-256 de plantilla | UPDATE directo a `content_md5` | RLS; el campo se recalcula en cada upload; manifiesto firmado |
| Manipular variable snapshot post-generación | UPDATE directo al JSONB | RLS; snapshot es append-only al momento de generación |
| Interceptar y modificar PDF firmado | MITM entre DocuSeal y Nexus | HTTPS obligatorio; el webhook incluye URL de descarga firmada |
| Inyección en placeholders de plantilla | `{{usuario_input}}` con contenido malicioso | Jinja2 con autoescape; los valores provienen del CRM, no de input directo del usuario |

### R — Repudiation (Repudio)

| Amenaza | Vector | Mitigación |
|---|---|---|
| Negar haber iniciado una firma | No hay log del trigger | `audit_trail` registra `initiated_by` + timestamp en `document_signature_flows` |
| Negar haber aprobado un contrato | No hay log de la decisión | `legal_review_decisions` registra `reviewer_id` + `decided_at` + `notes` |
| Negar haber generado un documento | No hay trazabilidad | `generated_documents.created_by` + audit log en `dossier_exports` |

### I — Information Disclosure (Divulgación de información)

| Amenaza | Vector | Mitigación |
|---|---|---|
| Acceso a documentos de otra org | Sin RLS adecuada | `eq("org_id", org_id)` en cada query; Supabase RLS como segunda capa |
| Exposición de URLs permanentes de Storage | URL pública hardcodeada | Todas las URLs son firmadas temporales (1h); no se exponen rutas base |
| Datos personales en logs | `console.log(variable_snapshot)` | Los logs de producción no incluyen JSONB de partes; solo IDs y estados |
| Exposición del secreto HMAC | Secreto en variable de entorno | `DOCUSEAL_WEBHOOK_SECRET` solo en variables de entorno server-side; nunca en cliente |
| Secretos en repositorio | `.env` commiteado | `.gitignore` bloquea `.env*`; secrets en Vercel + Supabase Dashboard |

### D — Denial of Service (Denegación de servicio)

| Amenaza | Vector | Mitigación |
|---|---|---|
| Flood del webhook DocuSeal | Miles de POSTs al endpoint | Rate limiting en Vercel (plan Pro); HMAC filtra payloads inválidos |
| Generación masiva de documentos | Loop de API de generación | Rate limit por org en `POST /generate-document` (implementar) |
| Cron de retención bloqueante | Sweep con millones de documentos | Procesamiento por org con `asyncio`; timeout de 55s en cron route |
| ZIP export para expediente gigante | 1000 documentos → OOM | Límite de tamaño en el worker (pendiente); timeout de 5 min |

### E — Elevation of Privilege (Escalada de privilegios)

| Amenaza | Vector | Mitigación |
|---|---|---|
| Usuario con rol `viewer` publica plantilla | Falta de check de rol | `require_dms_membership` verifica role mínimo; publish requiere `manager` o `admin` |
| Usuario de otra org accede a plantillas privadas | Cross-org query | RLS por `org_id` + filtro explícito en cada endpoint |
| Cron key usada para modificar datos de usuario | Endpoint interno sobre-permisivo | Los endpoints `/api/internal/*` solo hacen sweeps de mantenimiento; no exponen datos de usuario |
| Advisor AI sugiere aprobar sin revisión real | AI siempre aprueba con confidence 1.0 | Gates post-AI son independientes del AI; critical risk y divergencia fuerzan bloqueo |

---

## Controles de seguridad implementados

| Control | Estado | Ubicación |
|---|---|---|
| Autenticación JWT (Supabase Auth) | ✅ Activo | Todos los endpoints `/api/dms/*` |
| Autorización por org (RLS) | ✅ Activo | Supabase + `verify_org_membership` |
| HMAC webhook DocuSeal | ✅ Activo | `backend/api/routes/dms.py` |
| API key interna (Bearer) | ✅ Activo | `backend/api/internal_webhooks.py` |
| HTTPS | ✅ Activo | Vercel (forced) |
| URLs de storage temporales | ✅ Activo | `createSignedUrl(path, 3600)` |
| Inmutabilidad post-firma | ✅ Activo | `document_versions.immutable` |
| Gate de placeholder pendiente | ✅ Activo | `_pre_validate()` en advisor service |
| Gate de riesgo crítico | ✅ Activo | `_apply_post_gates()` |
| Gate de timeout | ✅ Activo | `httpx.TimeoutException` catch |
| Sin secretos en código | ✅ Activo | Variables de entorno en `.env` |

---

## Riesgos residuales aceptados

| Riesgo | Impacto | Probabilidad | Decisión |
|---|---|---|---|
| Advisor AI no disponible → bloqueo total de revisión automática | Alto | Bajo | Aceptado — el sistema cae a revisión manual |
| DocuSeal cloud comprometido | Muy alto | Muy bajo | Aceptado — DocuSeal tiene SOC 2; alternativa: auto-hosted |
| Brecha en Supabase Storage | Alto | Muy bajo | Aceptado — documentos privados; URLs temporales limitan exposición |
| ZIP export sin cifrar por defecto | Medio | Bajo | Aceptado — cifrado disponible como opción; responsabilidad del usuario activarlo |

---

## Recomendaciones pendientes

1. **Rate limiting** en `POST /api/dms/folders/{id}/generate-document` por org (evitar abuso)
2. **Penetration test** antes de producción en los endpoints de generación y firma
3. **Audit log inmutable** — considerar escribir el audit trail en Supabase con `INSERT ONLY` (sin UPDATE/DELETE)
4. **DocuSeal self-hosted** — evaluar si el volumen de contratos justifica auto-hosting para control total del PDF firmado
5. **Cifrado en reposo** de `variable_snapshot` y `generation_payload` (datos sensibles de las partes)
6. **2FA obligatorio** para usuarios con rol `admin` o `manager` en organizaciones con contratos de alto valor
