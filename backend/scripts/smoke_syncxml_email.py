#!/usr/bin/env python3
import os
import smtplib
import sys
from email.message import EmailMessage


def missing(names):
    return [name for name in names if not os.getenv(name)]


dry_run = os.getenv("DRY_RUN", "true").lower() != "false"
required = ["ADMIN_EMAILS", "SYNCXML_APP_URL", "SYNCXML_LOGIN_URL"]
smtp_required = ["SMTP_HOST", "SMTP_FROM_EMAIL"]
missing_vars = missing(required)
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
message["Subject"] = "Smoke test Nexus SyncXML pilot email"
message.set_content(
    "\n".join(
        [
            "Smoke test for Nexus SyncXML controlled pilot emails.",
            f"SyncXML app: {os.getenv('SYNCXML_APP_URL')}",
            f"SyncXML login: {os.getenv('SYNCXML_LOGIN_URL')}",
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
