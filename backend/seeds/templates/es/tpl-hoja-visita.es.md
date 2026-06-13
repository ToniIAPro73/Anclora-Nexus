---
template_key: hoja-visita
template_family: hoja-visita
ape_code: APE-VISIT-015
display_name: "Hoja de visita"
operation_type: compraventa
phase: visita
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
requires_legal_review: false
requires_advisor_validation: false
signable: true
system_template: true
storage_path: templates/es/tpl-hoja-visita.es.md
effective_from:
effective_until:
---

# Hoja de Visita

**Organización:** {{ organization.legal_name }} · **Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## Datos de la visita

| Campo | Detalle |
|---|---|
| Fecha y hora | {{ deal.visit_date }} |
| Inmueble visitado | {{ property.address }}, {{ property.municipality }} |
| Referencia catastral | {{ property.cadastral_reference }} |
| Agente | {{ agent.full_name }} · {{ agent.email }} |

---

## Cliente visitante

| Dato | Valor |
|---|---|
| Nombre completo | {{ buyer.full_name }} |
| NIF/NIE/Pasaporte | {{ buyer.id_document }} |
| Email | {{ buyer.email }} |
| Teléfono | {{ buyer.phone }} |

---

## Declaración del visitante

El/la abajo firmante declara haber visitado el inmueble sito en **{{ property.address }}**, presentado por **{{ organization.trade_name }}** a través de su agente **{{ agent.full_name }}**, y reconoce que dicha presentación ha sido realizada en exclusiva por esta agencia, comprometiéndose a no efectuar ningún tipo de negociación o contrato sobre el inmueble sin la intervención de la misma durante un plazo de doce (12) meses desde la fecha de la visita.

Asimismo, el visitante declara conocer y aceptar la **Política de Privacidad** de {{ organization.legal_name }} ({{ organization.email }}), conforme al RGPD (UE) 2016/679 y la LOPDGDD.

---

## Condiciones del inmueble observadas

{{ deal.visit_notes }}

---

## Firmas

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Agente | {{ agent.full_name }} | __________________ | {{ document.generated_at }} |
| Visitante | {{ buyer.full_name }} | __________________ | {{ document.generated_at }} |

---

*{{ organization.legal_name }} — {{ organization.address }} — {{ organization.email }} — {{ organization.roaiib_number }}*

**DOCUMENTO CONFIDENCIAL — Uso interno y del cliente.**
