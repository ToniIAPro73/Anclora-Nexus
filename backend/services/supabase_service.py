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
        # Generate signature before insert
        signature = self._generate_signature(data)
        audit_data = {**data, "signature": signature, "timestamp": datetime.utcnow().isoformat()}
        response = self.client.table("audit_log").insert(audit_data).execute()
        return response.data[0]

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

    async def get_recent_leads(self, days: int = 7) -> List[Dict[str, Any]]:
        threshold = (datetime.utcnow() - timedelta(days=days)).isoformat()
        response = self.client.table("leads").select("*").gte("created_at", threshold).execute()
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
