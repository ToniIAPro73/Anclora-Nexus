import hmac
import hashlib
import json
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from supabase import create_client, Client
from backend.config import settings

class SupabaseService:
    def __init__(self):
        self.client: Client = create_client(
            settings.SUPABASE_URL, 
            settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        )
        self.audit_secret = settings.OPENAI_API_KEY # Using OpenAI key as a placeholder secret if dedicated not found
        self.fixed_org_id = "00000000-0000-0000-0000-000000000000" # Fixed Org ID for v0

    def _generate_signature(self, data: Dict[str, Any]) -> str:
        """Generates HMAC-SHA256 signature for audit log integrity."""
        message = json.dumps(data, sort_keys=True)
        return hmac.new(
            self.audit_secret.encode(),
            message.encode(),
            hashlib.sha256
        ).hexdigest()

    async def insert_lead(self, data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table("leads").insert(data).execute()
        return response.data[0]

    async def update_lead(self, lead_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table("leads").update(data).eq("id", lead_id).execute()
        return response.data[0]

    async def insert_task(self, data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table("tasks").insert(data).execute()
        return response.data[0]

    async def insert_agent_log(self, data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table("agent_logs").insert(data).execute()
        return response.data[0]

    async def insert_audit_log(self, data: Dict[str, Any]) -> Dict[str, Any]:
        # Ensure org_id is present
        if "org_id" not in data:
            data["org_id"] = self.fixed_org_id
            
        # Generate signature before insert
        signature = self._generate_signature(data)
        audit_data = {**data, "signature": signature, "timestamp": datetime.utcnow().isoformat()}
        response = self.client.table("audit_log").insert(audit_data).execute()
        return response.data[0]

    async def get_constitutional_limits(self, org_id: str) -> Dict[str, Any]:
        response = self.client.table("constitutional_limits").select("*").eq("org_id", org_id).execute()
        return {item["limit_type"]: float(item["limit_value"]) for item in response.data}

    async def count_daily_leads(self, org_id: str) -> int:
        today = datetime.utcnow().date().isoformat()
        response = self.client.table("leads").select("id", count="exact").eq("org_id", org_id).gte("created_at", today).execute()
        return response.count or 0

    async def get_daily_token_usage(self, org_id: str) -> int:
        today = datetime.utcnow().date().isoformat()
        response = self.client.table("agent_logs").select("tokens_used").eq("org_id", org_id).gte("timestamp", today).execute()
        return sum(item.get("tokens_used", 0) for item in response.data if item.get("tokens_used"))

    async def get_active_leads(self, priority_min: int = 3) -> List[Dict[str, Any]]:
        response = self.client.table("leads").select("*").eq("status", "new").gte("ai_priority", priority_min).execute()
        return response.data

    async def get_available_properties(self) -> List[Dict[str, Any]]:
        response = self.client.table("properties").select("*").eq("status", "prospect").execute()
        return response.data

    async def update_property_matching(self, property_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table("properties").update(data).eq("id", property_id).execute()
        return response.data[0]

    async def insert_agent_execution(self, data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table("agent_executions").insert(data).execute()
        return response.data[0]

    async def insert_weekly_recap(self, data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.client.table("weekly_recaps").insert(data).execute()
        return response.data[0]

    async def get_recent_leads(self, days: int = 7, org_id: Optional[str] = None) -> List[Dict[str, Any]]:
        threshold = (datetime.utcnow() - timedelta(days=days)).isoformat()
        query = self.client.table("leads").select("*").gte("created_at", threshold)
        if org_id:
            query = query.eq("org_id", org_id)
        response = query.execute()
        return response.data

    async def get_recent_executions(self, days: int = 7) -> List[Dict[str, Any]]:
        threshold = (datetime.utcnow() - timedelta(days=days)).isoformat()
        response = self.client.table("agent_executions").select("*").gte("created_at", threshold).execute()
        return response.data

    async def get_recent_properties_updates(self, days: int = 7) -> List[Dict[str, Any]]:
        threshold = (datetime.utcnow() - timedelta(days=days)).isoformat()
        response = self.client.table("properties").select("*").gte("created_at", threshold).execute()
        return response.data

supabase_service = SupabaseService()
