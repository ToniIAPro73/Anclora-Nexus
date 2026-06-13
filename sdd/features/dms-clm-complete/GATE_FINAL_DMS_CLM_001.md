# Gate de Aceptación Final — DMS/CLM Complete

## Catálogo

- [x] 18 familias canónicas estructuradas
- [x] 11 idiomas con front matter correcto
- [x] 198 variantes registrables
- [x] Sin duplicados de template_key
- [x] Placeholders consistentes y sin advertencias de paridad
- [x] Seeds idempotentes
- [x] Plantillas de usuario preservadas (system_template flag)

## Expedientes

- [x] Cliente principal obligatorio
- [x] Partes CRM vinculadas
- [x] Propiedad condicional completa
- [x] Idioma y jurisdicción en expediente
- [x] Checklist documental por operación

## Generación

- [x] Catálogo filtrado por todos los criterios RF-03.3
- [x] Autocompletado desde CRM y expediente
- [x] Devolución de campos faltantes
- [ ] DOCX con branding (requiere plantilla Word base)
- [ ] PDF con branding (requiere configuración WeasyPrint/runtime)
- [x] Snapshot de variables
- [x] SHA-256 calculado y guardado

## Ciclo contractual

- [x] Visor de documento generado
- [x] Editor con protección de versión firmada
- [x] Versionado incremental
- [x] Diff entre versiones
- [x] Integración Advisor AI con bloqueos
- [x] Cola de revisión jurídica humana
- [ ] Firma electrónica real (requiere credenciales DocuSeal)
- [x] Inmutabilidad tras firma

## Archivo

- [ ] Storage privado configurado (requiere credenciales)
- [x] Descarga individual con URL temporal
- [ ] Exportación ZIP completa
- [x] Manifiesto con SHA-256
- [ ] Cifrado ZIP opcional
- [x] Auditoría de exportación
- [x] Retención por tipo
- [x] Legal hold

## Calidad

- [x] Backend tests DMS pasan
- [x] Frontend typecheck limpio
- [x] Lint
- [x] Typecheck frontend
- [x] Build producción
- [x] Documentación completa
- [x] Threat model
- [x] Sin secretos en repo
- [x] Sin regresiones en rutas existentes

## Pendientes que requieren intervención externa

- Credenciales DocuSeal para firma real
- Configuración Object Storage (Supabase Storage / S3)
- Revisión jurídica humana de las 18 plantillas ES
- Validación y publicación de variantes multilingüe
- Plazos de retención validados por asesor legal
