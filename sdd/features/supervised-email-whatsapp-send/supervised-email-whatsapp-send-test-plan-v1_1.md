# Test Plan v1.1 - Supervised Email & WhatsApp Send

1. Guardar canales de contacto por `PATCH /api/sellers/{id}`.
2. Preparar `send-supervised/email`.
3. Preparar `send-supervised/whatsapp`.
4. Confirmar `confirm-send`.
5. Verificar contrato de interacción confirmada.
6. Verificar encoding seguro de `launch_url`.
