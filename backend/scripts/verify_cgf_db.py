
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env from root
if os.path.exists(".env"):
    load_dotenv(dotenv_path=".env")
else:
    load_dotenv(dotenv_path="../.env")

url: str = os.environ.get("SUPABASE_URL")
if not url:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")

key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found")
    sys.exit(1)

supabase: Client = create_client(url, key)

tables_to_check = ["org_cost_policies", "org_cost_usage_events", "org_cost_alerts"]

print("=== DB Verification for ANCLORA-CGF-001 ===")

errors = []

for table in tables_to_check:
    try:
        response = supabase.table(table).select("*").limit(1).execute()
        print(f"[OK] Table '{table}' exists and is accessible.")
        if table == "org_cost_policies":
             # Check if there is at least one policy (backfill check)
             if len(response.data) > 0:
                 print(f"  [OK] Backfill confirmed: found {len(response.data)} policies.")
             else:
                 print(f"  [WARNING] Table '{table}' is empty. Backfill might have failed.")
                 errors.append(f"Table '{table}' is empty")
    except Exception as e:
        print(f"[ERROR] Failed to access table '{table}': {e}")
        errors.append(f"Missing table '{table}'")

if errors:
    print("\n[FAIL] DB Verification failed.")
    sys.exit(1)
else:
    print("\n[SUCCESS] All tables verified.")
    sys.exit(0)
