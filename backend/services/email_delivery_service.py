from __future__ import annotations

import smtplib
from email.message import EmailMessage
from email.utils import make_msgid
from typing import Any, Dict, Optional

from backend.config import settings


def get_email_transport_summary() -> Dict[str, Any]:
    enabled = bool(
        (settings.SMTP_HOST or "").strip()
        and (settings.SMTP_FROM_EMAIL or "").strip()
    )
    return {
        "native_email_enabled": enabled,
        "provider": "smtp" if enabled else "mailto",
        "from_email": settings.SMTP_FROM_EMAIL,
        "from_name": settings.SMTP_FROM_NAME,
        "reply_to": settings.SMTP_REPLY_TO,
    }


def send_email_native(*, to_email: str, subject: str, body: str, html: Optional[str] = None) -> Dict[str, Any]:
    transport = get_email_transport_summary()
    if not transport["native_email_enabled"]:
        raise RuntimeError("Native email transport is not configured")

    message = EmailMessage()
    message["To"] = to_email
    message["From"] = (
        f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        if settings.SMTP_FROM_NAME
        else str(settings.SMTP_FROM_EMAIL)
    )
    message["Subject"] = subject
    if settings.SMTP_REPLY_TO:
        message["Reply-To"] = settings.SMTP_REPLY_TO
    message["Message-ID"] = make_msgid(domain=(settings.SMTP_FROM_EMAIL or "anclora.local").split("@")[-1])
    message.set_content(body)
    if html:
        message.add_alternative(html, subtype="html")

    if settings.SMTP_USE_SSL:
        with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
            if settings.SMTP_USERNAME:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD or "")
            smtp.send_message(message)
    else:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=20) as smtp:
            smtp.ehlo()
            if settings.SMTP_USE_TLS:
                smtp.starttls()
                smtp.ehlo()
            if settings.SMTP_USERNAME:
                smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD or "")
            smtp.send_message(message)

    return {
        "provider": "smtp",
        "message_id": message["Message-ID"],
        "from_email": settings.SMTP_FROM_EMAIL,
        "reply_to": settings.SMTP_REPLY_TO,
    }
