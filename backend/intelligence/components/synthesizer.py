"""
Anclora Intelligence v1 — Synthesizer Component
Generates SynthesizerOutput from GovernorDecision and QueryPlan
"""

import uuid
import time
import random
from datetime import datetime, timezone
from typing import Tuple, Optional, List, Dict, Any, Callable
from ..intelligence_types import (
    GovernorDecision, QueryPlan, SynthesizerOutput,
    Meta, MetaVersion, PlanView, Trace, EvidenceView, EvidenceStatus,
    RiskSummary, RiskLevel
)
from ..validation import validate_synthesizer_output
from ..utils.logging import get_intelligence_logger

# Initialize structured logger
logger = get_intelligence_logger("synthesizer")


def retry_with_backoff(retries: int = 3, backoff_in_seconds: float = 1.0) -> Callable:
    """
    Decorator for retry logic with exponential backoff.
    """
    def decorator(func: Callable) -> Callable:
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            x = 0
            while True:
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if x == retries:
                        logger.error(f"Failed after {retries} retries", extra={"error": str(e)})
                        raise
                    
                    sleep_time = (backoff_in_seconds * (2 ** x) + 
                                 random.uniform(0, 1))
                    logger.warning(f"Retry {x+1}/{retries} after {sleep_time:.2f}s", extra={"error": str(e)})
                    time.sleep(sleep_time)
                    x += 1
        return wrapper
    return decorator


class Synthesizer:
    """
    Synthesizer: Takes GovernorDecision and QueryPlan, generates SynthesizerOutput.
    Formats response in 5 fixed blocks, includes metadata, evidence placeholder.
    """
    
    def __init__(self) -> None:
        """Initialize Synthesizer."""
        self.schema_version = "1.0"
        self.strategic_mode_id = "validation-phase-v1"
        self.domain_pack_id = "real-estate-mallorca@v0.1"
        logger.info("Synthesizer initialized")
    
    @retry_with_backoff(retries=3)
    def synthesize(
        self,
        query_plan: QueryPlan,
        governor_decision: GovernorDecision
    ) -> Tuple[Optional[SynthesizerOutput], Optional[str]]:
        """
        Synthesize SynthesizerOutput from decision and plan.

        Logic:
        1. Format answer in 5 blocks (FIJO)
        2. Create meta (summary of decision + risks)
        3. Create plan view
        4. Create trace (for audit)
        5. Create evidence view (empty Phase 1)
        6. Validate and return

        Args:
            query_plan (QueryPlan): The query plan used.
            governor_decision (GovernorDecision): The decision from the governor.

        Returns:
            Tuple[Optional[SynthesizerOutput], Optional[str]]: The synthesized output and error message.
        """
        
        correlation_id = getattr(query_plan, "correlation_id", "unknown")
        logger.info("Starting synthesis", extra={"correlation_id": correlation_id})
        
        try:
            # Step 1: Format answer in 5 FIXED blocks
            answer = self._format_answer_5_blocks(governor_decision, query_plan)
            
            # Step 2: Create meta
            meta = Meta(
                mode=query_plan.mode,
                domain_hint=query_plan.domain_hint,
                confidence=governor_decision.confidence,
                flags=governor_decision.flags,
                recommendation=governor_decision.recommendation,
                risk_summary=RiskSummary(
                    labor=governor_decision.risks.labor.level,
                    tax=governor_decision.risks.tax.level,
                    brand=governor_decision.risks.brand.level,
                    focus=governor_decision.risks.focus.level,
                ),
                version=MetaVersion(
                    schema_version=self.schema_version,
                    strategic_mode_id=self.strategic_mode_id,
                    domain_pack_id=self.domain_pack_id
                )
            )
            
            # Step 3: Create plan view
            plan_view = PlanView(
                domains_selected=query_plan.domains_selected,
                rationale=query_plan.rationale,
                lab_policy={
                    "status": query_plan.lab_policy.status if query_plan.lab_policy else "unknown",
                    "rationale": query_plan.lab_policy.rationale if query_plan.lab_policy else ""
                }
            )
            
            # Step 4: Create trace (ID creation for Audit)
            trace = Trace(
                query_plan_id=str(uuid.uuid4()),  # Placeholder for real IDs if not passed
                governor_decision_id=str(uuid.uuid4()),
                created_at=datetime.now(timezone.utc).isoformat(),
                output_ai=True
            )
            
            # Step 5: Create evidence view (Empty for Phase 1)
            evidence = EvidenceView(
                status=EvidenceStatus.NOT_AVAILABLE,
                items=[]
            )
            
            # Step 6: Create SynthesizerOutput
            output = SynthesizerOutput(
                answer=answer,
                meta=meta,
                plan=plan_view,
                trace=trace,
                evidence=evidence
            )
            
            # Step 7: Validate
            is_valid, error = validate_synthesizer_output(output)
            
            if not is_valid:
                logger.error("Synthesis validation failed", extra={"error": error, "correlation_id": correlation_id})
                return None, f"SynthesizerOutput validation failed: {error}"
            
            logger.info("Synthesis complete", extra={"correlation_id": correlation_id})
            return output, None
            
        except Exception as e:
            logger.exception("Synthesizer error", extra={"correlation_id": correlation_id})
            # Graceful degradation: return a generic but valid response if possible
            return self._generate_fallback_output(query_plan, governor_decision, str(e))

    def _format_answer_5_blocks(
        self,
        decision: GovernorDecision,
        query_plan: QueryPlan
    ) -> str:
        """
        Format answer in 5 FIXED blocks.
        Order NEVER changes.

        Args:
            decision (GovernorDecision): The governor's decision.
            query_plan (QueryPlan): The query plan.

        Returns:
            str: The formatted answer string.
        """
        
        recommendation_text = self._recommendation_to_text(decision.recommendation)
        justification = self._generate_recommendation_justification(decision)
        
        blocks = [
            "# DIAGNÓSTICO",
            decision.diagnosis,
            "",
            "# RECOMENDACIÓN",
            f"**{recommendation_text}**",
            justification,
            "",
            "# RIESGOS",
            self._format_risks(decision),
            "",
            "# PRÓXIMOS PASOS",
            "\n".join([f"- {step}" for step in decision.next_steps]),
            "",
            "# QUÉ NO HACER",
            "\n".join([f"- {item}" for item in decision.dont_do])
        ]
        
        return "\n".join(blocks)

    def _recommendation_to_text(self, recommendation: str) -> str:
        """Convert recommendation enum to readable text."""
        mapping = {
            "execute": "EJECUTAR ACCIÓN",
            "postpone": "POSPONER / EN PAUSA",
            "reframe": "REENCUADRAR ESTRATEGIA",
            "discard": "DESCARTAR IDEA"
        }
        return mapping.get(recommendation, "ANALIZAR MÁS A FONDO")

    def _generate_recommendation_justification(self, decision: GovernorDecision) -> str:
        """Generate brief justification for recommendation."""
        if decision.recommendation == "execute":
            return "La situación está alineada con el principio rector y los riesgos son gestionables."
        elif decision.recommendation == "postpone":
            return "Existen riesgos críticos o falta de validación que aconsejan esperar."
        elif decision.recommendation == "reframe":
            return "La aproximación actual no optimiza la base del negocio; requiere ajuste estructural."
        else:
            return "La acción propuesta viola restricciones de seguridad fundamentales."

    def _format_risks(self, decision: GovernorDecision) -> str:
        """Format risks for the answer block."""
        risk_lines = []
        for dim in ["labor", "tax", "brand", "focus"]:
            risk_item = getattr(decision.risks, dim)
            risk_lines.append(f"- **{dim.capitalize()}**: {risk_item.level.value.upper()} — {risk_item.rationale}")
        return "\n".join(risk_lines)

    def _generate_fallback_output(
        self, 
        query_plan: QueryPlan, 
        governor_decision: GovernorDecision, 
        error_msg: str
    ) -> Tuple[SynthesizerOutput, str]:
        """
        Generate a safe fallback output in case of error.
        
        Args:
            query_plan (QueryPlan): The query plan.
            governor_decision (GovernorDecision): The governor's decision.
            error_msg (str): The error that occurred.
            
        Returns:
            Tuple[SynthesizerOutput, str]: A synthesized output in a safer but degraded state.
        """
        logger.warning("Generating fallback output due to error", extra={"error": error_msg})
        
        # We try to at least provide the core information from the governor's decision
        answer = (
            "# DIAGNÓSTICO\nError en procesamiento detallado. Use con precaución.\n\n"
            f"# RECOMENDACIÓN\n{governor_decision.recommendation.value.upper()}\n\n"
            "# RIESGOS\nEvaluación parcial disponible.\n\n"
            "# PRÓXIMOS PASOS\n- Validar manualmente con experto.\n\n"
            "# QUÉ NO HACER\n- No tomar decisiones críticas basadas en este reporte parcial."
        )
        
        fallback_output = SynthesizerOutput(
            answer=answer,
            meta=Meta(
                mode=query_plan.mode,
                domain_hint=query_plan.domain_hint,
                confidence=Confidence.LOW,
                flags=["degraded-output", "error-recovery"],
                recommendation=governor_decision.recommendation,
                risk_summary=RiskSummary(
                    labor=governor_decision.risks.labor.level,
                    tax=governor_decision.risks.tax.level,
                    brand=governor_decision.risks.brand.level,
                    focus=governor_decision.risks.focus.level,
                ),
                version=MetaVersion(
                    schema_version=self.schema_version,
                    strategic_mode_id=self.strategic_mode_id,
                    domain_pack_id=self.domain_pack_id
                )
            ),
            plan=PlanView(
                domains_selected=query_plan.domains_selected,
                rationale="Recovery mode rationale.",
                lab_policy={"status": "denied", "rationale": "Error during synthesis"}
            ),
            trace=Trace(
                query_plan_id="error",
                governor_decision_id="error",
                created_at=datetime.now(timezone.utc).isoformat(),
                output_ai=True
            ),
            evidence=EvidenceView(status=EvidenceStatus.NOT_AVAILABLE, items=[])
        )
        
        return fallback_output, f"Synthesizer recovered from error: {error_msg}"


# ═══════════════════════════════════════════════════════════════
# FACTORY FUNCTION
# ═══════════════════════════════════════════════════════════════

def create_synthesizer() -> Synthesizer:
    """Factory function to create a Synthesizer instance."""
    return Synthesizer()
