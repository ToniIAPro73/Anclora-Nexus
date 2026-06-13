---
template_key: inventario-estado-inmueble
template_family: inventario-estado-inmueble
ape_code: APE-INVENTORY-016
display_name: "Inventario y estado del inmueble"
operation_type: alquiler_temporada
phase: entrega
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
requires_advisor_validation: false
signable: true
system_template: true
storage_path: templates/es/tpl-inventario-estado-inmueble.es.md
effective_from:
effective_until:
---

# Inventario y Estado del Inmueble

**Organización:** {{ organization.legal_name }} · **Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Identificación del inmueble

| Campo | Detalle |
|---|---|
| Dirección completa | {{ property.address }}, {{ property.municipality }} |
| Código postal | {{ property.postal_code }} |
| Referencia catastral | {{ property.cadastral_reference }} |
| Referencia registral | {{ property.registry_reference }} |

---

## 2. Partes

| Rol | Nombre | NIF/NIE/Pasaporte |
|---|---|---|
| Propietario / Arrendador | {{ landlord.full_name }} | {{ landlord.id_document }} |
| Inquilino / Arrendatario | {{ tenant.full_name }} | {{ tenant.id_document }} |
| Agente | {{ agent.full_name }} | — |

---

## 3. Estado general del inmueble

| Estancia | Estado | Observaciones |
|---|---|---|
| Entrada | {{ inventory.entrada_estado }} | {{ inventory.entrada_obs }} |
| Salón / Comedor | {{ inventory.salon_estado }} | {{ inventory.salon_obs }} |
| Cocina | {{ inventory.cocina_estado }} | {{ inventory.cocina_obs }} |
| Dormitorio 1 | {{ inventory.dorm1_estado }} | {{ inventory.dorm1_obs }} |
| Dormitorio 2 | {{ inventory.dorm2_estado }} | {{ inventory.dorm2_obs }} |
| Baño 1 | {{ inventory.bano1_estado }} | {{ inventory.bano1_obs }} |
| Terraza / Jardín | {{ inventory.terraza_estado }} | {{ inventory.terraza_obs }} |

---

## 4. Suministros en el momento de la entrega

| Suministro | Lectura / Estado |
|---|---|
| Agua | {{ inventory.agua_lectura }} |
| Electricidad | {{ inventory.luz_lectura }} |
| Gas | {{ inventory.gas_lectura }} |
| Internet | {{ inventory.internet_estado }} |

---

## 5. Inventario de mobiliario y electrodomésticos

{{ inventory.mobiliario_detalle }}

---

## 6. Llaves entregadas

| Tipo | Cantidad |
|---|---|
| Llave principal | {{ inventory.llaves_principal }} |
| Llave buzón | {{ inventory.llaves_buzon }} |
| Mando garaje | {{ inventory.mandos_garaje }} |
| Tarjeta acceso | {{ inventory.tarjetas_acceso }} |

---

## 7. Observaciones generales

{{ inventory.observaciones_generales }}

---

## 8. Firmas

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Arrendador | {{ landlord.full_name }} | __________________ | {{ document.generated_at }} |
| Arrendatario | {{ tenant.full_name }} | __________________ | {{ document.generated_at }} |
| Agente | {{ agent.full_name }} | __________________ | {{ document.generated_at }} |

---

*{{ organization.legal_name }} — {{ organization.address }} — {{ organization.email }} — {{ organization.roaiib_number }}*
