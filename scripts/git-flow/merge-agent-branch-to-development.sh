#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-}"

if [ -z "$BRANCH" ]; then
  echo "Uso: bash scripts/git-flow/merge-agent-branch-to-development.sh <branch>"
  echo "Ejemplo: bash scripts/git-flow/merge-agent-branch-to-development.sh feat/codex-mejora-landing"
  exit 1
fi

case "$BRANCH" in
  feat/*|fix/*|chore/*|hotfix/*)
    ;;
  *)
    echo "ERROR: rama no permitida: $BRANCH"
    echo "Prefijos permitidos: feat/, fix/, chore/, hotfix/"
    exit 1
    ;;
esac

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: working tree no está limpio."
  git status --short
  exit 1
fi

git fetch origin --prune

if ! git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  echo "ERROR: no existe origin/$BRANCH"
  exit 1
fi

git switch development
git pull --ff-only origin development

git merge "origin/$BRANCH" --no-ff -m "Merge $BRANCH into development"

bash scripts/git-flow/run-checks.sh

git push origin development

echo "OK: $BRANCH integrado en development y subido a origin/development"