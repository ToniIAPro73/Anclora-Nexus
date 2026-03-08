import json
from typing import Any

import httpx

from .ai_runtime import get_task_runtime_routes, get_runtime_summary


class LLMService:
    def __init__(self):
        self.timeout = httpx.Timeout(60.0, connect=10.0)

    @staticmethod
    def runtime_summary() -> dict[str, Any]:
        return get_runtime_summary()

    async def summarize(self, text: str) -> str:
        """Fast path for summaries."""
        try:
            return await self._invoke_task("summarize", text)
        except Exception as exc:
            return f"Summary unavailable ({exc})"

    async def generate_copy(self, context: str) -> str:
        """Copywriting path optimized for persuasive and polished output."""
        try:
            return await self._invoke_task("generate_copy", context)
        except Exception:
            return (
                "Copy generation unavailable. "
                "This is a placeholder luxury summary for the properties found."
            )

    async def analyze(self, data: str) -> str:
        """Structured analysis path with deterministic fallback."""
        try:
            return await self._invoke_task("analyze", data)
        except Exception:
            if "cruzar estos LEADS" in data:
                return '{"matchings": []}'
            return "Analysis failed due to AI runtime unavailability."

    async def _invoke_task(self, task_name: str, prompt: str) -> str:
        routes = get_task_runtime_routes()
        route = routes[task_name]
        if not route.is_ready:
            missing = ", ".join(route.missing_env) or "provider configuration"
            raise RuntimeError(f"{route.label} route '{task_name}' is not ready: missing {missing}")

        try:
            return await self._generate_text(
                base_url=route.base_url,
                api_key=route.api_key or "",
                model=route.model,
                prompt=prompt,
                temperature=route.temperature,
                provider_label=route.label,
            )
        except Exception as primary_error:
            if route.fallback_model == route.model:
                raise primary_error
            return await self._generate_text(
                base_url=route.base_url,
                api_key=route.api_key or "",
                model=route.fallback_model,
                prompt=prompt,
                temperature=route.temperature,
                provider_label=f"{route.label}-fallback",
            )

    async def _generate_text(
        self,
        *,
        base_url: str,
        api_key: str,
        model: str,
        prompt: str,
        temperature: float,
        provider_label: str,
    ) -> str:
        url = f"{base_url.rstrip('/')}/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": model,
            "temperature": temperature,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        }
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
        content = self._extract_content(data)
        if not content:
            raise RuntimeError(f"{provider_label} returned empty content for model '{model}'")
        return content

    @staticmethod
    def _extract_content(data: dict[str, Any]) -> str:
        choices = data.get("choices") or []
        if not choices:
            return ""
        message = choices[0].get("message") or {}
        content = message.get("content")
        if isinstance(content, str):
            return content
        if isinstance(content, list):
            parts: list[str] = []
            for item in content:
                if isinstance(item, dict):
                    text = item.get("text")
                    if isinstance(text, str):
                        parts.append(text)
                elif isinstance(item, str):
                    parts.append(item)
            return "\n".join(parts).strip()
        if isinstance(content, dict):
            text = content.get("text")
            if isinstance(text, str):
                return text
        return json.dumps(content) if content is not None else ""


llm_service = LLMService()
