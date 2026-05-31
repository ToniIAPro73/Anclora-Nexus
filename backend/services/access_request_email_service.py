from __future__ import annotations

import logging
from html import escape
from typing import Any, Dict

from backend.config import settings
from backend.services.email_delivery_service import get_email_transport_summary, send_email_native

logger = logging.getLogger(__name__)


def _product_label(record: Dict[str, Any]) -> str:
    product = str(record.get("product") or "").strip().lower()
    if product == "data_lab":
        return "Data Lab"
    if product == "syncxml":
        return "SyncXML"
    return "Synergi"


def _full_name(record: Dict[str, Any]) -> str:
    return str(record.get("full_name") or "there").strip() or "there"


def _email_to(record: Dict[str, Any]) -> str:
    return str(record.get("email") or "").strip()


def _html_shell(*, title: str, intro: str, body: str) -> str:
    return f"""
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family:Arial,Helvetica,sans-serif;background:#071f2b;padding:32px 12px;color:#f7f4ea;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:680px;background:#0a3241;border:1px solid rgba(212,175,55,0.22);border-radius:20px;">
              <tr>
                <td style="padding:32px;">
                  <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#d4af37;">Anclora Nexus</p>
                  <h1 style="margin:0 0 18px;font-size:28px;line-height:1.2;color:#f7f4ea;">{escape(title)}</h1>
                  <p style="margin:0 0 22px;color:#d8dfd6;line-height:1.7;font-size:16px;">{escape(intro)}</p>
                  <p style="margin:0 0 24px;color:#d8dfd6;line-height:1.7;font-size:15px;">{escape(body)}</p>
                  <p style="margin:0;color:#d4af37;line-height:1.8;">Anclora</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    """


def build_access_request_approved_email(record: Dict[str, Any]) -> Dict[str, str]:
    product = _product_label(record)
    full_name = _full_name(record)
    subject = f"Anclora {product} · Access request approved"

    extra_text = ""
    extra_html = ""
    if product == "SyncXML":
        pwd = settings.SYNCXML_ADMIN_PASSWORD or "NOT_CONFIGURED"
        url = settings.SYNCXML_APP_URL
        extra_text = f"\n\nYou can now access the pilot at {url} using the shared password: {pwd}\n"
        extra_html = f"<p style='margin:0 0 24px;color:#d4af37;line-height:1.7;font-size:16px;'>You can now access the pilot at <a href='{url}' style='color:#d4af37;'>{url}</a> using the shared password: <strong>{pwd}</strong></p>"
    else:
        extra_text = (
            "\nOur team will send the next steps or access link when they apply. "
            "No external account has been created automatically by this approval.\n"
        )
        extra_html = (
            "<p style='margin:0 0 24px;color:#d8dfd6;line-height:1.7;font-size:15px;'>"
            "Our team will send the next steps or access link when they apply. "
            "No external account has been created automatically by this approval."
            "</p>"
        )

    text = (
        f"Hello {full_name},\n\n"
        f"Your request for Anclora {product} has been approved."
        f"{extra_text}\n"
        "Regards,\nAnclora"
    )
    html = _html_shell(
        title=f"Your {product} request has been approved",
        intro=f"Hello {full_name}, your request for Anclora {product} has been approved.",
        body=extra_html,
    )
    return {"to": _email_to(record), "subject": subject, "text": text, "html": html}


def build_syncxml_pilot_acceptance_email(record: Dict[str, Any], credentials: Dict[str, Any]) -> Dict[str, str]:
    full_name = _full_name(record)
    login_url = settings.SYNCXML_LOGIN_URL or settings.SYNCXML_APP_URL
    email = str(credentials.get("email") or _email_to(record))
    temporary_password = str(credentials.get("temporaryPassword") or "")
    expires_at = credentials.get("expiresAt") or "según condiciones del piloto"
    subject = "Anclora SyncXML · Acceso al piloto controlado"
    text = (
        f"Hola {full_name},\n\n"
        "Tu solicitud encaja con el alcance actual del piloto controlado de Anclora SyncXML.\n\n"
        f"Acceso: {login_url}\n"
        f"Email autorizado: {email}\n"
        f"Contraseña temporal: {temporary_password}\n"
        f"Caducidad/revisión: {expires_at}\n\n"
        "Límites del piloto:\n"
        "- Usa solo datos sintéticos o anonimizados.\n"
        "- No subas datos reales de huéspedes.\n"
        "- No hay envío automático a SES.HOSPEDAJES en esta fase.\n"
        "- El piloto no constituye asesoramiento legal ni garantiza cumplimiento normativo definitivo.\n"
        "- El acceso es limitado, revocable y revisable.\n\n"
        "Gracias,\nAnclora"
    )
    html = _html_shell(
        title="Acceso al piloto controlado de SyncXML",
        intro=f"Hola {full_name}, tu solicitud encaja con el alcance actual del piloto controlado.",
        body=(
            f"Accede en {login_url}. Email autorizado: {email}. "
            f"Contraseña temporal: {temporary_password}. "
            "Usa solo datos sintéticos o anonimizados; no subas datos reales de huéspedes. "
            "No hay envío automático a SES.HOSPEDAJES ni garantía legal definitiva. "
            "El acceso es limitado, revocable y revisable."
        ),
    )
    return {"to": email, "subject": subject, "text": text, "html": html}


def build_access_request_rejected_email(record: Dict[str, Any]) -> Dict[str, str]:
    product = _product_label(record)
    full_name = _full_name(record)
    reason = str(record.get("rejection_reason") or "").strip()
    reason_text = f"\nReason: {reason}\n" if reason else "\n"
    reason_html = f" Reason: {reason}" if reason else ""
    subject = f"Anclora {product} · Access request reviewed"
    text = (
        f"Hello {full_name},\n\n"
        f"We reviewed your request for Anclora {product}. "
        "We will not move forward with access at this stage."
        f"{reason_text}\n"
        "Regards,\nAnclora"
    )
    html = _html_shell(
        title=f"Your {product} request has been reviewed",
        intro=(
            f"Hello {full_name}, we reviewed your request for Anclora {product}. "
            "We will not move forward with access at this stage."
        ),
        body=f"Thank you for your interest in Anclora {product}.{reason_html}",
    )
    return {"to": _email_to(record), "subject": subject, "text": text, "html": html}


def build_syncxml_more_info_email(record: Dict[str, Any], message: str) -> Dict[str, str]:
    full_name = _full_name(record)
    subject = "Anclora SyncXML · Necesitamos aclarar tu solicitud"
    text = (
        f"Hola {full_name},\n\n"
        f"{message}\n\n"
        "Recuerda que esta fase funciona solo con datos sintéticos o anonimizados y sin envío automático a SES.HOSPEDAJES.\n\n"
        "Gracias,\nAnclora"
    )
    html = _html_shell(
        title="Necesitamos aclarar tu solicitud",
        intro=f"Hola {full_name}, antes de confirmar el acceso necesitamos aclarar algunos detalles.",
        body=f"{message} Recuerda que esta fase funciona solo con datos sintéticos o anonimizados y sin envío automático a SES.HOSPEDAJES.",
    )
    return {"to": _email_to(record), "subject": subject, "text": text, "html": html}


def build_access_request_fallback_admin_email(record: Dict[str, Any]) -> Dict[str, str]:
    product = _product_label(record)
    email = _email_to(record)
    subject = f"ACTION REQUIRED: Validation failed for {product} lead"
    text = (
        f"Hello Admin,\n\n"
        f"The automated AI validation failed for the new {product} lead: {email}.\n"
        "Please review this request manually in the Nexus dashboard.\n\n"
        "Regards,\nAnclora Nexus"
    )
    html = _html_shell(
        title="Validation Fallback Triggered",
        intro=f"Automated validation failed for {email}.",
        body="Please review this request manually in the Nexus dashboard.",
    )
    admin_email = settings.ADMIN_EMAIL
    return {"to": admin_email, "subject": subject, "text": text, "html": html}


class AccessRequestEmailService:
    def build_decision_email(self, record: Dict[str, Any]) -> Dict[str, str]:
        status = str(record.get("status") or "").strip().lower()
        if status == "approved":
            return build_access_request_approved_email(record)
        if status == "rejected":
            return build_access_request_rejected_email(record)
        raise ValueError(f"Unsupported access request decision status: {status}")

    def build_syncxml_acceptance_email(self, record: Dict[str, Any], credentials: Dict[str, Any]) -> Dict[str, str]:
        return build_syncxml_pilot_acceptance_email(record, credentials)

    def build_syncxml_more_info_email(self, record: Dict[str, Any], message: str) -> Dict[str, str]:
        return build_syncxml_more_info_email(record, message)

    def send_decision_email(self, record: Dict[str, Any]) -> Dict[str, Any]:
        mail = self.build_decision_email(record)
        transport = get_email_transport_summary()
        if not transport["native_email_enabled"]:
            logger.info("Access request decision email skipped: native email is not configured")
            return {
                "status": "skipped",
                "transport": "unavailable",
                "to": mail["to"],
                "subject": mail["subject"],
            }

        delivery = send_email_native(
            to_email=mail["to"],
            subject=mail["subject"],
            body=mail["text"],
            html=mail["html"],
        )
        return {
            "status": "sent",
            "transport": "smtp",
            "to": mail["to"],
            "subject": mail["subject"],
            "delivery": delivery,
        }


access_request_email_service = AccessRequestEmailService()
