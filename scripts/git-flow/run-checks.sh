#!/usr/bin/env bash
set -euo pipefail

echo "== Nexus checks =="

npm run lint
npm run build
npm run ops:guesthub-pilot:check-env

echo "== Checks completed =="