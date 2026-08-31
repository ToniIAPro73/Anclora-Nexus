#!/usr/bin/env python3
# Smoke task for the GuestHub controlled pilot (renamed from Anclora SyncXML, 2026-08).
# NOTE: persisted values task_type="syncxml_pilot_review" and origin="anclora-syncxml"
# stay legacy on purpose — they mirror live DB rows and constraints; no data migration.
import os
import sys
from datetime import datetime, timezone


required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "PUBLIC_CTA_ORG_ID"]
missing = [name for name in required if not os.getenv(name)]
if missing:
    print(f"Missing required environment variables: {', '.join(missing)}", file=sys.stderr)
    sys.exit(2)

if os.getenv("ALLOW_REAL_SUPABASE_WRITE", "false").lower() != "true":
    print("Refusing real Supabase write without ALLOW_REAL_SUPABASE_WRITE=true.")
    print("Dry-run payload:")
    print(
        {
            "task_type": "syncxml_pilot_review",
            "origin": "anclora-syncxml",
            "entity_type": "pilot_request",
            "title": "Revisar piloto GuestHub · smoke@example.com",
        }
    )
    sys.exit(0)

try:
    from supabase import create_client
except Exception as exc:
    print(f"Supabase client is not installed: {exc}", file=sys.stderr)
    sys.exit(2)

client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
payload = {
    "org_id": os.environ["PUBLIC_CTA_ORG_ID"],
    "title": f"Revisar piloto GuestHub · smoke-{datetime.now(timezone.utc).isoformat()}",
    "status": "pending",
    "task_type": "syncxml_pilot_review",
    "origin": "anclora-syncxml",
    "entity_type": "pilot_request",
    "entity_id": "smoke",
    "metadata": {"smoke": True, "badge": "GuestHub · Piloto controlado"},
}
result = client.table("tasks").insert(payload).execute()
print({"ok": bool(result.data), "data": result.data})
