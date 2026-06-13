---
template_key: recibo-fianza
template_family: recibo-fianza
display_name: "Recibo de fianza"
operation_type: alquiler
jurisdiction: ES-IB
language: es
version: 0.1-draft
legal_review_status: pending
brand: Anclora Private Estates
storage_path: templates/es/tpl-recibo-fianza.es.md
---

# Recibo de Entrega de Fianza

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## Datos

- **Arrendador:** {{ landlord.fullname }} — {{ landlord.id_document }}
- **Arrendatario:** {{ tenant.fullname }} — {{ tenant.id_document }}
- **Inmueble:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Contrato de referencia:** {{ tenancy.contract_reference }} de fecha {{ tenancy.contract_date }}

## Importe

- **Fianza recibida:** {{ tenancy.deposit_amount }} €
- **Concepto:** Fianza legal (art. 36 LAU) equivalente a {{ tenancy.deposit_months }} mensualidad/es de renta
- **Forma de pago:** {{ tenancy.deposit_payment_method }}
- **Fecha de recepción:** {{ tenancy.deposit_received_date }}

## Depósito en Organismo Autonómico

El Arrendador se compromete a depositar la fianza en el organismo autonómico correspondiente de las Illes Balears en el plazo legalmente establecido.

Fianza depositada: Sí / No — Referencia: {{ tenancy.deposit_official_ref }}

---

## Firma

| Parte                  | Nombre                  | Firma          | Fecha                       |
| ---------------------- | ----------------------- | -------------- | --------------------------- |
| Arrendador (recibe)    | {{ landlord.fullname }} | ******\_****** | {{ document.generated_at }} |
| Arrendatario (entrega) | {{ tenant.fullname }}   | ******\_****** | {{ document.generated_at }} |

---

Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal
