import httpx
import logging
from typing import Dict, Any
from backend.config import settings
from backend.services.supabase_service import supabase_service
from backend.services.access_request_email_service import access_request_email_service
from backend.services.email_delivery_service import send_email_native

logger = logging.getLogger(__name__)

class SyncXmlPilotService:
    async def process_incoming_lead(self, data: Dict[str, Any]):
        # 1. Persist as PENDING
        record_data = {
            "product": "syncxml",
            "source": "syncxml_landing",
            "full_name": f"{data.get('nombre', '')} {data.get('apellidos', '')}".strip(),
            "email": data.get("email"),
            "status": "pending",
            "metadata": data
        }
        
        # Adjust org_id as required by Nexus DB schema
        org_id = settings.LEGACY_SINGLE_TENANT_ORG_ID or settings.PUBLIC_CTA_ORG_ID
        record_data["org_id"] = org_id
        
        try:
            result = supabase_service.client.table("access_requests").insert(record_data).execute()
            if not result.data:
                logger.error(f"Failed to persist SyncXML lead: {result}")
                raise RuntimeError("Failed to persist SyncXML lead")
                
            record = result.data[0]
            logger.info(f"SyncXML lead persisted: {record['id']} for {record['email']}")
            
            # 2. Call Hermes
            try:
                async with httpx.AsyncClient() as client:
                    hermes_url = f"{settings.HERMES_WORKER_URL}/api/validate-lead"
                    payload = {
                        "product": "SyncXML",
                        "name": record_data["full_name"],
                        "email": record_data["email"],
                        "properties": str(data.get("inmuebles", "")),
                        "message": data.get("mensaje", "")
                    }
                    
                    # Log attempt
                    logger.info(f"Requesting AI validation from Hermes: {hermes_url}")
                    
                    # Use a short timeout to fail fast and fallback
                    # Adding WORKER_API_KEY if exists for authorization
                    headers = {}
                    if hasattr(settings, "WORKER_API_KEY") and settings.WORKER_API_KEY:
                         headers["Authorization"] = f"Bearer {settings.WORKER_API_KEY}"
                    elif hasattr(settings, "INTERNAL_AUDIT_SECRET") and settings.INTERNAL_AUDIT_SECRET:
                         # Fallback to audit secret if worker key is same
                         headers["Authorization"] = f"Bearer {settings.INTERNAL_AUDIT_SECRET}"

                    response = await client.post(hermes_url, json=payload, headers=headers, timeout=15.0)
                    response.raise_for_status()
                    hermes_result = response.json()
                    
                    decision = hermes_result.get("decision")
                    reason = hermes_result.get("reason", "")
                    
                    logger.info(f"Hermes decision for {record['email']}: {decision} ({reason})")
                    
                    new_status = "approved" if decision == "APPROVED" else "rejected"
                    
                    # Update status
                    supabase_service.client.table("access_requests").update({
                        "status": new_status,
                        "rejection_reason": reason if new_status == "rejected" else None
                    }).eq("id", record["id"]).execute()
                    
                    record["status"] = new_status
                    record["rejection_reason"] = reason
                    
                    # Send email
                    email_data = access_request_email_service.build_decision_email(record)
                    send_email_native(
                        to_email=email_data["to"],
                        subject=email_data["subject"],
                        body=email_data["text"],
                        html=email_data["html"]
                    )
                    logger.info(f"Sent {new_status} email to {record['email']}")
                    
            except Exception as e:
                logger.error(f"Hermes validation failed for {record['email']}: {e}. Falling back to manual review.")
                # Leave as PENDING, send fallback email to admin
                fallback_email = access_request_email_service.build_access_request_fallback_admin_email(record)
                send_email_native(
                    to_email=fallback_email["to"],
                    subject=fallback_email["subject"],
                    body=fallback_email["text"],
                    html=fallback_email["html"]
                )
                logger.info(f"Sent fallback admin email for {record['email']}")

        except Exception as e:
            logger.error(f"Error processing SyncXML lead: {e}")

syncxml_pilot_service = SyncXmlPilotService()
