from __future__ import annotations

import json
from typing import Any, Dict, Optional
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from backend.config import settings


class CaptchaVerificationError(RuntimeError):
    pass


class CaptchaVerificationService:
    def _provider_enabled(self, provider: str | None) -> bool:
        return (provider or "").strip().lower() == "recaptcha"

    def verify(self, *, provider: Optional[str], token: Optional[str], remote_ip: Optional[str] = None) -> Dict[str, Any]:
        if not self._provider_enabled(provider):
            return {"provider": "none", "verified": False, "required": False}

        if not settings.RECAPTCHA_SECRET_KEY:
            raise CaptchaVerificationError("reCAPTCHA secret key is not configured")

        if not token:
            raise CaptchaVerificationError("Missing reCAPTCHA token")

        payload = {
            "secret": settings.RECAPTCHA_SECRET_KEY,
            "response": token,
        }
        if remote_ip:
            payload["remoteip"] = remote_ip

        request = Request(
            settings.RECAPTCHA_VERIFY_URL,
            data=urlencode(payload).encode("utf-8"),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            method="POST",
        )

        with urlopen(request, timeout=10) as response:
            body = json.loads(response.read().decode("utf-8"))

        if not bool(body.get("success")):
            raise CaptchaVerificationError("reCAPTCHA verification failed")

        return {
            "provider": "recaptcha",
            "verified": True,
            "required": True,
            "score": body.get("score"),
            "hostname": body.get("hostname"),
        }


captcha_verification_service = CaptchaVerificationService()
