#!/usr/bin/env bash
set -euo pipefail

AGENT="${1:-}"
DESC="${2:-}"

if [ -z "$AGENT" ] || [ -z "$DESC" ]; then
  echo "Uso: bash scripts/git-flow/start-agent-branch.sh <agente> <descripcion>"
  echo "Ejemplo: bash scripts/git-flow/start-agent-branch.sh codex mejora-landing"
  exit 1
fi

BRANCH="feat/${AGENT}-${DESC}"

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: working tree no está limpio."
  git status --short
  exit 1
fi

git fetch origin --prune
git switch development
git pull --ff-only origin development
git switch -c "$BRANCH"

echo "OK: rama creada: $BRANCH"
echo "Cuando termines:"
echo "  git add ."
echo "  git commit -m \"feat(scope): resumen\""
echo "  git push -u origin $BRANCH"