---
template_key: informacion-privacidad-cliente
template_family: informacion-privacidad-cliente
ape_code: APE-PRIVACY-017
display_name: "Información de privacidad del cliente"
operation_type: general
phase: onboarding
jurisdiction: ES-IB
language: es
locale: es-ES
version: 0.1.0
status: draft
legal_review_status: pending
translation_status: approved_source
source_language: es
source_version: 0.1.0
brand: Anclora Private Estates
requires_legal_review: true
requires_advisor_validation: false
signable: true
system_template: true
storage_path: templates/es/tpl-informacion-privacidad-cliente.es.md
effective_from:
effective_until:
---

# Información sobre el Tratamiento de Datos Personales

**Organización:** {{ organization.legal_name }} · **Fecha:** {{ document.generated_at }}

De conformidad con el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos Personales y Garantía de los Derechos Digitales (LOPDGDD), le informamos del tratamiento de sus datos personales.

---

## 1. Responsable del tratamiento

| Campo | Detalle |
|---|---|
| Denominación social | {{ organization.legal_name }} |
| Nombre comercial | {{ organization.trade_name }} |
| NIF | {{ organization.tax_id }} |
| Domicilio | {{ organization.address }} |
| Email | {{ organization.email }} |
| Teléfono | {{ organization.phone }} |

---

## 2. Datos del interesado

| Dato | Valor |
|---|---|
| Nombre completo | {{ buyer.full_name }} |
| NIF/NIE/Pasaporte | {{ buyer.id_document }} |
| Email | {{ buyer.email }} |
| Teléfono | {{ buyer.phone }} |
| Domicilio | {{ buyer.address }} |

---

## 3. Finalidades del tratamiento

Sus datos personales serán tratados para las siguientes finalidades:

1. **Gestión de la relación comercial**: intermediación inmobiliaria, presentación de inmuebles, elaboración y firma de contratos.
2. **Cumplimiento de obligaciones legales**: identificación del cliente conforme a la Ley 10/2010 de prevención del blanqueo de capitales.
3. **Envío de comunicaciones comerciales**: información sobre inmuebles similares a su perfil de búsqueda, cuando haya prestado su consentimiento.

---

## 4. Base jurídica del tratamiento

| Finalidad | Base jurídica |
|---|---|
| Gestión comercial | Ejecución de contrato (art. 6.1.b RGPD) |
| Cumplimiento PBC | Obligación legal (art. 6.1.c RGPD) |
| Comunicaciones comerciales | Consentimiento (art. 6.1.a RGPD) |

---

## 5. Destinatarios de los datos

Sus datos podrán comunicarse a:

- Entidades financieras y notarías para formalización de contratos.
- Administraciones públicas cuando lo exija la normativa vigente.
- Proveedores de servicios técnicos bajo acuerdo de encargo de tratamiento.

No se realizarán transferencias internacionales de datos fuera del Espacio Económico Europeo sin garantías adecuadas.

---

## 6. Plazos de conservación

Los datos se conservarán mientras dure la relación contractual y, posteriormente, durante los plazos legalmente establecidos, mínimo 10 años para documentación PBC conforme al art. 25 Ley 10/2010.

---

## 7. Derechos del interesado

Puede ejercer sus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición dirigiéndose a {{ organization.email }} o a {{ organization.address }}, aportando copia de su documento identificativo.

Si considera que el tratamiento no es conforme con la normativa, puede presentar reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).

---

## 8. Consentimiento

Marcando la casilla correspondiente o firmando este documento, usted declara haber sido informado/a del tratamiento de sus datos personales y presta su consentimiento para las finalidades indicadas.

☐ **Consiento el envío de comunicaciones comerciales** sobre inmuebles y servicios de {{ organization.trade_name }}.

---

## 9. Firma del interesado

| Dato | Valor |
|---|---|
| Nombre | {{ buyer.full_name }} |
| Firma | __________________ |
| Fecha | {{ document.generated_at }} |

---

*{{ organization.legal_name }} — {{ organization.address }} — {{ organization.email }} — {{ organization.roaiib_number }}*

**AVISO LEGAL: Este documento es un borrador base sujeto a revisión jurídica. No constituye asesoramiento legal.**
