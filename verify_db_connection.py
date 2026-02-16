import asyncio
import sys
import os

# Ensure backend modules are found
sys.path.append(os.getcwd())

from backend.services.supabase_service import supabase_service

async def verify_connection():
    print(f"Testing connection to: {supabase_service.client.supabase_url}")
    try:
        # Try a simple public table query
        response = supabase_service.client.table("dq_quality_issues").select("count", count="exact").limit(1).execute()
        print(f"Connection SUCCESS. Count: {response.count}")
        return True
    except Exception as e:
        print(f"Connection FAILED: {e}")
        return False

if __name__ == "__main__":
    try:
        success = asyncio.run(verify_connection())
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"Script Error: {e}")
        sys.exit(1)
