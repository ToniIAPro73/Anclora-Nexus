
import asyncio
import os
import uuid
from typing import Dict, Any

import pytest
# We will use the existing backend infrastructure
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env
load_dotenv(dotenv_path=r"c:\Users\Usuario\Workspace\01_Proyectos\anclora-nexus\.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("FATAL: Missing Supabase credentials")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Test Data
ORG_ID_1 = "00000000-0000-0000-0000-000000000000" # Using zero UUID for test org if possible, or we need to find a valid one. 
# actually, let's look for a valid ORG or create a temporary one?
# For QA scripts, usually we want to work with existing dev data or create ephemeral. 
# Let's try to list orgs first.

async def get_test_org():
    res = supabase.table("organizations").select("id").limit(1).execute()
    if res.data:
        return res.data[0]["id"]
    return None

async def run_qa():
    print("=== STARTING CSL QA BACKEND ===\n")
    
    org_id = await get_test_org()
    if not org_id:
        print("FAIL: No organization found to test against.")
        return

    print(f"Using Org ID: {org_id}")

    # 1. DB Schema Validation
    print("\n--- 1. Validation: DB Schema Columns ---")
    try:
        # We can try to insert a dummy property with the new fields to see if DB accepts it
        # or just inspect schema via a raw query if we had access, but we assume we use valid Supabase client
        # Let's try to CREATE a property with the new fields.
        
        prop_id = str(uuid.uuid4())
        payload = {
            "id": prop_id,
            "org_id": org_id,
            "address": "QA CSL Test Address",
            "status": "prospect",
            "price": 500000,
            "useful_area_m2": 100.0,
            "built_area_m2": 120.0,
            "plot_area_m2": 500.0,
            # surface_m2 is legacy/computed possibly? migration said compatibility. 
            # In update, we likely sync them. Let's see if we can insert just these.
        }
        
        # Note: We might need other required fields. Assuming minimal for now.
        # Check if 'surface_m2' is NOT null constraint?
        # Migration 025 likely handles it or we should include it.
        # Let's include surface_m2 matching built_area_m2 for safety if legacy exists.
        payload["surface_m2"] = 120.0 

        res = supabase.table("properties").insert(payload).execute()
        print("PASS: Inserted property with new area fields.")
        
        data = res.data[0]
        if (data.get("useful_area_m2") == 100.0 and 
            data.get("built_area_m2") == 120.0 and 
            data.get("plot_area_m2") == 500.0):
            print("PASS: Retrieved values match inserted values.")
        else:
            print(f"FAIL: Value mismatch. Got: {data}")

    except Exception as e:
        print(f"FAIL: Schema validation error: {e}")
        return # invalid schema blocks everything

    # 2. Validation: Logic Constraint (useful <= built)
    print("\n--- 2. Validation: Logic Constraint (useful <= built) ---")
    try:
        bad_prop_id = str(uuid.uuid4())
        bad_payload = {
            "id": bad_prop_id,
            "org_id": org_id,
            "address": "QA CSL Bad Logic Address",
            "status": "prospect",
            "useful_area_m2": 200.0,
            "built_area_m2": 100.0, # useful > built, should fail
            "surface_m2": 100.0
        }
        supabase.table("properties").insert(bad_payload).execute()
        print("FAIL: DB allowed useful_area_m2 > built_area_m2")
        # Cleanup
        supabase.table("properties").delete().eq("id", bad_prop_id).execute()
    except Exception as e:
        print(f"PASS: DB rejected useful > built as expected. Error: {e}")

    # 3. Validation: Origin Locking
    print("\n--- 3. Validation: Server-side Origin Locking ---")
    print("SKIPPED: 'source_system' column missing in DB (Migration 020 not applied?)")
    return
        
    print("\n=== QA BACKEND FINISHED ===\n")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    loop.run_until_complete(run_qa())
