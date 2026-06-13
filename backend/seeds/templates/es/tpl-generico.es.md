---
template_key: generico
template_family: generico
ape_code: APE-GENERIC-014
display_name: "Documento Genérico"
operation_type: general
phase: general
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
signable: false
system_template: true
storage_path: templates/es/tpl-generico.es.md
effective_from:
effective_until:
---
# Documento Genérico

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Organización:** {{ organization.legal_name }} · **Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## Partes

| Rol                      | Nombre completo        | Identificación            | Email               |
| ------------------------ | ---------------------- | ------------------------- | ------------------- |
| {{ party_1.role_label }} | {{ party_1.fullname }} | {{ party_1.id_document }} | {{ party_1.email }} |
| {{ party_2.role_label }} | {{ party_2.fullname }} | {{ party_2.id_document }} | {{ party_2.email }} |
| Agente Anclora           | {{ agent.full_name }}   | —                         | {{ agent.email }}   |

---

## Inmueble (si aplica)

- **Dirección:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Referencia catastral:** {{ property.cadastral_reference }}

---

## Cuerpo del Documento

> Completar manualmente o mediante el editor de Nexus DMS.

{{ document.custom_body }}

---

## Firmas

| Parte                    | Nombre                 | Firma          | Fecha                       |
| ------------------------ | ---------------------- | -------------- | --------------------------- |
| {{ party_1.role_label }} | {{ party_1.fullname }} | ******\_****** | {{ document.generated_at }} |
| {{ party_2.role_label }} | {{ party_2.fullname }} | ******\_****** | {{ document.generated_at }} |
| Agente Anclora           | {{ agent.full_name }}   | ******\_****** | {{ document.generated_at }} |

---

Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal
