# PROMPT: GRAVITY CLAW DOSSIER EXPORT & SHARE V1

Implementa export PDF y share para el dossier de seller en Anclora Nexus.

## Reglas
- Reusar `GET /api/sellers/{seller_id}/dossier-export` como contrato.
- PDF client-side aceptado en v1.
- Share via Web Share API con fallback de copia.
- No introducir envio automatico a canales externos.
