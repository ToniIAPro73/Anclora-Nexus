"""
Anclora Intelligence v1 — Validation Functions
Validate all dataclasses against their invariants
"""

from typing import Tuple
from .intelligence_types import (
    QueryPlan, GovernorDecision, SynthesizerOutput,
    IntelligenceAuditEntry, NotebookLMRetrievalLog,
    RiskLevel, Confidence, AuditStatus
)


# ═══════════════════════════════════════════════════════════════
# CONTRACT #2: QueryPlan Validators
# ═══════════════════════════════════════════════════════════════

def validate_query_plan(plan: QueryPlan) -> Tuple[bool, str]:
    """
    Validate QueryPlan against all invariants.
    Returns: (is_valid, error_message)
    """
    
    # Invariant 1: domains_selected nunca vacío
    if not plan.domains_selected or len(plan.domains_selected) == 0:
        return False, "domains_selected cannot be empty"
    
    # Invariant 2: Nunca más de 3 dominios
    if len(plan.domains_selected) > 3:
        return False, f"domains_selected max 3, got {len(plan.domains_selected)}"
    
    # Invariant 3: mode siempre presente
    if not plan.mode:
        return False, "mode is required"
    
    # Invariant 4: confidence siempre presente
    if not plan.confidence:
        return False, "confidence is required"
    
    # Invariant 5: lab_policy siempre presente
    if plan.lab_policy is None:
        return False, "lab_policy is required"
    
    # Invariant 6: rationale siempre presente
    if not plan.rationale or len(plan.rationale.strip()) == 0:
        return False, "rationale is required"
    
    # Invariant 7: agents_selected siempre lista (puede ser vacía)
    if not isinstance(plan.agents_selected, list):
        return False, "agents_selected must be a list"
    
    # Invariant 8: needs_evidence y needs_skills siempre presentes
    if plan.needs_evidence is None or plan.needs_skills is None:
        return False, "needs_evidence and needs_skills are required"
    
    # Invariant 9: timestamp presente
    if not plan.timestamp:
        return False, "timestamp is required"
    
    # Invariant 10: Mode binding (fast permite max 2 dominios)
    if str(plan.mode).lower() == "fast" and len(plan.domains_selected) > 2:
        return False, f"mode='fast' allows max 2 domains, got {len(plan.domains_selected)}"
    
    return True, ""


# ═══════════════════════════════════════════════════════════════
# CONTRACT #1: GovernorDecision Validators
# ═══════════════════════════════════════════════════════════════

def validate_governor_decision(decision: GovernorDecision) -> Tuple[bool, str]:
    """
    Validate GovernorDecision against all invariants.
    Returns: (is_valid, error_message)
    """
    
    # Invariant 1: recommendation siempre presente
    if not decision.recommendation:
        return False, "recommendation is required"
    
    # Invariant 2: next_steps EXACTAMENTE 3
    if not isinstance(decision.next_steps, tuple) or len(decision.next_steps) != 3:
        return False, f"next_steps must be exactly 3, got {len(decision.next_steps) if decision.next_steps else 0}"
    
    # Invariant 3: All 3 next_steps non-empty
    for i, step in enumerate(decision.next_steps):
        if not step or len(step.strip()) == 0:
            return False, f"next_steps[{i}] cannot be empty"
    
    # Invariant 4: risks SIEMPRE tiene 4 dimensiones
    if not decision.risks:
        return False, "risks is required"
    
    if not decision.risks.labor or not decision.risks.tax or \
       not decision.risks.brand or not decision.risks.focus:
        return False, "risks must have all 4 dimensions (labor, tax, brand, focus)"
    
    # Invariant 5: dont_do NUNCA vacío (2-5 elementos)
    if not decision.dont_do or len(decision.dont_do) < 2:
        return False, "dont_do must have at least 2 items"
    
    if len(decision.dont_do) > 5:
        return False, f"dont_do max 5 items, got {len(decision.dont_do)}"
    
    # Invariant 6: confidence SIEMPRE presente
    if not decision.confidence:
        return False, "confidence is required"
    
    # Invariant 7: strategic_mode_version presente
    if not decision.strategic_mode_version:
        return False, "strategic_mode_version is required"
    
    # Invariant 8: domains_used presente
    if not decision.domains_used:
        return False, "domains_used is required"
    
    # Invariant 9: timestamp presente
    if not decision.timestamp:
        return False, "timestamp is required"
    
    # Invariant 10: diagnosis presente
    if not decision.diagnosis or len(decision.diagnosis.strip()) == 0:
        return False, "diagnosis is required"
    
    return True, ""


# ═══════════════════════════════════════════════════════════════
# CONTRACT #3: SynthesizerOutput Validators
# ═══════════════════════════════════════════════════════════════

def validate_synthesizer_output(output: SynthesizerOutput) -> Tuple[bool, str]:
    """
    Validate SynthesizerOutput against all invariants.
    Returns: (is_valid, error_message)
    """
    
    # Invariant 1: answer siempre presente
    if not output.answer or len(output.answer.strip()) == 0:
        return False, "answer is required"
    
    # Invariant 2: meta siempre presente
    if not output.meta:
        return False, "meta is required"
    
    # Invariant 3: meta.recommendation debe estar presente
    if not output.meta.recommendation:
        return False, "meta.recommendation is required"
    
    # Invariant 4: meta.risk_summary debe estar presente
    if not output.meta.risk_summary:
        return False, "meta.risk_summary is required"
    
    # Invariant 5: plan siempre presente
    if not output.plan:
        return False, "plan is required"
    
    # Invariant 6: plan.domains_selected presente
    if not output.plan.domains_selected or len(output.plan.domains_selected) == 0:
        return False, "plan.domains_selected is required"
    
    # Invariant 7: trace siempre presente
    if not output.trace:
        return False, "trace is required"
    
    # Invariant 8: trace.output_ai SIEMPRE true
    if output.trace.output_ai != True:
        return False, "trace.output_ai must be True"
    
    # Invariant 9: evidence siempre presente
    if not output.evidence:
        return False, "evidence is required"
    
    # Invariant 10: answer debe contener 5 bloques (validación básica)
    required_blocks = ["DIAGNÓSTICO", "RECOMENDACIÓN", "RIESGOS", "PRÓXIMOS", "NO HACER"]
    for block in required_blocks:
        if block not in output.answer.upper():
            return False, f"answer missing required section: {block}"
    
    return True, ""


# ═══════════════════════════════════════════════════════════════
# CONTRACT #5: Audit Log Validators
# ═══════════════════════════════════════════════════════════════

def validate_audit_entry(entry: IntelligenceAuditEntry) -> Tuple[bool, str]:
    """
    Validate IntelligenceAuditEntry against all invariants.
    Returns: (is_valid, error_message)
    """
    
    # Invariant 1: entry_id NUNCA null
    if not entry.entry_id:
        return False, "entry_id is required"
    
    # Invariant 2: timestamp NUNCA null
    if not entry.timestamp:
        return False, "timestamp is required"
    
    # Invariant 3: correlation_id NUNCA null
    if not entry.correlation_id:
        return False, "correlation_id is required"
    
    # Invariant 4: user_id NUNCA null
    if not entry.user_id:
        return False, "user_id is required"
    
    # Invariant 5: message NUNCA null
    if not entry.message:
        return False, "message is required"
    
    # Invariant 6: query_plan NUNCA null
    if entry.query_plan is None:
        return False, "query_plan snapshot is required"
    
    # Invariant 7: governor_decision NUNCA null
    if entry.governor_decision is None:
        return False, "governor_decision snapshot is required"
    
    # Invariant 8: synthesizer_output NUNCA null
    if entry.synthesizer_output is None:
        return False, "synthesizer_output snapshot is required"
    
    # Invariant 9: status NUNCA null
    if not entry.status:
        return False, "status is required"
    
    # Invariant 10: output_ai NUNCA null
    if entry.output_ai is None:
        return False, "output_ai is required"
    
    # Invariant 11: Si status=success, output_ai debe ser true
    if entry.status == AuditStatus.SUCCESS and entry.output_ai != True:
        return False, "if status=success, output_ai must be True"
    
    # Invariant 12: checksum NUNCA null
    if not entry.checksum:
        return False, "checksum is required"
    
    return True, ""


# ═══════════════════════════════════════════════════════════════
# VALIDATION RUNNER
# ═══════════════════════════════════════════════════════════════

def validate_all(
    query_plan: QueryPlan = None,
    governor_decision: GovernorDecision = None,
    synthesizer_output: SynthesizerOutput = None,
    audit_entry: IntelligenceAuditEntry = None
) -> Tuple[bool, list]:
    """
    Run all validations. Returns (all_valid, list_of_errors).
    """
    errors = []
    
    if query_plan:
        valid, error = validate_query_plan(query_plan)
        if not valid:
            errors.append(f"QueryPlan: {error}")
    
    if governor_decision:
        valid, error = validate_governor_decision(governor_decision)
        if not valid:
            errors.append(f"GovernorDecision: {error}")
    
    if synthesizer_output:
        valid, error = validate_synthesizer_output(synthesizer_output)
        if not valid:
            errors.append(f"SynthesizerOutput: {error}")
    
    if audit_entry:
        valid, error = validate_audit_entry(audit_entry)
        if not valid:
            errors.append(f"AuditEntry: {error}")
    
    return len(errors) == 0, errors
