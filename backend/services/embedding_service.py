from __future__ import annotations

from typing import Any, Dict, List

import httpx

from backend.config import settings


class EmbeddingService:
    def __init__(self) -> None:
        self.timeout = httpx.Timeout(30.0, connect=10.0)

    def is_ready(self) -> bool:
        return bool(settings.CLOUDFLARE_API_TOKEN and settings.CLOUDFLARE_ACCOUNT_ID and settings.CLOUDFLARE_EMBED_MODEL)

    def summary(self) -> Dict[str, Any]:
        return {
            "provider": "cloudflare",
            "model": settings.CLOUDFLARE_EMBED_MODEL,
            "active": self.is_ready(),
            "missing_env": [
                name
                for name, value in (
                    ("CLOUDFLARE_API_TOKEN", settings.CLOUDFLARE_API_TOKEN),
                    ("CLOUDFLARE_ACCOUNT_ID", settings.CLOUDFLARE_ACCOUNT_ID),
                )
                if not value
            ],
        }

    async def embed_text(self, text: str) -> List[float]:
        if not self.is_ready():
            raise RuntimeError("Embedding provider is not configured")

        base_url = (
            settings.CLOUDFLARE_AI_BASE_URL.rstrip("/")
            if settings.CLOUDFLARE_AI_BASE_URL
            else f"https://api.cloudflare.com/client/v4/accounts/{settings.CLOUDFLARE_ACCOUNT_ID}/ai/run"
        )
        if base_url.endswith("/ai/v1"):
            url = f"{base_url}/embeddings"
            payload: Dict[str, Any] = {
                "model": settings.CLOUDFLARE_EMBED_MODEL,
                "input": text,
            }
        else:
            url = f"{base_url}/{settings.CLOUDFLARE_EMBED_MODEL}"
            payload = {"text": [text]}

        headers = {
            "Authorization": f"Bearer {settings.CLOUDFLARE_API_TOKEN}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()

        vector = self._extract_vector(data)
        if not vector:
            raise RuntimeError("Embedding provider returned empty vector")
        return [float(item) for item in vector]

    @staticmethod
    def _extract_vector(data: Dict[str, Any]) -> List[float]:
        if isinstance(data.get("result"), dict):
            result = data["result"]
            if isinstance(result.get("data"), list) and result["data"]:
                first = result["data"][0]
                if isinstance(first, list):
                    return [float(item) for item in first]
                if isinstance(first, dict) and isinstance(first.get("embedding"), list):
                    return [float(item) for item in first["embedding"]]
            if isinstance(result.get("embedding"), list):
                return [float(item) for item in result["embedding"]]
        if isinstance(data.get("data"), list) and data["data"]:
            first = data["data"][0]
            if isinstance(first, dict) and isinstance(first.get("embedding"), list):
                return [float(item) for item in first["embedding"]]
        return []


embedding_service = EmbeddingService()
