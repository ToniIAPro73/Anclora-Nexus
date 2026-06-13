---
template_key: declaracion-origen-fondos
template_family: declaracion-origen-fondos
ape_code: APE-COMPLIANCE-SOF-018
display_name: "Declaración de origen de fondos"
operation_type: general
phase: precontractual
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
requires_advisor_validation: true
signable: true
system_template: true
storage_path: templates/es/tpl-declaracion-origen-fondos.es.md
effective_from:
effective_until:
---

# Declaración de Origen de Fondos

**Organización:** {{ organization.legal_name }} · **Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

En cumplimiento de la Ley 10/2010, de 28 de abril, de prevención del blanqueo de capitales y de la financiación del terrorismo, y su Reglamento de desarrollo, el/la abajo firmante declara bajo su responsabilidad el origen de los fondos destinados a la operación inmobiliaria de referencia.

---

## 1. Datos del declarante

| Dato | Valor |
|---|---|
| Nombre completo | {{ buyer.full_name }} |
| NIF/NIE/Pasaporte | {{ buyer.id_document }} |
| Nacionalidad | {{ buyer.nationality }} |
| Domicilio | {{ buyer.address }} |
| Email | {{ buyer.email }} |
| Teléfono | {{ buyer.phone }} |
| Es persona jurídica | {{ buyer.is_company }} |
| Denominación social (si procede) | {{ buyer.company_name }} |
| CIF (si procede) | {{ buyer.company_cif }} |

---

## 2. Operación de referencia

| Dato | Valor |
|---|---|
| Tipo de operación | {{ deal.operation_type }} |
| Inmueble | {{ property.address }}, {{ property.municipality }} |
| Precio acordado | {{ deal.price }} EUR |
| Señal o arras aportada | {{ deal.deposit_amount }} EUR |

---

## 3. Origen de los fondos

Marque la/s fuente/s que corresponda/n y proporcione la documentación acreditativa:

☐ **Ahorros personales / cuenta bancaria propia**  
Entidad bancaria: {{ sof.bank_name }} — Cuenta: {{ sof.bank_account_last4 }}

☐ **Venta de inmueble**  
Referencia: {{ sof.property_sale_reference }} — Fecha: {{ sof.property_sale_date }}

☐ **Préstamo hipotecario**  
Entidad: {{ sof.mortgage_bank }} — Importe: {{ sof.mortgage_amount }} EUR

☐ **Herencia o donación**  
Fecha liquidación impuesto: {{ sof.inheritance_date }} — Notaría: {{ sof.inheritance_notary }}

☐ **Rendimientos de actividad empresarial o profesional**  
Actividad: {{ sof.business_activity }}

☐ **Otros**  
Descripción: {{ sof.other_description }}

---

## 4. Declaración de titularidad real

El/la declarante manifiesta que:

☐ Actúa en nombre propio y es el/la titular real de los fondos indicados.

☐ Actúa en representación de un tercero: **{{ party_1.full_name }}** (NIF/NIE: **{{ party_1.id_document }}**), quien es el/la titular real.

---

## 5. Declaración de Persona Políticamente Expuesta (PEP)

☐ No soy ni he sido Persona Políticamente Expuesta en los últimos dos años, ni tengo vínculos familiares o de negocio con ninguna PEP.

☐ Soy o he sido PEP o tengo vínculos con una PEP. Detalle: {{ sof.pep_details }}

---

## 6. Declaración de veracidad

El/la firmante declara que la información anterior es veraz y completa, y se compromete a comunicar cualquier modificación relevante. Es consciente de que la ocultación o falsedad de esta información puede ser constitutiva de infracción penal.

---

## 7. Firma

| Dato | Valor |
|---|---|
| Nombre | {{ buyer.full_name }} |
| NIF/NIE | {{ buyer.id_document }} |
| Firma | __________________ |
| Fecha y lugar | {{ document.generated_at }} — {{ property.municipality }} |

---

*{{ organization.legal_name }} — {{ organization.address }} — {{ organization.email }} — {{ organization.roaiib_number }}*

**AVISO LEGAL: Este documento es un borrador base sujeto a revisión jurídica por especialista en prevención del blanqueo de capitales. No constituye asesoramiento legal definitivo.**
