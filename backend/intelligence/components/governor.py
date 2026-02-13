"""
Anclora Intelligence v1 — Governor Component
Evaluates QueryPlan under Strategic Mode and generates GovernorDecision
"""

from datetime import datetime, timezone
from typing import Tuple, List, Optional, Dict, Any
from ..intelligence_types import (
    QueryPlan, GovernorDecision, RiskProfile, RiskItem,
    Recommendation, RiskLevel, Confidence, DomainKey, QueryMode
)
from ..validation import validate_governor_decision
from ..utils.logging import get_intelligence_logger

# Initialize structured logger
logger = get_intelligence_logger("governor")


class Governor:
    """
    Governor: Takes QueryPlan and generates GovernorDecision.
    Applies Strategic Mode, evaluates risks, decides action.
    """
    
    def __init__(self, strategic_mode_version: str = "1.0-validation-phase") -> None:
        """
        Initialize Governor with Strategic Mode.

        Args:
            strategic_mode_version (str): The version of the strategic mode to use.
        """
        self.strategic_mode_version = strategic_mode_version
        
        # Strategic Mode v1: Principle, Priorities, Hard Constraints
        self.principle = "Consolidate Base Today, Decide with Freedom Tomorrow"
        
        self.priorities: Dict[int, Dict[str, Any]] = {
            1: {"name": "cash_consolidation", "weight": 100},
            2: {"name": "brand_differentiation", "weight": 80},
            3: {"name": "operational_efficiency", "weight": 60},
            4: {"name": "expansion_preparation", "weight": 40},
        }
        
        self.hard_constraints: Dict[str, str] = {
            "hc_001": "No Public Founder OS Launch (Phase 1)",
            "hc_002": "No Sustained SL without Cash Flow",
            "hc_003": "No External IA Consulting (unvalidated)",
            "hc_004": "No Technology Without Direct Impact",
            "hc_005": "No Emotional Labor Decisions (unvalidated)",
        }
        
        logger.info("Governor initialized", extra={"version": strategic_mode_version, "principle": self.principle})
    
    def evaluate(self, query_plan: QueryPlan) -> Tuple[Optional[GovernorDecision], Optional[str]]:
        """
        Evaluate QueryPlan and generate GovernorDecision.
        ...
        """
        if query_plan is None:
            return None, "Governor error: QueryPlan is required"

        correlation_id = getattr(query_plan, "correlation_id", "unknown")
        logger.info("Starting evaluation", extra={"correlation_id": correlation_id, "mode": query_plan.mode})
        
        try:
            # Step 1: Analyze intent
            primary_domain: Optional[str] = query_plan.domains_selected[0] if query_plan.domains_selected else None
            
            # Step 2: Evaluate under principle
            aligns_with_principle = self._evaluate_principle_alignment(query_plan)
            
            # Step 3: Assess risks
            risks = self._assess_risks(query_plan, primary_domain or "unknown")
            
            # Step 4: Check hard constraints
            constraint_violations = self._check_hard_constraints(query_plan)
            
            # Step 5: Determine recommendation
            recommendation = self._determine_recommendation(
                aligns_with_principle,
                constraint_violations,
                risks,
                query_plan.confidence
            )
            
            # Step 6: Generate next_steps (EXACTLY 3)
            next_steps = self._generate_next_steps(primary_domain or "unknown", recommendation)
            
            # Step 7: Generate dont_do (2-5)
            dont_do = self._generate_dont_do(primary_domain or "unknown", query_plan, risks)
            
            # Step 8: Generate flags
            flags = self._generate_flags(constraint_violations, risks, query_plan)
            
            # Step 9: Calculate confidence
            confidence = self._calculate_decision_confidence(
                query_plan.confidence,
                len(constraint_violations),
                risks
            )
            
            # Step 10: Generate diagnosis
            diagnosis = self._generate_diagnosis(primary_domain or "unknown", recommendation, risks)
            
            # Step 11: Create GovernorDecision
            decision = GovernorDecision(
                diagnosis=diagnosis,
                recommendation=recommendation,
                risks=risks,
                next_steps=next_steps,
                dont_do=dont_do,
                flags=flags,
                confidence=confidence,
                strategic_mode_version=self.strategic_mode_version,
                domains_used=query_plan.domains_selected if query_plan.domains_selected else ["unknown"],
                timestamp=datetime.now(timezone.utc).isoformat()
            )
            
            # Step 12: Validate
            is_valid, error = validate_governor_decision(decision)
            
            if not is_valid:
                logger.error("Decision validation failed", extra={"error": error, "correlation_id": correlation_id})
                return None, f"GovernorDecision validation failed: {error}"
            
            logger.info("Evaluation complete", extra={"recommendation": recommendation, "correlation_id": correlation_id})
            return decision, None
        
        except Exception as e:
            logger.exception("Governor error during evaluation", extra={"correlation_id": correlation_id})
            return None, f"Governor error: {str(e)}"
    
    def _evaluate_principle_alignment(self, query_plan: QueryPlan) -> bool:
        """
        Evaluate if decision aligns with principle rector.

        Args:
            query_plan (QueryPlan): The query plan.

        Returns:
            bool: True if aligned, False otherwise.
        """
        # Principle: Consolidate base (cash, validation, freedom)
        
        # Tax/Transition domains require validation
        has_critical_domain = any(
            d in [DomainKey.TAX.value, DomainKey.TRANSITION.value]
            for d in query_plan.domains_selected
        )
        
        # If critical domain + high complexity = needs validation
        return not has_critical_domain or query_plan.mode == QueryMode.DEEP
    
    def _assess_risks(self, query_plan: QueryPlan, primary_domain: str) -> RiskProfile:
        """
        Assess 4-dimensional risks.

        Args:
            query_plan (QueryPlan): The query plan.
            primary_domain (str): The primary domain of the query.

        Returns:
            RiskProfile: The assessed risk profile.
        """
        
        # Default levels
        labor_risk = RiskLevel.LOW
        tax_risk = RiskLevel.LOW
        brand_risk = RiskLevel.LOW
        focus_risk = RiskLevel.LOW
        
        # Risk mapping by domain
        if primary_domain == DomainKey.TRANSITION.value:
            labor_risk = RiskLevel.HIGH
            tax_risk = RiskLevel.MEDIUM
            focus_risk = RiskLevel.MEDIUM
        
        elif primary_domain == DomainKey.TAX.value:
            tax_risk = RiskLevel.HIGH
            labor_risk = RiskLevel.MEDIUM
        
        elif primary_domain == DomainKey.GROWTH.value:
            focus_risk = RiskLevel.HIGH
            labor_risk = RiskLevel.MEDIUM
            tax_risk = RiskLevel.MEDIUM
            brand_risk = RiskLevel.MEDIUM
        
        return RiskProfile(
            labor=RiskItem(
                level=labor_risk,
                rationale=self._generate_risk_rationale(primary_domain, "labor")
            ),
            tax=RiskItem(
                level=tax_risk,
                rationale=self._generate_risk_rationale(primary_domain, "tax")
            ),
            brand=RiskItem(
                level=brand_risk,
                rationale=self._generate_risk_rationale(primary_domain, "brand")
            ),
            focus=RiskItem(
                level=focus_risk,
                rationale=self._generate_risk_rationale(primary_domain, "focus")
            ),
        )
    
    def _generate_risk_rationale(self, domain: str, dimension: str) -> str:
        """
        Generate brief risk rationale.

        Args:
            domain (str): The domain name.
            dimension (str): The risk dimension (labor, tax, brand, focus).

        Returns:
            str: The rationale string.
        """
        rationales = {
            (DomainKey.TRANSITION.value, "labor"): "Cambio laboral requiere validación de alternativa",
            (DomainKey.TRANSITION.value, "tax"): "Implicaciones fiscales y de SS",
            (DomainKey.TAX.value, "tax"): "Normativa fiscal compleja",
            (DomainKey.GROWTH.value, "focus"): "Expansión sin base validada",
        }
        
        return rationales.get((domain, dimension), f"Bajo riesgo en {dimension}")
    
    def _check_hard_constraints(self, query_plan: QueryPlan) -> List[str]:
        """
        Check if decision violates hard constraints.

        Args:
            query_plan (QueryPlan): The query plan.

        Returns:
            List[str]: List of violated constraint IDs.
        """
        violations: List[str] = []
        
        # hc_005: No emotional labor decisions without validation
        if DomainKey.TRANSITION.value in query_plan.domains_selected:
            violations.append("hc_005")  # Must validate cash first
        
        # hc_003: No external IA consulting unvalidated
        if "lab" in [f.lower() for f in query_plan.flags]:
            violations.append("hc_003")
        
        return violations
    
    def _determine_recommendation(
        self,
        aligns_with_principle: bool,
        constraint_violations: List[str],
        risks: RiskProfile,
        confidence: Confidence
    ) -> Recommendation:
        """
        Determine recommendation based on evaluation.

        Args:
            aligns_with_principle (bool): Alignment with principle reactor.
            constraint_violations (List[str]): List of constraint violations.
            risks (RiskProfile): The risk profile.
            confidence (Confidence): Plan confidence.

        Returns:
            Recommendation: The final recommendation.
        """
        
        # If high risk labor or tax + violations = postpone
        if (risks.labor.level == RiskLevel.HIGH or risks.tax.level == RiskLevel.HIGH) and constraint_violations:
            return Recommendation.POSTPONE
        
        # If principle not aligned = reframe
        if not aligns_with_principle:
            return Recommendation.REFRAME
        
        # Low confidence = postpone
        if confidence == Confidence.LOW:
            return Recommendation.POSTPONE
        
        # If safe = execute
        return Recommendation.EXECUTE
    
    def _generate_next_steps(self, domain: str, recommendation: Recommendation) -> Tuple[str, str, str]:
        """
        Generate exactly 3 next steps.

        Args:
            domain (str): The primary domain.
            recommendation (Recommendation): The recommendation.

        Returns:
            Tuple[str, str, str]: Exactly 3 next steps.
        """
        
        if domain == DomainKey.TRANSITION.value:
            return (
                "Validar 3 cierres inmobiliarios (≥€5k comisión neta each)",
                "Proyectar cash flow 6 meses sin salario CGI",
                "Revisar con asesor fiscal: excedencia vs renuncia"
            )
        
        elif domain == DomainKey.TAX.value:
            return (
                "Consultar con asesor fiscal sobre implicaciones",
                "Documentar estructura legal actual",
                "Revisar normativa aplicable"
            )
        
        elif domain == DomainKey.BRAND.value:
            return (
                "Validar diferenciador único en Mallorca SW",
                "Documentar ventaja competitiva",
                "Planificar rollout"
            )
        
        return (
            "Definir objetivo concreto",
            "Listar pasos iniciales",
            "Establecer timeline"
        )
    
    def _generate_dont_do(self, domain: str, query_plan: QueryPlan, risks: RiskProfile) -> List[str]:
        """
        Generate 2-5 dont_do items.

        Args:
            domain (str): The primary domain.
            query_plan (QueryPlan): The query plan.
            risks (RiskProfile): The risk profile.

        Returns:
            List[str]: List of 2-5 dont_do items.
        """
        
        dont_do: List[str] = []
        
        # Domain-specific dont_do
        if domain == DomainKey.TRANSITION.value:
            dont_do.extend([
                "No comunicar a CGI hasta validación completa",
                "No solicitar excedencia sin colchón 6-12 meses",
                "No asumir excedencia = renuncia automática"
            ])
        
        elif domain == DomainKey.TAX.value:
            dont_do.extend([
                "No crear SL sin asesoría fiscal",
                "No asumir estructuras fiscales sin validación"
            ])
        
        elif domain == DomainKey.MARKET.value:
            dont_do.extend([
                "No fijar precios sin análisis de mercado",
                "No comprometer términos sin validación"
            ])
        
        # Risk-based dont_do
        if risks.labor.level == RiskLevel.HIGH:
            dont_do.append("No tomar decisiones emocionales sin validación")
        
        if risks.focus.level == RiskLevel.HIGH:
            dont_do.append("No iniciar múltiples proyectos simultáneamente")
        
        # Always include overengineering warning
        dont_do.append("No sobrecomplicar soluciones (KISS principle)")
        
        # Ensure: unique, min 2, max 5
        dont_do_unique = list(dict.fromkeys(dont_do))
        
        if len(dont_do_unique) < 2:
            dont_do_unique.append("No actuar sin información completa")
            
        return dont_do_unique[:5]
    
    def _generate_flags(self, constraint_violations: List[str], risks: RiskProfile, query_plan: QueryPlan) -> List[str]:
        """
        Generate operational flags.

        Args:
            constraint_violations (List[str]): List of violations.
            risks (RiskProfile): The risk profile.
            query_plan (QueryPlan): The query plan.

        Returns:
            List[str]: List of flags.
        """
        flags: List[str] = []
        
        if constraint_violations:
            flags.append("hitl_required=true")
        
        if risks.labor.level == RiskLevel.HIGH:
            flags.append("labor-risk=HIGH")
        
        if risks.tax.level == RiskLevel.HIGH:
            flags.append("tax-risk=HIGH")
        
        if risks.focus.level == RiskLevel.HIGH:
            flags.append("focus-risk=HIGH")
        
        return flags
    
    def _calculate_decision_confidence(self, plan_confidence: Confidence, violations: int, risks: RiskProfile) -> Confidence:
        """
        Calculate confidence in the decision.

        Args:
            plan_confidence (Confidence): The confidence of the plan.
            violations (int): Number of constraint violations.
            risks (RiskProfile): The risk profile.

        Returns:
            Confidence: The calculated confidence level.
        """
        
        if violations > 0 or plan_confidence == Confidence.LOW:
            return Confidence.MEDIUM
        
        return plan_confidence
    
    def _generate_diagnosis(self, domain: str, recommendation: Recommendation, risks: RiskProfile) -> str:
        """
        Generate diagnosis of the situation.

        Args:
            domain (str): The primary domain.
            recommendation (Recommendation): The recommendation.
            risks (RiskProfile): The risk profile.

        Returns:
            str: The diagnosis string.
        """
        
        if domain == DomainKey.TRANSITION.value:
            return (
                "Solicitar excedencia requiere validación previa de caja alternativa. "
                "Cambio laboral es irreversible sin consolidación de base financiera. "
                "El principio rector requiere validación objetiva antes de decisión."
            )
        
        elif domain == DomainKey.TAX.value:
            return (
                "Estructura fiscal requiere asesoría especializada. "
                "Las implicaciones legales y tributarias son complejas. "
                "Necesita validación con experto antes de acción."
            )
        
        return (
            f"Situación analizada en dominio {domain}. "
            "Recomendación basada en Strategic Mode v1. "
            "Próximos pasos deben seguir el principio rector."
        )


# ═══════════════════════════════════════════════════════════════
# FACTORY FUNCTION
# ═══════════════════════════════════════════════════════════════

def create_governor(strategic_mode_version: str = "1.0-validation-phase") -> Governor:
    """
    Factory function to create a Governor instance.

    Args:
        strategic_mode_version (str): The version of strategic mode.

    Returns:
        Governor: A new Governor instance.
    """
    return Governor(strategic_mode_version)
