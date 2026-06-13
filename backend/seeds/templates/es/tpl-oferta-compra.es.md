---
template_key: oferta-compra
template_family: oferta-compra
display_name: "Oferta de compra"
operation_type: compraventa
jurisdiction: ES-IB
language: es
version: 0.1-draft
legal_review_status: pending
brand: Anclora Private Estates
storage_path: templates/es/tpl-oferta-compra.es.md
---

# Oferta de Compra

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Partes

- **Oferente (Comprador):** {{ buyer.fullname }} — {{ buyer.id_document }} — {{ buyer.email }}
- **Inmueble ofertado:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Propietario actual:** {{ seller.fullname }}
- **Agente Anclora:** {{ agent.fullname }} — ROAIIB nº {{ organization.roaiib_number }}

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

| Parte | Nombre | Firma | Fecha |
|-------|--------|-------|-------|
| Oferente | {{ buyer.fullname }} | _____________ | {{ document.generated_at }} |
| Vendedor (aceptación) | {{ seller.fullname }} | _____________ | _____________ |
| Agente Anclora | {{ agent.fullname }} | _____________ | {{ document.generated_at }} |

---
*Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal*
