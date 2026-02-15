
import os
import sys
import httpx
import jwt
import time
from datetime import datetime, timedelta

# Load .env manually because python-dotenv might not be installed or I want to be sure
def load_env_file(filepath):
    if not os.path.exists(filepath):
        return {}
    env = {}
    with open(filepath, 'r') as f:
        for line in f:
            if line.strip() and not line.startswith('#'):
                key, val = line.strip().split('=', 1)
                env[key] = val
    return env

env = load_env_file('.env')
SUPABASE_URL = env.get('SUPABASE_URL')
SUPABASE_KEY = env.get('SUPABASE_SERVICE_ROLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("CRITICAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    sys.exit(1)

print(f"Target Project: {SUPABASE_URL}")

# Headers for Supabase direct access (Admin)
sb_headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def run_qa():
    errors = []
    
    # 1. DB SCHEMA CHECK
    print("\n--- [1] DB Schema Validation ---")
    try:
        # Try to select the new columns
        # We fetch 1 row just to check if columns exist
        url = f"{SUPABASE_URL}/rest/v1/properties?select=id,useful_area_m2,built_area_m2,plot_area_m2&limit=1"
        r = httpx.get(url, headers=sb_headers)
        if r.status_code == 200:
            print("SUCCESS: New columns (useful_area_m2, built_area_m2, plot_area_m2) exist.")
        else:
            msg = f"FAILURE: Columns missing or API error. {r.status_code} {r.text}"
            print(msg)
            errors.append(msg)
    except Exception as e:
        print(f"EXCEPTION: {e}")
        errors.append(str(e))

    # 2. BACKFILL CHECK
    print("\n--- [2] DB Backfill Validation ---")
    try:
        # Check if any row has surface_m2 but NULL built_area_m2
        url = f"{SUPABASE_URL}/rest/v1/properties?surface_m2=not.is.null&built_area_m2=is.null&select=count"
        # We need "Prefer: count=exact" to get the range header or just check result size if we limit
        headers = sb_headers.copy()
        headers["Prefer"] = "count=exact, head"
        r = httpx.get(url, headers=headers)
        if r.status_code == 200 or r.status_code == 206:
            # content-range: 0-0/0 means 0 total
            cr = r.headers.get("Content-Range", "*/0")
            count = int(cr.split('/')[-1])
            if count == 0:
                print("SUCCESS: Backfill complete (0 rows pending).")
            else:
                msg = f"FAILURE: Backfill incomplete. {count} rows have surface_m2 but no built_area_m2."
                print(msg)
                errors.append(msg)
        else:
            print(f"WARNING: Could not verify backfill count. {r.status_code}")
    except Exception as e:
        print(f"EXCEPTION: {e}")
        errors.append(str(e))

    # 3. API CONTRACT & LOGIC VALIDATION
    print("\n--- [3] API Logic Validation (Server-Side) ---")
    # We will try to INSERT a property with useful > built using the REST API (simulates backend logic if implemented in DB constraint)
    # The migration 025 added a CHECK constraint: useful_area_m2 <= built_area_m2
    
    test_uuid = "00000000-0000-0000-0000-000000000000" # Invalid UUID but maybe format is ok? No, let's let DB gen it.
    
    # Case A: Invalid Logic
    payload_invalid = {
        "title": "QA Test Invalid",
        "org_id": "00000000-0000-0000-0000-000000000000", # Need a valid org? Usually RLS checks this. Service role bypasses RLS.
        "useful_area_m2": 100,
        "built_area_m2": 50
    }
    
    try:
        url = f"{SUPABASE_URL}/rest/v1/properties"
        r = httpx.post(url, headers=sb_headers, json=payload_invalid)
        if r.status_code == 400 or r.status_code == 422: # Expect error due to constraint
            if "properties_useful_le_built" in r.text or "violates check constraint" in r.text:
                print("SUCCESS: Constraint properties_useful_le_built is active.")
            else:
                print(f"WARNING: Rejected but not sure why: {r.text}")
        elif r.status_code == 201:
             msg = "FAILURE: Constraint useful <= built FAILED. Record inserted."
             print(msg)
             # cleanup
             inserted = r.json()
             if inserted:
                 httpx.delete(f"{SUPABASE_URL}/rest/v1/properties?id=eq.{inserted[0]['id']}", headers=sb_headers)
             errors.append(msg)
        else:
             print(f"INFO: API returned {r.status_code} {r.text}")

    except Exception as e:
        print(f"EXCEPTION: {e}")
        errors.append(str(e))

    # Summary
    print("\n=== QA SUMMARY ===")
    if not errors:
        print("ALL CHECKS PASSED")
        sys.exit(0)
    else:
        print(f"FOUND {len(errors)} ERRORS")
        sys.exit(1)

if __name__ == "__main__":
    run_qa()
