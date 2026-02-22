# Gate Final - Origin Aware Editability Policy

Gate policy:
- GO only if all QA checks pass.
- NO-GO if:
  - lock matrix not enforced,
  - payload sanitization missing,
  - missing i18n in any of `es/en/de/ru`,
  - visual regression in lead/property modals.

On GO:
- Update `sdd/features/FEATURES.md`.
- Update `sdd/core/CHANGELOG.md`.
