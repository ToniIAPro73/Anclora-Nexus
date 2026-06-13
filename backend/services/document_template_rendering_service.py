"""Resolve DMS template variables from folder, CRM and party context."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from backend.services.document_generation_service import generate_from_template


@dataclass
class RenderedTemplateDocument:
    rendered_text: str
    missing_fields: list[str]
    variable_snapshot: dict[str, Any]

    @property
    def is_complete(self) -> bool:
        return not self.missing_fields


def _value_at_path(data: dict[str, Any], path: str | None) -> Any:
    if not path:
        return None
    current: Any = data
    for part in path.split("."):
        if not isinstance(current, dict):
            return None
        current = current.get(part)
        if current is None:
            return None
    return current


def _compact(value: Any) -> Any:
    if isinstance(value, str):
        stripped = value.strip()
        return stripped or None
    return value


def _first_party(parties: list[dict[str, Any]], *roles: str) -> dict[str, Any]:
    wanted = set(roles)
    return next((party for party in parties if party.get("party_role") in wanted), {})


def build_template_context(
    *,
    folder: dict[str, Any],
    parties: list[dict[str, Any]],
    property_row: dict[str, Any] | None = None,
    organization: dict[str, Any] | None = None,
    agent: dict[str, Any] | None = None,
) -> dict[str, Any]:
    primary_party = next((party for party in parties if party.get("is_primary") is True), None) or (parties[0] if parties else {})
    buyer = _first_party(parties, "buyer", "co_buyer") or primary_party
    seller = _first_party(parties, "seller", "co_seller")

    return {
        "folder": folder,
        "client": primary_party,
        "primary_party": primary_party,
        "buyer": buyer,
        "seller": seller,
        "parties": {
            "all": parties,
            "buyer": buyer,
            "seller": seller,
        },
        "property": property_row or {},
        "organization": organization or {},
        "agent": agent or {},
    }


def resolve_and_render_template(
    *,
    canonical_text: str,
    template_fields: list[dict[str, Any]],
    context: dict[str, Any],
    overrides: dict[str, Any] | None = None,
) -> RenderedTemplateDocument:
    values: dict[str, Any] = {}
    overrides = overrides or {}

    for field in template_fields:
        key = str(field.get("field_key") or "").strip()
        if not key:
            continue
        value = overrides.get(key)
        if value is None:
            value = _value_at_path(context, field.get("source_path"))
        if value is None:
            value = field.get("default_value")
        value = _compact(value)
        if value is not None:
            values[key] = value

    result = generate_from_template(
        canonical_text=canonical_text,
        field_values=values,
        required_fields=[str(field["field_key"]) for field in template_fields if field.get("required")],
    )

    return RenderedTemplateDocument(
        rendered_text=result.rendered_text,
        missing_fields=result.unfilled_placeholders,
        variable_snapshot=values,
    )
