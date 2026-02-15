import asyncio
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load env
load_dotenv(r"c:\Users\Usuario\Workspace\01_Proyectos\anclora-nexus\.env")

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

async def run_qa():
    print("starting QA for ANCLORA-CSL-001...")
    
    # 3. Verify Constraints & API Contract
    print("\n[3] Verifying Constraints (Useful <= Built)...")
    
    # Get a valid org_id
    org_res = supabase.table("organizations").select("id").limit(1).execute()
    if not org_res.data:
        print("FAILED: No organizations found.")
        return
    test_org_id = org_res.data[0]['id']
    
    # Valid Payload (No title)
    prop_data = {
        "org_id": test_org_id,
        "address": "QA CSL Valid Street 123",
        "city": "QA City",
        "postal_code": "00000",
        "useful_area_m2": 50,
        "built_area_m2": 100,
        "plot_area_m2": 200,
        "property_type": "apartment",
        "price": 100000,
        # "status": "draft", # Status might be there? Let's assume yes or default
        "source_system": "manual",
        "source_portal": "idealista"
    }
    
    valid_id = None
    try:
        print("Attempting valid insert...")
        res_valid = supabase.table("properties").insert(prop_data).execute()
        valid_id = res_valid.data[0]['id']
        print(f"SUCCESS: Valid property inserted. ID: {valid_id}")
        
        # Test Constraint
        print("Attempting invalid insert (Useful > Built)...")
        prop_invalid = prop_data.copy()
        prop_invalid["address"] = "QA CSL Invalid Street"
        prop_invalid["useful_area_m2"] = 150
        prop_invalid["built_area_m2"] = 100
        
        try:
            supabase.table("properties").insert(prop_invalid).execute()
            print("FAILED: Constraint check incorrectly passed.")
             # clean up if it passed
            supabase.table("properties").delete().eq("address", "QA CSL Invalid Street").execute()
        except Exception as e:
            if "useful_le_built" in str(e) or "check constraint" in str(e).lower():
                print(f"SUCCESS: Constraint caught invalid data. Error: {e}")
            else:
                 print(f"WARNING: Insert failed but maybe not due to constraint? Error: {e}")

    except Exception as e:
        print(f"FAILED: Valid insert failed. Error: {e}")
    finally:
        if valid_id:
            supabase.table("properties").delete().eq("id", valid_id).execute()
            print("Cleanup complete.")

if __name__ == "__main__":
    asyncio.run(run_qa())
