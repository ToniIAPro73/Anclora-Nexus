#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
JWT="${JWT:-}"
ORG_ID="${ORG_ID:-}"
TRACE_ID="${TRACE_ID:-smoke-2026-03-10-001}"
SNAPSHOT_ID="${SNAPSHOT_ID:-smoke-2026-03-10}"

if [[ -z "$JWT" ]]; then
  echo "Missing JWT env var"
  echo "Example: export JWT='eyJ...'"
  exit 1
fi

if [[ -z "$ORG_ID" ]]; then
  echo "Missing ORG_ID env var"
  echo "Example: export ORG_ID='00000000-0000-0000-0000-000000000000'"
  exit 1
fi

echo "==> POST ${BACKEND_URL}/api/ingestion/seller-signals"
curl -i -X POST "${BACKEND_URL}/api/ingestion/seller-signals" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"org_id\": \"${ORG_ID}\",
    \"connector_name\": \"smoke:manual-seller-signal\",
    \"trace_id\": \"${TRACE_ID}\",
    \"snapshot_id\": \"${SNAPSHOT_ID}\",
    \"signals\": [
      {
        \"external_id\": \"smoke-seller-001\",
        \"nombre_propietario\": \"Seller Smoke Test\",
        \"website_url\": \"https://example.com/seller-smoke-test\",
        \"direccion\": \"Test address Mallorca\",
        \"zona\": \"palma\",
        \"fuente\": \"manual\",
        \"prioridad\": 4,
        \"senales_motivacion\": [\"smoke_test\"]
      }
    ]
  }"

echo
echo "==> GET ${BACKEND_URL}/api/ingestion/events?limit=5&entity_type=seller_signal"
curl -i "${BACKEND_URL}/api/ingestion/events?limit=5&entity_type=seller_signal" \
  -H "Authorization: Bearer ${JWT}"

echo
echo "Done."
