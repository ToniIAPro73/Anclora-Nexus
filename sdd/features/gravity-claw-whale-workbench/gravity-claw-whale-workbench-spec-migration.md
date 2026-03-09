# MIGRATION / ROLLOUT: GRAVITY CLAW WHALE WORKBENCH V1

## DB Impact

- No requiere migracion nueva.
- Reutiliza `seller_interactions` y clasifica artefactos con `metadata.artifact`.

## Rollout

1. Desplegar backend.
2. Desplegar frontend.
3. Verificar `/api/sellers/{id}/workbench`.
4. Generar workbench desde un seller real o de prueba.
5. Registrar una interaccion manual y confirmar persistencia.

## Rollback

- Revertir backend/frontend al commit previo.
- Los registros insertados en `seller_interactions` permanecen validos y no rompen compatibilidad.
