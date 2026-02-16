import asyncio
import os
import sys
from dotenv import load_dotenv

# Ensure backend root is in path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.services.dq_service import dq_service
from backend.services.supabase_service import supabase_service
from backend.models.dq import EntityType, ResolutionAction

load_dotenv()

# Fixed Org ID for testing
TEST_ORG_ID = "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" 

async def verify_dq():
    print(f"Verifying DQ for Org: {TEST_ORG_ID}")
    
    # 1. Trigger Recompute
    print("\nRunning recompute_all...")
    try:
        await dq_service.recompute_all(TEST_ORG_ID)
        print("Recompute successful.")
    except Exception as e:
        print(f"Recompute FAILED: {e}")
        return

    # 2. Check Metrics
    print("\nFetching metrics...")
    try:
        metrics = await dq_service.get_metrics(TEST_ORG_ID)
        print(f"Metrics: {metrics}")
    except Exception as e:
        print(f"Metrics FAILED: {e}")

    # 3. Fetch Issues
    print("\nFetching issues...")
    try:
        issues_resp = await dq_service.get_issues(TEST_ORG_ID, limit=5)
        print(f"Found {issues_resp.total_count} issues. Showing first {len(issues_resp.issues)}:")
        for iss in issues_resp.issues:
            print(f" - {iss.issue_type} ({iss.severity}): {iss.issue_payload}")
    except Exception as e:
        print(f"Get Issues FAILED: {e}")

    # 4. Fetch Candidates and Resolve one
    print("\nFetching candidates to test resolution...")
    resp = supabase_service.client.table("dq_entity_candidates").select("*").eq("org_id", TEST_ORG_ID).eq("status", "suggested_merge").limit(1).execute()
    candidates = resp.data or []
    
    if candidates:
        candidate = candidates[0]
        cid = candidate["id"]
        print(f"Resolving candidate {cid} as REJECTED_MERGE...")
        try:
            res = await dq_service.resolve_candidate(
                org_id=TEST_ORG_ID,
                candidate_id=cid,
                action=ResolutionAction.REJECT_MERGE,
                details={"reason": "Manual verification test"}
            )
            print(f"Resolution Result: {res}")
            
            # Verify Log
            log_resp = supabase_service.client.table("dq_resolution_log").select("*").eq("candidate_id", cid).execute()
            if log_resp.data:
                print("Log entry verified.")
            else:
                print("Log entry MISSING!")
                
        except Exception as e:
            print(f"Resolution FAILED: {e}")
    else:
        print("No candidates found to test resolution.")

if __name__ == "__main__":
    asyncio.run(verify_dq())
