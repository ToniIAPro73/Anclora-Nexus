---
trigger: always_on
---

# Feature Rules: Supervised Email & WhatsApp Send v1

## Normative Priority
1) sdd/core/constitution-canonical.md
2) .agent/rules/workspace-governance.md
3) .agent/rules/anclora-nexus.md
4) sdd/features/supervised-email-whatsapp-send/supervised-email-whatsapp-send-spec-v1.md
5) sdd/features/supervised-email-whatsapp-send/supervised-email-whatsapp-send-spec-v1_1.md

## Rules
- Todo envío debe ser HITL: el sistema prepara y abre el cliente real, la persona confirma el envío.
- No almacenar credenciales SMTP ni tokens de WhatsApp en v1.
- Mail y WhatsApp deben quedar auditados como interacción programada y luego confirmada.
- El seller debe tener canales de contacto persistidos antes del envío.
- Las URLs `mailto:` y `wa.me` se generan en backend con encoding seguro.
