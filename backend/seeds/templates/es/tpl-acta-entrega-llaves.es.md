---
template_key: acta-entrega-llaves
template_family: acta-entrega-llaves
display_name: "Acta de entrega de llaves"
operation_type: entrega
jurisdiction: ES-IB
language: es
version: 0.1-draft
legal_review_status: pending
brand: Anclora Private Estates
storage_path: templates/es/tpl-acta-entrega-llaves.es.md
---

# Acta de Entrega y Recepción de Llaves

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Partes

- **Transmitente:** {{ seller.fullname }} — {{ seller.id_document }}
- **Receptor:** {{ buyer.fullname }} — {{ buyer.id_document }}
- **Agente Anclora:** {{ agent.fullname }}
- **Contrato de origen:** {{ deal.origin_contract_type }} de fecha {{ deal.origin_contract_date }}

## 2. Inmueble

- **Dirección:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Estado en el momento de la entrega:** {{ property.delivery_condition }}

## 3. Llaves Entregadas

| Descripción | Cantidad | Observaciones |
|-------------|----------|---------------|
| Llave puerta principal | {{ keys.main_door_qty }} | {{ keys.main_door_notes }} |
| Llave buzón | {{ keys.mailbox_qty }} | {{ keys.mailbox_notes }} |
| Llave garaje / trastero | {{ keys.garage_qty }} | {{ keys.garage_notes }} |
| Mando a distancia | {{ keys.remote_qty }} | {{ keys.remote_notes }} |
| Tarjeta de acceso | {{ keys.card_qty }} | {{ keys.card_notes }} |
| Otras | {{ keys.other_qty }} | {{ keys.other_notes }} |

## 4. Lecturas de Suministros

| Suministro | Compañía | Nº contrato | Lectura |
|------------|----------|-------------|---------|
| Electricidad | {{ supply.electricity_company }} | {{ supply.electricity_contract }} | {{ supply.electricity_reading }} kWh |
| Agua | {{ supply.water_company }} | {{ supply.water_contract }} | {{ supply.water_reading }} m³ |
| Gas | {{ supply.gas_company }} | {{ supply.gas_contract }} | {{ supply.gas_reading }} |

## 5. Observaciones

{{ delivery.observations }}

---

## Firma de Conformidad

| Parte | Nombre | Firma | Fecha y Hora |
|-------|--------|-------|-------------|
| Transmitente | {{ seller.fullname }} | _____________ | {{ delivery.datetime }} |
| Receptor | {{ buyer.fullname }} | _____________ | {{ delivery.datetime }} |
| Agente Anclora | {{ agent.fullname }} | _____________ | {{ delivery.datetime }} |

---
*Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal*
