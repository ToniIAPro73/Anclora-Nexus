"""
Anclora Intelligence v1 — Type Definitions
All dataclasses for Contracts #1-6
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal, Optional, List, Tuple
from enum import Enum


# ═══════════════════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════════════════

class Recommendation(str, Enum):
    EXECUTE = "execute"
    POSTPONE = "postpone"
    REFRAME = "reframe"
    DISCARD = "discard"


class DomainKey(str, Enum):
    MARKET = "market"
    BRAND = "brand"
    TAX = "tax"
    TRANSITION = "transition"
    SYSTEM = "system"
    GROWTH = "growth"
    LAB = "lab"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class QueryMode(str, Enum):
    FAST = "fast"
    DEEP = "deep"


class Confidence(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class LabStatus(str, Enum):
    DENIED = "denied"
    CONDITIONAL = "conditional"
    APPROVED = "approved"


class AuditStatus(str, Enum):
    SUCCESS = "success"
    ERROR = "error"
    PARTIAL = "partial"


class EvidenceStatus(str, Enum):
    NOT_AVAILABLE = "not_available"
    AVAILABLE = "available"
    PARTIAL = "partial"
    DEGRADED = "degraded"


# ═══════════════════════════════════════════════════════════════
# CONTRACT #1: GovernorDecision v1
# ═══════════════════════════════════════════════════════════════

@dataclass
class RiskItem:
    """Un riesgo específico con nivel y justificación."""
    level: RiskLevel
    rationale: str


@dataclass
class RiskProfile:
    """Evaluación de riesgos en 4 dimensiones."""
    labor: RiskItem
    tax: RiskItem
    brand: RiskItem
    focus: RiskItem


@dataclass
class GovernorDecision:
    """Salida oficial del Governor: decisión estratégica estructurada."""
    diagnosis: str
    recommendation: Recommendation
    risks: RiskProfile
    next_steps: Tuple[str, str, str]  # Exactamente 3
    dont_do: List[str]
    flags: List[str]
    confidence: Confidence
    strategic_mode_version: str
    domains_used: List[str]
    timestamp: str  # ISO-8601


# ═══════════════════════════════════════════════════════════════
# CONTRACT #2: QueryPlan v1
# ═══════════════════════════════════════════════════════════════

@dataclass
class LabPolicy:
    """Control de acceso a laboratorio tecnológico."""
    allow_lab: bool
    status: LabStatus
    rationale: str


@dataclass
class QueryPlan:
    """Plan de consulta emitido por Router: entrada a Governor."""
    mode: QueryMode
    domain_hint: str  # "auto" or DomainKey
    domains_selected: List[str]
    agents_selected: List[str] = field(default_factory=list)
    needs_evidence: bool = False
    needs_skills: bool = False
    lab_policy: LabPolicy = None
    rationale: str = ""
    confidence: Confidence = Confidence.MEDIUM
    flags: List[str] = field(default_factory=list)
    timestamp: str = ""


# ═══════════════════════════════════════════════════════════════
# CONTRACT #3: SynthesizerOutput v1
# ═══════════════════════════════════════════════════════════════

@dataclass
class RiskSummary:
    """Resumen de riesgos para UI (chips de color)."""
    labor: RiskLevel
    tax: RiskLevel
    brand: RiskLevel
    focus: RiskLevel


@dataclass
class MetaVersion:
    """Versionado de componentes."""
    schema_version: str
    strategic_mode_id: str
    domain_pack_id: str


@dataclass
class Meta:
    """Metadatos de la decisión."""
    mode: QueryMode
    domain_hint: str
    confidence: Confidence
    flags: List[str]
    recommendation: Recommendation
    risk_summary: RiskSummary
    version: MetaVersion


@dataclass
class PlanView:
    """Vista de alto nivel del plan para UI."""
    domains_selected: List[str]
    rationale: str
    lab_policy: dict  # {status, rationale}


@dataclass
class Trace:
    """Trazabilidad y explicabilidad auditables."""
    query_plan_id: str
    governor_decision_id: str
    created_at: str  # ISO-8601
    output_ai: bool = True


@dataclass
class EvidenceItemView:
    """Un ítem de evidencia de NotebookLM."""
    notebook_id: str
    source_title: str
    excerpt: str
    relevance_score: float


@dataclass
class EvidenceView:
    """Vista de evidencia (vacía en Phase 1)."""
    status: EvidenceStatus
    items: List[EvidenceItemView] = field(default_factory=list)


@dataclass
class SynthesizerOutput:
    """Respuesta final de Intelligence: lo que ve el usuario."""
    answer: str
    meta: Meta
    plan: PlanView
    trace: Trace
    evidence: EvidenceView


# ═══════════════════════════════════════════════════════════════
# CONTRACT #5: Audit Log v1
# ═══════════════════════════════════════════════════════════════

@dataclass
class IntelligenceAuditEntry:
    """Un registro de auditoría inmutable de una operación."""
    entry_id: str  # UUID
    timestamp: str  # ISO-8601
    correlation_id: str
    user_id: str
    
    # Input
    message: str
    message_length: int
    
    # Plan
    query_plan_id: str
    query_plan: dict  # JSON snapshot
    
    # Decision
    governor_decision_id: str
    governor_decision: dict  # JSON snapshot
    
    # Output
    synthesizer_output_id: str
    synthesizer_output: dict  # JSON snapshot
    
    # Governance
    strategic_mode_version: str
    domain_pack_version: str
    
    # State
    status: AuditStatus
    error_message: Optional[str] = None
    warnings: List[str] = field(default_factory=list)
    
    # AI Metadata
    output_ai: bool = True
    model_used: str = ""
    confidence_overall: Confidence = Confidence.MEDIUM
    
    # Storage
    stored_at: str = ""
    retention_policy: str = "permanent"
    
    # Integrity
    checksum: str = ""
    signature: Optional[str] = None


# ═══════════════════════════════════════════════════════════════
# CONTRACT #6: NotebookLM Retrieval Policy v1
# ═══════════════════════════════════════════════════════════════

@dataclass
class EvidenceResult:
    """Un resultado individual de búsqueda en NotebookLM."""
    notebook_id: str
    source_title: str
    excerpt: str
    relevance_score: float
    confidence_level: Confidence


@dataclass
class NotebookLMQuery:
    """Una búsqueda individual en NotebookLM."""
    query_id: str  # UUID
    timestamp: str  # ISO-8601
    original_domain: str
    original_intent: str
    formulated_query: str
    iteration: int
    
    # Output
    status: AuditStatus
    results: List[EvidenceResult] = field(default_factory=list)
    average_relevance: float = 0.0
    search_duration_ms: int = 0
    
    # Decision
    included_in_response: bool = False
    reason_for_inclusion: str = ""


@dataclass
class NotebookLMRetrievalLog:
    """Registro de todas las operaciones de retrieval."""
    entry_id: str  # UUID
    timestamp: str  # ISO-8601
    correlation_id: str
    
    # Context
    query_plan_id: str
    governor_decision_id: str
    synthesizer_request_id: str
    
    # Policy applied
    policy_version: str = "1.0"
    policy_mode: str = "active"
    
    # Queries executed
    queries: List[NotebookLMQuery] = field(default_factory=list)
    total_queries_executed: int = 0
    total_items_retrieved: int = 0
    total_items_used: int = 0
    
    # Decision
    evidence_included: bool = False
    evidence_status: EvidenceStatus = EvidenceStatus.NOT_AVAILABLE
    
    # Metrics
    total_duration_ms: int = 0
    average_relevance_overall: float = 0.0
    success_rate: float = 0.0
    
    # Outcome
    status: AuditStatus = AuditStatus.SUCCESS
    notes: str = ""
