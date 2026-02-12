import asyncio
from backend.services.llm_service import llm_service
from backend.services.supabase_service import supabase_service
from backend.skills.recap_weekly import run_recap_weekly

async def verify_recap():
    print("--- VERIFYING RECAP SKILL ---")
    data = {"days": 7, "org_id": "00000000-0000-0000-0000-000000000000"} # Placeholder org_id for dev
    
    # Run skill directly
    print("Running recap_weekly skill...")
    result = await run_recap_weekly(data, llm_service, supabase_service)
    
    print("\nResult:")
    print(f"Summary: {result.get('luxury_summary')[:100]}...")
    print(f"Metrics: {result.get('metrics')}")
    print(f"Action: {result.get('top_action')}")
    
    # Check if we can save it (this will likely fail if the org_id doesn't exist, but it validates the call)
    try:
        print("\nAttempting to save recap to DB...")
        # We try to use the service directly to test DB connectivity/schema
        # Note: If this fails due to RLS or missing org_id, it's expected in some envs
        # but the skill logic itself is what we are primarily testing.
        await supabase_service.insert_weekly_recap({
            "org_id": "da5e9127-6f6a-4972-871d-157608827725", # Try to find a valid one or use seed
            "week_start": result["week_start"],
            "week_end": result["week_end"],
            "metrics": result["metrics"],
            "insights": result["luxury_summary"],
            "top_actions": {"action": result["top_action"]}
        })
        print("Recap saved successfully.")
    except Exception as e:
        print(f"Post-processing DB save skipped or failed (expected if no valid org_id): {e}")

if __name__ == "__main__":
    asyncio.run(verify_recap())
