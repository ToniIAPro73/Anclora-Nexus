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


BRAND_BG = "#070A12"
BRAND_SURFACE = "#101827"
BRAND_SURFACE_ELEVATED = "#151F32"
BRAND_ACCENT = "#BFA46A"
BRAND_TEXT = "#F8FAFC"
BRAND_MUTED = "#A8B3C7"


def _syncxml_app_url() -> str:
    return (settings.SYNCXML_APP_URL or "https://anclora-syncxml.vercel.app").rstrip("/")


def _syncxml_logo_url() -> str:
    return f"{_syncxml_app_url()}/brand/logo-anclora-syncxml-email.png"


def _html_p(text: str) -> str:
    return f"<p style='margin:0 0 16px;color:{BRAND_MUTED};font-size:15px;line-height:22px;'>{escape(text)}</p>"


def _detail_row(label: str, value: Any) -> str:
    normalized = str(value or "").strip() or "No especificado"
    return (
        "<tr>"
        f"<td style='padding:8px 0;color:{BRAND_MUTED};font-size:13px;line-height:18px;width:190px;'>{escape(label)}</td>"
        f"<td style='padding:8px 0;color:{BRAND_TEXT};font-size:14px;line-height:20px;font-weight:700;'>{escape(normalized)}</td>"
        "</tr>"
    )


def _detail_table(rows: list[tuple[str, Any]]) -> str:
    return (
        f"<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='margin:18px 0 0;border-collapse:collapse;border-top:1px solid rgba(191,164,106,0.34);'>"
        + "".join(_detail_row(label, value) for label, value in rows)
        + "</table>"
    )


def _pill(label: str) -> str:
    return (
        f"<span style='display:inline-block;margin:0 0 12px;padding:6px 10px;border:1px solid rgba(191,164,106,0.42);"
        f"border-radius:999px;color:{BRAND_ACCENT};font-size:12px;line-height:16px;font-weight:800;'>"
        f"{escape(label)}</span>"
    )


def _button(label: str, href: str) -> str:
    return (
        f"<a href='{escape(href)}' style='display:inline-block;margin:8px 0 18px;padding:12px 18px;"
        f"border-radius:999px;background:{BRAND_ACCENT};color:#111827;text-decoration:none;"
        f"font-size:14px;line-height:18px;font-weight:850;'>{escape(label)}</a>"
    )


def _html_shell(*, title: str, intro: str, body_html: str, eyebrow: str = "Anclora SyncXML") -> str:
    return f"""
      <!doctype html>
      <html lang="es">
      <body style="margin:0;padding:0;background:{BRAND_BG};font-family:Inter,Segoe UI,Arial,sans-serif;color:{BRAND_TEXT};">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:{BRAND_BG};padding:32px 16px;color:{BRAND_TEXT};border-collapse:collapse;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:720px;border-collapse:collapse;">
              <tr>
                <td style="padding:0 0 18px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding-right:12px;">
                        <img src="{escape(_syncxml_logo_url())}" width="48" height="48" alt="Anclora SyncXML" style="display:block;width:48px;height:48px;border-radius:8px;object-fit:contain;">
                      </td>
                      <td>
                        <div style="color:{BRAND_TEXT};font-size:18px;line-height:24px;font-weight:850;">Anclora SyncXML</div>
                        <div style="color:{BRAND_MUTED};font-size:13px;line-height:18px;">Piloto controlado</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="border:1px solid rgba(255,255,255,0.10);border-radius:8px;background:{BRAND_SURFACE};overflow:hidden;">
                  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;">
                    <tr>
                      <td style="padding:28px 28px 10px;background:{BRAND_SURFACE_ELEVATED};border-bottom:1px solid rgba(255,255,255,0.08);">
                        {_pill(eyebrow)}
                        <h1 style="margin:0;color:{BRAND_TEXT};font-size:24px;line-height:31px;font-weight:850;letter-spacing:0;">{escape(title)}</h1>
                        <p style="margin:10px 0 0;color:{BRAND_MUTED};font-size:15px;line-height:22px;">{escape(intro)}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:24px 28px 28px;">
                        {body_html}
                        <p style="margin:20px 0 0;color:{BRAND_ACCENT};font-size:14px;line-height:22px;font-weight:700;">Anclora</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 4px 0;color:{BRAND_MUTED};font-size:12px;line-height:18px;">
                  Email transaccional de Anclora SyncXML. El piloto es limitado, revocable y revisable.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      </body>
      </html>
    """


def build_access_request_approved_email(record: Dict[str, Any]) -> Dict[str, str]:
    product = _product_label(record)
    full_name = _full_name(record)
    subject = f"Anclora {product} · Solicitud aprobada"

    extra_text = ""
    extra_html = ""
    extra_text = (
        "\nNuestro equipo enviará los siguientes pasos cuando apliquen. "
        "No se ha creado ninguna cuenta externa automáticamente con esta aprobación.\n"
    )
    extra_html = (
        _html_p("Nuestro equipo enviará los siguientes pasos cuando apliquen.")
        + _html_p("No se ha creado ninguna cuenta externa automáticamente con esta aprobación.")
    )

    text = (
        f"Hola {full_name},\n\n"
        f"Tu solicitud para Anclora {product} ha sido aprobada."
        f"{extra_text}\n"
        "Gracias,\nAnclora"
    )
    html = _html_shell(
        title=f"Solicitud aprobada",
        intro=f"Hola {full_name}, tu solicitud para Anclora {product} ha sido aprobada.",
        body_html=extra_html,
        eyebrow="Acceso aprobado",
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
    body_html = (
        _button("Acceder al piloto", login_url)
        + _detail_table([
            ("URL de acceso", login_url),
            ("Email autorizado", email),
            ("Contraseña temporal", temporary_password),
            ("Caducidad/revisión", expires_at),
        ])
        + "<div style='margin-top:20px;padding:16px;border:1px solid rgba(255,255,255,0.10);border-radius:8px;background:rgba(255,255,255,0.035);'>"
        + f"<div style='color:{BRAND_ACCENT};font-size:12px;line-height:16px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;'>Límites del piloto</div>"
        + f"<ul style='margin:10px 0 0;padding-left:18px;color:{BRAND_MUTED};font-size:14px;line-height:22px;'>"
        + "<li>Usa solo datos sintéticos o anonimizados.</li>"
        + "<li>No subas datos reales de huéspedes.</li>"
        + "<li>No hay envío automático a SES.HOSPEDAJES en esta fase.</li>"
        + "<li>No constituye asesoramiento legal ni garantía normativa definitiva.</li>"
        + "<li>El acceso es limitado, revocable y revisable.</li>"
        + "</ul></div>"
    )
    html = _html_shell(
        title="Acceso al piloto controlado de SyncXML",
        intro=f"Hola {full_name}, tu solicitud encaja con el alcance actual del piloto controlado.",
        body_html=body_html,
        eyebrow="Acceso aprobado",
    )
    return {"to": email, "subject": subject, "text": text, "html": html}


def build_access_request_rejected_email(record: Dict[str, Any]) -> Dict[str, str]:
    product = _product_label(record)
    full_name = _full_name(record)
    reason = str(record.get("rejection_reason") or "").strip()
    reason_text = f"\nMotivo: {reason}\n" if reason else "\n"
    subject = f"Anclora {product} · Solicitud revisada"
    text = (
        f"Hola {full_name},\n\n"
        f"Hemos revisado tu solicitud para Anclora {product}. "
        "En esta fase no avanzaremos con el acceso al piloto."
        f"{reason_text}\n"
        "Gracias,\nAnclora"
    )
    body_html = (
        _html_p(f"Hemos revisado tu solicitud para Anclora {product}. En esta fase no avanzaremos con el acceso al piloto.")
        + (
            "<div style='margin-top:18px;padding:16px;border:1px solid rgba(255,255,255,0.10);border-radius:8px;background:rgba(255,255,255,0.035);'>"
            + f"<div style='color:{BRAND_ACCENT};font-size:12px;line-height:16px;font-weight:800;text-transform:uppercase;letter-spacing:0.08em;'>Motivo</div>"
            + f"<div style='margin-top:8px;color:{BRAND_TEXT};font-size:14px;line-height:21px;'>{escape(reason)}</div>"
            + "</div>"
            if reason
            else _html_p("Gracias por tu interés. Si cambia el alcance del piloto, podremos valorar de nuevo casos similares.")
        )
        + _html_p("El piloto controlado se limita a casos que encajan con pruebas sobre datos sintéticos o anonimizados y sin uso productivo oficial.")
    )
    html = _html_shell(
        title="Solicitud revisada",
        intro=f"Hola {full_name}, hemos completado la revisión de tu solicitud.",
        body_html=body_html,
        eyebrow="Revisión completada",
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
        body_html=(
            _html_p(message)
            + _html_p("Recuerda que esta fase funciona solo con datos sintéticos o anonimizados y sin envío automático a SES.HOSPEDAJES.")
        ),
        eyebrow="Información adicional",
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
        body_html=_html_p("Please review this request manually in the Nexus dashboard."),
        eyebrow="Revisión manual",
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
