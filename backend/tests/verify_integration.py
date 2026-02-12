import asyncio
import json
import hmac
import hashlib
from datetime import datetime
from backend.services.supabase_service import supabase_service
from backend.agents.graph import agent_executor

async def verify_integration():
    print("--- STARTING INTEGRATION VERIFICATION ---")
    
    # 0. Get Existing Organization
    print("\n0. Fetching Organization...")
    # 0. Get Existing Organization
    print("\n0. Fetching Organization...")
    org_response = supabase_service.client.table("organizations").select("*").limit(1).execute()
    if not org_response.data:
        print("No organization found. Creating default...")
        org_response = supabase_service.client.table("organizations").insert([
            {"name": "Anclora Private Estates", "slug": "anclora-private-estates"}
        ]).execute()
    
    org_id = org_response.data[0]["id"]
    supabase_service.fixed_org_id = org_id # Update service with real ID
    print(f"Using Organization ID: {org_id}")
    print("\n1. Verifying Constitutional Limits...")
    supabase_service.client.table("constitutional_limits").upsert([
        {"org_id": org_id, "limit_type": "max_daily_leads", "limit_value": 50, "description": "Max leads per day v0"},
        {"org_id": org_id, "limit_type": "max_llm_tokens_per_day", "limit_value": 100000, "description": "Max tokens per day v0"}
    ]).execute()
    limits = await supabase_service.get_constitutional_limits(org_id)
    print(f"Limits found: {limits}")
    
    # 2. Verify audit_log Signature
    print("\n2. Verifying audit_log Signature...")
    test_audit = {
        "org_id": org_id,
        "actor_type": "system",
        "actor_id": "verification_script",
        "action": "test.signature",
        "details": {"test": "data"}
    }
    log_entry = await supabase_service.insert_audit_log(test_audit)
    print(f"Audit log entry created with signature: {log_entry.get('signature')}")
    
    # 3. Verify limit_check node (Blocking)
    print("\n3. Verifying limit_check node (Blocking)...")
    # Temporarily set limit to 0 to force block
    supabase_service.client.table("constitutional_limits").update({"limit_value": 0}).eq("limit_type", "max_daily_leads").execute()
    
    initial_state = {
        "input_data": {"name": "Test Lead"},
        "skill_name": "lead_intake",
        "org_id": org_id,
        "status": "pending"
    }
    
    result = await agent_executor.ainvoke(initial_state)
    print(f"Execution status: {result.get('status')} (Expected: success if finalize node is reached)")
    print(f"Limits OK: {result.get('limits_ok')} (Expected: False)")
    print(f"Error: {result.get('error')}")
    
    # Restore limit
    supabase_service.client.table("constitutional_limits").update({"limit_value": 50}).eq("limit_type", "max_daily_leads").execute()
    
    # 4. Verify audit_log Immutability (Manual update attempt)
    print("\n4. Verifying audit_log Immutability...")
    try:
        supabase_service.client.table("audit_log").update({"action": "hacked"}).eq("id", log_entry["id"]).execute()
        print("WARNING: Audit log UPDATE succeeded! (This should have failed)")
    except Exception as e:
        print(f"Audit log UPDATE failed as expected: {str(e)}")

    print("\n--- VERIFICATION COMPLETED ---")

if __name__ == "__main__":
    asyncio.run(verify_integration())
