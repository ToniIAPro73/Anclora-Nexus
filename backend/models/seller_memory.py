from typing import Any, Dict, List

from pydantic import BaseModel


FEATURE_VERSION = "ANCLORA-SMSR-001.v1"


class MemoryMatchReason(BaseModel):
    type: str
    value: str


class SellerMemoryRecord(BaseModel):
    id: str
    interaction_id: str | None = None
    memory_kind: str
    source_type: str
    source_artifact: str | None = None
    summary: str
    redacted_content: str
    semantic_payload: Dict[str, Any] = {}
    keywords: List[str] = []
    salience_score: int
    source_created_at: str


class SellerMemoryMatch(BaseModel):
    record: SellerMemoryRecord
    score: float
    matched_keywords: List[str] = []
    reasons: List[MemoryMatchReason] = []


class SellerMemoryResponse(BaseModel):
    version: str = FEATURE_VERSION
    seller_id: str
    status: str
    query: str
    total_records: int
    matches: List[SellerMemoryMatch]
    retrieval_summary: str


class SellerMemoryRebuildResponse(BaseModel):
    version: str = FEATURE_VERSION
    seller_id: str
    status: str
    indexed_records: int
    created_records: int
