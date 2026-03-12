# ANCLORA-DLAB-002 · Data Lab Selective Access

- `Data Lab` no se abre como dashboard público generalista.
- Todo acceso externo pasa por `request -> review -> workspace tokenized`.
- Los perfiles admitidos en `v1` son `partner`, `client`, `investor` y `other`.
- Toda aprobación debe generar:
  - `approved_scope`
  - `access_tier`
  - `launch_url`
- La UI pública y privada debe respetar contratos de `surface`, tipografía, formularios e i18n.
