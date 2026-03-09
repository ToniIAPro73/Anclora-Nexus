"""
StateFox Telegram adapter discovery contract.

This module does not claim an official StateFox API. It exists to encode the
observed import strategy and normalization contract so the repo has a single
technical source of truth before implementing a live adapter.
"""

from typing import Any, Dict, List


FEATURE_ID = "ANCLORA-STFX-001.v1"


def get_statefox_import_contract() -> Dict[str, Any]:
    return {
        "feature_id": FEATURE_ID,
        "primary_target": "properties",
        "secondary_target": "nexus_sellers",
        "secondary_condition": (
            "Only derive into nexus_sellers when seller-side evidence exists: "
            "direct owner, direct phone/WhatsApp, no agency, urgency, or a "
            "captation-specific indicator."
        ),
        "property_fields": [
            "source",
            "source_url",
            "title",
            "zone",
            "city",
            "price",
            "property_type",
            "bedrooms",
            "bathrooms",
            "area_m2",
            "notes",
            "source_system",
            "source_portal",
        ],
        "seller_signal_fields": [
            "nombre_propietario",
            "telefono_contacto",
            "whatsapp_contacto",
            "anuncio_url",
            "zona",
            "precio_publicado",
            "senales_motivacion",
            "datos_extraidos",
        ],
    }


def classify_statefox_targets(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Minimal contract for future adapter execution.

    Inputs are intentionally generic because the real StateFox surface is still
    under discovery. The classifier is conservative: everything is a property
    candidate first; sellers are derived only by explicit signals.
    """
    seller_signals: List[str] = list(payload.get("seller_signals") or [])
    direct_owner = bool(payload.get("direct_owner"))
    direct_contact = bool(payload.get("telefono_contacto") or payload.get("whatsapp_contacto"))
    no_agency = bool(payload.get("no_agency"))

    should_create_seller = bool(seller_signals or direct_owner or direct_contact or no_agency)

    return {
        "create_property": True,
        "create_seller": should_create_seller,
        "primary_target": "properties",
        "secondary_target": "nexus_sellers" if should_create_seller else None,
        "seller_signal_count": len(seller_signals),
    }
