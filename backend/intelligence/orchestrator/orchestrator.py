"""
Anclora Intelligence v1 — Orchestrator
Coordinates Router → Governor → Synthesizer in E2E flow
"""

import uuid
from datetime import datetime, timezone
from typing import Tuple, Dict
from ..components.router import create_router
from ..components.governor import create_governor
from ..components.synthesizer import create_synthesizer
from ..types import SynthesizerOutput
from ..database import get_db_service


class Orchestrator:
    """
    Orchestrator: Coordinates the Intelligence pipeline.
    
    Flow:
    1. Router: message → QueryPlan
    2. Governor: QueryPlan → GovernorDecision
    3. Synthesizer: GovernorDecision + QueryPlan → SynthesizerOutput
    """
    
    def __init__(self, strategic_mode_version: str = "1.0-validation-phase"):
        """Initialize Orchestrator with all components."""
        self.router = create_router()
        self.governor = create_governor(strategic_mode_version)
        self.synthesizer = create_synthesizer()
        self.strategic_mode_version = strategic_mode_version
    
    def process_query(self, message: str, user_id: str = "toni") -> Tuple[Dict, str]:
        """
        Process user message through full Intelligence pipeline.
        
        Args:
            message: User's input message
            user_id: User identifier (default: toni)
        
        Returns:
            (result_dict, error_message)
        
        Result dict contains:
            - correlation_id: UUID for tracing
            - query_plan: The generated plan
            - governor_decision: The decision
            - synthesizer_output: The final response
            - processing_status: success|error|partial
            - execution_times: Dict of component timings
        """
        
        correlation_id = str(uuid.uuid4())
        
        try:
            # ─── STEP 1: ROUTER ───
            print(f"[{correlation_id}] Step 1: Router processing...")
            router_start = datetime.now(timezone.utc)
            
            query_plan, router_error = self.router.route_query(message)
            
            router_end = datetime.now(timezone.utc)
            router_time_ms = (router_end - router_start).total_seconds() * 1000
            
            if router_error:
                return self._error_result(correlation_id, router_error, "router_failed"), router_error
            
            if not query_plan:
                return self._error_result(correlation_id, "QueryPlan is None", "router_failed"), "Router returned None"
            
            print(f"[{correlation_id}] ✅ Router: {router_time_ms:.2f}ms, domains: {query_plan.domains_selected}")
            
            # ─── STEP 2: GOVERNOR ───
            print(f"[{correlation_id}] Step 2: Governor evaluating...")
            governor_start = datetime.now(timezone.utc)
            
            governor_decision, governor_error = self.governor.evaluate(query_plan)
            
            governor_end = datetime.now(timezone.utc)
            governor_time_ms = (governor_end - governor_start).total_seconds() * 1000
            
            if governor_error:
                return self._error_result(correlation_id, governor_error, "governor_failed"), governor_error
            
            if not governor_decision:
                return self._error_result(correlation_id, "GovernorDecision is None", "governor_failed"), "Governor returned None"
            
            print(f"[{correlation_id}] ✅ Governor: {governor_time_ms:.2f}ms, recommendation: {governor_decision.recommendation.value}")
            
            # ─── STEP 3: SYNTHESIZER ───
            print(f"[{correlation_id}] Step 3: Synthesizer formatting...")
            synthesizer_start = datetime.now(timezone.utc)
            
            synthesizer_output, synthesizer_error = self.synthesizer.synthesize(
                query_plan,
                governor_decision
            )
            
            synthesizer_end = datetime.now(timezone.utc)
            synthesizer_time_ms = (synthesizer_end - synthesizer_start).total_seconds() * 1000
            
            if synthesizer_error:
                return self._error_result(correlation_id, synthesizer_error, "synthesizer_failed"), synthesizer_error
            
            if not synthesizer_output:
                return self._error_result(correlation_id, "SynthesizerOutput is None", "synthesizer_failed"), "Synthesizer returned None"
            
            print(f"[{correlation_id}] ✅ Synthesizer: {synthesizer_time_ms:.2f}ms")
            
            # ─── SUCCESS ───
            total_time_ms = router_time_ms + governor_time_ms + synthesizer_time_ms
            
            result = {
                "correlation_id": correlation_id,
                "user_id": user_id,
                "message": message,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                
                "query_plan": {
                    "mode": query_plan.mode.value,
                    "domains_selected": query_plan.domains_selected,
                    "confidence": query_plan.confidence.value,
                    "flags": query_plan.flags,
                },
                
                "governor_decision": {
                    "recommendation": governor_decision.recommendation.value,
                    "risks": {
                        "labor": governor_decision.risks.labor.level.value,
                        "tax": governor_decision.risks.tax.level.value,
                        "brand": governor_decision.risks.brand.level.value,
                        "focus": governor_decision.risks.focus.level.value,
                    },
                    "confidence": governor_decision.confidence.value,
                    "flags": governor_decision.flags,
                },
                
                "synthesizer_output": {
                    "answer": synthesizer_output.answer,
                    "meta": {
                        "recommendation": synthesizer_output.meta.recommendation.value,
                        "confidence": synthesizer_output.meta.confidence.value,
                        "risk_summary": {
                            "labor": synthesizer_output.meta.risk_summary.labor.value,
                            "tax": synthesizer_output.meta.risk_summary.tax.value,
                            "brand": synthesizer_output.meta.risk_summary.brand.value,
                            "focus": synthesizer_output.meta.risk_summary.focus.value,
                        },
                    },
                    "plan": {
                        "domains_selected": synthesizer_output.plan.domains_selected,
                        "rationale": synthesizer_output.plan.rationale,
                    },
                },
                
                "processing_status": "success",
                "execution_times": {
                    "router_ms": router_time_ms,
                    "governor_ms": governor_time_ms,
                    "synthesizer_ms": synthesizer_time_ms,
                    "total_ms": total_time_ms,
                },
            }
            
            print(f"[{correlation_id}] ✅ COMPLETE: {total_time_ms:.2f}ms total")
            
            # ─── AUDIT LOG ───
            audit_id = "LOCAL_EXE"
            try:
                db_service = get_db_service()
                success, log_msg = db_service.save_audit_log(
                    correlation_id=correlation_id,
                    user_id=user_id,
                    message=message,
                    query_plan=query_plan.__dict__ if query_plan else {},
                    query_plan_id=query_plan.query_plan_id if query_plan else "unknown",
                    governor_decision=governor_decision.__dict__ if governor_decision else {},
                    governor_decision_id=governor_decision.decision_id if governor_decision else "unknown",
                    synthesizer_output=synthesizer_output.__dict__ if synthesizer_output else {},
                    synthesizer_output_id=synthesizer_output.output_id if synthesizer_output else "unknown",
                    status="success",
                    strategic_mode_version=self.strategic_mode_version,
                    confidence_overall=query_plan.confidence.value if query_plan else "low",
                    execution_times={
                        'router_ms': result.get('execution_times', {}).get('router_ms'),
                        'governor_ms': result.get('execution_times', {}).get('governor_ms'),
                        'synthesizer_ms': result.get('execution_times', {}).get('synthesizer_ms'),
                        'total_ms': result.get('execution_times', {}).get('total_ms'),
                    },
                )
                if success:
                    print(f"[{correlation_id}] ✅ Audit log saved")
                    # Extract ID from "Audit log saved: <id>"
                    if "saved: " in log_msg:
                        audit_id = log_msg.split("saved: ")[1]
            except Exception as e:
                print(f"[{correlation_id}] ⚠️  Database logging failed: {e}")
            
            result["audit_id"] = audit_id
            return result, None
        
        except Exception as e:
            error_msg = f"Orchestrator error: {str(e)}"
            print(f"[{correlation_id}] ❌ ERROR: {error_msg}")
            return self._error_result(correlation_id, error_msg, "orchestrator_error"), error_msg
    
    def _error_result(self, correlation_id: str, error: str, status: str) -> Dict:
        """Generate error result dict."""
        return {
            "correlation_id": correlation_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "processing_status": status,
            "error": error,
        }


# ═══════════════════════════════════════════════════════════════
# FACTORY FUNCTION
# ═══════════════════════════════════════════════════════════════

def create_orchestrator(strategic_mode_version: str = "1.0-validation-phase") -> Orchestrator:
    """Factory function to create an Orchestrator instance."""
    return Orchestrator(strategic_mode_version)

