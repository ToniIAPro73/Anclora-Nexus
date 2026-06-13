---
template_key: acuerdo-confidencialidad
template_family: acuerdo-confidencialidad
ape_code: APE-NDA-013
display_name: "Acuerdo de Confidencialidad (NDA)"
operation_type: general
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
storage_path: templates/es/tpl-acuerdo-confidencialidad.es.md
effective_from:
effective_until:
---
# Acuerdo de Confidencialidad (NDA)

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Partes

- **Parte Divulgadora:** {{ party_1.fullname }} — {{ party_1.id_document }} — {{ party_1.email }}
- **Parte Receptora:** {{ party_2.fullname }} — {{ party_2.id_document }} — {{ party_2.email }}
- **Objeto:** Operación inmobiliaria sobre {{ property.address }}, Illes Balears

## 2. Definición de Información Confidencial

Se considera información confidencial toda la información relativa al inmueble, sus propietarios, condiciones económicas de la operación, documentación técnica, financiera o jurídica, así como cualquier otra información designada como confidencial por cualquiera de las partes.

## 3. Obligaciones

- La Parte Receptora se compromete a no divulgar la información confidencial a terceros sin autorización escrita previa
- La información solo podrá usarse para el fin específico de evaluar la operación indicada
- La obligación de confidencialidad persiste {{ nda.duration_years }} años tras la firma o la conclusión de la operación

## 4. Excepciones

La obligación de confidencialidad no aplica a información que sea de dominio público, que ya obrara en poder de la Parte Receptora, o que deba divulgarse por imperativo legal o requerimiento judicial.

## 5. Consecuencias del Incumplimiento

El incumplimiento dará derecho a la Parte Divulgadora a reclamar los daños y perjuicios acreditados, más una penalidad convencional de {{ nda.penalty_amount }} €.

## 6. Jurisdicción

Juzgados y Tribunales de Palma de Mallorca.

---

## Firmas

| Parte             | Nombre                 | Firma          | Fecha                       |
| ----------------- | ---------------------- | -------------- | --------------------------- |
| Parte Divulgadora | {{ party_1.fullname }} | ******\_****** | {{ document.generated_at }} |
| Parte Receptora   | {{ party_2.fullname }} | ******\_****** | {{ document.generated_at }} |

---

Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal
