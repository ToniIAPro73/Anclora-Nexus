# Prompt — Move Antigravity to Legacy

Actúa como agente técnico de mantenimiento del repositorio Anclora-Nexus.

## Objetivo

Mover la carpeta `.antigravity` completa a `legacy/agent-systems/antigravity`, dejando `.agent/prompts` como ubicación canónica de prompts de ejecución por feature.

## Contexto

El contenido de `.antigravity/prompts/` ya fue copiado y verificado en `.agent/prompts/`.

No borres `.antigravity`. Muévela completa a legacy usando `git mv`.

No hagas commit automáticamente.

No añadas `.codex/` ni `AGENTS.md`.

## Repositorio

`~/projects/anclora-nexus`

## Rama

`sdd/synergi-datalab-access-requests`

## Script único de ejecución

Copia y pega este bloque completo en terminal:

    cd ~/projects/anclora-nexus

    git switch sdd/synergi-datalab-access-requests

    echo "== Initial status =="
    git status -sb

    echo "== Pre-checks =="
    test -d .agent/prompts && echo "OK: .agent/prompts exists" || { echo "ERROR: .agent/prompts missing"; exit 1; }
    test -d .antigravity && echo "OK: .antigravity exists" || { echo "ERROR: .antigravity missing"; exit 1; }

    echo -n ".agent/prompts files before: "
    find .agent/prompts -type f | wc -l
    echo -n ".antigravity files before: "
    find .antigravity -type f | wc -l

    mkdir -p legacy/agent-systems

    git mv .antigravity legacy/agent-systems/antigravity

    cat > legacy/agent-systems/antigravity/README.md <<'MD'
    # Antigravity Legacy Agent System

    Estado: DEPRECATED  
    Fecha de deprecación: 2026-05-05

    ## Motivo

    El flujo operativo del proyecto Anclora Nexus deja de usar `.antigravity` como ubicación activa de prompts y reglas de ejecución.

    La ubicación canónica actual para prompts de agentes es `.agent/prompts/`.

    ## Regla vigente

    No añadir nuevos prompts a `.antigravity`.

    Todo nuevo prompt de ejecución por feature debe crearse en `.agent/prompts/features/<feature>/`.

    ## Motivo operativo

    Antigravity no puede instalarse en el portátil corporativo actual. El flujo de trabajo se centraliza en VS Code, Codex/Gemini/Claude y la estructura `.agent`.

    ## Trazabilidad

    Esta carpeta se conserva únicamente como histórico para evitar pérdida de contexto.
    MD

    echo "== Verify moved =="
    test ! -d .antigravity && echo "OK: .antigravity moved" || echo "ERROR: .antigravity still exists in root"
    test -d legacy/agent-systems/antigravity && echo "OK: legacy antigravity exists" || echo "ERROR: legacy antigravity missing"

    echo "== Counts =="
    echo -n ".agent/prompts files after: "
    find .agent/prompts -type f | wc -l
    echo -n "legacy antigravity files after: "
    find legacy/agent-systems/antigravity -type f | wc -l

    echo "== Active references to .antigravity outside legacy =="
    grep -Rni "\.antigravity" . \
      --exclude-dir=.git \
      --exclude-dir=node_modules \
      --exclude-dir=.next \
      --exclude-dir=legacy \
      | sed -n '1,160p' || true

    echo "== Git status =="
    git status --short

    echo "== Diff stat =="
    git diff --stat

## Criterios de aceptación

- `.antigravity` ya no existe en raíz.
- `legacy/agent-systems/antigravity` existe.
- `.agent/prompts` sigue intacto.
- Se crea `legacy/agent-systems/antigravity/README.md`.
- Se reportan referencias activas restantes a `.antigravity` fuera de legacy.
- No se hace commit automáticamente.
