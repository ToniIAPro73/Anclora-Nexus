import os
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

# Deterministic test env defaults. Several test modules set these via
# os.environ.setdefault at import time, but module import order is not
# guaranteed, so the backend.config Settings singleton must see them here,
# before any test module (or backend module) is imported. Explicitly-set
# real env vars always win.
os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-key")
os.environ.setdefault("NEXUS_INTERNAL_API_KEY", "internal-key-test")
os.environ.setdefault("NEXUS_DOCUMENT_ENCRYPTION_KEY", "00" * 32)
os.environ.setdefault("DOCUSEAL_API_KEY", "docuseal-api-key")
os.environ.setdefault("DOCUSEAL_WEBHOOK_SECRET", "webhook-secret")
