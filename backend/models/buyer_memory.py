from typing import Any, Dict, List

from pydantic import BaseModel


FEATURE_VERSION = "ANCLORA-BMCR-001.v1"


class BuyerMemoryMatchReason(BaseModel):
    type: str
    value: str


class BuyerMemoryRecord(BaseModel):
    id: str
    source_ref: str
    memory_kind: str
    source_type: str
    source_artifact: str | None = None
    summary: str
    redacted_content: str
    semantic_payload: Dict[str, Any] = {}
    keywords: List[str] = []
    salience_score: int
    embedding_status: str = "pending"
    embedding_dimensions: int | None = None
    source_created_at: str


class BuyerMemoryMatch(BaseModel):
    record: BuyerMemoryRecord
    score: float
    matched_keywords: List[str] = []
    reasons: List[BuyerMemoryMatchReason] = []


class BuyerMemoryResponse(BaseModel):
    version: str = FEATURE_VERSION
    buyer_id: str
    status: str
    query: str
    total_records: int
    vector_ready_records: int = 0
    retrieval_mode: str = "lexical"
    matches: List[BuyerMemoryMatch]
    retrieval_summary: str


class BuyerMemoryRebuildResponse(BaseModel):
    version: str = FEATURE_VERSION
    buyer_id: str
    status: str
    indexed_records: int
    created_records: int
    vectorized_records: int = 0
