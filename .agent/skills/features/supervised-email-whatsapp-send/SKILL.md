---
name: supervised-email-whatsapp-send
description: Prepara, lanza y confirma envíos supervisados reales por email y WhatsApp desde Gravity Claw.
---

# Skill - Supervised Email & WhatsApp Send v1

## Mandatory Reading
1) sdd/features/supervised-email-whatsapp-send/supervised-email-whatsapp-send-INDEX.md
2) sdd/features/supervised-email-whatsapp-send/supervised-email-whatsapp-send-spec-v1.md
3) sdd/features/supervised-email-whatsapp-send/supervised-email-whatsapp-send-spec-v1_1.md
4) .agent/rules/feature-supervised-email-whatsapp-send.md

## Instructions
- Persistir email/teléfono/WhatsApp del seller antes de lanzar el envío.
- Preparar `mailto:` y `wa.me` desde backend para que la UI no duplique reglas.
- Aplicar encoding seguro en las URLs de lanzamiento.
- Registrar la interacción primero como `programado`.
- Exigir confirmación humana para pasar la interacción a `realizado`.
