from __future__ import annotations

from typing import Optional


def _normalize_lang(language: Optional[str]) -> str:
    value = str(language or "es").strip().lower()
    if value in {"en", "de"}:
        return value
    return "es"


def build_partner_submission_confirmation(*, full_name: str, language: Optional[str]) -> dict[str, str]:
    lang = _normalize_lang(language)
    if lang == "en":
        return {
            "subject": "Anclora Synergi · We received your partner application",
            "body": (
                f"Hello {full_name},\n\n"
                "We have received your Synergi partner application.\n"
                "Our team will review your profile and reply within a target window of seven days.\n\n"
                "Regards,\nAnclora"
            ),
        }
    if lang == "de":
        return {
            "subject": "Anclora Synergi · Ihre Partnerbewerbung ist eingegangen",
            "body": (
                f"Hallo {full_name},\n\n"
                "Wir haben Ihre Bewerbung für das Synergi-Partnernetzwerk erhalten.\n"
                "Unser Team prüft Ihr Profil und antwortet innerhalb eines Zielzeitraums von sieben Tagen.\n\n"
                "Viele Grüße\nAnclora"
            ),
        }
    return {
        "subject": "Anclora Synergi · Hemos recibido tu solicitud",
        "body": (
            f"Hola {full_name},\n\n"
            "Hemos recibido tu solicitud para formar parte de Synergi.\n"
            "Nuestro equipo revisará tu perfil y responderá dentro de un plazo objetivo de siete días.\n\n"
            "Equipo Anclora"
        ),
    }


def build_partner_review_email(*, full_name: str, language: Optional[str], accepted: bool, review_notes: Optional[str], launch_url: Optional[str]) -> dict[str, str]:
    lang = _normalize_lang(language)
    notes = review_notes or ("Sin observaciones adicionales." if lang == "es" else "No further notes.")
    if accepted:
        if lang == "en":
            body = (
                f"Hello {full_name},\n\n"
                "Your application to join Anclora Synergi has been approved.\n"
                "You can access your partner workspace using the link below.\n\n"
                f"Workspace access: {launch_url or '-'}\n"
                f"Review notes: {notes}\n\n"
                "Regards,\nAnclora"
            )
            subject = "Anclora Synergi · Partner access approved"
        elif lang == "de":
            body = (
                f"Hallo {full_name},\n\n"
                "Ihre Bewerbung für Anclora Synergi wurde angenommen.\n"
                "Sie können Ihren Partner-Workspace über den folgenden Link öffnen.\n\n"
                f"Workspace-Zugang: {launch_url or '-'}\n"
                f"Anmerkungen: {notes}\n\n"
                "Viele Grüße\nAnclora"
            )
            subject = "Anclora Synergi · Partnerzugang genehmigt"
        else:
            body = (
                f"Hola {full_name},\n\n"
                "Tu solicitud para entrar en Anclora Synergi ha sido aprobada.\n"
                "Puedes acceder a tu workspace de partner con el siguiente enlace.\n\n"
                f"Acceso al workspace: {launch_url or '-'}\n"
                f"Notas de revisión: {notes}\n\n"
                "Equipo Anclora"
            )
            subject = "Anclora Synergi · Acceso partner aprobado"
        return {"subject": subject, "body": body}

    if lang == "en":
        return {
            "subject": "Anclora Synergi · Application reviewed",
            "body": (
                f"Hello {full_name},\n\n"
                "We reviewed your Synergi application and we will not move forward at this stage.\n"
                f"Review notes: {notes}\n\n"
                "Regards,\nAnclora"
            ),
        }
    if lang == "de":
        return {
            "subject": "Anclora Synergi · Bewerbung geprüft",
            "body": (
                f"Hallo {full_name},\n\n"
                "Wir haben Ihre Synergi-Bewerbung geprüft und werden in dieser Phase nicht fortfahren.\n"
                f"Anmerkungen: {notes}\n\n"
                "Viele Grüße\nAnclora"
            ),
        }
    return {
        "subject": "Anclora Synergi · Solicitud revisada",
        "body": (
            f"Hola {full_name},\n\n"
            "Hemos revisado tu solicitud para Synergi y por ahora no avanzará a la siguiente fase.\n"
            f"Notas de revisión: {notes}\n\n"
            "Equipo Anclora"
        ),
    }


def build_data_lab_submission_confirmation(*, full_name: str, language: Optional[str]) -> dict[str, str]:
    lang = _normalize_lang(language)
    if lang == "en":
        return {
            "subject": "Anclora Data Lab · We received your access request",
            "body": (
                f"Hello {full_name},\n\n"
                "We received your request for Anclora Data Lab.\n"
                "Our team will review it and reply by email as soon as the request is assessed.\n\n"
                "Regards,\nAnclora"
            ),
        }
    if lang == "de":
        return {
            "subject": "Anclora Data Lab · Ihre Anfrage ist eingegangen",
            "body": (
                f"Hallo {full_name},\n\n"
                "Wir haben Ihre Anfrage für Anclora Data Lab erhalten.\n"
                "Unser Team prüft sie und antwortet per E-Mail, sobald die Bewertung abgeschlossen ist.\n\n"
                "Viele Grüße\nAnclora"
            ),
        }
    return {
        "subject": "Anclora Data Lab · Hemos recibido tu solicitud",
        "body": (
            f"Hola {full_name},\n\n"
            "Hemos recibido tu solicitud de acceso a Anclora Data Lab.\n"
            "Nuestro equipo la revisará y te responderá por email una vez esté evaluada.\n\n"
            "Equipo Anclora"
        ),
    }


def build_data_lab_review_email(*, full_name: str, language: Optional[str], approved: bool, review_notes: Optional[str], launch_url: Optional[str]) -> dict[str, str]:
    lang = _normalize_lang(language)
    notes = review_notes or ("Sin observaciones adicionales." if lang == "es" else "No further notes.")
    if approved:
        if lang == "en":
            return {
                "subject": "Anclora Data Lab · Access approved",
                "body": (
                    f"Hello {full_name},\n\n"
                    "Your access request to Anclora Data Lab has been approved.\n"
                    f"Workspace access: {launch_url or '-'}\n"
                    f"Review notes: {notes}\n\n"
                    "Regards,\nAnclora"
                ),
            }
        if lang == "de":
            return {
                "subject": "Anclora Data Lab · Zugang genehmigt",
                "body": (
                    f"Hallo {full_name},\n\n"
                    "Ihre Zugangsanfrage für Anclora Data Lab wurde genehmigt.\n"
                    f"Workspace-Zugang: {launch_url or '-'}\n"
                    f"Anmerkungen: {notes}\n\n"
                    "Viele Grüße\nAnclora"
                ),
            }
        return {
            "subject": "Anclora Data Lab · Acceso aprobado",
            "body": (
                f"Hola {full_name},\n\n"
                "Tu solicitud de acceso a Anclora Data Lab ha sido aprobada.\n"
                f"Acceso al workspace: {launch_url or '-'}\n"
                f"Notas de revisión: {notes}\n\n"
                "Equipo Anclora"
            ),
        }

    if lang == "en":
        return {
            "subject": "Anclora Data Lab · Request reviewed",
            "body": (
                f"Hello {full_name},\n\n"
                "We reviewed your Data Lab request and we will not move forward at this stage.\n"
                f"Review notes: {notes}\n\n"
                "Regards,\nAnclora"
            ),
        }
    if lang == "de":
        return {
            "subject": "Anclora Data Lab · Anfrage geprüft",
            "body": (
                f"Hallo {full_name},\n\n"
                "Wir haben Ihre Anfrage für Data Lab geprüft und werden in dieser Phase nicht fortfahren.\n"
                f"Anmerkungen: {notes}\n\n"
                "Viele Grüße\nAnclora"
            ),
        }
    return {
        "subject": "Anclora Data Lab · Solicitud revisada",
        "body": (
            f"Hola {full_name},\n\n"
            "Hemos revisado tu solicitud para Data Lab y por ahora no avanzará a la siguiente fase.\n"
            f"Notas de revisión: {notes}\n\n"
            "Equipo Anclora"
        ),
    }
