import sys
import os
sys.path.append(os.getcwd())

print(f"CWD: {os.getcwd()}")
print(f"PYTHONPATH: {os.environ.get('PYTHONPATH', 'Not Set')}")

try:
    from backend.config import settings
    print(f"Settings loaded. URL: {settings.SUPABASE_URL}")
except Exception as e:
    print(f"Import settings failed: {e}")
    import traceback
    traceback.print_exc()

try:
    from backend.services.supabase_service import supabase_service
    print("Import supabase_service success")
except Exception as e:
    print(f"Import supabase_service failed: {e}")
    import traceback
    traceback.print_exc()

try:
    from backend.api.deps import get_org_id
    print("Import deps success")
except Exception as e:
    print(f"Import deps failed: {e}")
    import traceback
    traceback.print_exc()

try:
    from backend.api.routes import dq
    print("Import dq success")
except Exception as e:
    print(f"Import dq failed: {e}")
    import traceback
    traceback.print_exc()
