---
template_key: oferta-compra
template_family: oferta-compra
ape_code: APE-SALE-OFFER-003
display_name: "Oferta de Compra"
operation_type: compraventa
phase: negociacion
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
storage_path: templates/es/tpl-oferta-compra.es.md
effective_from:
effective_until:
---
# Oferta de Compra

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Partes

- **Oferente (Comprador):** {{ buyer.full_name }} — {{ buyer.id_document }} — {{ buyer.email }}
- **Inmueble ofertado:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Propietario actual:** {{ seller.full_name }}
- **Agente Anclora:** {{ agent.full_name }} — ROAIIB nº {{ organization.roaiib_number }}

---

## 2. Condiciones de la Oferta

- **Precio ofertado:** {{ deal.offer_price }} €
- **Financiación:** {{ deal.financing_type }} — Importe hipoteca solicitada: {{ deal.mortgage_amount }} €
- **Señal propuesta:** {{ deal.deposit_proposed }} € a entregar en {{ deal.deposit_deadline }} días desde aceptación
- **Plazo propuesto para escritura:** {{ deal.signing_deadline }}
- **Condición suspensiva financiación:** Sí / No — {{ deal.financing_condition }}
- **Condición suspensiva revisión documental:** Sí / No — {{ deal.doc_review_condition }}
- **Vigencia de la oferta:** {{ deal.offer_validity_days }} días naturales desde la fecha indicada

## 3. Aceptación

La presente oferta quedará vinculante para ambas partes una vez firmada por el Vendedor dentro del plazo de vigencia indicado. En caso de no aceptación en plazo, la oferta quedará automáticamente sin efecto.

## 4. Jurisdicción

Juzgados y Tribunales de Palma de Mallorca.

---

## Firmas

| Parte                 | Nombre                | Firma          | Fecha                       |
| --------------------- | --------------------- | -------------- | --------------------------- |
| Oferente              | {{ buyer.full_name }}  | ******\_****** | {{ document.generated_at }} |
| Vendedor (aceptación) | {{ seller.full_name }} | ******\_****** | ******\_******              |
| Agente Anclora        | {{ agent.full_name }}  | ******\_****** | {{ document.generated_at }} |

---

Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal
