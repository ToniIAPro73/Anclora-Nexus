---
template_key: contrato-reserva-senal
template_family: contrato-reserva-senal
ape_code: APE-SALE-RESERVE-004
display_name: "Contrato de Reserva / Señal"
operation_type: compraventa
phase: reserva
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
storage_path: templates/es/tpl-contrato-reserva-senal.es.md
effective_from:
effective_until:
---
# Contrato de Reserva / Señal

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Partes

| Rol       | Nombre                | Identificación           | Email              |
| --------- | --------------------- | ------------------------ | ------------------ |
| Comprador | {{ buyer.full_name }}  | {{ buyer.id_document }}  | {{ buyer.email }}  |
| Vendedor  | {{ seller.full_name }} | {{ seller.id_document }} | {{ seller.email }} |
| Agente    | {{ agent.full_name }}  | —                        | {{ agent.email }}  |

## 2. Inmueble Reservado

- **Dirección:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Referencia catastral:** {{ property.cadastral_reference }}
- **Precio total acordado:** {{ deal.price_total }} €

## 3. Señal

- **Importe de la señal:** {{ deal.deposit_amount }} €
- **Forma de pago:** {{ deal.deposit_payment_method }}
- **La señal es imputable al precio total** en caso de formalizar la compraventa.
- **Plazo de reserva:** {{ deal.reservation_days }} días naturales desde la firma
- **Destino si el comprador desiste:** La señal quedará en poder del Vendedor/Agente como compensación, salvo pacto en contrario.
- **Destino si el vendedor desiste:** El Vendedor devolverá el doble de la señal recibida.

## 4. Compromisos

Durante el período de reserva, el Vendedor se compromete a no comercializar el inmueble con terceros. El Comprador se compromete a formalizar el contrato de arras o la compraventa en el plazo indicado.

## 5. Jurisdicción

Juzgados y Tribunales de Palma de Mallorca.

---

## Firmas

| Parte          | Nombre                | Firma          | Fecha                       |
| -------------- | --------------------- | -------------- | --------------------------- |
| Comprador      | {{ buyer.full_name }}  | ******\_****** | {{ document.generated_at }} |
| Vendedor       | {{ seller.full_name }} | ******\_****** | {{ document.generated_at }} |
| Agente Anclora | {{ agent.full_name }}  | ******\_****** | {{ document.generated_at }} |

---

Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal
