# MIGRATION / ROLLOUT: GRAVITY CLAW DOSSIER EXPORT & SHARE V1

## DB Impact

- Ninguno.
- Reutiliza payload agregado del workbench.

## Rollout

1. Desplegar backend.
2. Desplegar frontend.
3. Verificar `GET /api/sellers/{id}/dossier-export`.
4. Generar PDF desde la ficha.
5. Verificar flujo de share/copy fallback.
