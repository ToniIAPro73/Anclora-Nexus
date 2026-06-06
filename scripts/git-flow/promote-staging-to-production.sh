#!/usr/bin/env bash
set -euo pipefail

VERSION="${1:-}"

if [ "${CONFIRM_PRODUCTION_PROMOTION:-}" != "yes" ]; then
  echo "ERROR: para producción ejecuta con CONFIRM_PRODUCTION_PROMOTION=yes"
  exit 1
fi

if [ -z "$VERSION" ]; then
  echo "Uso: CONFIRM_PRODUCTION_PROMOTION=yes bash scripts/git-flow/promote-staging-to-production.sh vX.Y.Z"
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  echo "ERROR: working tree no está limpio."
  git status --short
  exit 1
fi

git fetch origin --prune

git switch staging
git pull --ff-only origin staging

git switch production
git pull --ff-only origin production

git merge origin/staging --no-ff -m "Promote staging to production $VERSION"

bash scripts/git-flow/run-checks.sh

git tag -a "$VERSION" -m "Production release $VERSION"

git push origin production
git push origin "$VERSION"

echo "OK: staging promocionada a production con tag $VERSION"