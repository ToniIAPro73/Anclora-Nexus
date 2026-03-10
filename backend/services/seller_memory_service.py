from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
import re
from typing import Any, Dict, List, Tuple

from backend.models.seller_memory import (
    MemoryMatchReason,
    SellerMemoryMatch,
    SellerMemoryRebuildResponse,
    SellerMemoryRecord,
    SellerMemoryResponse,
)
from backend.services.supabase_service import SupabaseService


DEFAULT_QUERY = "seguimiento captacion objeciones siguiente paso exclusividad"
EMAIL_RE = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
PHONE_RE = re.compile(r"(?:(?:\+|00)\d{1,3}[\s-]?)?(?:\d[\s-]?){7,14}\d")
URL_RE = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
WORD_RE = re.compile(r"[a-zA-Z0-9áéíóúñü]+", re.IGNORECASE)
STOPWORDS = {
    "de", "la", "el", "y", "en", "que", "para", "por", "con", "sin", "del", "los", "las",
    "una", "uno", "sobre", "desde", "este", "esta", "pero", "como", "mas", "más", "the",
    "and", "for", "with", "from", "was", "are", "una", "muy", "todo", "toda", "after",
}


class SellerMemoryService:
    def __init__(self) -> None:
        self.client = SupabaseService().client

    def _table_exists(self, table: str) -> bool:
        try:
            self.client.table(table).select("id").limit(1).execute()
            return True
        except Exception:
            return False

    @staticmethod
    def _redact_pii(text: str) -> str:
        redacted = EMAIL_RE.sub("[redacted-email]", text or "")
        redacted = PHONE_RE.sub("[redacted-phone]", redacted)
        redacted = URL_RE.sub("[redacted-url]", redacted)
        return redacted.strip()

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        tokens = [token.lower() for token in WORD_RE.findall(text or "")]
        return [token for token in tokens if len(token) > 2 and token not in STOPWORDS]

    def _build_keywords(self, *values: str) -> List[str]:
        counter: Counter[str] = Counter()
        for value in values:
            counter.update(self._tokenize(value))
        return [token for token, _count in counter.most_common(8)]

    @staticmethod
    def _memory_kind(tipo: str, artifact: str) -> str:
        if artifact in {"email_draft", "whatsapp_draft", "call_brief", "context_brief", "dossier"}:
            return "artifact"
        if artifact.startswith("supervised_send_") or tipo in {"email", "whatsapp"}:
            return "outreach"
        if tipo in {"llamada", "reunion"}:
            return "followup"
        return "interaction"

    def _build_record_payload(self, org_id: str, seller_id: str, interaction: Dict[str, Any]) -> Dict[str, Any]:
        metadata = interaction.get("metadata") or {}
        artifact = str(metadata.get("artifact") or "")
        tipo = str(interaction.get("tipo") or "nota")
        contenido = str(interaction.get("contenido") or "")
        resultado = str(interaction.get("resultado") or "")
        redacted_content = self._redact_pii(contenido)
        keywords = self._build_keywords(contenido, resultado, artifact, tipo)
        summary_bits = [tipo.replace("_", " ")]
        if artifact:
            summary_bits.append(artifact.replace("_", " "))
        if resultado:
            summary_bits.append(f"resultado {resultado}")
        if redacted_content:
            summary_bits.append(redacted_content[:220])
        summary = " · ".join(part for part in summary_bits if part).strip()
        salience = min(100, 35 + (15 if resultado else 0) + (20 if artifact else 0) + min(len(keywords) * 3, 20))

        return {
            "org_id": org_id,
            "seller_id": seller_id,
            "interaction_id": interaction.get("id"),
            "memory_kind": self._memory_kind(tipo, artifact),
            "source_type": tipo,
            "source_artifact": artifact or None,
            "summary": summary or "interaction",
            "redacted_content": redacted_content or summary or "interaction",
            "semantic_payload": {
                "resultado": resultado or None,
                "artifact": artifact or None,
                "estado": interaction.get("estado"),
                "matched_channel": tipo if tipo in {"email", "whatsapp", "llamada"} else None,
            },
            "keywords": keywords,
            "salience_score": salience,
            "source_created_at": interaction.get("created_at") or datetime.now(timezone.utc).isoformat(),
        }

    async def rebuild_for_seller(
        self,
        *,
        db: SupabaseService,
        org_id: str,
        seller_id: str,
    ) -> SellerMemoryRebuildResponse:
        if not self._table_exists("seller_memory_records"):
            return SellerMemoryRebuildResponse(
                seller_id=seller_id,
                status="migration_missing",
                indexed_records=0,
                created_records=0,
            )

        interactions = (
            db.client.table("seller_interactions")
            .select("id,tipo,estado,contenido,resultado,metadata,created_at")
            .eq("org_id", str(org_id))
            .eq("seller_id", str(seller_id))
            .order("created_at", desc=False)
            .execute()
            .data
            or []
        )
        current = (
            db.client.table("seller_memory_records")
            .select("interaction_id")
            .eq("org_id", str(org_id))
            .eq("seller_id", str(seller_id))
            .execute()
            .data
            or []
        )
        existing_ids = {row.get("interaction_id") for row in current if row.get("interaction_id")}

        new_rows = [
            self._build_record_payload(org_id, seller_id, interaction)
            for interaction in interactions
            if interaction.get("id") not in existing_ids
        ]
        if new_rows:
            db.client.table("seller_memory_records").insert(new_rows).execute()

        total = len(existing_ids) + len(new_rows)
        return SellerMemoryRebuildResponse(
            seller_id=seller_id,
            status="ready",
            indexed_records=total,
            created_records=len(new_rows),
        )

    def _score_record(self, record: Dict[str, Any], query_tokens: List[str]) -> Tuple[float, List[str], List[MemoryMatchReason]]:
        summary = str(record.get("summary") or "")
        redacted = str(record.get("redacted_content") or "")
        artifact = str(record.get("source_artifact") or "")
        keywords = [str(item).lower() for item in (record.get("keywords") or [])]
        searchable_tokens = set(self._tokenize(" ".join([summary, redacted, artifact, " ".join(keywords)])))
        keyword_hits = [token for token in query_tokens if token in searchable_tokens]

        score = float(record.get("salience_score") or 0) * 0.35
        reasons: List[MemoryMatchReason] = []
        if keyword_hits:
            score += len(keyword_hits) * 18
            reasons.append(MemoryMatchReason(type="keyword_hits", value=", ".join(keyword_hits[:4])))
        if artifact:
            score += 8
            reasons.append(MemoryMatchReason(type="artifact_match", value=artifact))

        created_at = str(record.get("source_created_at") or "")
        if created_at:
            try:
                dt = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
                age_days = max((datetime.now(timezone.utc) - dt).days, 0)
                recency_boost = max(0.0, 12.0 - min(age_days, 12))
                if recency_boost > 0:
                    score += recency_boost
                    reasons.append(MemoryMatchReason(type="recency", value=f"{int(recency_boost)}"))
            except ValueError:
                pass
        return score, keyword_hits, reasons

    async def search(
        self,
        *,
        db: SupabaseService,
        org_id: str,
        seller_id: str,
        query: str = DEFAULT_QUERY,
        limit: int = 5,
    ) -> SellerMemoryResponse:
        if not self._table_exists("seller_memory_records"):
            return SellerMemoryResponse(
                seller_id=seller_id,
                status="migration_missing",
                query=query,
                total_records=0,
                matches=[],
                retrieval_summary="Semantic memory unavailable until migration 043 is applied.",
            )

        await self.rebuild_for_seller(db=db, org_id=org_id, seller_id=seller_id)
        rows = (
            db.client.table("seller_memory_records")
            .select("*")
            .eq("org_id", str(org_id))
            .eq("seller_id", str(seller_id))
            .order("source_created_at", desc=True)
            .limit(100)
            .execute()
            .data
            or []
        )
        query_tokens = self._tokenize(query or DEFAULT_QUERY)
        ranked: List[SellerMemoryMatch] = []
        for row in rows:
            score, matched_keywords, reasons = self._score_record(row, query_tokens)
            if query_tokens and not matched_keywords and score < 30:
                continue
            ranked.append(
                SellerMemoryMatch(
                    record=SellerMemoryRecord(
                        id=str(row.get("id")),
                        interaction_id=row.get("interaction_id"),
                        memory_kind=str(row.get("memory_kind") or "interaction"),
                        source_type=str(row.get("source_type") or "nota"),
                        source_artifact=row.get("source_artifact"),
                        summary=str(row.get("summary") or ""),
                        redacted_content=str(row.get("redacted_content") or ""),
                        semantic_payload=row.get("semantic_payload") or {},
                        keywords=[str(item) for item in (row.get("keywords") or [])],
                        salience_score=int(row.get("salience_score") or 0),
                        source_created_at=str(row.get("source_created_at") or ""),
                    ),
                    score=round(score, 2),
                    matched_keywords=matched_keywords,
                    reasons=reasons,
                )
            )

        ranked.sort(key=lambda item: item.score, reverse=True)
        matches = ranked[:limit]
        summary = " | ".join(item.record.summary for item in matches[:3]) or "No reusable memory found for this seller."
        return SellerMemoryResponse(
            seller_id=seller_id,
            status="ready",
            query=query,
            total_records=len(rows),
            matches=matches,
            retrieval_summary=summary,
        )


seller_memory_service = SellerMemoryService()
