#!/usr/bin/env bash
set -euo pipefail

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: working tree no está limpio."
  git status --short
  exit 1
fi

git fetch origin --prune

git switch development
git pull --ff-only origin development

git switch staging
git pull --ff-only origin staging

git merge origin/development --no-ff -m "Promote development to staging"

bash scripts/git-flow/run-checks.sh

git push origin staging

echo "OK: development promocionada a staging"