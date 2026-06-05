#!/usr/bin/env bash
set -euo pipefail

INPUT="${1:-}"
PROJECT="${2:-nexus}"
BACKEND="${3:-${MINERU_DEFAULT_BACKEND:-pipeline}}"

if [ -z "$INPUT" ]; then
  echo "Uso: scripts/ingest-with-mineru.sh <documento> [proyecto] [backend]"
  exit 1
fi

"$HOME/projects/agent-tooling/mineru/bin/mineru-agent-ingest.sh" "$INPUT" "$PROJECT" "$BACKEND"
