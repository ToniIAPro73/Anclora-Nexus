# Prompt Gemini — Internal Reviewer Identity

Repo: `~/projects/anclora-nexus`  
Branch: `sdd/internal-reviewer-identity`  
Base: `main`

## Contexto

La feature Synergi/Data Lab Access Requests ya está mergeada en `main`.

Nexus es una aplicación **INTERNAL / control plane / backoffice**. Synergi y Data Lab son aplicaciones **PREMIUM** separadas y no deben tocarse en esta feature.

La UI interna `/access-requests` permite revisar, aprobar y rechazar solicitudes. Actualmente usa un fallback temporal:

```ts
const REVIEWED_BY_FALLBACK = 'internal-user'
```

en:

```text
frontend/src/app/(dashboard)/access-requests/page.tsx
```

Esto debe corregirse porque Nexus necesita trazabilidad real de qué usuario interno aprobó o rechazó cada solicitud.

## Objetivo

Sustituir `reviewed_by = "internal-user"` por la identidad real del usuario autenticado en Nexus.

## Contratos obligatorios

Leer antes de tocar código:

```text
AGENTS.md
README.md
sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md
docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md
docs/standards/LOCALIZATION_CONTRACT.md
```

Reglas:

- Mantener Nexus como app INTERNAL.
- No usar patrones premium externos.
- No tocar `PrivateAreaShell`.
- No tocar Synergi/Data Lab.
- No modificar `/api/public/cta/lead`.
- No enviar `org_id` desde frontend.
- No introducir secretos ni nuevas env vars.
- No implementar RBAC completo.
- No crear migraciones.

## Pistas del repo

Ya existen patrones de usuario autenticado con:

```text
supabase.auth.getUser()
frontend/src/components/layout/UserMenu.tsx
frontend/src/lib/contexts/OrgContext.tsx
frontend/src/components/TeamManagement.tsx
frontend/src/app/(dashboard)/profile/page.tsx
frontend/src/lib/supabase.ts
```

## Implementación esperada

1. Auditar cómo se obtiene el usuario actual en frontend.
2. En `/access-requests/page.tsx`, cargar el usuario autenticado con el patrón ya existente.
3. Usar como `reviewed_by` preferente:
   - `user.email`, si existe;
   - si no, `user.id`.
4. Si no hay usuario autenticado al aprobar/rechazar:
   - bloquear la acción;
   - mostrar error operativo usando i18n;
   - no enviar la request al backend.
5. Eliminar el uso normal de `"internal-user"`.
6. Añadir traducciones si hace falta para el error en idiomas activos:
   - `es`
   - `en`
   - `de`
   - `ru`
7. Mantener payloads actuales:

```json
{ "reviewed_by": "...", "admin_notes": "..." }
```

```json
{ "reviewed_by": "...", "admin_notes": "...", "rejection_reason": "..." }
```

8. No cambiar el contrato backend.

## Archivos esperados

Probables archivos a tocar:

```text
frontend/src/app/(dashboard)/access-requests/page.tsx
frontend/src/lib/i18n/translations.ts
```

Solo tocar otros archivos si hay una razón clara y documentada.

## Validaciones obligatorias

Desde raíz:

```bash
git status --short

grep -Rni "internal-user" frontend/src backend/api backend/services || true

git diff -- backend/api/routes/public.py

git diff --name-only | grep -E "PrivateAreaShell|private-area" || true
```

Frontend:

```bash
cd frontend
npx eslint \
  'src/app/(dashboard)/access-requests/page.tsx' \
  src/components/access-requests/AccessRequestsTable.tsx \
  src/components/access-requests/AccessRequestDetailPanel.tsx \
  src/components/access-requests/AccessRequestDecisionDialog.tsx \
  src/lib/access-requests-api.ts \
  src/lib/i18n/translations.ts

npm run build
```

Si `npm run lint` global falla solo por deuda previa en `frontend/src/lib/server-auth.ts`, no corregir en esta feature. Documentarlo.

## Entrega esperada

No hacer commit sin aprobación.

Reportar:

```bash
git status --short
git diff --stat
git diff -- 'frontend/src/app/(dashboard)/access-requests/page.tsx'
git diff -- frontend/src/lib/i18n/translations.ts
```

Y resumen de:

- cómo se obtiene el usuario real;
- qué valor se envía como `reviewed_by`;
- qué ocurre si no hay usuario autenticado;
- resultados de eslint/build;
- riesgos restantes.

## Commit sugerido

```text
feat: use authenticated reviewer identity for access requests
```
