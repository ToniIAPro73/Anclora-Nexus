import asyncio
import os
import sys
from dotenv import load_dotenv

# Path setup
sys.path.append(os.getcwd())

from backend.services.finops import finops_service
from backend.models.finops import BudgetUpdate, UsageEventSchema

async def verify_hard_stop():
    print("=== Verifying Hard-Stop Enforcement ===")
    
    # 1. Setup an org with a 0 budget or very low budget
    test_org_id = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf" # Use the same one from logic test
    
    print(f"Setting budget = 1 EUR for Org {test_org_id}...")
    await finops_service.update_budget_policy(test_org_id, BudgetUpdate(
        monthly_budget_eur=1.0,
        warning_threshold_pct=50.0,
        hard_stop_threshold_pct=90.0,
        hard_stop_enabled=True
    ))
    
    # 2. Log usage to trigger hard_stop
    print("Logging 10 EUR usage to trigger hard-stop...")
    await finops_service.log_usage_event(test_org_id, UsageEventSchema(
        capability_code="test_lockdown",
        units=1.0,
        cost_eur=10.0
    ))
    
    status = await finops_service.get_budget_status(test_org_id)
    print(f"Current Status: {status.status}")
    
    if status.status != "hard_stop":
        print("[FAIL] Could not reach hard_stop status.")
        return

    print("\n[OK] Hard-stop status reached. Testing API routes locally...")
    
    # Instead of full HTTP request (complex to setup FastAPI client here without server running),
    # we can manually call the dependency function with the test org_id.
    from backend.api.deps import check_budget_hard_stop
    
    try:
        print("Checking check_budget_hard_stop dependency for this org...")
        await check_budget_hard_stop(test_org_id)
        print("[FAIL] check_budget_hard_stop did NOT raise HTTPException 402.")
    except Exception as e:
        if hasattr(e, "status_code") and e.status_code == 402:
            print(f"[SUCCESS] Dependency correctly raised: {e}")
        else:
            print(f"[FAIL] Unexpected exception: {e}")

    # Reset for cleanliness
    print("\nResetting budget to 1000 EUR...")
    await finops_service.update_budget_policy(test_org_id, BudgetUpdate(
        monthly_budget_eur=1000.0
    ))

if __name__ == "__main__":
    asyncio.run(verify_hard_stop())
