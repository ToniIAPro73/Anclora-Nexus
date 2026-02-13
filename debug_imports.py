import sys
import os

print(f"Current Working Directory: {os.getcwd()}")
print(f"Python Executable: {sys.executable}")
print("Python Path:")
for path in sys.path:
    print(f"  {path}")

try:
    import backend
    print("✅ Successfully imported 'backend'")
    from backend.services.llm_service import LLMService
    print("✅ Successfully imported 'backend.services.llm_service'")
except ImportError as e:
    print(f"❌ Failed to import: {e}")

try:
    from sdd.features.intelligence.skills.lead_intake import run_lead_intake
    print("✅ Successfully imported 'run_lead_intake'")
except ImportError as e:
    print(f"❌ Failed to import lead_intake: {e}")
