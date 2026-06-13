---
template_key: kyc-identificacion-cliente
template_family: kyc-identificacion-cliente
display_name: "KYC — Identificación de cliente"
operation_type: compliance
jurisdiction: ES-IB
language: es
version: 0.1-draft
legal_review_status: pending
brand: Anclora Private Estates
storage_path: templates/es/tpl-kyc-identificacion-cliente.es.md
---

# Formulario KYC — Identificación y Perfil de Cliente

![Logo Anclora Private Estates](ANCLORA_LOGO_PLACEHOLDER)

**Ref. expediente:** {{ deal.folder_reference }} · **Fecha:** {{ document.generated_at }}

> Este formulario se cumplimenta en el marco de las obligaciones de diligencia debida en materia de Prevención de Blanqueo de Capitales y Financiación del Terrorismo (PBC/FT). Los datos se tratan conforme al RGPD. Anclora Private Estates no es sujeto obligado principal bajo la Ley 10/2010, pero aplica este protocolo como medida interna de gestión de riesgos.

---

## 1. Datos del Cliente

- **Nombre completo:** {{ buyer.fullname }}
- **Fecha de nacimiento:** {{ buyer.birth_date }}
- **Nacionalidad:** {{ buyer.nationality }}
- **Documento de identificación:** {{ buyer.id_type }} — Nº: {{ buyer.id_document }} — Caducidad: {{ buyer.id_expiry }}
- **País de residencia fiscal:** {{ buyer.tax_country }}
- **NIF / NIE / VAT número:** {{ buyer.tax_id }}
- **Domicilio:** {{ buyer.address }}
- **Email:** {{ buyer.email }} · **Teléfono:** {{ buyer.phone }}
- **PEP (Persona Políticamente Expuesta):** Sí / No — {{ buyer.is_pep }}

## 2. Perfil Económico

- **Actividad profesional / empresarial:** {{ buyer.professional_activity }}
- **Empresa (si aplica):** {{ buyer.company_name }} — CIF: {{ buyer.company_tax_id }}
- **Rango estimado de ingresos anuales:** {{ buyer.income_range }}
- **Patrimonio estimado:** {{ buyer.estimated_wealth }}

## 3. Origen de Fondos

- **Origen declarado de los fondos para esta operación:** {{ buyer.funds_origin }}
- **Documentación acreditativa:** {{ buyer.funds_documents }}
- **Operación financiada con hipoteca:** Sí / No — Entidad: {{ buyer.mortgage_bank }}
- **Parte del precio en efectivo:** {{ buyer.cash_amount }} €

## 4. Declaración del Cliente

El cliente declara que los datos anteriores son verídicos y completos, que los fondos empleados en la operación tienen origen lícito, y que no actúa por cuenta de terceros no declarados.

---

## Firma

| Parte          | Nombre               | Firma          | Fecha                       |
| -------------- | -------------------- | -------------- | --------------------------- |
| Cliente        | {{ buyer.fullname }} | ******\_****** | {{ document.generated_at }} |
| Agente Anclora | {{ agent.fullname }} | ******\_****** | {{ document.generated_at }} |

---

Documento generado por Anclora Nexus DMS · Anclora Private Estates · ES-IB · Pendiente de revisión legal
