from __future__ import annotations

from typing import Any, Optional

import httpx

from backend.config import settings


SAFE_FAILURE_RESULT: dict[str, Any] = {
    "status": "review_required",
    "block_signing": False,
    "confidence": 0.0,
    "summary": "Advisor AI no esta disponible; la validacion queda pendiente.",
    "findings": [],
    "required_actions": ["Revisar manualmente el documento antes de enviarlo a firma."],
    "missing_documents": [],
    "legal_disclaimer": "La validacion automatica no sustituye revision de abogado, notaria, gestoria o asesor especializado.",
    "sources": [],
    "advisor_available": False,
}


class AdvisorContractValidatorService:
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
    ) -> None:
        self.base_url = (base_url or settings.ADVISOR_AI_BASE_URL or "").rstrip("/")
        self.api_key = api_key if api_key is not None else settings.ADVISOR_AI_INTERNAL_API_KEY
        self.timeout_seconds = timeout_seconds or settings.ADVISOR_AI_TIMEOUT_SECONDS

    async def validate_contract(
        self,
        *,
        contract_text: str,
        contract_type: Optional[str],
        operation_type: str,
        jurisdiction: str,
        language: str,
        metadata: dict[str, Any],
    ) -> dict[str, Any]:
        if not self.base_url:
            return {**SAFE_FAILURE_RESULT, "error": "ADVISOR_AI_BASE_URL not configured"}

        payload = {
            "contractText": contract_text,
            "contractType": contract_type,
            "operationType": operation_type,
            "jurisdiction": jurisdiction,
            "language": language,
            "metadata": metadata,
        }
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            headers["X-Anclora-Internal-Key"] = self.api_key

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(
                    f"{self.base_url}/api/validate-contract",
                    json=payload,
                    headers=headers,
                )
            response.raise_for_status()
            data = response.json()
            if not isinstance(data, dict):
                raise ValueError("Advisor AI returned a non-object response")
            return self._normalize_response(data)
        except Exception as exc:
            return {**SAFE_FAILURE_RESULT, "error": str(exc)}

    def _normalize_response(self, data: dict[str, Any]) -> dict[str, Any]:
        findings = data.get("findings") if isinstance(data.get("findings"), list) else []
        required_actions = data.get("required_actions") if isinstance(data.get("required_actions"), list) else []
        missing_documents = data.get("missing_documents") if isinstance(data.get("missing_documents"), list) else []
        sources = data.get("sources") if isinstance(data.get("sources"), list) else []

        return {
            "status": data.get("status") if data.get("status") in {"ok", "review_required", "error"} else "review_required",
            "block_signing": bool(data.get("block_signing")),
            "confidence": float(data.get("confidence") or 0.0),
            "summary": str(data.get("summary") or "Validacion completada por Advisor AI."),
            "findings": findings,
            "required_actions": [str(item) for item in required_actions],
            "missing_documents": [str(item) for item in missing_documents],
            "legal_disclaimer": str(data.get("legal_disclaimer") or SAFE_FAILURE_RESULT["legal_disclaimer"]),
            "sources": sources,
            "advisor_available": True,
        }


advisor_contract_validator_service = AdvisorContractValidatorService()
