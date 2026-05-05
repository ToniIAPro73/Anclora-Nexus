# Prompt - ANCLORA-PAA-001 v1

Implementar la capa de acceso privado del ecosistema Anclora con estas restricciones:

- `Private Estates` es la puerta publica.
- `Agent Portal` reutiliza el login actual de Nexus y preserva `next`.
- `Partner Portal` y `Data Lab` deben tener rutas publicas propias y semantica clara de acceso controlado.
- Toda redireccion debe pasar por normalizacion de rutas internas.
- Toda UI nueva debe seguir contratos de:
  - `page-title`
  - `page-subtitle`
  - `surface-primary`
  - `surface-secondary`
  - `surface-copy-safe`
- Toda copy nueva debe añadirse a i18n.
- El resultado debe quedar documentado con spec, test plan, QA y gate final.

Resultado esperado:

1. `Private Estates` enruta cada portal a su destino correcto.
2. `Nexus` expone `/private-area`, `/private-area/partner` y `/private-area/data-lab`.
3. El login soporta `next` y `portal`.
4. El sistema evita redirects inseguros y conserva la semantica multiportal.
