import asyncio
import os
import sys
# Add root to sys.path
sys.path.append(os.getcwd())
from backend.services.supabase_service import supabase_service

async def verify():
    print("Verifying properties schema via API...")
    try:
        # Fetch one property
        response = supabase_service.client.table("properties").select("*").limit(1).execute()
        if response.data:
            item = response.data[0]
            keys = item.keys()
            print(f"Keys found: {list(keys)}")
            if "useful_area_m2" in keys:
                print("SUCCESS: useful_area_m2 found.")
            else:
                print("FAILURE: useful_area_m2 NOT found.")
            if "built_area_m2" in keys:
                print("SUCCESS: built_area_m2 found.")
            else:
                print("FAILURE: built_area_m2 NOT found.")
        else:
            print("No properties found to check keys.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(verify())
