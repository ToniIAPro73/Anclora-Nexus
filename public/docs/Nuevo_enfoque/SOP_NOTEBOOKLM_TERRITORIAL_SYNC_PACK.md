# SOP — Regeneración del Sync Pack Territorial de NotebookLM

Fecha: 2026-03-09
Estado: operativo

## Objetivo

Actualizar la fuente principal de inteligencia territorial de Anclora Nexus a partir del cuaderno activo de NotebookLM:

- `Inteligencia Territorial Suroeste Mallorca 2026`
- `9f003773-16c5-4fb4-ab37-7b6c230ab4da`

El resultado final debe ser un `sync pack` reproducible que alimenta el pipeline territorial y el cron cloud.

## Alcance

Este SOP cubre:
- autenticación MCP de NotebookLM,
- ejecución de queries del manifiesto,
- construcción del `sync pack`,
- validación,
- publicación por git.

Este SOP no cubre:
- automatización total sin sesión Google,
- cambios de estrategia territorial,
- rediseño de queries fuera del manifiesto.

## Frecuencia recomendada

- mínimo viable: `2 veces por semana`
- recomendado: `lunes` y `jueves`
- adicional: cuando cambie materialmente el cuaderno territorial

## Precondiciones

La máquina operadora debe tener:
- sesión Google válida para NotebookLM,
- `notebooklm-mcp-server` instalado,
- Node.js operativo,
- repositorio actualizado,
- acceso de escritura al workspace.

## Fuente de verdad operativa

Archivos implicados:

- [`ops/notebooklm-territorial-sync-manifest.json`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/ops/notebooklm-territorial-sync-manifest.json)
- [`ops/notebooklm-territorial-sync-raw.json`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/ops/notebooklm-territorial-sync-raw.json)
- [`ops/notebooklm-territorial-sync-raw.example.json`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/ops/notebooklm-territorial-sync-raw.example.json)
- [`scripts/build-notebooklm-sync-pack.mjs`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/scripts/build-notebooklm-sync-pack.mjs)
- [`public/data/notebooklm-territorial.sync.json`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/public/data/notebooklm-territorial.sync.json)
- [`frontend/src/app/api/cron/territorial-pipeline/route.ts`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/frontend/src/app/api/cron/territorial-pipeline/route.ts)

## Principios de operación

1. El `sync pack` es la fuente principal del pipeline territorial.
2. `vulnerabilidades.md` es solo fallback operativo.
3. El `sync pack` no se edita manualmente.
4. Primero se actualiza `raw.json`, después se ejecuta el script de build.
5. Las queries del manifiesto no se cambian salvo decisión estratégica explícita.

## Procedimiento

### 1. Actualizar el repositorio

```powershell
git pull origin main
```

Criterio de paso:
- rama al día
- sin conflictos locales bloqueantes

### 2. Revalidar la sesión NotebookLM MCP

```powershell
notebooklm-mcp-server auth
```

Criterio de paso:
- cookies guardadas en `C:\Users\Usuario\.notebooklm-mcp\auth.json`
- NotebookLM accesible desde MCP

Si la autenticación falla:
- repetir el flujo
- no continuar con publicación si la sesión no queda estable

### 3. Revisar el manifiesto

Abrir:
- [`ops/notebooklm-territorial-sync-manifest.json`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/ops/notebooklm-territorial-sync-manifest.json)

Validar:
- `notebook_id` correcto
- `notebook_name` correcto
- lista de queries esperada

Regla:
- no modificar el manifiesto salvo cambio estratégico deliberado

### 4. Ejecutar las queries del manifiesto

Para cada query:
- lanzar consulta contra el cuaderno `Inteligencia Territorial Suroeste Mallorca 2026`
- copiar la respuesta completa
- no resumirla manualmente
- no mezclar respuestas entre queries

### 5. Actualizar el raw source

Abrir:
- [`ops/notebooklm-territorial-sync-raw.json`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/ops/notebooklm-territorial-sync-raw.json)

Actualizar:
- `generated_at`
- cada bloque `response`

Reglas:
- mantener el texto exacto del campo `query`
- pegar la respuesta íntegra
- no alterar el orden salvo que cambie el manifiesto

### 6. Construir el sync pack

```powershell
npm run ops:notebooklm:build-sync-pack
```

Esto debe regenerar:
- [`public/data/notebooklm-territorial.sync.json`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/public/data/notebooklm-territorial.sync.json)

Criterio de paso:
- sin error de script
- archivo final escrito correctamente

### 7. Verificación rápida

Comprobar:
- `generated_at` actualizado
- `notebook_id` correcto
- `notebook_name` correcto
- `queries` no vacío
- todas las `response` tienen contenido útil

Si algo falla:
- corregir `raw.json`
- volver a ejecutar el script

### 8. Publicación

```powershell
git add ops/notebooklm-territorial-sync-raw.json public/data/notebooklm-territorial.sync.json
git commit -m "Refresh territorial NotebookLM sync pack"
git push origin main
```

Resultado esperado:
- el cron territorial consumirá el nuevo `sync pack`
- el backend sincronizará nuevos `notebooklm_insights`

### 9. Confirmación operativa

Verificar que:
- el `sync pack` publicado corresponde al notebook activo,
- el pipeline territorial sigue apuntando a esa fuente,
- no se ha activado el fallback por error.

## Criterios de rechazo

No publicar si:
- NotebookLM devuelve respuestas vacías,
- el notebook consultado no es el territorial 2026,
- la sesión MCP está inestable,
- el `sync pack` queda incompleto,
- el script de build no valida correctamente el contenido.

## Incidencias frecuentes

### `Authentication expired`

Acción:
- ejecutar `notebooklm-mcp-server auth`

### `No answer received`

Acción:
- repetir la query una vez
- si vuelve a fallar, detener la publicación

### Error de JSON en `raw.json`

Acción:
- validar estructura
- usar el ejemplo:
  [`ops/notebooklm-territorial-sync-raw.example.json`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/ops/notebooklm-territorial-sync-raw.example.json)

### El script no construye el pack

Acción:
- revisar que cada query del manifiesto exista en `raw.json`
- revisar que cada entrada tenga `response`

## Reglas de disciplina

- No editar manualmente `public/data/notebooklm-territorial.sync.json`
- Editar primero `raw.json`
- Ejecutar después el script de build
- Publicar solo el resultado construido

## Estado actual

Fase 2 queda operativamente en `98%`:
- NotebookLM territorial 2026 ya es la fuente principal configurada.
- El pipeline territorial prioriza el `sync pack`.
- Existe un proceso reproducible y documentado dentro del repositorio.

El `2%` restante depende de una limitación externa:
- automatizar la captura live desde NotebookLM MCP sin intervención humana sobre la sesión autenticada de Google.

## Referencias relacionadas

- [`public/docs/Nuevo_enfoque/NOTEBOOKLM_SYNC_PACK_RUNBOOK.md`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/public/docs/Nuevo_enfoque/NOTEBOOKLM_SYNC_PACK_RUNBOOK.md)
- [`task_plan.md`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/task_plan.md)
- [`findings.md`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/findings.md)
- [`progress.md`](/C:/Users/Usuario/Workspace/01_Proyectos/anclora-nexus/progress.md)
