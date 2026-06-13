---
template_key: oferta-compra
template_family: oferta-compra
ape_code: APE-SALE-OFFER-003
display_name: "Purchase Offer"
operation_type: compraventa
phase: negociacion
jurisdiction: ES-IB
language: pt
locale: pt-PT
version: 0.1.0
status: draft
legal_review_status: pending
translation_status: machine_translated
source_language: es
source_version: 0.1.0
brand: Anclora Private Estates
requires_legal_review: true
requires_advisor_validation: true
signable: true
system_template: true
storage_path: templates/pt/tpl-oferta-compra.pt.md
effective_from:
effective_until:
---

<!-- MACHINE TRANSLATED STUB — Requires human legal review before publication. -->
<!-- Source: tpl-oferta-compra.es.md v0.1.0 -->
<!-- Translation status: machine_translated — DO NOT PUBLISH without approval. -->

# Purchase Offer

**Organisation:** {{ organization.legal_name }} · **Ref:** {{ deal.folder_reference }} · **Date:** {{ document.generated_at }}

---

> **⚠ TRANSLATION NOTICE:** This document is a machine-translated draft based on the Spanish canonical version (APE-SALE-OFFER-003). It has not been reviewed by a legal professional. Placeholders are identical to the Spanish source. Do not use for signing without human legal review and approval.

---

{{ document.custom_body }}

---

*{{ organization.legal_name }} — {{ organization.address }} — {{ organization.email }} — {{ organization.roaiib_number }}*
