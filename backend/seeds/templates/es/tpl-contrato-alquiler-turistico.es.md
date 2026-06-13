---
template_key: contrato-alquiler-turistico
template_family: contrato-alquiler-turistico
ape_code: APE-TOUR-STAY-008
display_name: "Contrato de Explotación de Alquiler Turístico (ETV)"
operation_type: alquiler_turistico
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
storage_path: templates/es/tpl-contrato-alquiler-turistico.es.md
effective_from:
effective_until:
---
# Contrato de Explotación de Alquiler Turístico (ETV)

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

> ⚠️ Solo válido para propiedades con licencia ETV activa. El número NRUA es obligatorio para publicar en portales desde 2025. Pendiente de revisión jurídica.

---

## 1. Partes

| Rol                | Nombre                  | Identificación             | Email                |
| ------------------ | ----------------------- | -------------------------- | -------------------- |
| Propietario/Gestor | {{ landlord.full_name }} | {{ landlord.id_document }} | {{ landlord.email }} |
| Huésped            | {{ guest.full_name }}    | {{ guest.id_document }}    | {{ guest.email }}    |
| Agente             | {{ agent.full_name }}    | —                          | {{ agent.email }}    |

## 2. Inmueble y Licencias

- **Dirección:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Número de Licencia ETV / DRIAT:** {{ property.etv_license }}
- **Número NRUA (Registro Único):** {{ property.nrua_number }}
- **Capacidad máxima autorizada:** {{ property.max_capacity }} personas
- **Número de habitaciones:** {{ property.rooms }}

## 3. Reserva

- **Fecha check-in:** {{ booking.checkin_date }} — Hora: {{ booking.checkin_time }}
- **Fecha check-out:** {{ booking.checkout_date }} — Hora: {{ booking.checkout_time }}
- **Número de noches:** {{ booking.nights }}
- **Número de huéspedes:** {{ booking.guest_count }} (adultos: {{ booking.adults }}, menores: {{ booking.minors }})

## 4. Precio y Pagos

- **Precio total de la estancia:** {{ booking.total_price }} €
- **Señal / depósito previo:** {{ booking.prepayment }} €
- **Depósito de seguridad:** {{ booking.security_deposit }} €
- **Fecha límite de cancelación sin penalización:** {{ booking.free_cancellation_date }}
- **Política de cancelación:** {{ booking.cancellation_policy }}

## 5. Normas de Uso

- Capacidad máxima: {{ property.max_capacity }} personas
- No se permiten fiestas ni eventos sin autorización escrita
- Horario de silencio: 22:00 a 09:00
- Mascotas: {{ booking.pets_allowed }}
- Fumadores: {{ booking.smoking_allowed }}

## 6. Obligaciones Legales

- **Registro de viajeros (RD 933/2021):** El huésped mayor de 14 años debe facilitar sus datos completos. El gestor está obligado a enviar el parte de entrada al Ministerio del Interior en un plazo máximo de 24 horas desde el check-in.
- **Impuesto turístico (Ecotasa Baleares):** {{ booking.tourist_tax }} € por persona/noche, a cargo del huésped.
- El número NRUA debe figurar en todos los anuncios en portales de alquiler vacacional.

## 7. Jurisdicción

Juzgados y Tribunales de Palma de Mallorca.

---

## Firmas

| Parte              | Nombre                  | Firma          | Fecha                       |
| ------------------ | ----------------------- | -------------- | --------------------------- |
| Propietario/Gestor | {{ landlord.full_name }} | ******\_****** | {{ document.generated_at }} |
| Huésped            | {{ guest.full_name }}    | ******\_****** | {{ document.generated_at }} |

---

Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal
