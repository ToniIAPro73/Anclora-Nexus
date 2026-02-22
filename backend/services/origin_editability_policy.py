from typing import Dict, List, Literal

EntityType = Literal["lead", "property"]

LEAD_FIELDS: List[str] = [
    "name",
    "email",
    "phone",
    "budget_range",
    "property_interest",
    "priority",
    "status",
]

PROPERTY_FIELDS: List[str] = [
    "source",
    "source_url",
    "source_system",
    "source_portal",
    "high_ticket_score",
    "score_breakdown",
    "match_score",
]


def build_policy(entity: EntityType, source_system: str | None) -> Dict[str, object]:
    origin = (source_system or "manual").strip().lower() or "manual"
    locked_fields: List[str] = []
    reasons: List[str] = []

    if entity == "lead":
        if origin != "manual":
            locked_fields = ["name", "email", "phone", "budget_range", "property_interest"]
            reasons.append("lead_auto_ingested")
        editable_fields = [f for f in LEAD_FIELDS if f not in locked_fields]
        return {
            "entity": entity,
            "origin": origin,
            "locked_fields": locked_fields,
            "editable_fields": editable_fields,
            "reasons": reasons or ["manual"],
        }

    if origin != "manual":
        locked_fields.extend(["source", "source_url", "source_system", "source_portal"])
        reasons.append("property_non_manual_trace")
    if origin == "pbm":
        locked_fields.extend(["high_ticket_score", "score_breakdown", "match_score"])
        reasons.append("property_pbm_scoring")
    editable_fields = [f for f in PROPERTY_FIELDS if f not in locked_fields]
    return {
        "entity": entity,
        "origin": origin,
        "locked_fields": locked_fields,
        "editable_fields": editable_fields,
        "reasons": reasons or ["manual"],
    }


def sanitize_payload(payload: Dict[str, object], entity: EntityType, source_system: str | None) -> Dict[str, object]:
    policy = build_policy(entity, source_system)
    locked_fields = policy.get("locked_fields", [])
    sanitized = dict(payload)
    for field in locked_fields:
        if isinstance(field, str):
            sanitized.pop(field, None)
    return sanitized
