"""
Anclora Intelligence v1 — Type Definitions
All pydantic models for Contracts #1-6
"""

import uuid
from datetime import datetime, timezone
from typing import Literal, Optional, List, Tuple, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field, validator, ConfigDict


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


class StateEnum(str, Enum):
    """Orchestrator pipeline states."""
    IDLE = "idle"
    ROUTING = "routing"
    GOVERNING = "governing"
    SYNTHESIZING = "synthesizing"
    AUDITING = "auditing"
    COMPLETED = "completed"
    FAILED = "failed"


# ═══════════════════════════════════════════════════════════════
# CONTRACT #1: GovernorDecision v1
# ═══════════════════════════════════════════════════════════════

class RiskItem(BaseModel):
    """Un riesgo específico con nivel y justificación."""
    model_config = ConfigDict(from_attributes=True)
    level: RiskLevel
    rationale: str


class RiskProfile(BaseModel):
    """Evaluación de riesgos en 4 dimensiones."""
    model_config = ConfigDict(from_attributes=True)
    labor: RiskItem
    tax: RiskItem
    brand: RiskItem
    focus: RiskItem


class GovernorDecision(BaseModel):
    """Salida oficial del Governor: decisión estratégica estructurada."""
    model_config = ConfigDict(from_attributes=True)
    decision_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    diagnosis: str
    recommendation: Recommendation
    risks: RiskProfile
    next_steps: Tuple[str, str, str]  # Exactamente 3
    dont_do: List[str]
    flags: List[str]
    confidence: Confidence
    strategic_mode_version: str
    domains_used: List[str]
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ═══════════════════════════════════════════════════════════════
# CONTRACT #2: QueryPlan v1
# ═══════════════════════════════════════════════════════════════

class LabPolicy(BaseModel):
    """Control de acceso a laboratorio tecnológico."""
    model_config = ConfigDict(from_attributes=True)
    allow_lab: bool
    status: LabStatus
    rationale: str


class QueryPlan(BaseModel):
    """Plan de consulta emitido por Router: entrada a Governor."""
    model_config = ConfigDict(from_attributes=True)
    query_plan_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    correlation_id: Optional[str] = None
    mode: QueryMode
    domain_hint: str = "auto"
    domains_selected: List[str]
    agents_selected: List[str] = []
    needs_evidence: bool = False
    needs_skills: bool = False
    lab_policy: Optional[LabPolicy] = None
    rationale: str = ""
    confidence: Confidence = Confidence.MEDIUM
    flags: List[str] = []
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ═══════════════════════════════════════════════════════════════
# CONTRACT #3: SynthesizerOutput v1
# ═══════════════════════════════════════════════════════════════

class RiskSummary(BaseModel):
    """Resumen de riesgos para UI (chips de color)."""
    model_config = ConfigDict(from_attributes=True)
    labor: RiskLevel
    tax: RiskLevel
    brand: RiskLevel
    focus: RiskLevel


class MetaVersion(BaseModel):
    """Versionado de componentes."""
    model_config = ConfigDict(from_attributes=True)
    schema_version: str
    strategic_mode_id: str
    domain_pack_id: str


class Meta(BaseModel):
    """Metadatos de la decisión."""
    model_config = ConfigDict(from_attributes=True)
    mode: QueryMode
    domain_hint: str
    confidence: Confidence
    flags: List[str]
    recommendation: Recommendation
    risk_summary: RiskSummary
    version: MetaVersion


class PlanView(BaseModel):
    """Vista de alto nivel del plan para UI."""
    model_config = ConfigDict(from_attributes=True)
    domains_selected: List[str]
    rationale: str
    lab_policy: Dict[str, Any]  # {status, rationale}


class Trace(BaseModel):
    """Trazabilidad y explicabilidad auditables."""
    model_config = ConfigDict(from_attributes=True)
    query_plan_id: str
    governor_decision_id: str
    created_at: str
    output_ai: bool = True


class EvidenceItemView(BaseModel):
    """Un ítem de evidencia de NotebookLM."""
    model_config = ConfigDict(from_attributes=True)
    notebook_id: str
    source_title: str
    excerpt: str
    relevance_score: float


class EvidenceView(BaseModel):
    """Vista de evidencia (vacía en Phase 1)."""
    model_config = ConfigDict(from_attributes=True)
    status: EvidenceStatus
    items: List[EvidenceItemView] = []


class SynthesizerOutput(BaseModel):
    """Respuesta final de Intelligence: lo que ve el usuario."""
    model_config = ConfigDict(from_attributes=True)
    output_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    answer: str
    meta: Meta
    plan: PlanView
    trace: Trace
    evidence: EvidenceView


# ═══════════════════════════════════════════════════════════════
# CONTRACT #5: Audit Log v1
# ═══════════════════════════════════════════════════════════════

class IntelligenceAuditEntry(BaseModel):
    """Un registro de auditoría inmutable de una operación."""
    model_config = ConfigDict(from_attributes=True)
    entry_id: str
    timestamp: str
    correlation_id: str
    user_id: str
    
    # Input
    message: str
    message_length: int
    
    # Plan
    query_plan_id: str
    query_plan: Dict[str, Any]
    
    # Decision
    governor_decision_id: str
    governor_decision: Dict[str, Any]
    
    # Output
    synthesizer_output_id: str
    synthesizer_output: Dict[str, Any]
    
    # Governance
    strategic_mode_version: str
    domain_pack_version: str
    
    # State
    status: AuditStatus
    error_message: Optional[str] = None
    warnings: List[str] = []
    
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

class EvidenceResult(BaseModel):
    """Un resultado individual de búsqueda en NotebookLM."""
    model_config = ConfigDict(from_attributes=True)
    notebook_id: str
    source_title: str
    excerpt: str
    relevance_score: float
    confidence_level: Confidence


class NotebookLMQuery(BaseModel):
    """Una búsqueda individual en NotebookLM."""
    model_config = ConfigDict(from_attributes=True)
    query_id: str
    timestamp: str
    original_domain: str
    original_intent: str
    formulated_query: str
    iteration: int
    
    # Output
    status: AuditStatus
    results: List[EvidenceResult] = []
    average_relevance: float = 0.0
    search_duration_ms: int = 0
    
    # Decision
    included_in_response: bool = False
    reason_for_inclusion: str = ""


class NotebookLMRetrievalLog(BaseModel):
    """Registro de todas las operaciones de retrieval."""
    model_config = ConfigDict(from_attributes=True)
    entry_id: str
    timestamp: str
    correlation_id: str
    
    # Context
    query_plan_id: str
    governor_decision_id: str
    synthesizer_request_id: str
    
    # Policy applied
    policy_version: str = "1.0"
    policy_mode: str = "active"
    
    # Queries executed
    queries: List[NotebookLMQuery] = []
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
