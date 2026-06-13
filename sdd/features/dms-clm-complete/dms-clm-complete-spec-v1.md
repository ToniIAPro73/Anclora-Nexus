# DMS/CLM Complete — Especificación v1

## Alcance

Módulo DMS/CLM de Anclora Nexus para Anclora Private Estates. Cubre el ciclo completo desde la creación del expediente hasta el archivo o exportación, incluyendo plantillas multilingüe, generación, validación, firma, retención y exportación del dossier.

---

## Requisitos funcionales

### RF-01 Expediente (Deal Folder)

- RF-01.1 El sistema DEBE requerir un cliente principal CRM para crear un expediente.
- RF-01.2 El sistema DEBE soportar los tipos de operación: `compraventa`, `captacion_intermediacion`, `alquiler_temporada`, `alquiler_residencial`, `alquiler_turistico`, `compliance`, `general`.
- RF-01.3 El expediente DEBE registrar idioma y jurisdicción.
- RF-01.4 El expediente DEBE soportar asociación condicional con una propiedad.
- RF-01.5 El sistema DEBE permitir añadir múltiples partes con roles distintos.

### RF-02 Partes del expediente

- RF-02.1 Roles soportados: buyer, seller, co_buyer, co_seller, landlord, tenant, guest, representative, attorney, company, beneficial_owner, lawyer, witness, agent, guarantor, notary.
- RF-02.2 Las partes DEBEN vincularse a entidades CRM (lead_id, seller_id, company_id, contact_id).
- RF-02.3 El sistema DEBE soportar un snapshot de datos de parte en el momento de generación del documento.

### RF-03 Catálogo de plantillas

- RF-03.1 El catálogo DEBE contener 18 familias canónicas.
- RF-03.2 El catálogo DEBE soportar 11 idiomas.
- RF-03.3 El endpoint de plantillas disponibles DEBE filtrar por: operation_type, phase, jurisdiction, language, status=published, legal_review_status=approved.
- RF-03.4 El sistema DEBE implementar fallback de idioma: expediente → cliente → español.
- RF-03.5 Las plantillas de sistema (`system_template=true`) NO DEBEN poder ser modificadas por usuarios.

### RF-04 Generación de documentos

- RF-04.1 El sistema DEBE autocompletar variables desde: expediente, cliente, partes, propiedad, organización, agente.
- RF-04.2 El sistema DEBE devolver lista de campos faltantes antes de generar.
- RF-04.3 El sistema DEBE generar snapshot de variables en el momento de generación.
- RF-04.4 El sistema DEBE generar DOCX y PDF con branding Anclora Private Estates.
- RF-04.5 El sistema DEBE calcular SHA-256 del documento generado.

### RF-05 Versionado de documentos

- RF-05.1 Cada edición material DEBE crear una nueva versión.
- RF-05.2 Las versiones enviadas a firma DEBEN ser inmutables.
- RF-05.3 El sistema DEBE soportar comparación de versiones (diff).

### RF-06 Validación Advisor AI

- RF-06.1 Un placeholder pendiente DEBE bloquear la firma.
- RF-06.2 Un riesgo crítico DEBE bloquear la firma.
- RF-06.3 Un fallo técnico del Advisor NUNCA aprueba automáticamente.
- RF-06.4 Una traducción divergente DEBE bloquear la firma.

### RF-07 Revisión jurídica humana

- RF-07.1 Una aprobación DEBE referirse a una versión concreta.
- RF-07.2 El sistema DEBE registrar: usuario, rol, versión, fecha, notas, condiciones.

### RF-08 Firma electrónica

- RF-08.1 Solo versiones aprobadas PUEDEN enviarse a firma.
- RF-08.2 El webhook DEBE verificarse con HMAC.
- RF-08.3 El PDF firmado, certificado y evidencia DEBEN guardarse.
- RF-08.4 La versión firmada DEBE marcarse como inmutable.
- RF-08.5 El nivel de firma DEBE registrarse: simple, advanced, qualified, unknown.

### RF-09 Almacenamiento

- RF-09.1 Los binarios DEBEN guardarse en Object Storage privado.
- RF-09.2 PostgreSQL SÓLO guarda metadatos, rutas y hashes.
- RF-09.3 Los storage_path NO DEBEN exponerse directamente al cliente.
- RF-09.4 Las URLs de descarga DEBEN ser temporales.

### RF-10 Exportación del dossier

- RF-10.1 El ZIP DEBE incluir manifiesto con SHA-256 por archivo.
- RF-10.2 El cifrado AES-256 DEBE ser opcional.
- RF-10.3 La contraseña NUNCA DEBE registrarse.
- RF-10.4 El ZIP temporal DEBE eliminarse tras descarga o caducidad.
- RF-10.5 Toda descarga de exportación DEBE generar auditoría.

### RF-11 Retención

- RF-11.1 Las políticas DEBEN definirse por tipo de documento, operación y jurisdicción.
- RF-11.2 Un legal hold DEBE impedir el borrado.
- RF-11.3 Los documentos firmados NO DEBEN eliminarse por cron sin revisión.
- RF-11.4 Toda eliminación DEBE generar auditoría.

---

## Requisitos no funcionales

### RNF-01 Multitenancy

- Todos los recursos DEBEN estar aislados por org_id.
- RLS DEBE estar activo en todas las tablas DMS.

### RNF-02 Seguridad

- La validación MIME y límites de tamaño DEBEN aplicarse en subida.
- No DEBEN registrarse secretos en logs.
- Las rutas de almacenamiento NO DEBEN ser predecibles.

### RNF-03 Trazabilidad

- Toda acción sobre documentos DEBE registrarse en auditoría.
- Los registros de auditoría DEBEN incluir hash, no texto completo.

### RNF-04 Internacionalización jurídica

- Las variantes no españolas DEBEN mantener jurisdicción ES-IB.
- Las traducciones automáticas DEBEN requerir revisión antes de publicar.
- Los documentos bilingües (ES + idioma cliente) DEBEN ser posibles pero no por defecto.
