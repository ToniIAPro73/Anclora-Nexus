"""
Firecrawl Service — FSBO Scraping Engine

Scrapes Idealista FSBO (particular) listings by zone using Firecrawl.
Free plan: 500 credits/month. Estimated usage: ~100 credits/month for SW Mallorca.

Credit cost:
  - 1 credit per search results page (zone discovery)
  - 1 credit per individual listing (enrichment)
"""

import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "")

# Idealista FSBO search URLs by zone (particulares = private sellers, no agency)
IDEALISTA_ZONE_URLS: Dict[str, str] = {
    "andratx": "https://www.idealista.com/venta-viviendas/andratx-balears-illes/particulares/",
    "calvia": "https://www.idealista.com/venta-viviendas/calvia-balears-illes/particulares/",
    "son_ferrer": "https://www.idealista.com/venta-viviendas/son-ferrer-calvia-balears-illes/particulares/",
    "santa_ponca": "https://www.idealista.com/venta-viviendas/santa-ponca-calvia-balears-illes/particulares/",
    "paguera": "https://www.idealista.com/venta-viviendas/peguera-calvia-balears-illes/particulares/",
    "portals_nous": "https://www.idealista.com/venta-viviendas/portals-nous-calvia-balears-illes/particulares/",
    "bendinat": "https://www.idealista.com/venta-viviendas/bendinat-calvia-balears-illes/particulares/",
    "punta_negra": "https://www.idealista.com/venta-viviendas/cala-vinyas-calvia-balears-illes/particulares/",
    "costa_den_blanes": "https://www.idealista.com/venta-viviendas/costa-den-blanes-calvia-balears-illes/particulares/",
    "port_adriano": "https://www.idealista.com/venta-viviendas/el-toro-port-adriano-calvia-balears-illes/particulares/",
    "palma": "https://www.idealista.com/venta-viviendas/palma-balears-illes/particulares/",
}

# Extraction schema for Idealista search results page
SEARCH_EXTRACT_SCHEMA = {
    "type": "object",
    "properties": {
        "listings": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title":         {"type": "string"},
                    "url":           {"type": "string", "description": "Full URL of the listing"},
                    "price":         {"type": "number", "description": "Price in EUR"},
                    "area_m2":       {"type": "number", "description": "Total area in square meters"},
                    "bedrooms":      {"type": "integer"},
                    "bathrooms":     {"type": "integer"},
                    "property_type": {"type": "string", "description": "villa, apartment, house, etc."},
                    "location":      {"type": "string", "description": "Neighborhood or street"},
                    "is_fsbo":       {"type": "boolean", "description": "True if sold by private owner (particular), not agency"},
                    "days_published": {"type": "integer", "description": "Days the listing has been published"},
                    "description_snippet": {"type": "string", "description": "First 200 chars of the description"},
                },
                "required": ["url", "price"],
            },
        }
    },
    "required": ["listings"],
}

# Extraction schema for individual listing page (contact enrichment)
LISTING_EXTRACT_SCHEMA = {
    "type": "object",
    "properties": {
        "nombre_propietario":  {"type": "string", "description": "Owner or contact name"},
        "telefono_contacto":   {"type": "string", "description": "Phone number if shown"},
        "email_contacto":      {"type": "string", "description": "Email if shown"},
        "descripcion":         {"type": "string", "description": "Full property description"},
        "precio":              {"type": "number"},
        "area_m2":             {"type": "number"},
        "bedrooms":            {"type": "integer"},
        "bathrooms":           {"type": "integer"},
        "ubicacion":           {"type": "string"},
        "fecha_publicacion":   {"type": "string", "description": "Publication date if available"},
        "caracteristicas":     {
            "type": "array",
            "items": {"type": "string"},
            "description": "Property features: pool, garage, garden, etc.",
        },
        "precio_rebajado":     {"type": "boolean", "description": "True if price was reduced"},
    },
}


def _get_client():
    """Lazy-load Firecrawl client to avoid import errors if SDK not installed."""
    try:
        from firecrawl.v1 import V1FirecrawlApp  # type: ignore
        if not FIRECRAWL_API_KEY:
            raise ValueError("FIRECRAWL_API_KEY not set in environment")
        return V1FirecrawlApp(api_key=FIRECRAWL_API_KEY)
    except ImportError as exc:
        raise RuntimeError("firecrawl-py not installed. Run: pip install firecrawl-py") from exc


def _derive_motivation_signals(listing: Dict[str, Any]) -> List[str]:
    """Infer motivation signals from raw listing data."""
    signals = ["fsbo"]  # All Idealista 'particulares' listings are FSBO by definition
    days = listing.get("days_published") or 0
    price_reduced = listing.get("precio_rebajado", False)

    if days >= 90:
        signals.append("estancamiento_mercado")
    if days >= 180:
        signals.append("larga_permanencia")
    if price_reduced:
        signals.append("bajada_precio")

    desc = (listing.get("description_snippet") or "").lower()
    if any(w in desc for w in ["herencia", "herederos", "urgente", "oportunidad"]):
        signals.append("herencia")
    if any(w in desc for w in ["divorcio", "separacion"]):
        signals.append("divorcio")

    return signals


def _normalise_listing_to_signal(
    raw: Dict[str, Any],
    zona: str,
    fuente: str = "idealista",
) -> Dict[str, Any]:
    """Convert a Firecrawl-extracted listing dict to a seller_signal_ingest-compatible signal."""
    url = raw.get("url") or raw.get("anuncio_url") or ""
    if url and not url.startswith("http"):
        url = "https://www.idealista.com" + url

    return {
        "nombre_propietario":  raw.get("nombre_propietario"),
        "anuncio_url":         url,
        "zona":                zona,
        "fuente":              fuente,
        "precio_publicado":    raw.get("price") or raw.get("precio"),
        "superficie_m2":       raw.get("area_m2"),
        "tipo_propiedad":      raw.get("property_type") or raw.get("property_type"),
        "dias_en_mercado":     raw.get("days_published") or raw.get("dias_en_mercado"),
        "senales_motivacion":  _derive_motivation_signals(raw),
        "datos_extraidos": {
            "bedrooms":   raw.get("bedrooms"),
            "bathrooms":  raw.get("bathrooms"),
            "location":   raw.get("location") or raw.get("ubicacion"),
            "description": raw.get("description_snippet") or raw.get("descripcion"),
            "features":   raw.get("caracteristicas"),
            "scraped_at": datetime.now(timezone.utc).isoformat(),
        },
    }


async def scrape_zone(zona: str) -> Dict[str, Any]:
    """
    Scrape Idealista FSBO listings for one zone.
    Costs 1 Firecrawl credit.

    Returns:
        {"zona": str, "signals": [...], "credits_used": 1, "url": str}
    """
    url = IDEALISTA_ZONE_URLS.get(zona)
    if not url:
        return {"zona": zona, "signals": [], "credits_used": 0, "error": f"No URL configured for zona '{zona}'"}

    app = _get_client()

    from firecrawl.v1 import V1JsonConfig  # type: ignore

    result = app.scrape_url(
        url,
        formats=["json"],
        json_options=V1JsonConfig(
            schema=SEARCH_EXTRACT_SCHEMA,
            prompt="Extract all property listings from this Idealista search results page. Each listing should have its URL, price, area, bedrooms, bathrooms, property type, location, and days published.",
        ),
        proxy="stealth",
    )

    listings = []
    if hasattr(result, "json") and result.json:
        data = result.json if isinstance(result.json, dict) else {}
        listings = data.get("listings") or []
    elif isinstance(result, dict):
        data = result.get("json") or result.get("extract") or {}
        listings = data.get("listings") or []

    signals = [
        _normalise_listing_to_signal(listing, zona=zona)
        for listing in listings
        if listing.get("url") or listing.get("price")
    ]

    return {
        "zona": zona,
        "signals": signals,
        "listings_found": len(listings),
        "signals_extracted": len(signals),
        "credits_used": 1,
        "source_url": url,
    }


async def scrape_listing(url: str, zona: str) -> Optional[Dict[str, Any]]:
    """
    Scrape an individual Idealista listing for contact info enrichment.
    Costs 1 Firecrawl credit.

    Returns normalised signal dict or None on failure.
    """
    if not url:
        return None

    app = _get_client()

    from firecrawl.v1 import V1JsonConfig  # type: ignore

    result = app.scrape_url(
        url,
        formats=["json"],
        json_options=V1JsonConfig(
            schema=LISTING_EXTRACT_SCHEMA,
            prompt="Extract owner contact info, property details, price, location and features from this Idealista listing page.",
        ),
        proxy="stealth",
    )

    raw = {}
    if hasattr(result, "json") and result.json:
        raw = result.json if isinstance(result.json, dict) else {}
    elif isinstance(result, dict):
        raw = result.get("json") or result.get("extract") or {}

    if not raw:
        return None

    raw["anuncio_url"] = url
    return _normalise_listing_to_signal(raw, zona=zona)
