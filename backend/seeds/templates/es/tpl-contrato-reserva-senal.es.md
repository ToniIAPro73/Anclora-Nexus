---
template_key: contrato-reserva-senal
template_family: contrato-reserva-senal
display_name: "Contrato de reserva / señal"
operation_type: compraventa
jurisdiction: ES-IB
language: es
version: 0.1-draft
legal_review_status: pending
brand: Anclora Private Estates
storage_path: templates/es/tpl-contrato-reserva-senal.es.md
---

# Contrato de Reserva / Señal

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Partes

| Rol | Nombre | Identificación | Email |
|-----|--------|---------------|-------|
| Comprador | {{ buyer.fullname }} | {{ buyer.id_document }} | {{ buyer.email }} |
| Vendedor | {{ seller.fullname }} | {{ seller.id_document }} | {{ seller.email }} |
| Agente | {{ agent.fullname }} | — | {{ agent.email }} |

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

| Parte | Nombre | Firma | Fecha |
|-------|--------|-------|-------|
| Comprador | {{ buyer.fullname }} | _____________ | {{ document.generated_at }} |
| Vendedor | {{ seller.fullname }} | _____________ | {{ document.generated_at }} |
| Agente Anclora | {{ agent.fullname }} | _____________ | {{ document.generated_at }} |

---
*Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal*
