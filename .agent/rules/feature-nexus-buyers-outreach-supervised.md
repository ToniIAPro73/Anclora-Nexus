# ANCLORA-NBOS-001

- Buyer outreach debe reutilizar `buyer_profiles`, `property_buyer_matches`, `buyer_memory_records` y `buyer_interactions`.
- Todo endpoint buyer-side debe resolver `org_id` vía auth; sin bypass anónimo.
- Todo draft y brief debe poder degradar a fallback determinista si AI runtime no está listo.
- UI nueva debe usar contratos `surface-primary` / `surface-secondary`, `page-title` / `section-title` e i18n.
