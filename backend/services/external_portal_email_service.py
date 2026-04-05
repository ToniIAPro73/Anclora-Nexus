from __future__ import annotations

from html import escape
from typing import Optional


def _normalize_lang(language: Optional[str]) -> str:
    value = str(language or "es").strip().lower()
    if value in {"en", "de"}:
        return value
    return "es"


def _render_shell(*, eyebrow: str, title: str, intro: str, primary_label: Optional[str] = None, primary_href: Optional[str] = None, secondary_title: Optional[str] = None, secondary_body: Optional[str] = None, closing: str, signature: str, note_lines: list[str] | None = None) -> str:
    primary_block = ""
    if primary_label and primary_href:
        primary_block = f"""
          <p style="margin:0 0 32px;text-align:center;">
            <a href="{escape(primary_href, quote=True)}" style="background:linear-gradient(135deg,#d4af37,#c4a037);color:#0b1824;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:700;display:inline-block;font-size:14px;letter-spacing:0.04em;">
              {escape(primary_label)}
            </a>
          </p>
        """

    secondary_block = ""
    if secondary_title or secondary_body:
        secondary_block = f"""
          <hr style="border:none;border-top:1px solid #d4af372e;margin:32px 0;" />
          <h2 style="font-size:15px;color:#d4af37;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 14px;">
            {escape(secondary_title or "")}
          </h2>
          <p style="margin:0 0 24px;color:#d8dfd6;line-height:1.7;">{escape(secondary_body or "")}</p>
        """

    notes_block = ""
    if note_lines:
        items = "".join(f"<li style=\"margin-bottom:8px;\">{escape(line)}</li>" for line in note_lines if line)
        notes_block = f"""
          <div style="margin-top:28px;padding:18px 20px;border-radius:18px;border:1px solid #d4af3724;background:rgba(255,255,255,0.03);">
            <ul style="margin:0;padding-left:18px;color:#d8dfd6;line-height:1.7;">{items}</ul>
          </div>
        """

    return f"""
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family:Arial,Helvetica,sans-serif;background:#071f2b;padding:32px 12px;color:#f7f4ea;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:680px;background:linear-gradient(180deg,#0a3241 0%,#071f2b 100%);border:1px solid rgba(212,175,55,0.22);border-radius:28px;overflow:hidden;">
              <tr>
                <td style="padding:36px 36px 18px;">
                  <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.32em;text-transform:uppercase;color:#d4af37;">{escape(eyebrow)}</p>
                  <h1 style="margin:0 0 18px;font-size:34px;line-height:1.1;color:#f7f4ea;">{escape(title)}</h1>
                  <p style="margin:0 0 28px;color:#d8dfd6;line-height:1.75;font-size:16px;">{escape(intro)}</p>
                  {primary_block}
                  {secondary_block}
                  <p style="margin:0 0 10px;color:#f7f4ea;">{escape(closing)}</p>
                  <p style="margin:0;color:#d4af37;line-height:1.8;">{signature}</p>
                  {notes_block}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    """


def build_partner_submission_confirmation(*, full_name: str, language: Optional[str]) -> dict[str, str]:
    lang = _normalize_lang(language)
    if lang == "en":
        subject = "Anclora Synergi · We received your partner application"
        body = (
            f"Hello {full_name},\n\n"
            "We have received your Synergi partner application.\n"
            "Our team will review your profile and reply within a target window of seven days.\n\n"
            "Regards,\nAnclora"
        )
        html = _render_shell(
            eyebrow="Synergi",
            title="Your application is now under review",
            intro=f"Hello {full_name}, we have received your partner application. Our team will review your profile and reply within a target window of seven days.",
            secondary_title="What happens next",
            secondary_body="We will assess fit, service quality, coverage and collaboration potential before opening access to the workspace.",
            closing="Regards,",
            signature="Anclora",
        )
        return {"subject": subject, "body": body, "html": html}
    if lang == "de":
        subject = "Anclora Synergi · Ihre Partnerbewerbung ist eingegangen"
        body = (
            f"Hallo {full_name},\n\n"
            "Wir haben Ihre Bewerbung für das Synergi-Partnernetzwerk erhalten.\n"
            "Unser Team prüft Ihr Profil und antwortet innerhalb eines Zielzeitraums von sieben Tagen.\n\n"
            "Viele Grüße\nAnclora"
        )
        html = _render_shell(
            eyebrow="Synergi",
            title="Ihre Bewerbung wird jetzt geprüft",
            intro=f"Hallo {full_name}, wir haben Ihre Partnerbewerbung erhalten. Unser Team prüft Ihr Profil und antwortet innerhalb eines Zielzeitraums von sieben Tagen.",
            secondary_title="Nächster Schritt",
            secondary_body="Wir bewerten Positionierung, Servicequalität, Abdeckung und Zusammenarbeitspotenzial, bevor der Workspace geöffnet wird.",
            closing="Viele Grüße",
            signature="Anclora",
        )
        return {"subject": subject, "body": body, "html": html}

    subject = "Anclora Synergi · Hemos recibido tu solicitud"
    body = (
        f"Hola {full_name},\n\n"
        "Hemos recibido tu solicitud para formar parte de Synergi.\n"
        "Nuestro equipo revisará tu perfil y responderá dentro de un plazo objetivo de siete días.\n\n"
        "Equipo Anclora"
    )
    html = _render_shell(
        eyebrow="Synergi",
        title="Tu solicitud ya está en revisión",
        intro=f"Hola {full_name}, hemos recibido tu solicitud para formar parte de Synergi. Nuestro equipo revisará tu perfil y responderá dentro de un plazo objetivo de siete días.",
        secondary_title="Qué ocurrirá ahora",
        secondary_body="Evaluaremos encaje, nivel de servicio, cobertura y potencial de colaboración antes de abrir acceso al workspace.",
        closing="Equipo Anclora",
        signature="Anclora",
    )
    return {"subject": subject, "body": body, "html": html}


def build_partner_review_email(*, full_name: str, language: Optional[str], accepted: bool, review_notes: Optional[str], launch_url: Optional[str]) -> dict[str, str]:
    lang = _normalize_lang(language)
    notes = review_notes or ("Sin observaciones adicionales." if lang == "es" else "No further notes.")
    if accepted:
        if lang == "en":
            subject = "Anclora Synergi · Partner access approved"
            body = (
                f"Hello {full_name},\n\n"
                "Your application to join Anclora Synergi has been approved.\n"
                "You can access your partner workspace using the link below.\n\n"
                f"Workspace access: {launch_url or '-'}\n"
                f"Review notes: {notes}\n\n"
                "Regards,\nAnclora"
            )
            html = _render_shell(
                eyebrow="Synergi",
                title="Your partner access has been approved",
                intro=f"Hello {full_name}, your application to join Anclora Synergi has been approved.",
                primary_label="Open partner workspace",
                primary_href=launch_url,
                secondary_title="Review notes",
                secondary_body=notes,
                closing="Regards,",
                signature="Anclora",
                note_lines=["Use this access link as your operating credential.", "If you need a different collaboration scope, reply to this email."],
            )
            return {"subject": subject, "body": body, "html": html}
        if lang == "de":
            subject = "Anclora Synergi · Partnerzugang genehmigt"
            body = (
                f"Hallo {full_name},\n\n"
                "Ihre Bewerbung für Anclora Synergi wurde angenommen.\n"
                "Sie können Ihren Partner-Workspace über den folgenden Link öffnen.\n\n"
                f"Workspace-Zugang: {launch_url or '-'}\n"
                f"Anmerkungen: {notes}\n\n"
                "Viele Grüße\nAnclora"
            )
            html = _render_shell(
                eyebrow="Synergi",
                title="Ihr Partnerzugang wurde genehmigt",
                intro=f"Hallo {full_name}, Ihre Bewerbung für Anclora Synergi wurde angenommen.",
                primary_label="Partner-Workspace öffnen",
                primary_href=launch_url,
                secondary_title="Anmerkungen",
                secondary_body=notes,
                closing="Viele Grüße",
                signature="Anclora",
                note_lines=["Nutzen Sie diesen Zugangslink als operative Zugangsdaten.", "Wenn Sie einen anderen Kollaborationsumfang benötigen, antworten Sie auf diese E-Mail."],
            )
            return {"subject": subject, "body": body, "html": html}

        subject = "Anclora Synergi · Acceso partner aprobado"
        body = (
            f"Hola {full_name},\n\n"
            "Tu solicitud para entrar en Anclora Synergi ha sido aprobada.\n"
            "Puedes acceder a tu workspace de partner con el siguiente enlace.\n\n"
            f"Acceso al workspace: {launch_url or '-'}\n"
            f"Notas de revisión: {notes}\n\n"
            "Equipo Anclora"
        )
        html = _render_shell(
            eyebrow="Synergi",
            title="Tu acceso partner ha sido aprobado",
            intro=f"Hola {full_name}, tu solicitud para entrar en Anclora Synergi ha sido aprobada.",
            primary_label="Abrir workspace partner",
            primary_href=launch_url,
            secondary_title="Notas de revisión",
            secondary_body=notes,
            closing="Equipo Anclora",
            signature="Anclora",
            note_lines=["Utiliza este enlace como tu credencial operativa de acceso.", "Si necesitas otro alcance de colaboración, responde a este email."],
        )
        return {"subject": subject, "body": body, "html": html}

    if lang == "en":
        subject = "Anclora Synergi · Application reviewed"
        body = (
            f"Hello {full_name},\n\n"
            "We reviewed your Synergi application and we will not move forward at this stage.\n"
            f"Review notes: {notes}\n\n"
            "Regards,\nAnclora"
        )
        html = _render_shell(
            eyebrow="Synergi",
            title="We have reviewed your application",
            intro=f"Hello {full_name}, we reviewed your Synergi application and we will not move forward at this stage.",
            secondary_title="Review notes",
            secondary_body=notes,
            closing="Regards,",
            signature="Anclora",
        )
        return {"subject": subject, "body": body, "html": html}
    if lang == "de":
        subject = "Anclora Synergi · Bewerbung geprüft"
        body = (
            f"Hallo {full_name},\n\n"
            "Wir haben Ihre Synergi-Bewerbung geprüft und werden in dieser Phase nicht fortfahren.\n"
            f"Anmerkungen: {notes}\n\n"
            "Viele Grüße\nAnclora"
        )
        html = _render_shell(
            eyebrow="Synergi",
            title="Ihre Bewerbung wurde geprüft",
            intro=f"Hallo {full_name}, wir haben Ihre Synergi-Bewerbung geprüft und werden in dieser Phase nicht fortfahren.",
            secondary_title="Anmerkungen",
            secondary_body=notes,
            closing="Viele Grüße",
            signature="Anclora",
        )
        return {"subject": subject, "body": body, "html": html}

    subject = "Anclora Synergi · Solicitud revisada"
    body = (
        f"Hola {full_name},\n\n"
        "Hemos revisado tu solicitud para Synergi y por ahora no avanzará a la siguiente fase.\n"
        f"Notas de revisión: {notes}\n\n"
        "Equipo Anclora"
    )
    html = _render_shell(
        eyebrow="Synergi",
        title="Hemos revisado tu solicitud",
        intro=f"Hola {full_name}, hemos revisado tu solicitud para Synergi y por ahora no avanzará a la siguiente fase.",
        secondary_title="Notas de revisión",
        secondary_body=notes,
        closing="Equipo Anclora",
        signature="Anclora",
    )
    return {"subject": subject, "body": body, "html": html}


def build_data_lab_submission_confirmation(*, full_name: str, language: Optional[str]) -> dict[str, str]:
    lang = _normalize_lang(language)
    if lang == "en":
        subject = "Anclora Data Lab · We received your access request"
        body = (
            f"Hello {full_name},\n\n"
            "We received your request for Anclora Data Lab.\n"
            "Our team will review it and reply by email as soon as the request is assessed.\n\n"
            "Regards,\nAnclora"
        )
        html = _render_shell(
            eyebrow="Data Lab",
            title="Your request is now under review",
            intro=f"Hello {full_name}, we received your request for Anclora Data Lab. Our team will review it and reply by email as soon as the request is assessed.",
            secondary_title="Review flow",
            secondary_body="We assess purpose, audience, scope and information sensitivity before enabling selective access.",
            closing="Regards,",
            signature="Anclora",
        )
        return {"subject": subject, "body": body, "html": html}
    if lang == "de":
        subject = "Anclora Data Lab · Ihre Anfrage ist eingegangen"
        body = (
            f"Hallo {full_name},\n\n"
            "Wir haben Ihre Anfrage für Anclora Data Lab erhalten.\n"
            "Unser Team prüft sie und antwortet per E-Mail, sobald die Bewertung abgeschlossen ist.\n\n"
            "Viele Grüße\nAnclora"
        )
        html = _render_shell(
            eyebrow="Data Lab",
            title="Ihre Anfrage wird jetzt geprüft",
            intro=f"Hallo {full_name}, wir haben Ihre Anfrage für Anclora Data Lab erhalten. Unser Team prüft sie und antwortet per E-Mail, sobald die Bewertung abgeschlossen ist.",
            secondary_title="Prüfablauf",
            secondary_body="Wir bewerten Zweck, Profil, angeforderten Umfang und Informationssensibilität, bevor der selektive Zugang aktiviert wird.",
            closing="Viele Grüße",
            signature="Anclora",
        )
        return {"subject": subject, "body": body, "html": html}

    subject = "Anclora Data Lab · Hemos recibido tu solicitud"
    body = (
        f"Hola {full_name},\n\n"
        "Hemos recibido tu solicitud de acceso a Anclora Data Lab.\n"
        "Nuestro equipo la revisará y te responderá por email una vez esté evaluada.\n\n"
        "Equipo Anclora"
    )
    html = _render_shell(
        eyebrow="Data Lab",
        title="Tu solicitud ya está en revisión",
        intro=f"Hola {full_name}, hemos recibido tu solicitud de acceso a Anclora Data Lab. Nuestro equipo la revisará y te responderá por email una vez esté evaluada.",
        secondary_title="Proceso de evaluación",
        secondary_body="Revisaremos propósito, perfil, alcance solicitado y sensibilidad de los activos antes de habilitar acceso selectivo.",
        closing="Equipo Anclora",
        signature="Anclora",
    )
    return {"subject": subject, "body": body, "html": html}


def build_valuation_submission_confirmation(*, full_name: str, language: Optional[str]) -> dict[str, str]:
    lang = _normalize_lang(language)
    if lang == "en":
        subject = "Anclora Private Estates · We received your valuation request"
        body = (
            f"Hello {full_name},\n\n"
            "We have received your property valuation request.\n"
            "Our team will review the details and get back to you personally within a target window of two working days.\n\n"
            "Regards,\nAnclora"
        )
        html = _render_shell(
            eyebrow="Private Estates",
            title="Your valuation request has been received",
            intro=f"Hello {full_name}, we have received your property valuation request. Our team will review the details and get back to you personally within a target window of two working days.",
            secondary_title="What happens next",
            secondary_body="We will assess the asset, the micro-location and the right approach before scheduling a private conversation.",
            closing="Regards,",
            signature="Anclora",
        )
        return {"subject": subject, "body": body, "html": html}
    if lang == "de":
        subject = "Anclora Private Estates · Ihre Bewertungsanfrage ist eingegangen"
        body = (
            f"Hallo {full_name},\n\n"
            "Wir haben Ihre Immobilienbewertungsanfrage erhalten.\n"
            "Unser Team wird die Angaben prüfen und sich innerhalb von zwei Werktagen persönlich bei Ihnen melden.\n\n"
            "Viele Grüße\nAnclora"
        )
        html = _render_shell(
            eyebrow="Private Estates",
            title="Ihre Bewertungsanfrage ist eingegangen",
            intro=f"Hallo {full_name}, wir haben Ihre Immobilienbewertungsanfrage erhalten. Unser Team wird die Angaben prüfen und sich innerhalb von zwei Werktagen persönlich bei Ihnen melden.",
            secondary_title="Nächste Schritte",
            secondary_body="Wir analysieren das Objekt, die Mikrolage und den richtigen Ansatz, bevor wir ein privates Gespräch vereinbaren.",
            closing="Viele Grüße",
            signature="Anclora",
        )
        return {"subject": subject, "body": body, "html": html}

    subject = "Anclora Private Estates · Hemos recibido tu solicitud de valoración"
    body = (
        f"Hola {full_name},\n\n"
        "Hemos recibido tu solicitud de valoración de inmueble.\n"
        "Nuestro equipo revisará los detalles y te responderá de forma personal dentro de un plazo objetivo de dos días hábiles.\n\n"
        "Equipo Anclora"
    )
    html = _render_shell(
        eyebrow="Private Estates",
        title="Tu solicitud de valoración ha sido recibida",
        intro=f"Hola {full_name}, hemos recibido tu solicitud de valoración. Nuestro equipo revisará los detalles y te responderá de forma personal dentro de un plazo objetivo de dos días hábiles.",
        secondary_title="Qué ocurrirá ahora",
        secondary_body="Analizaremos el activo, la microzona y el enfoque más adecuado antes de organizar una conversación privada.",
        closing="Equipo Anclora",
        signature="Anclora",
    )
    return {"subject": subject, "body": body, "html": html}


def build_data_lab_review_email(*, full_name: str, language: Optional[str], approved: bool, review_notes: Optional[str], launch_url: Optional[str]) -> dict[str, str]:
    lang = _normalize_lang(language)
    notes = review_notes or ("Sin observaciones adicionales." if lang == "es" else "No further notes.")
    if approved:
        if lang == "en":
            subject = "Anclora Data Lab · Access approved"
            body = (
                f"Hello {full_name},\n\n"
                "Your access request to Anclora Data Lab has been approved.\n"
                f"Workspace access: {launch_url or '-'}\n"
                f"Review notes: {notes}\n\n"
                "Regards,\nAnclora"
            )
            html = _render_shell(
                eyebrow="Data Lab",
                title="Your Data Lab access has been approved",
                intro=f"Hello {full_name}, your access request to Anclora Data Lab has been approved.",
                primary_label="Open Data Lab workspace",
                primary_href=launch_url,
                secondary_title="Review notes",
                secondary_body=notes,
                closing="Regards,",
                signature="Anclora",
                note_lines=["Use this access link as your operating credential.", "If you require a wider scope, reply to this email with the requested analytical perimeter."],
            )
            return {"subject": subject, "body": body, "html": html}
        if lang == "de":
            subject = "Anclora Data Lab · Zugang genehmigt"
            body = (
                f"Hallo {full_name},\n\n"
                "Ihre Zugangsanfrage für Anclora Data Lab wurde genehmigt.\n"
                f"Workspace-Zugang: {launch_url or '-'}\n"
                f"Anmerkungen: {notes}\n\n"
                "Viele Grüße\nAnclora"
            )
            html = _render_shell(
                eyebrow="Data Lab",
                title="Ihr Data-Lab-Zugang wurde genehmigt",
                intro=f"Hallo {full_name}, Ihre Zugangsanfrage für Anclora Data Lab wurde genehmigt.",
                primary_label="Data-Lab-Workspace öffnen",
                primary_href=launch_url,
                secondary_title="Anmerkungen",
                secondary_body=notes,
                closing="Viele Grüße",
                signature="Anclora",
                note_lines=["Nutzen Sie diesen Zugangslink als operative Zugangsdaten.", "Wenn Sie einen erweiterten Umfang benötigen, antworten Sie auf diese E-Mail."],
            )
            return {"subject": subject, "body": body, "html": html}

        subject = "Anclora Data Lab · Acceso aprobado"
        body = (
            f"Hola {full_name},\n\n"
            "Tu solicitud de acceso a Anclora Data Lab ha sido aprobada.\n"
            f"Acceso al workspace: {launch_url or '-'}\n"
            f"Notas de revisión: {notes}\n\n"
            "Equipo Anclora"
        )
        html = _render_shell(
            eyebrow="Data Lab",
            title="Tu acceso a Data Lab ha sido aprobado",
            intro=f"Hola {full_name}, tu solicitud de acceso a Anclora Data Lab ha sido aprobada.",
            primary_label="Abrir workspace Data Lab",
            primary_href=launch_url,
            secondary_title="Notas de revisión",
            secondary_body=notes,
            closing="Equipo Anclora",
            signature="Anclora",
            note_lines=["Utiliza este enlace como tu credencial operativa de acceso.", "Si necesitas otro alcance analítico, responde a este email indicando el perímetro deseado."],
        )
        return {"subject": subject, "body": body, "html": html}

    if lang == "en":
        subject = "Anclora Data Lab · Request reviewed"
        body = (
            f"Hello {full_name},\n\n"
            "We reviewed your Data Lab request and we will not move forward at this stage.\n"
            f"Review notes: {notes}\n\n"
            "Regards,\nAnclora"
        )
        html = _render_shell(
            eyebrow="Data Lab",
            title="We have reviewed your request",
            intro=f"Hello {full_name}, we reviewed your Data Lab request and we will not move forward at this stage.",
            secondary_title="Review notes",
            secondary_body=notes,
            closing="Regards,",
            signature="Anclora",
        )
        return {"subject": subject, "body": body, "html": html}
    if lang == "de":
        subject = "Anclora Data Lab · Anfrage geprüft"
        body = (
            f"Hallo {full_name},\n\n"
            "Wir haben Ihre Anfrage für Data Lab geprüft und werden in dieser Phase nicht fortfahren.\n"
            f"Anmerkungen: {notes}\n\n"
            "Viele Grüße\nAnclora"
        )
        html = _render_shell(
            eyebrow="Data Lab",
            title="Ihre Anfrage wurde geprüft",
            intro=f"Hallo {full_name}, wir haben Ihre Anfrage für Data Lab geprüft und werden in dieser Phase nicht fortfahren.",
            secondary_title="Anmerkungen",
            secondary_body=notes,
            closing="Viele Grüße",
            signature="Anclora",
        )
        return {"subject": subject, "body": body, "html": html}

    subject = "Anclora Data Lab · Solicitud revisada"
    body = (
        f"Hola {full_name},\n\n"
        "Hemos revisado tu solicitud para Data Lab y por ahora no avanzará a la siguiente fase.\n"
        f"Notas de revisión: {notes}\n\n"
        "Equipo Anclora"
    )
    html = _render_shell(
        eyebrow="Data Lab",
        title="Hemos revisado tu solicitud",
        intro=f"Hola {full_name}, hemos revisado tu solicitud para Data Lab y por ahora no avanzará a la siguiente fase.",
        secondary_title="Notas de revisión",
        secondary_body=notes,
        closing="Equipo Anclora",
        signature="Anclora",
    )
    return {"subject": subject, "body": body, "html": html}
