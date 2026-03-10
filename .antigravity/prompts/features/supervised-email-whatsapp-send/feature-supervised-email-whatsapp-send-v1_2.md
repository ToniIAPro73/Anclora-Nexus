# Prompt - Supervised Email & WhatsApp Send v1.2

Objetivo: convertir el flujo supervisado actual en outreach email real y trazable, manteniendo HITL y fallback a cliente local.

Checklist:
1. Detectar si el transporte nativo SMTP está configurado.
2. Mantener `mailto` y `wa.me` como fallback supervisado.
3. Persistir el transporte usado en metadata.
4. Si el email se envía por `native_email`, registrar provider, message id y `sent_at`.
5. Exponer en el workbench la disponibilidad de email nativo y el último delivery email.
6. Contar también los envíos nativos en command center.

Criterio de cierre:
- Toni puede enviar email real desde el workbench cuando SMTP está configurado.
- Toni sigue pudiendo usar `mailto` si SMTP no está disponible.
- el resultado queda visible en interacción, workbench y command center.
