"""
Anclora Intelligence v1 — Router Component
Generates QueryPlan from user message
"""

import uuid
from datetime import datetime, timezone
from typing import Tuple
from ..types import QueryPlan, LabPolicy, LabStatus, QueryMode, Confidence, DomainKey
from ..validation import validate_query_plan


class Router:
    """
    Router: Takes user message and generates QueryPlan.
    Maps intent to domains, sets mode, flags, etc.
    """
    
    def __init__(self):
        """Initialize Router with Strategic Mode and domain registry."""
        self.enabled_domains = [
            DomainKey.MARKET,
            DomainKey.BRAND,
            DomainKey.TAX,
            DomainKey.TRANSITION,
            DomainKey.SYSTEM,
        ]
        
        # Keywords for domain detection
        self.domain_keywords = {
            DomainKey.MARKET: ["mercado", "precio", "comprador", "venta", "propiedad", "inmobiliario"],
            DomainKey.BRAND: ["diferencia", "posicionamiento", "marca", "reputación", "exclusivo"],
            DomainKey.TAX: ["impuesto", "fiscal", "social", "contribución", "retención", "ley"],
            DomainKey.TRANSITION: ["carrera", "trabajo", "excedencia", "renuncia", "laboral", "empleo"],
            DomainKey.SYSTEM: ["proceso", "herramienta", "operación", "eficiencia", "automatización"],
        }
    
    def route_query(self, message: str) -> Tuple[QueryPlan, str]:
        """
        Route user message to appropriate domains.
        Returns: (QueryPlan, error_message)
        
        Logic:
        1. Detect domains from keywords
        2. Determine mode (fast vs deep)
        3. Set confidence based on clarity
        4. Create LabPolicy
        5. Validate and return
        """
        
        try:
            # Step 1: Detect domains
            detected_domains = self._detect_domains(message)
            
            if not detected_domains:
                # Default: market + brand (lujo real estate)
                detected_domains = [DomainKey.MARKET.value]
            
            # Step 2: Limit to max 3 domains
            domains_selected = detected_domains[:3]
            
            # Step 3: Determine mode
            mode = self._determine_mode(message, len(domains_selected))
            
            # Step 4: Calculate confidence
            confidence = self._calculate_confidence(message, len(domains_selected))
            
            # Step 5: Create LabPolicy (always denied in Phase 1)
            lab_policy = LabPolicy(
                allow_lab=False,
                status=LabStatus.DENIED,
                rationale="Phase 1: No experimental features"
            )
            
            # Step 6: Generate flags
            flags = self._generate_flags(message, domains_selected)
            
            # Step 7: Create rationale
            rationale = self._generate_rationale(domains_selected, confidence)
            
            # Step 8: Create QueryPlan
            query_plan = QueryPlan(
                mode=mode,
                domain_hint="auto",
                domains_selected=domains_selected,
                agents_selected=[],
                needs_evidence=False,  # Phase 1
                needs_skills=False,     # Phase 1
                lab_policy=lab_policy,
                rationale=rationale,
                confidence=confidence,
                flags=flags,
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            
            # Step 9: Validate
            is_valid, error = validate_query_plan(query_plan)
            
            if not is_valid:
                return None, f"QueryPlan validation failed: {error}"
            
            return query_plan, None
        
        except Exception as e:
            return None, f"Router error: {str(e)}"
    
    def _detect_domains(self, message: str) -> list:
        """Detect domains from message keywords."""
        message_lower = message.lower()
        detected = []
        
        for domain, keywords in self.domain_keywords.items():
            if any(keyword in message_lower for keyword in keywords):
                detected.append(domain.value)
        
        return list(dict.fromkeys(detected))  # Remove duplicates, preserve order
    
    def _determine_mode(self, message: str, num_domains: int) -> QueryMode:
        """Determine if fast or deep analysis."""
        # Fast: short message, single domain
        # Deep: longer message, multiple domains, complex intent
        
        is_short = len(message.split()) < 15
        is_single_domain = num_domains == 1
        has_complexity = "vs" in message.lower() or "comparar" in message.lower()
        
        if is_short and is_single_domain and not has_complexity:
            return QueryMode.FAST
        else:
            return QueryMode.DEEP
    
    def _calculate_confidence(self, message: str, num_domains: int) -> Confidence:
        """Calculate confidence in domain detection."""
        # High: clear intent, single domain
        # Medium: ambiguous, multiple domains
        # Low: very short, unclear
        
        is_clear = len(message.split()) > 10
        is_single = num_domains == 1
        has_question_mark = "?" in message
        
        if is_clear and is_single and has_question_mark:
            return Confidence.HIGH
        elif is_clear or is_single:
            return Confidence.MEDIUM
        else:
            return Confidence.LOW
    
    def _generate_flags(self, message: str, domains: list) -> list:
        """Generate operational flags."""
        flags = []
        
        # Flag if low clarity
        if len(message.split()) < 8:
            flags.append("needs-clarification")
        
        # Flag if lab requested
        if "lab" in message.lower() or "experimen" in message.lower():
            flags.append("lab-access-requested")
            flags.append("lab-access-denied")
        
        # Flag if multiple domains (ambiguity)
        if len(domains) > 2:
            flags.append("router-ambiguity-detected")
        
        return flags
    
    def _generate_rationale(self, domains: list, confidence: Confidence) -> str:
        """Generate router's rationale for domain selection."""
        domains_str = ", ".join(domains)
        confidence_str = confidence.value
        
        return (
            f"Detectada intención clara en dominios: {domains_str}. "
            f"Seleccionados para análisis estratégico. "
            f"Confianza: {confidence_str}."
        )


# ═══════════════════════════════════════════════════════════════
# FACTORY FUNCTION
# ═══════════════════════════════════════════════════════════════

def create_router() -> Router:
    """Factory function to create a Router instance."""
    return Router()
