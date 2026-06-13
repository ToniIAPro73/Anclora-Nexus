from __future__ import annotations

import re
from typing import Any, Optional

import httpx

from backend.config import settings


SAFE_FAILURE_RESULT: dict[str, Any] = {
    "status": "review_required",
    "block_signing": True,
    "confidence": 0.0,
    "summary": "Advisor AI no esta disponible; la validacion queda pendiente.",
    "findings": [],
    "required_actions": ["Revisar manualmente el documento antes de enviarlo a firma."],
    "missing_documents": [],
    "legal_disclaimer": "La validacion automatica no sustituye revision de abogado, notaria, gestoria o asesor especializado.",
    "sources": [],
    "advisor_available": False,
}

_PENDING_PLACEHOLDER_RE = re.compile(r"\{\{[^}]+\}\}")
_MIN_RAG_SOURCES = 2
_DIVERGENCE_DIFF_THRESHOLD = 5  # More than this many differences → divergent


def _detect_pending_placeholders(text: str) -> list[str]:
    return _PENDING_PLACEHOLDER_RE.findall(text)


def _has_critical_divergence(differences: list[Any]) -> bool:
    if not isinstance(differences, list):
        return False
    critical_types = {"deleted_clause", "missing_clause", "critical_change"}
    critical_count = sum(
        1 for d in differences
        if isinstance(d, dict) and d.get("type") in critical_types
    )
    return critical_count > _DIVERGENCE_DIFF_THRESHOLD or len(differences) > _DIVERGENCE_DIFF_THRESHOLD * 2


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

    def _pre_validate(self, document_text: str) -> Optional[dict[str, Any]]:
        """Gate checks applied before calling Advisor AI.

        Returns a blocking result dict if the document must not proceed,
        or None if pre-validation passes.
        """
        pending = _detect_pending_placeholders(document_text)
        if pending:
            return {
                **SAFE_FAILURE_RESULT,
                "advisor_available": False,
                "status": "review_required",
                "block_signing": True,
                "summary": (
                    f"El documento contiene {len(pending)} marcador(es) sin completar: "
                    f"{', '.join(pending[:5])}{'…' if len(pending) > 5 else ''}. "
                    "Rellena todos los campos antes de continuar."
                ),
                "gate_blocked_reason": "pending_placeholders",
                "pending_placeholders": pending,
            }
        return None

    def _apply_post_gates(self, result: dict[str, Any]) -> dict[str, Any]:
        """Post-process Advisor AI result and enforce CLM gates.

        Gates applied after receiving an AI response:
        - critical risk_level → force block_signing
        - divergent translation (too many differences) → force block_signing + human review
        - insufficient RAG sources → flag human_review_recommended
        """
        risk_level = result.get("risk_level", "medium")
        differences = result.get("differences", [])
        rag_sources = int(result.get("rag_sources_used") or 0)
        required_actions: list[str] = list(result.get("required_actions") or [])
        flags: list[str] = list(result.get("gate_flags") or [])

        # Gate 1: Critical risk level → block signing
        if risk_level == "critical":
            result = {**result, "block_signing": True, "status": "review_required"}
            flags.append("critical_risk")
            required_actions.append(
                "Riesgo crítico detectado. Se requiere revisión jurídica humana antes de firmar."
            )

        # Gate 2: Divergent translation or excessive differences → block signing
        if _has_critical_divergence(differences):
            result = {**result, "block_signing": True, "status": "review_required"}
            flags.append("divergent_translation")
            required_actions.append(
                f"Se detectaron {len(differences)} diferencias significativas respecto a la plantilla canónica. "
                "Revisa la traducción o el contenido antes de enviar a firma."
            )

        # Gate 3: Insufficient RAG sources → recommend human review (non-blocking)
        if rag_sources < _MIN_RAG_SOURCES and result.get("advisor_available"):
            flags.append("insufficient_rag_sources")
            required_actions.append(
                "La validación automática se realizó con fuentes jurídicas limitadas. "
                "Se recomienda revisión humana adicional."
            )
            result = {**result, "human_review_recommended": True}

        return {**result, "required_actions": required_actions, "gate_flags": flags}

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
        pre = self._pre_validate(contract_text)
        if pre is not None:
            return pre

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
                # Invalid JSON shape → treat as unavailable, not as approval
                return {
                    **SAFE_FAILURE_RESULT,
                    "error": "Advisor AI returned a non-object response",
                    "gate_blocked_reason": "invalid_json_shape",
                }
            result = self._normalize_response(data)
            return self._apply_post_gates(result)
        except httpx.TimeoutException as exc:
            # Timeout must never silently approve
            return {
                **SAFE_FAILURE_RESULT,
                "error": f"Advisor AI timeout: {exc}",
                "gate_blocked_reason": "timeout",
            }
        except Exception as exc:
            return {**SAFE_FAILURE_RESULT, "error": str(exc)}

    async def validate_legal_document(
        self,
        *,
        document_text: str,
        document_type: str,
        canonical_template: Optional[str] = None,
        template_version_id: Optional[str] = None,
        operation_type: Optional[str] = None,
        variable_snapshot: Optional[dict[str, Any]] = None,
        jurisdiction: str = "España",
        language: str = "es",
        document_id: Optional[str] = None,
        org_id: Optional[str] = None,
        metadata: Optional[dict[str, Any]] = None,
    ) -> dict[str, Any]:
        """Call the Advisor AI /api/legal-documents/validate endpoint.

        Provides diff-aware validation against a canonical template when available.
        Pre-validates for pending placeholders before calling AI.
        Falls back to SAFE_FAILURE_RESULT on any network or parsing error.
        Post-applies CLM gates: critical risk, divergent translation, insufficient sources.
        """
        pre = self._pre_validate(document_text)
        if pre is not None:
            return pre

        if not self.base_url:
            return {**SAFE_FAILURE_RESULT, "error": "ADVISOR_AI_BASE_URL not configured"}

        payload: dict[str, Any] = {
            "currentText": document_text,
            "documentType": document_type,
            "jurisdiction": jurisdiction,
            "language": language,
            "variableSnapshot": variable_snapshot or {},
            "metadata": metadata or {},
        }
        if canonical_template:
            payload["canonicalText"] = canonical_template
        if template_version_id:
            payload["templateVersionId"] = template_version_id
        if operation_type:
            payload["operationType"] = operation_type
        if document_id:
            payload["documentId"] = document_id
        if org_id:
            payload["orgId"] = org_id

        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            headers["X-Anclora-Internal-Key"] = self.api_key
            headers["x-advisor-internal-api-key"] = self.api_key
            headers["x-advisor-caller"] = "nexus"

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(
                    f"{self.base_url}/api/legal-documents/validate",
                    json=payload,
                    headers=headers,
                )
            response.raise_for_status()
            data = response.json()
            if not isinstance(data, dict):
                return {
                    **SAFE_FAILURE_RESULT,
                    "error": "Advisor AI returned a non-object response",
                    "gate_blocked_reason": "invalid_json_shape",
                }
            result = self._normalize_legal_document_response(data)
            return self._apply_post_gates(result)
        except httpx.TimeoutException as exc:
            return {
                **SAFE_FAILURE_RESULT,
                "error": f"Advisor AI timeout: {exc}",
                "gate_blocked_reason": "timeout",
            }
        except Exception as exc:
            return {**SAFE_FAILURE_RESULT, "error": str(exc)}

    def _normalize_legal_document_response(self, data: dict[str, Any]) -> dict[str, Any]:
        findings = data.get("findings") if isinstance(data.get("findings"), list) else []
        required_actions = data.get("required_actions") if isinstance(data.get("required_actions"), list) else []
        sources = data.get("sources") if isinstance(data.get("sources"), list) else []
        differences = data.get("differences") if isinstance(data.get("differences"), list) else []
        missing_clauses = data.get("missing_clauses") if isinstance(data.get("missing_clauses"), list) else []

        return {
            "status": data.get("status") if data.get("status") in {"ok", "approved", "approved_with_warnings", "review_required", "rejected", "error"} else "review_required",
            "block_signing": bool(data.get("block_signing") or data.get("status") in {"rejected", "error"}),
            "risk_level": data.get("risk_level") or "medium",
            "review_requirement": data.get("review_requirement") or "recommended",
            "confidence": float(data.get("confidence") or 0.0),
            "summary": str(data.get("summary") or "Validacion completada por Advisor AI."),
            "findings": findings,
            "required_actions": [str(item) for item in required_actions],
            "missing_clauses": missing_clauses,
            "differences": differences,
            "legal_disclaimer": str(data.get("legal_disclaimer") or SAFE_FAILURE_RESULT["legal_disclaimer"]),
            "sources": sources,
            "document_id": data.get("document_id"),
            "validation_timestamp": data.get("validation_timestamp"),
            "rag_sources_used": int(data.get("rag_sources_used") or 0),
            "advisor_available": True,
        }

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
