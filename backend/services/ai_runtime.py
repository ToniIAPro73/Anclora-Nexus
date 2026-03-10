from dataclasses import dataclass
from typing import Any, Dict, Optional

from backend.config import settings


VALID_PROFILES = {"cloudflare", "groq-cloudflare"}


@dataclass(frozen=True)
class TaskRuntimeRoute:
    task: str
    provider: str
    label: str
    base_url: str
    api_key: Optional[str]
    model: str
    fallback_model: str
    temperature: float
    missing_env: tuple[str, ...]

    @property
    def is_ready(self) -> bool:
        return len(self.missing_env) == 0 and bool(self.api_key)

    def to_public_dict(self) -> Dict[str, Any]:
        return {
            "task": self.task,
            "provider": self.provider,
            "label": self.label,
            "base_url": self.base_url,
            "model": self.model,
            "fallback_model": self.fallback_model,
            "temperature": self.temperature,
            "is_ready": self.is_ready,
            "missing_env": list(self.missing_env),
        }


def _normalize_base_url(url: str) -> str:
    return url.rstrip("/")


def _read_profile() -> str:
    profile = (settings.AI_RUNTIME_PROFILE or "groq-cloudflare").strip().lower()
    if profile not in VALID_PROFILES:
        return "groq-cloudflare"
    return profile


def _cloudflare_base_url() -> str:
    if settings.CLOUDFLARE_AI_BASE_URL:
        return _normalize_base_url(settings.CLOUDFLARE_AI_BASE_URL)
    if settings.CLOUDFLARE_ACCOUNT_ID:
        return f"https://api.cloudflare.com/client/v4/accounts/{settings.CLOUDFLARE_ACCOUNT_ID}/ai/v1"
    return "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1"


def _missing(*pairs: tuple[str, Optional[str]]) -> tuple[str, ...]:
    return tuple(name for name, value in pairs if not value)


def _build_groq_route(task: str, model: str, fallback_model: str, temperature: float) -> TaskRuntimeRoute:
    return TaskRuntimeRoute(
        task=task,
        provider="groq",
        label="groq",
        base_url=_normalize_base_url(settings.GROQ_BASE_URL),
        api_key=settings.GROQ_API_KEY,
        model=model,
        fallback_model=fallback_model,
        temperature=temperature,
        missing_env=_missing(("GROQ_API_KEY", settings.GROQ_API_KEY)),
    )


def _build_cloudflare_route(task: str, model: str, fallback_model: str, temperature: float) -> TaskRuntimeRoute:
    return TaskRuntimeRoute(
        task=task,
        provider="cloudflare",
        label="cloudflare",
        base_url=_cloudflare_base_url(),
        api_key=settings.CLOUDFLARE_API_TOKEN,
        model=model,
        fallback_model=fallback_model,
        temperature=temperature,
        missing_env=_missing(
            ("CLOUDFLARE_API_TOKEN", settings.CLOUDFLARE_API_TOKEN),
            ("CLOUDFLARE_ACCOUNT_ID", settings.CLOUDFLARE_ACCOUNT_ID if not settings.CLOUDFLARE_AI_BASE_URL else "configured"),
        ),
    )


def get_task_runtime_routes() -> Dict[str, TaskRuntimeRoute]:
    profile = _read_profile()
    if profile == "cloudflare":
        summarize = _build_cloudflare_route(
            task="summarize",
            model=settings.CLOUDFLARE_MODEL_FAST,
            fallback_model=settings.CLOUDFLARE_MODEL_FALLBACK,
            temperature=0.1,
        )
        analyze = _build_cloudflare_route(
            task="analyze",
            model=settings.CLOUDFLARE_MODEL_PRIMARY,
            fallback_model=settings.CLOUDFLARE_MODEL_FALLBACK,
            temperature=0.1,
        )
        generate_copy = _build_cloudflare_route(
            task="generate_copy",
            model=settings.CLOUDFLARE_MODEL_PRIMARY,
            fallback_model=settings.CLOUDFLARE_MODEL_FALLBACK,
            temperature=0.6,
        )
    else:
        summarize = _build_groq_route(
            task="summarize",
            model=settings.GROQ_MODEL_FAST,
            fallback_model=settings.GROQ_MODEL_FALLBACK,
            temperature=0.1,
        )
        analyze = _build_groq_route(
            task="analyze",
            model=settings.GROQ_MODEL_PRIMARY,
            fallback_model=settings.GROQ_MODEL_FALLBACK,
            temperature=0.1,
        )
        generate_copy = _build_groq_route(
            task="generate_copy",
            model=settings.GROQ_MODEL_PRIMARY,
            fallback_model=settings.GROQ_MODEL_FALLBACK,
            temperature=0.6,
        )
    return {
        "summarize": summarize,
        "analyze": analyze,
        "generate_copy": generate_copy,
    }


def get_runtime_summary() -> Dict[str, Any]:
    routes = get_task_runtime_routes()
    profile = _read_profile()
    missing_env = sorted({item for route in routes.values() for item in route.missing_env})
    return {
        "feature_id": "ANCLORA-AIRP-001.v1",
        "profile": profile,
        "status": "ready" if not missing_env else "degraded",
        "routes": {name: route.to_public_dict() for name, route in routes.items()},
        "embeddings": {
            "provider": "cloudflare",
            "model": settings.CLOUDFLARE_EMBED_MODEL,
            "active": False,
            "note": "Reserved for future retrieval/pgvector work. Chat runtime only in v1.",
        },
        "audit_secret_configured": bool(settings.INTERNAL_AUDIT_SECRET),
        "deprecated_env_present": {
            "OPENAI_API_KEY": bool(settings.OPENAI_API_KEY),
            "ANTHROPIC_API_KEY": bool(settings.ANTHROPIC_API_KEY),
        },
        "missing_env": missing_env,
    }
