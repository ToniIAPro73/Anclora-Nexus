#!/usr/bin/env python3
import os
import smtplib
import sys
from email.message import EmailMessage


def missing(names):
    return [name for name in names if not os.getenv(name)]


def dual_env(canonical, legacy):
    """GuestHub rename (2026-08): read GUESTHUB_* first, fall back to legacy SYNCXML_*."""
    return os.getenv(canonical) or os.getenv(legacy)


dry_run = os.getenv("DRY_RUN", "true").lower() != "false"
required = ["ADMIN_EMAILS"]
smtp_required = ["SMTP_HOST", "SMTP_FROM_EMAIL"]
missing_vars = missing(required)
app_url = dual_env("GUESTHUB_APP_URL", "SYNCXML_APP_URL")
login_url = dual_env("GUESTHUB_LOGIN_URL", "SYNCXML_LOGIN_URL")
if not app_url:
    missing_vars.append("GUESTHUB_APP_URL (or legacy SYNCXML_APP_URL)")
if not login_url:
    missing_vars.append("GUESTHUB_LOGIN_URL (or legacy SYNCXML_LOGIN_URL)")
if not dry_run:
    missing_vars.extend(missing(smtp_required))

if missing_vars:
    print(f"Missing required environment variables: {', '.join(missing_vars)}", file=sys.stderr)
    sys.exit(2)

to_email = os.getenv("SMOKE_EMAIL_TO") or os.getenv("ADMIN_EMAILS", "").split(",")[0].strip()
if not dry_run and not os.getenv("SMOKE_EMAIL_TO"):
    print("Refusing real send without SMOKE_EMAIL_TO.", file=sys.stderr)
    sys.exit(2)

message = EmailMessage()
message["To"] = to_email
message["From"] = os.getenv("SMTP_FROM_EMAIL", "dry-run@example.com")
message["Subject"] = "Smoke test Nexus GuestHub pilot email"
message.set_content(
    "\n".join(
        [
            "Smoke test for Nexus GuestHub controlled pilot emails.",
            f"GuestHub app: {app_url}",
            f"GuestHub login: {login_url}",
            "No real pilot credentials are included.",
        ]
    )
)

if dry_run:
    print({"ok": True, "mode": "dry-run", "to": to_email, "subject": message["Subject"]})
    sys.exit(0)

port = int(os.getenv("SMTP_PORT", "587"))
with smtplib.SMTP(os.environ["SMTP_HOST"], port, timeout=20) as smtp:
    smtp.ehlo()
    if os.getenv("SMTP_USE_TLS", "true").lower() == "true":
        smtp.starttls()
        smtp.ehlo()
    if os.getenv("SMTP_USERNAME"):
        smtp.login(os.environ["SMTP_USERNAME"], os.getenv("SMTP_PASSWORD", ""))
    smtp.send_message(message)

print({"ok": True, "mode": "real", "to": to_email})
