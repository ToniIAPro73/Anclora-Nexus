---
template_key: contrato-temporada
template_family: contrato-temporada
display_name: "Contrato de temporada"
operation_type: alquiler_temporada
jurisdiction: ES-IB
language: es
version: 0.1-draft
legal_review_status: pending
brand: Anclora Private Estates
storage_path: templates/es/tpl-contrato-temporada.es.md
---

# Contrato de Arrendamiento de Temporada

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

> ⚠️ **AVISO LEGAL IMPORTANTE:** Este contrato debe declarar expresamente la causa de temporalidad. La ausencia de causa justificada puede ser calificada como fraude de ley (art. 3 LAU), convirtiendo el contrato en arrendamiento de vivienda habitual con todas sus consecuencias (prórrogas forzosas de 5-7 años). Pendiente de revisión jurídica antes de publicar.

---

## 1. Partes

| Rol | Nombre | Identificación | Domicilio habitual |
|-----|--------|---------------|-------------------|
| Arrendador | {{ landlord.fullname }} | {{ landlord.id_document }} | {{ landlord.permanent_address }} |
| Arrendatario | {{ tenant.fullname }} | {{ tenant.id_document }} | {{ tenant.permanent_address }} |
| Agente | {{ agent.fullname }} | — | {{ organization.address }} |

## 2. Inmueble

- **Dirección:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Referencia catastral:** {{ property.cadastral_reference }}
- **Capacidad:** {{ property.capacity }} personas
- **Estado:** Totalmente amueblado y equipado según inventario adjunto

## 3. Causa de Temporalidad (OBLIGATORIA)

El presente contrato se celebra por causa de temporada, quedando excluido del régimen de arrendamiento de vivienda habitual del art. 2 LAU, por la siguiente razón objetiva y verificable:

**Causa declarada:** {{ tenancy.temporality_cause }}

**Documentación acreditativa de la causa:** {{ tenancy.cause_documents }}

**Domicilio habitual del arrendatario durante la temporada:** {{ tenant.permanent_address }}

El arrendatario declara expresamente que mantiene su residencia habitual en la dirección indicada y que la ocupación de este inmueble es de carácter temporal y accesorio.

## 4. Duración

- **Fecha de inicio:** {{ tenancy.start_date }}
- **Fecha de fin:** {{ tenancy.end_date }}
- **Duración total:** {{ tenancy.duration_days }} días
- **Sin prórroga automática.** A la finalización del plazo, el contrato se extingue sin necesidad de preaviso.

## 5. Renta y Garantías

- **Renta mensual / total:** {{ tenancy.rent_amount }} € ({{ tenancy.rent_period }})
- **Forma de pago:** {{ tenancy.payment_method }}
- **Fianza legal (art. 36 LAU):** {{ tenancy.deposit_amount }} € (1 mensualidad)
- **Garantía adicional:** {{ tenancy.additional_guarantee }} € (máx. 2 mensualidades)
- **Depósito fianza en organismo oficial:** {{ tenancy.deposit_registered }}

## 6. Prohibición de Encadenamiento

Las partes declaran conocer que el encadenamiento de contratos de temporada sucesivos sobre el mismo inmueble y entre las mismas partes constituye presunción de fraude de ley. Este contrato es único e irrepetible en las mismas condiciones.

## 7. Jurisdicción

Juzgados y Tribunales de Palma de Mallorca.

---

## Firmas

| Parte | Nombre | Firma | Fecha |
|-------|--------|-------|-------|
| Arrendador | {{ landlord.fullname }} | _____________ | {{ document.generated_at }} |
| Arrendatario | {{ tenant.fullname }} | _____________ | {{ document.generated_at }} |
| Agente Anclora | {{ agent.fullname }} | _____________ | {{ document.generated_at }} |

---
*Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal*
