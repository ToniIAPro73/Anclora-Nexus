---
template_key: nota-encargo
template_family: nota-encargo
display_name: "Nota de encargo"
operation_type: captacion
jurisdiction: ES-IB
language: es
version: 0.1-draft
legal_review_status: pending
brand: Anclora Private Estates
storage_path: templates/es/tpl-nota-encargo.es.md
---

# Nota de Encargo de Comercialización

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

---

## 1. Partes

- **Propietario / Mandante:** {{ seller.fullname }} — {{ seller.id_document }} — {{ seller.email }}
- **Agencia Mandataria:** Anclora Private Estates — ROAIIB nº {{ organization.roaiib_number }} — {{ organization.address }}
- **Agente responsable:** {{ agent.fullname }} — {{ agent.email }}

## 2. Inmueble

- **Dirección:** {{ property.address }}, {{ property.municipality }}, Illes Balears
- **Referencia catastral:** {{ property.cadastral_reference }}
- **Precio de salida al mercado:** {{ deal.asking_price }} €

## 3. Servicios Incluidos

- Valoración profesional del inmueble
- Fotografía y material de marketing premium
- Publicación en portales nacionales e internacionales
- Gestión de visitas y filtrado de compradores
- Asesoramiento en negociación
- Acompañamiento hasta escritura pública
- Revisión documental y coordinación con Advisor AI

## 4. Honorarios

- **Comisión:** {{ deal.commission_pct }} % sobre el precio de venta final (IVA no incluido)
- **Responsable del pago:** {{ deal.commission_payer }} (Vendedor / Comprador / Compartida)
- **Devengo:** En el momento de la firma de la escritura pública de compraventa
- **Protección de honorarios en venta directa:** {{ deal.direct_sale_protection }}

## 5. Régimen

- **Exclusiva:** Sí / No — {{ deal.exclusivity }}
- **Duración del encargo:** {{ deal.mandate_duration_months }} meses desde la firma
- **Prórroga automática:** {{ deal.mandate_auto_renewal }}

## 6. Obligaciones del Agente (Ley 3/2024 — ROAIIB)

Anclora Private Estates actúa conforme a la Ley 3/2024 de regulación de la actividad inmobiliaria en las Illes Balears, con seguro de responsabilidad civil profesional vigente y aval de caución por importe mínimo reglamentario.

## 7. Jurisdicción

Juzgados y Tribunales de Palma de Mallorca.

---

## Firmas

| Parte | Nombre | Firma | Fecha |
|-------|--------|-------|-------|
| Propietario | {{ seller.fullname }} | _____________ | {{ document.generated_at }} |
| Agente Anclora | {{ agent.fullname }} | _____________ | {{ document.generated_at }} |

---
*Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal*
