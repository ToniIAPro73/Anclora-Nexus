"""
StateFox Telegram bridge MVP.

Supervised bridge that parses raw StateFox Telegram output and imports normalized
listings into the prospection properties pipeline.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from backend.models.prospection import PropertyCreate
from backend.services.prospection_service import prospection_service
from backend.services.statefox_adapter import classify_statefox_targets
from backend.services.supabase_service import supabase_service


PROPERTY_BLOCK_RE = re.compile(
    r"(?P<price>\d[\d\.]*)€\s*\|\s*(?P<title>[^|\n]+?)\s*\|\s*(?:https?://t\.me/StateFoxBot\?startapp=(?P<app_url>[^\s|]+)|\[app\])?\s*(?P<details>[^\n\r]+)",
    re.IGNORECASE,
)
PUBLIC_URL_RE = re.compile(
    r"https://es\.statefox\.com/public/ln/property/[^\s)]+",
    re.IGNORECASE,
)
ROOMS_RE = re.compile(r"(?P<bedrooms>\d+)\s*hab", re.IGNORECASE)
BATHS_RE = re.compile(r"(?P<bathrooms>\d+)\s*bañ", re.IGNORECASE)
AREA_RE = re.compile(r"(?P<area>\d+)\s*m2", re.IGNORECASE)


def _price_to_float(raw: str) -> float:
    return float(raw.replace(".", "").replace(",", "."))


def _guess_property_type(title: str) -> str:
    lowered = title.lower()
    if lowered.startswith("ático"):
        return "atico"
    if lowered.startswith("estudio"):
        return "estudio"
    if lowered.startswith("piso"):
        return "piso"
    return "propiedad"


def parse_statefox_raw(raw_text: str) -> Dict[str, Any]:
    public_urls = PUBLIC_URL_RE.findall(raw_text or "")
    listings: List[Dict[str, Any]] = []

    for idx, match in enumerate(PROPERTY_BLOCK_RE.finditer(raw_text or "")):
        details = match.group("details").strip()
        title = match.group("title").strip()
        listing: Dict[str, Any] = {
            "title": title,
            "price": _price_to_float(match.group("price")),
            "property_type": _guess_property_type(title),
            "app_url": (
                f"https://t.me/StateFoxBot?startapp={match.group('app_url')}"
                if match.group("app_url")
                else None
            ),
            "public_url": public_urls[idx] if idx < len(public_urls) else None,
            "notes": "StateFox Telegram Bridge supervised import",
            "raw_details": details,
            "seller_signals": [],
        }

        rooms = ROOMS_RE.search(details)
        baths = BATHS_RE.search(details)
        area = AREA_RE.search(details)
        if rooms:
            listing["bedrooms"] = int(rooms.group("bedrooms"))
        if baths:
            listing["bathrooms"] = int(baths.group("bathrooms"))
        if area:
            listing["area_m2"] = float(area.group("area"))

        listings.append(listing)

    return {
        "listings": listings,
        "count": len(listings),
        "has_reproducible_app_links": any(item.get("app_url") for item in listings),
        "has_public_urls": any(item.get("public_url") for item in listings),
    }


def _property_exists(org_id: str, source_url: Optional[str]) -> bool:
    if not source_url:
        return False
    for table in ("properties", "prospected_properties"):
        try:
            result = (
                supabase_service.client.table(table)
                .select("id")
                .eq("org_id", org_id)
                .eq("source_url", source_url)
                .limit(1)
                .execute()
            )
            if result.data:
                return True
        except Exception:
            continue
    return False


async def import_statefox_listings(
    org_id: str,
    raw_text: str,
    zone: Optional[str] = None,
    city: Optional[str] = "Mallorca",
) -> Dict[str, Any]:
    parsed = parse_statefox_raw(raw_text)
    created: List[Dict[str, Any]] = []
    skipped: List[str] = []

    for listing in parsed["listings"]:
        source_url = listing.get("public_url") or listing.get("app_url")
        if _property_exists(org_id, source_url):
            skipped.append(source_url or listing["title"])
            continue

        property_payload = PropertyCreate(
            source="statefox",
            source_url=source_url,
            title=listing["title"],
            zone=zone,
            city=city,
            price=listing["price"],
            property_type=listing.get("property_type"),
            bedrooms=listing.get("bedrooms"),
            bathrooms=listing.get("bathrooms"),
            area_m2=listing.get("area_m2"),
            notes=listing.get("notes"),
        )
        row = await prospection_service.create_property(org_id, property_payload)
        routing = classify_statefox_targets(listing)
        created.append(
            {
                "id": row.get("id"),
                "title": listing["title"],
                "source_url": source_url,
                "create_seller": routing["create_seller"],
            }
        )

    return {
        "parsed_count": parsed["count"],
        "imported_count": len(created),
        "skipped_count": len(skipped),
        "created": created,
        "skipped": skipped,
        "has_reproducible_app_links": parsed["has_reproducible_app_links"],
    }
