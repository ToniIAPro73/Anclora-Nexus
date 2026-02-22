# Agent D QA - Origin Aware Editability Policy

## Checklist
1) Lead `manual` => fields editable.
2) Lead `cta_web/social/import/referral/partner` => capture fields locked.
3) Property `widget` => source fields locked.
4) Property `pbm` => source fields + match score locked.
5) Sanitization strips locked fields before update.
6) i18n keys exist for `es/en/de/ru`.
7) Lint passes for touched files.
