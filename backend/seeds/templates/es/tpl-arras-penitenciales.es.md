---
template_key: arras-penitenciales
template_family: arras-penitenciales
ape_code: APE-SALE-ARRAS-001
display_name: "Contrato de Arras Penitenciales"
operation_type: compraventa
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
storage_path: templates/es/tpl-arras-penitenciales.es.md
effective_from:
effective_until:
---
# Contrato de Arras Penitenciales

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Organización:** {{ organization.legal_name }} · **Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Partes

| Rol | Nombre completo | NIF/NIE/Pasaporte | Email |
|-----|----------------|------------------|-------|
| Comprador | {{ buyer.full_name }} | {{ buyer.id_document }} | {{ buyer.email }} |
| Vendedor | {{ seller.full_name }} | {{ seller.id_document }} | {{ seller.email }} |
| Agente Anclora | {{ agent.full_name }} | — | {{ agent.email }} |

---

## 2. Objeto

El Vendedor y el Comprador, en pleno uso de su capacidad legal, acuerdan la celebración del presente contrato de arras penitenciales, al amparo del artículo 1454 del Código Civil español, sobre el inmueble descrito a continuación:

- **Dirección:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Referencia catastral:** {{ property.cadastral_reference }}
- **Finca registral nº:** {{ property.registry_record }} — Registro de la Propiedad de {{ property.registry_office }}
- **Superficie registral:** {{ property.registered_area }} m²
- **Descripción:** {{ property.description }}

## 3. Precio y Arras

- **Precio total de compraventa:** {{ deal.price_total }} €
- **Importe de arras (señal):** {{ deal.deposit_amount }} € (imputable al precio final)
- **Forma de pago de las arras:** {{ deal.deposit_payment_method }}
- **Fecha límite para elevar a escritura pública:** {{ deal.signing_deadline }}
- **Notaría designada:** {{ deal.notary_name }}, {{ deal.notary_address }}

## 4. Naturaleza Penitencial (art. 1454 CC)

En caso de que el Comprador desistiera de la operación, perderá las arras entregadas. Si fuera el Vendedor quien desistiere, estará obligado a devolver el doble de las arras recibidas. Esta penalidad sustituye cualquier otra reclamación de daños y perjuicios derivada del incumplimiento.

## 5. Documentación Técnica del Inmueble

- Certificado de Eficiencia Energética (CEE): {{ property.energy_certificate }} — Calificación: {{ property.energy_rating }}
- Cédula de Habitabilidad: {{ property.habitation_certificate }} — Vencimiento: {{ property.habitation_cert_expiry }}
- ITE (si aplica): {{ property.ite_certificate }}
- Deuda hipotecaria pendiente: {{ property.mortgage_pending }} €
- Certificado de deuda cero comunidad: {{ property.community_debt_certificate }}
- IBI al corriente: {{ property.ibi_status }}

## 6. Distribución de Gastos

Los gastos notariales de la escritura pública de compraventa serán a cargo del Comprador, salvo pacto expreso en contrario. El Impuesto de Transmisiones Patrimoniales (ITP) o el IVA según corresponda serán satisfechos por el Comprador conforme a la normativa fiscal vigente en las Illes Balears.

## 7. Mediación Inmobiliaria

Anclora Private Estates actúa como agente intermediario, inscrita en el Registro Oficial de Agentes Inmobiliarios de las Illes Balears (ROAIIB) con nº {{ organization.roaiib_number }}, conforme a la Ley 3/2024.

## 8. Jurisdicción

Para cualquier controversia derivada del presente contrato, las partes se someten expresamente a los Juzgados y Tribunales de Palma de Mallorca, renunciando a cualquier otro fuero que pudiera corresponderles.

---

## Firmas

| Parte | Nombre | Firma | Lugar y Fecha |
|-------|--------|-------|---------------|
| Comprador | {{ buyer.full_name }} | _____________ | {{ deal.signing_place }}, {{ document.generated_at }} |
| Vendedor | {{ seller.full_name }} | _____________ | {{ deal.signing_place }}, {{ document.generated_at }} |
| Agente Anclora | {{ agent.full_name }} | _____________ | {{ deal.signing_place }}, {{ document.generated_at }} |

---
*Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal*
