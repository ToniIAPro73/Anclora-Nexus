# Test Plan v1.2 - Supervised Email & WhatsApp Send

1. Verificar `send-supervised/email` con `transport=auto` y SMTP deshabilitado.
2. Verificar `send-supervised/email` con `transport=native_email` y SMTP habilitado.
3. Verificar que `transport` queda persistido en metadata.
4. Verificar que `native_email` devuelve `delivery.provider` y `delivery.message_id`.
5. Verificar que `whatsapp` sigue usando `wa_me`.
6. Verificar que el seller workbench expone `email_native_available` y `latest_email_delivery`.
7. Verificar que command center cuenta `sent_native_supervised`.
