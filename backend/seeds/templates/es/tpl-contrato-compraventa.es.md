---
template_key: contrato-compraventa
template_family: contrato-compraventa
ape_code: APE-SALE-PRIVATE-002
display_name: "Contrato Privado de Compraventa"
operation_type: compraventa
phase: contrato
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
storage_path: templates/es/tpl-contrato-compraventa.es.md
effective_from:
effective_until:
---
# Contrato Privado de Compraventa

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Organización:** {{ organization.legal_name }} · **Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Partes

| Rol | Nombre completo | NIF/NIE/Pasaporte | Domicilio |
|-----|----------------|------------------|-----------|
| Comprador | {{ buyer.full_name }} | {{ buyer.id_document }} | {{ buyer.address }} |
| Vendedor | {{ seller.full_name }} | {{ seller.id_document }} | {{ seller.address }} |
| Agente Anclora | {{ agent.full_name }} | — | {{ organization.address }} |

---

## 2. Objeto y Descripción del Inmueble

- **Dirección:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Referencia catastral:** {{ property.cadastral_reference }}
- **Finca registral nº:** {{ property.registry_record }} — Registro de la Propiedad de {{ property.registry_office }}
- **Superficie:** {{ property.registered_area }} m² (registral) / {{ property.cadastral_area }} m² (catastral)
- **Cargas y gravámenes:** {{ property.charges }} (según nota simple de fecha {{ property.nota_simple_date }})
- **Estado de ocupación:** {{ property.occupation_status }}
- **CEE:** {{ property.energy_certificate }} — Calificación {{ property.energy_rating }}
- **Cédula de Habitabilidad:** {{ property.habitation_certificate }}

## 3. Precio y Forma de Pago

- **Precio total:** {{ deal.price_total }} €
- **Cantidad ya entregada (arras/señal):** {{ deal.deposit_amount }} € (contrato de arras de fecha {{ deal.arras_date }})
- **Resto a satisfacer en escritura:** {{ deal.price_remaining }} €
- **Forma de pago:** {{ deal.payment_method }}
- **Fecha límite para otorgar escritura pública:** {{ deal.signing_deadline }}
- **Notaría:** {{ deal.notary_name }}, {{ deal.notary_address }}

## 4. Título de Propiedad

El Vendedor manifiesta ser el legítimo propietario del inmueble en virtud de {{ property.title_origin }}, libre de cargas salvo las indicadas, y con plenas facultades para transmitirlo.

## 5. Situación Urbanística

El Vendedor declara que el inmueble no está sujeto a ningún expediente de infracción urbanística activo, conforme a la Ley de Urbanismo de las Illes Balears (LUIB), y que las construcciones existentes cuentan con las correspondientes licencias o están en situación de fuera de ordenación consolidada.

## 6. Gastos e Impuestos

- Notaría y Registro: a cargo del Comprador
- ITP / IVA según régimen fiscal aplicable: a cargo del Comprador
- Plusvalía municipal: a cargo del Vendedor
- Hipoteca pendiente cancelada antes de la firma: a cargo del Vendedor

## 7. Entrega de Posesión

La entrega de llaves y posesión del inmueble se realizará en el momento de la firma de la escritura pública, salvo acuerdo expreso en contrario reflejado en este contrato: {{ deal.possession_agreement }}.

## 8. Jurisdicción

Juzgados y Tribunales de Palma de Mallorca.

---

## Firmas

| Parte | Nombre | Firma | Fecha |
|-------|--------|-------|-------|
| Comprador | {{ buyer.full_name }} | _____________ | {{ document.generated_at }} |
| Vendedor | {{ seller.full_name }} | _____________ | {{ document.generated_at }} |
| Agente Anclora | {{ agent.full_name }} | _____________ | {{ document.generated_at }} |

---
*Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal*
