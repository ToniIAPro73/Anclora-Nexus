# Test Plan - ANCLORA-PAA-001 v1

## Unit

1. `normalizeNextPath` acepta rutas internas validas.
2. `normalizeNextPath` rechaza redirects externos o malformados.
3. `buildPortalLoginHref('agent')` preserva `next=%2Fdashboard`.
4. `resolvePortalEntryHref` devuelve el destino correcto por portal y estado auth.

## Frontend Nexus

1. `/private-area` renderiza tres portales.
2. `/private-area/agent` redirige a login.
3. `/private-area/partner` y `/private-area/data-lab` son publicos.
4. `/login?portal=agent&next=/dashboard` redirige a `/dashboard` tras login.

## Frontend Private Estates

1. El menu de `Area Privada` abre:
   - Nexus login
   - partner portal
   - data lab portal
2. Ya no existe modal comun de `Partner`/`Data Lab`.

## Regression

1. `npm run frontend:lint`
2. `npm run frontend:build`
3. `npm run lint` en `Anclora-Private-Estates`
4. `npm run test` en `Anclora-Private-Estates`
5. `npm run build` en `Anclora-Private-Estates`
