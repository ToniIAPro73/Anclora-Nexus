"""Resolve DMS/CLM template variables from folder, CRM and party context.

Canonical placeholder contract: buyer.full_name, seller.full_name, agent.full_name, etc.
Legacy aliases (buyer.fullname, buyer.name) are resolved for backwards compatibility.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any

from backend.services.document_generation_service import generate_from_template

# ── Placeholder extraction ────────────────────────────────────────────────────

_PH_RE = re.compile(r"\{\{\s*(\w[\w.]*)\s*\}\}")

# Legacy alias map: old_key → canonical_key
_LEGACY_ALIASES: dict[str, str] = {
    "buyer.fullname": "buyer.full_name",
    "buyer.name": "buyer.full_name",
    "seller.fullname": "seller.full_name",
    "seller.name": "seller.full_name",
    "agent.fullname": "agent.full_name",
    "agent.name": "agent.full_name",
    "landlord.fullname": "landlord.full_name",
    "landlord.name": "landlord.full_name",
    "tenant.fullname": "tenant.full_name",
    "tenant.name": "tenant.full_name",
    "guest.fullname": "guest.full_name",
    "guest.name": "guest.full_name",
    "folder.reference": "deal.folder_reference",
    "folder.id": "deal.id",
    "folder.operation_type": "deal.operation_type",
    "organization.name": "organization.legal_name",
}


# ── Data class ────────────────────────────────────────────────────────────────

@dataclass
class RenderedTemplateDocument:
    rendered_text: str
    missing_fields: list[str]
    variable_snapshot: dict[str, Any]

    @property
    def is_complete(self) -> bool:
        return not self.missing_fields


# ── Utility helpers ───────────────────────────────────────────────────────────

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


def _compact(value: Any) -> str | None:
    if value is None:
        return None
    s = str(value).strip()
    return s if s else None


def _first_party(parties: list[dict[str, Any]], *roles: str) -> dict[str, Any]:
    wanted = set(roles)
    return next((p for p in parties if p.get("party_role") in wanted), {})


def _party_to_context(party: dict[str, Any]) -> dict[str, Any]:
    """Map a deal_folder_parties row to a canonical placeholder namespace."""
    return {
        "id": party.get("id"),
        "full_name": party.get("full_name"),
        "id_document": party.get("dni_nie_passport"),
        "email": party.get("email"),
        "phone": party.get("phone"),
        "address": party.get("address"),
        "nationality": party.get("nationality"),
        "is_company": party.get("is_company", False),
        "company_name": party.get("company_name"),
        "company_cif": party.get("company_cif"),
    }


def _folder_to_deal_context(folder: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": folder.get("id"),
        "folder_reference": folder.get("folder_reference"),
        "operation_type": folder.get("operation_type"),
        "phase": folder.get("phase"),
        "language": folder.get("language"),
        "jurisdiction": folder.get("jurisdiction"),
        "created_at": folder.get("created_at"),
        "price": folder.get("price"),
        "offer_price": folder.get("offer_price"),
        "deposit_amount": folder.get("deposit_amount"),
        "signing_deadline": folder.get("signing_deadline"),
        "visit_date": folder.get("visit_date"),
        "visit_notes": folder.get("visit_notes"),
    }


def _property_to_context(prop: dict[str, Any] | None) -> dict[str, Any]:
    if not prop:
        return {}
    return {
        "id": prop.get("id"),
        "address": prop.get("address") or prop.get("address_line_1"),
        "municipality": prop.get("municipality") or prop.get("city"),
        "postal_code": prop.get("postal_code"),
        "province": prop.get("province") or prop.get("region"),
        "cadastral_reference": prop.get("cadastral_reference"),
        "registry_reference": prop.get("registry_reference"),
        "energy_certificate": prop.get("energy_certificate"),
        "energy_rating": prop.get("energy_rating"),
        "habitation_certificate": prop.get("habitation_certificate"),
    }


def _org_to_context(org: dict[str, Any] | None) -> dict[str, Any]:
    if not org:
        return {}
    return {
        "id": org.get("id"),
        "legal_name": org.get("legal_name") or org.get("name"),
        "trade_name": org.get("trade_name") or org.get("display_name") or org.get("name"),
        "tax_id": org.get("tax_id") or org.get("cif"),
        "roaiib_number": org.get("roaiib_number") or org.get("registration_number"),
        "address": org.get("address") or org.get("address_line_1"),
        "email": org.get("email"),
        "phone": org.get("phone"),
    }


def _agent_to_context(agent: dict[str, Any] | None) -> dict[str, Any]:
    if not agent:
        return {}
    raw_name = agent.get("full_name") or agent.get("name") or ""
    first = agent.get("first_name", "")
    last = agent.get("last_name", "") or agent.get("surname", "")
    if not raw_name and (first or last):
        raw_name = f"{first} {last}".strip()
    return {
        "id": agent.get("id"),
        "full_name": raw_name,
        "email": agent.get("email"),
        "phone": agent.get("phone"),
        "roaiib_number": agent.get("roaiib_number"),
    }


# ── Context builder ───────────────────────────────────────────────────────────

def build_template_context(
    *,
    folder: dict[str, Any],
    parties: list[dict[str, Any]],
    property_row: dict[str, Any] | None = None,
    organization: dict[str, Any] | None = None,
    agent: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build the full variable resolution context from DMS/CRM data."""
    primary_party = next((p for p in parties if p.get("is_primary") is True), None) or (parties[0] if parties else {})
    buyer = _first_party(parties, "buyer", "co_buyer") or primary_party
    seller = _first_party(parties, "seller", "co_seller")
    landlord = _first_party(parties, "landlord")
    tenant = _first_party(parties, "tenant")
    guest = _first_party(parties, "guest")

    # Indexed parties for party_1, party_2, ...
    numbered: dict[str, dict[str, Any]] = {}
    for i, p in enumerate(parties, start=1):
        numbered[f"party_{i}"] = _party_to_context(p)

    ctx: dict[str, Any] = {
        "deal": _folder_to_deal_context(folder),
        "folder": _folder_to_deal_context(folder),  # legacy alias
        "property": _property_to_context(property_row),
        "organization": _org_to_context(organization),
        "agent": _agent_to_context(agent),
        "buyer": _party_to_context(buyer),
        "seller": _party_to_context(seller),
        "landlord": _party_to_context(landlord),
        "tenant": _party_to_context(tenant),
        "guest": _party_to_context(guest),
        "client": _party_to_context(primary_party),
        "primary_party": _party_to_context(primary_party),
        "document": {
            "generated_at": datetime.now(timezone.utc).strftime("%d/%m/%Y"),
        },
        **numbered,
    }
    return ctx


# ── Placeholder resolver ──────────────────────────────────────────────────────

def _resolve_placeholder(key: str, ctx: dict[str, Any]) -> Any:
    """Resolve a dotted placeholder key against the context, with legacy alias support."""
    canonical = _LEGACY_ALIASES.get(key, key)
    value = _value_at_path(ctx, canonical)
    if value is None and canonical != key:
        value = _value_at_path(ctx, key)
    return value


def extract_required_placeholders(canonical_text: str) -> list[str]:
    """Extract all {{ placeholder }} keys from a template body."""
    return list(dict.fromkeys(_PH_RE.findall(canonical_text)))


# ── Main renderer ─────────────────────────────────────────────────────────────

def resolve_and_render_template(
    *,
    canonical_text: str,
    template_fields: list[dict[str, Any]],
    context: dict[str, Any],
    overrides: dict[str, Any] | None = None,
) -> RenderedTemplateDocument:
    """Resolve variables from context + overrides, render the template, return result."""
    overrides = overrides or {}
    values: dict[str, Any] = {}

    # Resolve via field definitions (source_path driven)
    for field in template_fields:
        key = str(field.get("field_key") or "").strip()
        if not key:
            continue
        value = overrides.get(key)
        if value is None:
            source_path = field.get("source_path")
            if source_path:
                value = _value_at_path(context, source_path)
        if value is None:
            value = _resolve_placeholder(key, context)
        if value is None:
            value = field.get("default_value")
        v = _compact(value)
        if v is not None:
            values[key] = v

    # Also resolve any placeholder found directly in the template text
    # that isn't covered by field definitions (for markdown-native templates)
    if canonical_text:
        for ph in extract_required_placeholders(canonical_text):
            if ph not in values:
                v = _compact(overrides.get(ph) or _resolve_placeholder(ph, context))
                if v is not None:
                    values[ph] = v

    result = generate_from_template(
        canonical_text=canonical_text,
        field_values=values,
        required_fields=[str(f["field_key"]) for f in template_fields if f.get("required")],
    )

    return RenderedTemplateDocument(
        rendered_text=result.rendered_text,
        missing_fields=result.unfilled_placeholders,
        variable_snapshot=values,
    )


def compute_missing_fields(
    canonical_text: str,
    context: dict[str, Any],
    overrides: dict[str, Any] | None = None,
) -> list[str]:
    """Return list of placeholder keys that can't be resolved from context or overrides."""
    overrides = overrides or {}
    missing = []
    for ph in extract_required_placeholders(canonical_text):
        v = _compact(overrides.get(ph) or _resolve_placeholder(ph, context))
        if v is None:
            missing.append(ph)
    return missing
