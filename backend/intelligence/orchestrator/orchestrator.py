"""
Anclora Intelligence v1 — Orchestrator
Coordinates Router → Governor → Synthesizer in E2E flow
"""

import uuid
from datetime import datetime, timezone
from typing import Tuple, Dict, Any, Optional
from ..components.router import create_router
from ..components.governor import create_governor
from ..components.synthesizer import create_synthesizer
from ..intelligence_types import SynthesizerOutput, StateEnum, AuditStatus, Confidence
from ..database import get_db_service
from ..utils.logging import get_intelligence_logger

# Initialize structured logger
logger = get_intelligence_logger("orchestrator")


class Orchestrator:
    """
    Orchestrator: Coordinates the Intelligence pipeline.
    
    Flow:
    1. Router: message → QueryPlan
    2. Governor: QueryPlan → GovernorDecision
    3. Synthesizer: GovernorDecision + QueryPlan → SynthesizerOutput
    """
    
    def __init__(self, strategic_mode_version: str = "1.0-validation-phase") -> None:
        """
        Initialize Orchestrator with all components.

        Args:
            strategic_mode_version (str): The strategic mode version to use.
        """
        self.router = create_router()
        self.governor = create_governor(strategic_mode_version)
        self.synthesizer = create_synthesizer()
        self.strategic_mode_version = strategic_mode_version
        self.state = StateEnum.IDLE
        logger.info("Orchestrator initialized", extra={"version": strategic_mode_version})
    
    def process_query(self, message: str, user_id: str = "toni") -> Tuple[Dict[str, Any], Optional[str]]:
        """
        Process user message through full Intelligence pipeline.
        
        Args:
            message (str): User's input message.
            user_id (str): User identifier (default: toni).
        
        Returns:
            Tuple[Dict[str, Any], Optional[str]]: 
                - result_dict: Metadata and component outputs
                - error_message: String describing failure, or None
        """
        
        correlation_id = str(uuid.uuid4())
        self.state = StateEnum.ROUTING
        
        logger.info("Processing new query", extra={
            "correlation_id": correlation_id, 
            "user_id": user_id,
            "message_len": len(message)
        })
        
        execution_times: Dict[str, float] = {}
        start_total = datetime.now(timezone.utc)
        
        # Snapshot variables for final result
        query_plan = None
        governor_decision = None
        synthesizer_output = None
        
        try:
            # ─── STEP 1: ROUTER ───
            router_start = datetime.now(timezone.utc)
            query_plan, router_error = self.router.route_query(message)
            router_end = datetime.now(timezone.utc)
            execution_times["router_ms"] = (router_end - router_start).total_seconds() * 1000
            
            if router_error:
                self.state = StateEnum.FAILED
                return self._finalize_with_error(correlation_id, user_id, message, router_error, "router_failed", execution_times)
            
            # Attach correlation_id to query_plan for tracing in logs of other components
            if query_plan:
                setattr(query_plan, "correlation_id", correlation_id)
            
            logger.info("Router success", extra={
                "correlation_id": correlation_id,
                "domains": query_plan.domains_selected if query_plan else [],
                "time_ms": execution_times["router_ms"]
            })
            
            # ─── STEP 2: GOVERNOR ───
            self.state = StateEnum.GOVERNING
            governor_start = datetime.now(timezone.utc)
            governor_decision, governor_error = self.governor.evaluate(query_plan)
            governor_end = datetime.now(timezone.utc)
            execution_times["governor_ms"] = (governor_end - governor_start).total_seconds() * 1000
            
            if governor_error:
                self.state = StateEnum.FAILED
                return self._finalize_with_error(correlation_id, user_id, message, governor_error, "governor_failed", execution_times, query_plan)
            
            logger.info("Governor success", extra={
                "correlation_id": correlation_id,
                "recommendation": governor_decision.recommendation if governor_decision else "unknown",
                "time_ms": execution_times["governor_ms"]
            })
            
            # ─── STEP 3: SYNTHESIZER ───
            self.state = StateEnum.SYNTHESIZING
            synthesizer_start = datetime.now(timezone.utc)
            synthesizer_output, synthesizer_error = self.synthesizer.synthesize(query_plan, governor_decision)
            synthesizer_end = datetime.now(timezone.utc)
            execution_times["synthesizer_ms"] = (synthesizer_end - synthesizer_start).total_seconds() * 1000
            
            if synthesizer_error:
                # Note: Synthesizer might return a degraded output instead of just erroring
                if not synthesizer_output:
                    self.state = StateEnum.FAILED
                    return self._finalize_with_error(correlation_id, user_id, message, synthesizer_error, "synthesizer_failed", execution_times, query_plan, governor_decision)
                else:
                    logger.warning("Synthesizer partial success (degraded)", extra={"correlation_id": correlation_id, "error": synthesizer_error})
            
            logger.info("Synthesizer success", extra={
                "correlation_id": correlation_id,
                "time_ms": execution_times["synthesizer_ms"]
            })
            
            # ─── STEP 4: AUDIT ───
            self.state = StateEnum.AUDITING
            total_time_ms = (datetime.now(timezone.utc) - start_total).total_seconds() * 1000
            execution_times["total_ms"] = total_time_ms
            
            result = self._build_result_dict(
                correlation_id=correlation_id,
                user_id=user_id,
                message=message,
                query_plan=query_plan,
                governor_decision=governor_decision,
                synthesizer_output=synthesizer_output,
                execution_times=execution_times,
                status="success"
            )
            
            audit_id = self._save_audit_transaction(result)
            result["audit_id"] = audit_id
            
            self.state = StateEnum.COMPLETED
            logger.info("Pipeline complete", extra={"correlation_id": correlation_id, "total_ms": total_time_ms, "audit_id": audit_id})
            
            return result, None
            
        except Exception as e:
            error_msg = f"Orchestrator critical failure: {str(e)}"
            self.state = StateEnum.FAILED
            logger.exception("Critical error in pipeline", extra={"correlation_id": correlation_id})
            res_dict, _ = self._finalize_with_error(correlation_id, user_id, message, error_msg, "orchestrator_panic", execution_times, query_plan, governor_decision)
            return res_dict, error_msg

    def _build_result_dict(
        self,
        correlation_id: str,
        user_id: str,
        message: str,
        query_plan: Any,
        governor_decision: Any,
        synthesizer_output: Any,
        execution_times: Dict[str, float],
        status: str
    ) -> Dict[str, Any]:
        """Construct the standard result dictionary."""
        return {
            "correlation_id": correlation_id,
            "user_id": user_id,
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "processing_status": status,
            "execution_times": execution_times,
            "query_plan": query_plan.model_dump() if query_plan else None,
            "governor_decision": governor_decision.model_dump() if governor_decision else None,
            "synthesizer_output": synthesizer_output.model_dump() if synthesizer_output else None,
        }

    def _save_audit_transaction(self, result: Dict[str, Any]) -> str:
        """Save to audit log with transaction safety."""
        audit_id = "LOCAL_ONLY"
        try:
            db_service = get_db_service()
            success, log_msg = db_service.save_audit_log(
                correlation_id=result["correlation_id"],
                user_id=result["user_id"],
                message=result["message"],
                query_plan=result["query_plan"] or {},
                query_plan_id=result.get("query_plan", {}).get("query_plan_id", "unknown") if result["query_plan"] else "unknown",
                governor_decision=result["governor_decision"] or {},
                governor_decision_id=result.get("governor_decision", {}).get("decision_id", "unknown") if result["governor_decision"] else "unknown",
                synthesizer_output=result["synthesizer_output"] or {},
                synthesizer_output_id=result.get("synthesizer_output", {}).get("output_id", "unknown") if result["synthesizer_output"] else "unknown",
                status=result["processing_status"],
                strategic_mode_version=self.strategic_mode_version,
                confidence_overall=result.get("query_plan", {}).get("confidence", Confidence.LOW) if result["query_plan"] else Confidence.LOW,
                execution_times=result["execution_times"],
            )
            if success and "saved: " in log_msg:
                audit_id = log_msg.split("saved: ")[1]
                logger.info("Audit log persisted", extra={"correlation_id": result["correlation_id"], "audit_id": audit_id})
            else:
                logger.warning("Audit log persistence failed", extra={"correlation_id": result["correlation_id"], "reason": log_msg})
        except Exception as e:
            logger.error(f"Audit transaction error: {e}", extra={"correlation_id": result["correlation_id"]})
            
        return audit_id

    def _finalize_with_error(
        self, 
        correlation_id: str, 
        user_id: str, 
        message: str, 
        error: str, 
        status: str, 
        execution_times: Dict[str, float],
        query_plan: Optional[Any] = None,
        governor_decision: Optional[Any] = None
    ) -> Tuple[Dict[str, Any], Optional[str]]:
        """Finalize the process with an error state and log it."""
        result = self._build_result_dict(
            correlation_id=correlation_id,
            user_id=user_id,
            message=message,
            query_plan=query_plan,
            governor_decision=governor_decision,
            synthesizer_output=None,
            execution_times=execution_times,
            status=status
        )
        result["error"] = error
        
        # Still try to audit the failure
        self._save_audit_transaction(result)
        
        return result, error


# ═══════════════════════════════════════════════════════════════
# FACTORY FUNCTION
# ═══════════════════════════════════════════════════════════════

def create_orchestrator(strategic_mode_version: str = "1.0-validation-phase") -> Orchestrator:
    """Factory function to create an Orchestrator instance."""
    return Orchestrator(strategic_mode_version)
