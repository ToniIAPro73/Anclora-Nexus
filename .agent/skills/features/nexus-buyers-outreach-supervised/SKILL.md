# Nexus Buyers Outreach Supervised

## Objetivo
Implementar workbench buyer-side, drafts e HITL sobre buyers ya captados.

## Flujo
1. Obtener buyer + matches + memory + interactions.
2. Generar `buyer_brief`, `email_draft` y `whatsapp_draft`.
3. Lanzar envío supervisado con `mailto` / `wa.me` o SMTP nativo.
4. Confirmar el envío y persistir trazabilidad.

## Contratos
- No introducir copy hardcoded sin i18n.
- No crear pantallas fuera de Prospección si el flujo cabe en drawer contextual.
