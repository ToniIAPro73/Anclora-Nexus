---
template_key: contrato-arrendamiento
template_family: contrato-arrendamiento
display_name: "Contrato de arrendamiento"
operation_type: alquiler_residencial
jurisdiction: ES-IB
language: es
version: 0.1-draft
legal_review_status: pending
brand: Anclora Private Estates
storage_path: templates/es/tpl-contrato-arrendamiento.es.md
---

# Contrato de Arrendamiento de Vivienda Habitual

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

> ⚠️ Este contrato está regulado por la Ley de Arrendamientos Urbanos (LAU) y la Ley de Vivienda 12/2023. Pendiente de revisión jurídica antes de publicar.

---

## 1. Partes

| Rol          | Nombre                  | Identificación             | Email                |
| ------------ | ----------------------- | -------------------------- | -------------------- |
| Arrendador   | {{ landlord.fullname }} | {{ landlord.id_document }} | {{ landlord.email }} |
| Arrendatario | {{ tenant.fullname }}   | {{ tenant.id_document }}   | {{ tenant.email }}   |
| Agente       | {{ agent.fullname }}    | —                          | {{ agent.email }}    |

## 2. Inmueble

- **Dirección:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **CEE:** {{ property.energy_certificate }} — Calificación: {{ property.energy_rating }}
- **Cédula de Habitabilidad:** {{ property.habitation_certificate }}

## 3. Duración

- **Duración inicial:** {{ tenancy.duration_years }} años
- **Prórroga obligatoria (art. 9 LAU):** Hasta completar 5 años (arrendador persona física) o 7 años (arrendador persona jurídica)
- **Prórroga tácita (art. 10 LAU):** 3 años adicionales salvo denuncia con 4 meses de antelación por arrendador o 2 meses por arrendatario
- **Fecha inicio:** {{ tenancy.start_date }}

## 4. Renta

- **Renta mensual:** {{ tenancy.rent_amount }} €
- **Actualización anual:** Según índice pactado — {{ tenancy.rent_update_index }} (IPC / Índice de Referencia de Alquiler)
- **Forma de pago:** {{ tenancy.payment_method }} — antes del día {{ tenancy.payment_day }} de cada mes

## 5. Fianza y Garantías

- **Fianza legal (art. 36.1 LAU):** {{ tenancy.deposit_amount }} € (1 mensualidad)
- **Garantía adicional (art. 36.5 LAU):** {{ tenancy.additional_guarantee }} € (máx. 2 mensualidades)
- **Depósito en organismo autonómico:** {{ tenancy.deposit_registered }}

## 6. Gastos

- Los honorarios de gestión inmobiliaria son a cargo del Arrendador (Ley de Vivienda 12/2023, art. 20)
- Gastos de comunidad: {{ tenancy.community_charges_party }}
- IBI: {{ tenancy.ibi_party }}
- Suministros: a cargo del Arrendatario

## 7. Obras y Conservación

El Arrendador está obligado a realizar las reparaciones necesarias para conservar el inmueble en condiciones de habitabilidad (art. 21 LAU). El Arrendatario no podrá realizar obras sin consentimiento escrito del Arrendador.

## 8. Jurisdicción

Juzgados y Tribunales de Palma de Mallorca.

---

## Firmas

| Parte          | Nombre                  | Firma          | Fecha                       |
| -------------- | ----------------------- | -------------- | --------------------------- |
| Arrendador     | {{ landlord.fullname }} | ******\_****** | {{ document.generated_at }} |
| Arrendatario   | {{ tenant.fullname }}   | ******\_****** | {{ document.generated_at }} |
| Agente Anclora | {{ agent.fullname }}    | ******\_****** | {{ document.generated_at }} |

---

Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal
