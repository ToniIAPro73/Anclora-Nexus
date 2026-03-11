# Test Plan - ANCLORA-MTIP-001 v1.0

1. Verificar que `list_intelligence_packs()` devuelve fallback legacy cuando no hay catálogo persistido.
2. Verificar que crear un pack con `is_default=true` desactiva el default anterior.
3. Verificar que actualizar un pack permite activarlo y mantener stats agregadas.
4. Verificar que `GET /api/intelligence/packs` devuelve `items`, `active_pack` y `count`.
5. Verificar que `POST /api/intelligence/packs` crea un pack válido.
6. Verificar que `territorial-summary` y `territorial-insights` resuelven el pack activo sin romper el flujo legacy.
7. Verificar que la pantalla `/intelligence` compila y renderiza la card de catálogo sin romper contratos visuales ni i18n.
