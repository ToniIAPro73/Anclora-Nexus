#!/usr/bin/env bash
set -euo pipefail

echo "== Nexus checks =="

npm run lint
npm run build
npm run ops:syncxml-pilot:check-env

echo "== Checks completed =="