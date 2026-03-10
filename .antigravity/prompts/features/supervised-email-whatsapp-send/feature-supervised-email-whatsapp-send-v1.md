# Prompt - Supervised Email & WhatsApp Send v1

Objetivo: permitir outreach real desde Gravity Claw sin romper el principio HITL.

Checklist:
1. Validar canales de contacto del seller.
2. Preparar payload de email o WhatsApp en backend.
3. Registrar launch intent como interacción programada.
4. Abrir cliente real (`mailto` o `wa.me`).
5. Pedir confirmación explícita de envío.
6. Marcar interacción como realizada y actualizar estado comercial si aplica.
7. Garantizar encoding seguro de URLs y canales persistidos.
