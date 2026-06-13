---
template_key: mandato-exclusiva
template_family: mandato-exclusiva
ape_code: APE-AGENCY-EXCL-011
display_name: "Mandato de Intermediación en Exclusiva"
operation_type: captacion_intermediacion
phase: captacion
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
storage_path: templates/es/tpl-mandato-exclusiva.es.md
effective_from:
effective_until:
---
# Mandato de Intermediación en Exclusiva

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Partes

- **Propietario / Mandante:** {{ seller.full_name }} — {{ seller.id_document }} — {{ seller.email }}
- **Agencia:** Anclora Private Estates — ROAIIB nº {{ organization.roaiib_number }}
- **Agente responsable:** {{ agent.full_name }}

## 2. Inmueble

- **Dirección:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Referencia catastral:** {{ property.cadastral_reference }}
- **Precio mínimo de venta aceptado:** {{ deal.minimum_price }} €
- **Precio de salida al mercado:** {{ deal.asking_price }} €

## 3. Exclusiva

El Propietario otorga a Anclora Private Estates la **exclusividad territorial y comercial** para la comercialización del inmueble durante el período pactado. Durante este período, el Propietario se compromete a:

- No vender ni ofertar el inmueble directamente ni a través de terceros
- Notificar a Anclora cualquier contacto directo de potenciales compradores
- En caso de venta directa sin intervención de Anclora durante la exclusiva: el Propietario abonará igualmente los honorarios pactados

## 4. Duración

- **Duración de la exclusiva:** {{ deal.exclusivity_months }} meses desde la firma
- **Renovación automática:** {{ deal.exclusivity_renewal }}
- **Preaviso de rescisión:** {{ deal.exclusivity_notice_days }} días antes del vencimiento

## 5. Honorarios

- **Comisión:** {{ deal.commission_pct }} % sobre precio de venta final (+ IVA)
- **Devengo:** Firma de escritura pública
- **Protección post-exclusiva:** Si el comprador fue presentado por Anclora durante la exclusiva, los honorarios se devengan igualmente durante los {{ deal.post_exclusivity_protection_months }} meses siguientes al vencimiento

## 6. Obligaciones de Anclora (Ley 3/2024 — ROAIIB)

Anclora Private Estates actúa conforme a la Ley 3/2024, con seguro RC profesional y aval de caución vigentes, y se obliga a informar periódicamente al Propietario de las gestiones realizadas.

## 7. Jurisdicción

Juzgados y Tribunales de Palma de Mallorca.

---

## Firmas

| Parte          | Nombre                | Firma          | Fecha                       |
| -------------- | --------------------- | -------------- | --------------------------- |
| Propietario    | {{ seller.full_name }} | ******\_****** | {{ document.generated_at }} |
| Agente Anclora | {{ agent.full_name }}  | ******\_****** | {{ document.generated_at }} |

---

Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal
