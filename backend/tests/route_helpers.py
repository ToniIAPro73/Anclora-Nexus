"""Shared helpers for route-registration tests.

FastAPI >= 0.141 defers ``include_router()``: ``app.routes`` stores
``_IncludedRouter`` placeholders instead of eager ``APIRoute`` copies, so
``[r for r in app.routes if hasattr(r, "methods")]`` silently yields nothing.
``fastapi.routing.iter_route_contexts`` is the canonical unwrap API — it
yields ``RouteContext`` objects exposing ``path`` / ``methods`` / ``endpoint``
for plain routes and included-router candidates alike.
"""

from typing import Any

from fastapi.routing import iter_route_contexts


def flatten_routes(routes: Any) -> list:
    """Return HTTP route-like objects from ``app.routes``, unwrapping
    deferred ``_IncludedRouter`` placeholders (prefixed paths included)."""
    return [
        route_context
        for route_context in iter_route_contexts(routes)
        if route_context.path is not None and route_context.methods
    ]
