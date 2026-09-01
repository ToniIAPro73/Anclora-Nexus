# Real Estate Document Checklists

Mapa documental inicial para Espana / Baleares. No es asesoramiento legal definitivo. Validar con abogado, notaria, gestoria o asesor especializado antes de produccion.

## Compraventa

| Fase | Documento | Obligatorio | Responsable | Vigencia sugerida | Riesgo si falta | Categoria DMS | Firma | Advisor AI | Notas |
|---|---|---:|---|---|---|---|---|---|---|
| Captacion | Nota simple registral | Si | Agente/seller | 30 dias | Cargas o titularidad no verificadas | `nota_simple` | No | Si | Actualizar antes de arras/firma. |
| Captacion | Escritura propiedad | Si | Seller | Sin caducidad | Falta cadena de titularidad | `escritura_propiedad` | No | Si | Contrastar con registro. |
| Comercial | Certificado energetico | Si | Seller | Segun certificado | Sancion o bloqueo comercial | `certificado_energetico` | No | No | Obligatorio para oferta/venta. |
| Precontrato | Contrato de arras | Recomendado | Agencia/abogado | Hasta firma | Clausulas abusivas o incompletas | `arras_penitenciales` | Si | Si | Bloquear firma si Advisor marca riesgo critico. |
| Cierre | Certificado comunidad/deuda | Si si aplica | Seller/administrador | 30 dias | Deudas ocultas | `certificado_comunidad` | No | No | Pedir antes de notaria. |

## Alquiler de temporada

| Fase | Documento | Obligatorio | Responsable | Vigencia sugerida | Riesgo si falta | Categoria DMS | Firma | Advisor AI | Notas |
|---|---|---:|---|---|---|---|---|---|---|
| Preparacion | Contrato temporada | Si | Agencia/propietario | Por contrato | Recalificacion como vivienda habitual | `contrato_temporada` | Si | Si | Justificar causa temporal. |
| Preparacion | DNI/NIE/Pasaporte inquilino | Si | Cliente | Vigente | KYC incompleto | `dni_nie_pasaporte` | No | No | Minimizar datos y acceso. |
| Cierre | Inventario/anexos | Recomendado | Propietario | Por contrato | Disputas de deposito | `contrato_temporada` | Si | Si | Adjuntar al contrato. |

## Alquiler turistico

| Fase | Documento | Obligatorio | Responsable | Vigencia sugerida | Riesgo si falta | Categoria DMS | Firma | Advisor AI | Notas |
|---|---|---:|---|---|---|---|---|---|---|
| Licencia | DRIAT/ETV o titulo habilitante | Si | Propietario | Vigente | Actividad no autorizada | `driat_etv` | No | Si | Especialmente critico en Baleares. |
| Comercial | Certificado energetico | Si | Propietario | Segun certificado | Incumplimiento comercial | `certificado_energetico` | No | No | Revisar normativa aplicable. |
| Operativa | Normas de uso/contrato estancia | Recomendado | Agencia | Por temporada | Conflictos y reclamaciones | `contrato_temporada` | Si | Si | Coordinar con PMS/GuestHub si aplica. |

## Onboarding/KYC cliente individual

| Fase | Documento | Obligatorio | Responsable | Vigencia sugerida | Riesgo si falta | Categoria DMS | Firma | Advisor AI | Notas |
|---|---|---:|---|---|---|---|---|---|---|
| Alta | DNI/NIE/Pasaporte | Si | Cliente | Vigente | Identidad no verificada | `dni_nie_pasaporte` | No | No | Custodia con acceso minimo. |
| Alta | Encargo/mandato | Recomendado | Cliente/agencia | Por relacion | Falta autorizacion operativa | `contrato_compraventa` | Si | Si | Revisar alcance y honorarios. |
| Compliance | Declaracion titularidad fondos | Segun caso | Cliente | 12 meses | Riesgo AML/KYC | `kyc_cliente` | Si | No | Coordinar con asesoria. |

## Onboarding/KYC sociedad

| Fase | Documento | Obligatorio | Responsable | Vigencia sugerida | Riesgo si falta | Categoria DMS | Firma | Advisor AI | Notas |
|---|---|---:|---|---|---|---|---|---|---|
| Alta | Escritura constitucion/poderes | Si | Sociedad | Vigente | Firmante sin poder suficiente | `kyc_cliente` | No | Si | Confirmar poderes actuales. |
| Alta | CIF/VAT y datos registrales | Si | Sociedad | Vigente | Identificacion incompleta | `kyc_cliente` | No | No | Verificar registro mercantil. |
| Compliance | Titularidad real | Si | Sociedad | 12 meses | Riesgo AML | `kyc_cliente` | Si | No | Requiere validacion especializada. |

## Postfirma / archivo

| Fase | Documento | Obligatorio | Responsable | Vigencia sugerida | Riesgo si falta | Categoria DMS | Firma | Advisor AI | Notas |
|---|---|---:|---|---|---|---|---|---|---|
| Archivo | Contrato firmado | Si | Agencia/proveedor firma | Permanente | Perdida de evidencia contractual | `documento_firmado` | No | No | Debe ser inmutable. |
| Archivo | Justificante pago/senal | Segun caso | Cliente/agencia | Permanente | Disputa economica | `certificado_deuda_cero` | No | No | Asociar a expediente. |
| Cierre | Acta de entrega/llaves | Recomendado | Agencia | Permanente | Disputas postfirma | `documento_firmado` | Si | No | Adjuntar inventario si alquiler. |
