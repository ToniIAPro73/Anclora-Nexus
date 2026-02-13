"""
Anclora Intelligence v1 — Router Component
Generates QueryPlan from user message
"""

import uuid
from datetime import datetime, timezone
from typing import Tuple, List, Optional, Dict, Any
from pydantic import BaseModel, ValidationError
from .. import intelligence_types as types
from ..validation import validate_query_plan
from ..utils.logging import get_intelligence_logger

# Initialize structured logger
logger = get_intelligence_logger("router")


class RouterRequest(BaseModel):
    """Schema for incoming router requests."""
    message: str


class RouterResponse(BaseModel):
    """Schema for router responses."""
    query_plan: Optional[types.QueryPlan]
    error: Optional[str] = None
    status_code: int = 200


class Router:
    """
    Router: Takes user message and generates QueryPlan.
    Maps intent to domains, sets mode, flags, etc.
    """
    
    def __init__(self) -> None:
        """Initialize Router with Strategic Mode and domain registry."""
        self.enabled_domains: List[types.DomainKey] = [
            types.DomainKey.MARKET,
            types.DomainKey.BRAND,
            types.DomainKey.TAX,
            types.DomainKey.TRANSITION,
            types.DomainKey.SYSTEM,
        ]
        
        # Keywords for domain detection
        self.domain_keywords: Dict[types.DomainKey, List[str]] = {
            types.DomainKey.MARKET: ["mercado", "precio", "comprador", "venta", "propiedad", "inmobiliario"],
            types.DomainKey.BRAND: ["diferencia", "posicionamiento", "marca", "reputación", "exclusivo"],
            types.DomainKey.TAX: ["impuesto", "fiscal", "social", "contribución", "retención", "ley"],
            types.DomainKey.TRANSITION: ["carrera", "trabajo", "excedencia", "renuncia", "laboral", "empleo"],
            types.DomainKey.SYSTEM: ["proceso", "herramienta", "operación", "eficiencia", "automatización"],
        }
        logger.info("Router initialized")
    
    def validate_request(self, data: Dict[str, Any]) -> Tuple[Optional[RouterRequest], Optional[RouterResponse]]:
        """
        Middleware-like validation for router requests.

        Args:
            data (Dict[str, Any]): The incoming request data.

        Returns:
            Tuple[Optional[RouterRequest], Optional[RouterResponse]]: Validated request or error response.
        """
        try:
            request = RouterRequest(**data)
            return request, None
        except ValidationError as e:
            logger.error("Request validation failed", extra={"error": str(e)})
            return None, RouterResponse(query_plan=None, error=f"Invalid request format: {str(e)}", status_code=422)

    def route_query(self, message: str) -> Tuple[Optional[types.QueryPlan], Optional[str]]:
        """
        Route user message to appropriate domains.
        
        Error Codes Reference:
        - 400: Malformed input message
        - 403: Forbidden domain access (not in v1)
        - 404: No domain detected (defaults to MARKET in v1)
        - 422: Validation error in generated plan
        - 500: Internal router failure

        Args:
            message (str): User's input message.

        Returns:
            Tuple[Optional[types.QueryPlan], Optional[str]]: The generated plan and error description.
        """
        
        logger.info("Routing query", extra={"message_len": len(message)})
        
        try:
            # Step 1: Detect domains
            detected_domains = self._detect_domains(message)
            
            if not detected_domains:
                # Default: market (lujo real estate)
                logger.info("No domains detected, defaulting to MARKET")
                detected_domains = [types.DomainKey.MARKET.value]
            
            # Step 2: Limit to max 3 domains
            domains_selected = detected_domains[:3]
            
            # Step 3: Determine mode
            mode = self._determine_mode(message, len(domains_selected))
            
            # Step 4: Calculate confidence
            confidence = self._calculate_confidence(message, len(domains_selected))
            
            # Step 5: Create LabPolicy (always denied in Phase 1)
            lab_policy = types.LabPolicy(
                allow_lab=False,
                status=types.LabStatus.DENIED,
                rationale="Phase 1: No experimental features"
            )
            
            # Step 6: Generate flags
            flags = self._generate_flags(message, domains_selected)
            
            # Step 7: Create rationale
            rationale = self._generate_rationale(domains_selected, confidence)
            
            # Step 8: Create QueryPlan
            query_plan = types.QueryPlan(
                mode=mode,
                domain_hint="auto",
                domains_selected=detected_domains,  # Use detected
                agents_selected=[],
                needs_evidence=False,
                needs_skills=False,
                lab_policy=lab_policy,
                rationale=rationale,
                confidence=confidence,
                flags=flags,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            
            # Step 9: Validate
            is_valid, error = validate_query_plan(query_plan)
            
            if not is_valid:
                logger.error("Generated QueryPlan is invalid", extra={"error": error})
                return None, f"QueryPlan validation failed: {error} (Code 422)"
            
            logger.info("Routing complete", extra={"mode": mode, "domains": domains_selected})
            return query_plan, None
        
        except Exception as e:
            logger.exception("Router failure")
            return None, f"Router internal error: {str(e)} (Code 500)"
    
    def _detect_domains(self, message: str) -> List[str]:
        """Detect domains from message keywords."""
        message_lower = message.lower()
        detected: List[str] = []
        
        for domain, keywords in self.domain_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                detected.append(domain.value)
        
        return list(dict.fromkeys(detected))
    
    def _determine_mode(self, message: str, num_domains: int) -> types.QueryMode:
        """Determine if fast or deep analysis."""
        is_short = len(message.split()) < 15
        is_single_domain = num_domains == 1
        has_complexity = any(word in message.lower() for word in ["vs", "comparar", "diferencia", "impacto"])
        
        if is_short and is_single_domain and not has_complexity:
            return types.QueryMode.FAST
        else:
            return types.QueryMode.DEEP
    
    def _calculate_confidence(self, message: str, num_domains: int) -> types.Confidence:
        """Calculate confidence in domain detection."""
        is_clear = len(message.split()) > 10
        is_single = num_domains == 1
        has_question_mark = "?" in message
        
        if is_clear and is_single and has_question_mark:
            return types.Confidence.HIGH
        elif is_clear or is_single:
            return types.Confidence.MEDIUM
        else:
            return types.Confidence.LOW
    
    def _generate_flags(self, message: str, domains: List[str]) -> List[str]:
        """Generate operational flags."""
        flags: List[str] = []
        
        if len(message.split()) < 8:
            flags.append("needs-clarification")
        
        if any(word in message.lower() for word in ["lab", "experimen", "beta"]):
            flags.append("lab-access-requested")
            flags.append("lab-access-denied")
        
        if len(domains) > 2:
            flags.append("router-ambiguity-detected")
        
        return flags
    
    def _generate_rationale(self, domains: List[str], confidence: types.Confidence) -> str:
        """Generate router's rationale for domain selection."""
        domains_str = ", ".join(domains)
        return (
            f"Detectada intención en dominios: {domains_str}. "
            f"Seleccionados para análisis bajo Strategic Mode. "
            f"Confianza de detección: {confidence.value}."
        )


# ═══════════════════════════════════════════════════════════════
# FACTORY FUNCTION
# ═══════════════════════════════════════════════════════════════

def create_router() -> Router:
    """Factory function to create a Router instance."""
    return Router()
