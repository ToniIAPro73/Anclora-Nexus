
import asyncio
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path=r"c:\Users\Usuario\Workspace\01_Proyectos\anclora-nexus\.env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

async def debug_schema():
    print("=== DEBUG SCHEMAS ===")
    try:
        # We can't query information_schema directly via PostgREST easily unless exposed.
        # But we can try to select * limit 1 and print keys.
        res = supabase.table("properties").select("*").limit(1).execute()
        if res.data:
            print("Columns in properties table:")
            print(res.data[0].keys())
        else:
            print("No data in properties table, cannot infer columns from select *.")
            # Try to insert a dummy with only minimal fields to see if it works, 
            # or try to catch the error from select specific columns.
            
            try:
                supabase.table("properties").select("source_system").limit(1).execute()
                print("Column 'source_system' EXISTS.")
            except Exception as e:
                print(f"Column 'source_system' MISSING or Error: {e}")

            try:
                supabase.table("properties").select("useful_area_m2").limit(1).execute()
                print("Column 'useful_area_m2' EXISTS.")
            except Exception as e:
                print(f"Column 'useful_area_m2' MISSING or Error: {e}")

    except Exception as e:
        print(f"General Error: {e}")

if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    loop.run_until_complete(debug_schema())
