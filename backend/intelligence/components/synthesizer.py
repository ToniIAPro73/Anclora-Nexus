"""
Anclora Intelligence v1 — Synthesizer Component
Generates SynthesizerOutput from GovernorDecision and QueryPlan
"""

import uuid
from datetime import datetime, timezone
from typing import Tuple
from ..types import (
    GovernorDecision, QueryPlan, SynthesizerOutput,
    Meta, MetaVersion, PlanView, Trace, EvidenceView, EvidenceStatus,
    RiskSummary
)
from ..validation import validate_synthesizer_output


class Synthesizer:
    """
    Synthesizer: Takes GovernorDecision and QueryPlan, generates SynthesizerOutput.
    Formats response in 5 fixed blocks, includes metadata, evidence placeholder.
    """
    
    def __init__(self):
        """Initialize Synthesizer."""
        self.schema_version = "1.0"
        self.max_answer_length = 800  # words
        self.max_excerpt_length = 200  # chars
    
    def synthesize(
        self,
        query_plan: QueryPlan,
        governor_decision: GovernorDecision
    ) -> Tuple[SynthesizerOutput, str]:
        """
        Synthesize SynthesizerOutput from decision and plan.
        Returns: (SynthesizerOutput, error_message)
        
        Logic:
        1. Format answer in 5 blocks (FIJO)
        2. Create meta (summary of decision + risks)
        3. Create plan view
        4. Create trace (for audit)
        5. Create evidence view (empty Phase 1)
        6. Validate and return
        """
        
        try:
            # Step 1: Format answer in 5 fixed blocks
            answer = self._format_answer_5_blocks(governor_decision, query_plan)
            
            # Step 2: Create RiskSummary
            risk_summary = RiskSummary(
                labor=governor_decision.risks.labor.level,
                tax=governor_decision.risks.tax.level,
                brand=governor_decision.risks.brand.level,
                focus=governor_decision.risks.focus.level,
            )
            
            # Step 3: Create MetaVersion
            meta_version = MetaVersion(
                schema_version=self.schema_version,
                strategic_mode_id=governor_decision.strategic_mode_version,
                domain_pack_id="real-estate-mallorca@v0.1"
            )
            
            # Step 4: Create Meta
            meta = Meta(
                mode=query_plan.mode,
                domain_hint=query_plan.domain_hint,
                confidence=query_plan.confidence,
                flags=query_plan.flags + governor_decision.flags,
                recommendation=governor_decision.recommendation,
                risk_summary=risk_summary,
                version=meta_version
            )
            
            # Step 5: Create PlanView
            plan_view = PlanView(
                domains_selected=query_plan.domains_selected,
                rationale=query_plan.rationale,
                lab_policy={
                    "status": query_plan.lab_policy.status.value,
                    "rationale": query_plan.lab_policy.rationale
                }
            )
            
            # Step 6: Create Trace
            trace = Trace(
                query_plan_id=str(uuid.uuid4()),
                governor_decision_id=str(uuid.uuid4()),
                created_at=datetime.now(timezone.utc).isoformat(),
                output_ai=True
            )
            
            # Step 7: Create EvidenceView (empty Phase 1)
            evidence_view = EvidenceView(
                status=EvidenceStatus.NOT_AVAILABLE,
                items=[]
            )
            
            # Step 8: Create SynthesizerOutput
            output = SynthesizerOutput(
                answer=answer,
                meta=meta,
                plan=plan_view,
                trace=trace,
                evidence=evidence_view
            )
            
            # Step 9: Validate
            is_valid, error = validate_synthesizer_output(output)
            
            if not is_valid:
                return None, f"SynthesizerOutput validation failed: {error}"
            
            return output, None
        
        except Exception as e:
            return None, f"Synthesizer error: {str(e)}"
    
    def _format_answer_5_blocks(
        self,
        decision: GovernorDecision,
        query_plan: QueryPlan
    ) -> str:
        """
        Format answer in 5 FIXED blocks.
        Order NEVER changes.
        """
        
        # Block 1: DIAGNÓSTICO
        block1 = f"## DIAGNÓSTICO\n{decision.diagnosis}\n"
        
        # Block 2: RECOMENDACIÓN
        recommendation_text = self._recommendation_to_text(decision.recommendation)
        block2 = (
            f"\n## RECOMENDACIÓN\n"
            f"**{recommendation_text}**\n"
            f"{self._generate_recommendation_justification(decision)}\n"
        )
        
        # Block 3: RIESGOS ASOCIADOS
        block3 = (
            f"\n## RIESGOS ASOCIADOS\n"
            f"- Labor: **{decision.risks.labor.level.value.upper()}** — "
            f"{decision.risks.labor.rationale}\n"
            f"- Tax: **{decision.risks.tax.level.value.upper()}** — "
            f"{decision.risks.tax.rationale}\n"
            f"- Brand: **{decision.risks.brand.level.value.upper()}** — "
            f"{decision.risks.brand.rationale}\n"
            f"- Focus: **{decision.risks.focus.level.value.upper()}** — "
            f"{decision.risks.focus.rationale}\n"
        )
        
        # Block 4: PRÓXIMOS 3 PASOS
        block4 = (
            f"\n## PRÓXIMOS 3 PASOS\n"
            f"1. {decision.next_steps[0]}\n"
            f"2. {decision.next_steps[1]}\n"
            f"3. {decision.next_steps[2]}\n"
        )
        
        # Block 5: QUÉ NO HACER AHORA
        dont_do_list = "\n".join([f"- {item}" for item in decision.dont_do])
        block5 = (
            f"\n## QUÉ NO HACER AHORA\n"
            f"{dont_do_list}\n"
        )
        
        # Metadata footer (minimal, no prominent)
        footer = (
            f"\n---\n"
            f"**Análisis:** {', '.join(query_plan.domains_selected)} | "
            f"**Confianza:** {query_plan.confidence.value} | "
            f"**Modo:** {query_plan.mode.value}"
        )
        
        # Combine all blocks (FIXED ORDER)
        answer = block1 + block2 + block3 + block4 + block5 + footer
        
        return answer
    
    def _recommendation_to_text(self, recommendation) -> str:
        """Convert recommendation enum to readable text."""
        texts = {
            "execute": "EJECUTAR",
            "postpone": "POSTERGAR",
            "reframe": "REFORMULAR",
            "discard": "DESCARTAR",
        }
        return texts.get(recommendation.value, "EVALUAR")
    
    def _generate_recommendation_justification(self, decision: GovernorDecision) -> str:
        """Generate brief justification for recommendation."""
        
        if decision.recommendation.value == "execute":
            return "La acción está alineada con el principio rector y no presenta riesgos críticos."
        
        elif decision.recommendation.value == "postpone":
            return (
                "El momento no es óptimo. Requiere validación previa de factores críticos. "
                "Seguir los próximos 3 pasos antes de reconsiderar."
            )
        
        elif decision.recommendation.value == "reframe":
            return (
                "El enfoque requiere ajustes. Reformular la estrategia "
                "para alinearse mejor con objetivos y restricciones."
            )
        
        else:  # discard
            return (
                "La acción no está alineada con el principio rector o viola restricciones. "
                "Descartar y explorar alternativas."
            )
    
    def _is_valid_answer(self, answer: str) -> bool:
        """Validate that answer has all 5 blocks."""
        required_blocks = ["DIAGNÓSTICO", "RECOMENDACIÓN", "RIESGOS", "PRÓXIMOS", "NO HACER"]
        
        for block in required_blocks:
            if block not in answer.upper():
                return False
        
        return True


# ═══════════════════════════════════════════════════════════════
# FACTORY FUNCTION
# ═══════════════════════════════════════════════════════════════

def create_synthesizer() -> Synthesizer:
    """Factory function to create a Synthesizer instance."""
    return Synthesizer()
