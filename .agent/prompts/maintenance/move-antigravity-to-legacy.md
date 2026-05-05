# Prompt — Move Antigravity to Legacy

Actúa como agente técnico de mantenimiento del repositorio Anclora-Nexus.

## Objetivo

Mover la carpeta `.antigravity` a una ubicación legacy para dejar `.agent/prompts` como ubicación canónica de prompts de ejecución por feature.

## Contexto

Ya se ha copiado y verificado todo el contenido de:

```text
.antigravity/prompts/
```

en:

```text
.agent/prompts/
```

La nueva ubicación canónica es:

```text
.agent/prompts/
```

La carpeta `.antigravity` queda obsoleta porque Antigravity ya no se puede usar en el portátil corporativo actual. Aun así, no queremos perder trazabilidad histórica. Por tanto, en esta fase NO borres `.antigravity`; muévela completa a una carpeta legacy.

## Repositorio

```text
~/projects/anclora-nexus
```

## Rama

```text
sdd/synergi-datalab-access-requests
```

## Tareas

1. Asegúrate de estar en la rama correcta:

```bash
git switch sdd/synergi-datalab-access-requests
```

2. Comprueba estado antes de empezar:

```bash
git status --short
```

3. Verifica que `.agent/prompts` existe y contiene archivos:

```bash
find .agent/prompts -type f | wc -l
```

4. Verifica que `.antigravity` existe:

```bash
test -d .antigravity && echo "OK: .antigravity exists"
```

5. Crea la carpeta legacy:

```bash
mkdir -p legacy/agent-systems
```

6. Mueve `.antigravity` completa a:

```text
legacy/agent-systems/antigravity
```

Usa `git mv` para conservar trazabilidad:

```bash
git mv .antigravity legacy/agent-systems/antigravity
```

7. Añade un README de deprecación en:

```text
legacy/agent-systems/antigravity/README.md
```

Contenido exacto:

```markdown
# Antigravity Legacy Agent System

Estado: DEPRECATED  
Fecha de deprecación: 2026-05-05

## Motivo

El flujo operativo del proyecto Anclora Nexus deja de usar `.antigravity` como ubicación activa de prompts y reglas de ejecución.

La ubicación canónica actual para prompts de agentes es:

```text
.agent/prompts/
```

## Regla vigente

No añadir nuevos prompts a `.antigravity`.

Todo nuevo prompt de ejecución por feature debe crearse en:

```text
.agent/prompts/features/<feature>/
```

## Motivo operativo

Antigravity no puede instalarse en el portátil corporativo actual. El flujo de trabajo se centraliza en VS Code, Codex/Gemini/Claude y la estructura `.agent`.

## Trazabilidad

Esta carpeta se conserva únicamente como histórico para evitar pérdida de contexto.
```

8. Verifica que ya no existe `.antigravity` en raíz:

```bash
test ! -d .antigravity && echo "OK: .antigravity moved"
```

9. Verifica que el contenido legacy existe:

```bash
find legacy/agent-systems/antigravity -maxdepth 3 -type f | sort | sed -n '1,80p'
```

10. Verifica que `.agent/prompts` sigue intacto:

```bash
find .agent/prompts -type f | wc -l
```

11. Busca referencias activas a `.antigravity` fuera de legacy:

```bash
grep -Rni "\.antigravity" . \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=legacy \
  | sed -n '1,240p' || true
```

12. No edites todavía las referencias encontradas. Solo repórtalas.

13. Muestra resumen final:

```bash
echo "== Git status =="
git status --short

echo "== Diff stat =="
git diff --stat
```

## Criterios de aceptación

- `.antigravity` ya no existe en raíz.
- `legacy/agent-systems/antigravity` contiene el contenido anterior.
- `.agent/prompts` sigue intacto.
- No se modifica el contenido de prompts durante el movimiento.
- Se crea README de deprecación.
- Se reportan referencias activas restantes a `.antigravity`.
- No se hace commit automáticamente.

## Comandos sugeridos completos

```bash
cd ~/projects/anclora-nexus

git switch sdd/synergi-datalab-access-requests
git status --short

echo "== Current prompt counts =="
find .agent/prompts -type f | wc -l
find .antigravity -type f | wc -l

mkdir -p legacy/agent-systems

git mv .antigravity legacy/agent-systems/antigravity

cat > legacy/agent-systems/antigravity/README.md <<'MD'
# Antigravity Legacy Agent System

Estado: DEPRECATED  
Fecha de deprecación: 2026-05-05

## Motivo

El flujo operativo del proyecto Anclora Nexus deja de usar `.antigravity` como ubicación activa de prompts y reglas de ejecución.

La ubicación canónica actual para prompts de agentes es:

```text
.agent/prompts/
```

## Regla vigente

No añadir nuevos prompts a `.antigravity`.

Todo nuevo prompt de ejecución por feature debe crearse en:

```text
.agent/prompts/features/<feature>/
```

## Motivo operativo

Antigravity no puede instalarse en el portátil corporativo actual. El flujo de trabajo se centraliza en VS Code, Codex/Gemini/Claude y la estructura `.agent`.

## Trazabilidad

Esta carpeta se conserva únicamente como histórico para evitar pérdida de contexto.
MD

echo "== Verify moved =="
test ! -d .antigravity && echo "OK: .antigravity moved"
test -d legacy/agent-systems/antigravity && echo "OK: legacy antigravity exists"

echo "== Agent prompts count =="
find .agent/prompts -type f | wc -l

echo "== Legacy antigravity sample =="
find legacy/agent-systems/antigravity -maxdepth 3 -type f | sort | sed -n '1,80p'

echo "== Active references to .antigravity outside legacy =="
grep -Rni "\.antigravity" . \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  --exclude-dir=legacy \
  | sed -n '1,240p' || true

echo "== Git status =="
git status --short

echo "== Diff stat =="
git diff --stat
```
