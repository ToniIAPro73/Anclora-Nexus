# Prompt Gemini — Phase 1 Backend Access Requests

Repo: `~/projects/anclora-nexus`  
Branch: `sdd/synergi-datalab-access-requests`

## Contexto

Estás trabajando en Anclora Nexus.

Arquitectura vigente:

- Nexus = INTERNAL / control plane / backoffice / solicitudes / revisión / aprobación-rechazo / administración / trazabilidad / emails de decisión.
- Anclora Synergi = PREMIUM / experiencia partner / workspace propio en repo separado.
- Anclora Data Lab = PREMIUM / experiencia analítica / workspace propio en repo separado.

Lee primero:

- `AGENTS.md`
- `sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`
- `sdd/features/synergi-datalab-access-requests/spec-v1.md`
- `sdd/features/synergi-datalab-access-requests/implementation-plan-nexus.md`
- `sdd/features/synergi-datalab-access-requests/audit-legacy-synergi-datalab-features.md`

## Objetivo de esta fase

Implementar solo la Fase 1 backend/captcha/modelo/API/tests para centralizar solicitudes de acceso Synergi/Data Lab en Nexus.

No implementar todavía:

- UI interna de revisión.
- emails de decisión.
- cambios en repos `anclora-synergi` o `anclora-data-lab`.
- eliminación o deprecación física de legacy.
- cambios en `PrivateAreaShell`.
- migración de datos legacy.

## Regla principal

No mezcles Nexus con la experiencia premium externa.

```text
Nexus = source of truth para solicitudes y decisiones.
Synergi/Data Lab = apps premium externas que consumirán el estado o invitación emitida por Nexus.
```

## Plan aprobado con correcciones obligatorias

El plan base es válido, pero debe aplicarse con estas correcciones:

1. La migración no debe llamarse `056_access_requests.sql`.

   En Nexus ya existen migraciones posteriores:

   - `056_valuation_requests.sql`
   - `057_seller_intake_pipeline.sql`
   - `058_hnwi_prospection.sql`
   - `059_lead_outreach_interactions.sql`
   - `060_fix_lead_ingestion_schema.sql`

   Por tanto, usa:

   ```text
   supabase/migrations/061_access_requests.sql
   ```

2. No sustituyas reCAPTCHA por Turnstile de forma global.

   Extiende `backend/services/captcha_verification_service.py` para soportar ambos providers:

   ```text
   recaptcha
   turnstile
   ```

   No rompas las rutas existentes que ya usan reCAPTCHA.

3. Mantén la interfaz actual del servicio captcha.

   No introduzcas una función async suelta tipo `verify_turnstile(...)` salvo que actualices todas las llamadas y tests.

   Preferencia:

   ```text
   Mantener captcha_verification_service.verify(...)
   Añadir lógica interna por provider
   Mantener compatibilidad existente
   ```

4. Añade variables a `.env.example`:

   ```env
   TURNSTILE_SECRET_KEY=
   TURNSTILE_VERIFY_URL=https://challenges.cloudflare.com/turnstile/v0/siteverify
   ```

5. No toques `backend/api/main.py` salvo que confirmes que `backend/api/routes/public.py` no está ya registrado.

6. No deprecar ni borrar archivos legacy todavía.

   En esta fase solo se crea la base canónica nueva y sus tests.

## Archivos permitidos en esta fase

Toca solo estos archivos, salvo que encuentres una dependencia objetiva y la expliques antes:

```text
backend/config.py
backend/services/captcha_verification_service.py
backend/models/access_requests.py
backend/services/access_request_service.py
backend/api/routes/public.py
backend/tests/test_access_request_service.py
backend/tests/test_public_access_requests.py
supabase/migrations/061_access_requests.sql
.env.example
```

## Alcance funcional Fase 1

Implementar:

1. Modelo Pydantic de access requests.
2. Tabla canónica `access_requests`.
3. Validaciones de producto/source:

   ```text
   source = synergi_app  -> product = synergi
   source = data_lab_app -> product = data_lab
   source = landing      -> product = synergi | data_lab
   ```

4. Validaciones mínimas por producto:

   ```text
   product = synergi  -> requiere service_category y service_summary
   product = data_lab -> requiere intended_use o message
   ```

5. Verificación captcha compatible con:

   ```text
   recaptcha
   turnstile
   ```

6. Endpoint canónico:

   ```text
   POST /api/public/access-requests
   ```

7. Wrappers temporales si están en el spec:

   ```text
   POST /api/public/data-lab-access-requests
   POST /api/public/partner-admissions
   ```

   Los wrappers solo transforman payloads legacy al modelo `access_requests`.
   No deben contener lógica de decisión propia.

8. Persistencia como `pending`.
9. Respuesta con `request_id` y estado.
10. Tests unitarios y de rutas.

## No hacer

No hagas:

- No crear UI de administración todavía.
- No crear emails todavía.
- No tocar Synergi ni Data Lab.
- No borrar migraciones antiguas.
- No modificar migraciones ya existentes.
- No renombrar servicios legacy todavía.
- No cambiar globalmente de reCAPTCHA a Turnstile.
- No convertir servicios síncronos a async sin necesidad demostrada.
- No crear portal premium externo dentro de Nexus.

## Entrega esperada antes de aplicar cambios

Antes de modificar archivos, entrega:

1. Lista exacta de archivos que vas a tocar.
2. Confirmación del número de migración `061_access_requests.sql`.
3. Confirmación de que `public.py` ya está registrado o de si hace falta tocar `backend/api/main.py`.
4. Resumen de cómo mantendrás compatibilidad con reCAPTCHA.
5. Primer diff propuesto.

Después de aplicar cambios, entrega:

1. `git status --short`
2. `git diff --stat`
3. tests ejecutados
4. resultado de tests
5. riesgos restantes
6. commit sugerido, sin hacer commit hasta aprobación

## Commit sugerido si todo pasa

```text
docs/feat: add centralized access requests backend foundation
```

O, si el cambio incluye implementación real:

```text
feat: add centralized access requests intake backend
```
