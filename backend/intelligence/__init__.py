"""
Anclora Intelligence v1 — Main Module
Central entry point for Intelligence system
"""

# Version
__version__ = "1.0"

# Type definitions
from .intelligence_types import (
    # Enums
    Recommendation,
    DomainKey,
    RiskLevel,
    QueryMode,
    Confidence,
    LabStatus,
    AuditStatus,
    EvidenceStatus,
    
    # Dataclasses
    RiskItem,
    RiskProfile,
    GovernorDecision,
    LabPolicy,
    QueryPlan,
    RiskSummary,
    MetaVersion,
    Meta,
    PlanView,
    Trace,
    EvidenceItemView,
    EvidenceView,
    SynthesizerOutput,
    IntelligenceAuditEntry,
    EvidenceResult,
    NotebookLMQuery,
    NotebookLMRetrievalLog,
)

# Validation
from .validation import (
    validate_query_plan,
    validate_governor_decision,
    validate_synthesizer_output,
    validate_audit_entry,
    validate_all,
)

# Components
from .components import (
    Router,
    create_router,
    Governor,
    create_governor,
    Synthesizer,
    create_synthesizer,
)

# Orchestrator
from .orchestrator import (
    Orchestrator,
    create_orchestrator,
)

__all__ = [
    # Version
    "__version__",
    
    # Types
    "Recommendation",
    "DomainKey",
    "RiskLevel",
    "QueryMode",
    "Confidence",
    "LabStatus",
    "AuditStatus",
    "EvidenceStatus",
    "RiskItem",
    "RiskProfile",
    "GovernorDecision",
    "LabPolicy",
    "QueryPlan",
    "RiskSummary",
    "MetaVersion",
    "Meta",
    "PlanView",
    "Trace",
    "EvidenceItemView",
    "EvidenceView",
    "SynthesizerOutput",
    "IntelligenceAuditEntry",
    "EvidenceResult",
    "NotebookLMQuery",
    "NotebookLMRetrievalLog",
    
    # Validation
    "validate_query_plan",
    "validate_governor_decision",
    "validate_synthesizer_output",
    "validate_audit_entry",
    "validate_all",
    
    # Components
    "Router",
    "create_router",
    "Governor",
    "create_governor",
    "Synthesizer",
    "create_synthesizer",
    
    # Orchestrator
    "Orchestrator",
    "create_orchestrator",
]
