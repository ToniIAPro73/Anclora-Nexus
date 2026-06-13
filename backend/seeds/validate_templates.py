#!/usr/bin/env python3
"""
validate_templates.py — Validador de plantillas DMS/CLM de Anclora Nexus.

Verifica front matter, placeholders, unicidad APE, encoding y contenido
de todos los archivos Markdown en backend/seeds/templates/.

Uso:
    python backend/seeds/validate_templates.py
    python backend/seeds/validate_templates.py --lang es
    python backend/seeds/validate_templates.py --strict

Salida:
    artifacts/dms_template_validation_report.json

Código de salida:
    0 — sin errores críticos
    1 — errores críticos encontrados
"""

import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path
from typing import Any

# ── Configuración ──────────────────────────────────────────────────────────────

SEEDS_DIR = Path(__file__).parent
TEMPLATES_DIR = SEEDS_DIR / "templates"
MANIFEST_PATH = SEEDS_DIR / "template_manifest.json"
ARTIFACTS_DIR = Path(__file__).parent.parent.parent / "artifacts"

VALID_LANGUAGES = {"es", "ca", "de", "en", "sv", "fr", "it", "da", "nl", "no", "pt"}
VALID_JURISDICTIONS = {"ES-IB", "ES", "ES-CAT", "ES-MAD", "ES-AND"}
VALID_STATUSES = {"draft", "machine_translated", "human_review_required",
                  "legal_review_required", "approved", "published", "retired"}
VALID_TRANSLATION_STATUSES = {"draft", "machine_translated", "human_review_required",
                               "legal_review_required", "approved", "published",
                               "retired", "approved_source"}
VALID_LEGAL_REVIEW_STATUSES = {"pending", "in_review", "approved", "rejected", "expired"}
VALID_OPERATION_TYPES = {"compraventa", "captacion_intermediacion", "alquiler_temporada",
                          "alquiler_residencial", "alquiler_turistico", "compliance",
                          "general"}
VALID_PHASES = {"onboarding", "captacion", "due_diligence", "comercializacion",
                "visita", "negociacion", "reserva", "precontractual", "contrato",
                "firma", "entrega", "postfirma", "archivo", "general"}
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+$")
PLACEHOLDER_RE = re.compile(r"\{\{\s*(\w[\w.]*)\s*\}\}")

# Placeholders canónicos permitidos (prefijos)
CANONICAL_PREFIXES = {
    "organization", "agent", "deal", "property",
    "buyer", "seller", "landlord", "tenant", "guest",
    "party_1", "party_2", "document", "sof", "inventory",
    "booking", "delivery", "keys", "nda", "supply", "tenancy",
}

# Placeholders legacy (permitidos pero deprecados)
LEGACY_PLACEHOLDERS = {
    "buyer.fullname", "seller.fullname", "agent.fullname",
    "landlord.fullname", "tenant.fullname", "guest.fullname",
    "buyer.name", "seller.name",
}

# Patrones de datos personales reales que no deben aparecer
PERSONAL_DATA_PATTERNS = [
    re.compile(r"\b\d{8}[A-HJ-NP-TV-Z]\b"),         # DNI español
    re.compile(r"\b[X-Z]\d{7}[A-HJ-NP-TV-Z]\b"),    # NIE español
    re.compile(r"\b\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}\b"),  # tarjeta
    re.compile(r"\bES\d{22}\b"),                       # IBAN
    re.compile(r"(?i)\bpassword\s*[:=]\s*\S+"),
    re.compile(r"(?i)\bapi[_-]?key\s*[:=]\s*\S+"),
    re.compile(r"(?i)\bsecret\s*[:=]\s*\S+"),
]

REQUIRED_FRONT_MATTER_FIELDS = [
    "template_key", "template_family", "ape_code", "display_name",
    "operation_type", "phase", "jurisdiction", "language", "locale",
    "version", "status", "legal_review_status", "translation_status",
    "source_language", "source_version", "signable",
    "requires_legal_review", "requires_advisor_validation",
]

# ── Carga del manifiesto ───────────────────────────────────────────────────────

def load_manifest() -> dict[str, Any]:
    if not MANIFEST_PATH.exists():
        return {}
    with open(MANIFEST_PATH, encoding="utf-8") as f:
        return json.load(f)


def build_known_keys(manifest: dict) -> set[str]:
    return {fam["template_key"] for fam in manifest.get("families", [])}


def build_known_ape_codes(manifest: dict) -> dict[str, str]:
    return {fam["ape_code"]: fam["template_key"] for fam in manifest.get("families", [])}

# ── Parser de front matter ─────────────────────────────────────────────────────

def parse_front_matter(content: str) -> tuple[dict[str, Any], str]:
    """Extrae front matter YAML y cuerpo del Markdown."""
    if not content.startswith("---"):
        return {}, content
    end = content.find("\n---", 3)
    if end == -1:
        return {}, content
    fm_raw = content[3:end].strip()
    body = content[end + 4:].strip()
    fm: dict[str, Any] = {}
    for line in fm_raw.splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip().strip('"')
            if value.lower() == "true":
                fm[key] = True
            elif value.lower() == "false":
                fm[key] = False
            elif value == "":
                fm[key] = None
            else:
                fm[key] = value
    return fm, body

# ── Validación de un archivo ───────────────────────────────────────────────────

def validate_file(
    path: Path,
    known_keys: set[str],
    known_ape: dict[str, str],
    ape_seen: dict[str, list[str]],
) -> dict[str, Any]:
    result: dict[str, Any] = {
        "file": str(path.relative_to(SEEDS_DIR)),
        "errors": [],
        "warnings": [],
        "placeholders": [],
        "legacy_placeholders": [],
        "unknown_placeholders": [],
    }

    # Encoding UTF-8
    try:
        raw = path.read_text(encoding="utf-8")
    except UnicodeDecodeError as exc:
        result["errors"].append(f"encoding: archivo no es UTF-8 válido ({exc})")
        return result

    # Contenido no vacío
    if not raw.strip():
        result["errors"].append("content: archivo vacío")
        return result

    # Front matter
    fm, body = parse_front_matter(raw)
    if not fm:
        result["errors"].append("front_matter: no se encontró bloque YAML ---")
        return result

    result["front_matter"] = fm

    # Campos requeridos
    for field in REQUIRED_FRONT_MATTER_FIELDS:
        if field not in fm or fm[field] is None or fm[field] == "":
            result["errors"].append(f"front_matter.{field}: campo obligatorio ausente o vacío")

    # template_key conocido
    template_key = fm.get("template_key", "")
    if template_key and known_keys and template_key not in known_keys:
        result["errors"].append(f"template_key: '{template_key}' no está en el manifiesto")

    # Idioma válido
    lang = fm.get("language", "")
    if lang and lang not in VALID_LANGUAGES:
        result["errors"].append(f"language: '{lang}' no es un idioma soportado")

    # Idioma del archivo coincide con front matter
    name_parts = path.stem.split(".")
    if len(name_parts) >= 2:
        file_lang = name_parts[-1]
        if file_lang != lang:
            result["warnings"].append(
                f"language_mismatch: nombre del archivo usa '{file_lang}' pero front matter dice '{lang}'"
            )

    # Jurisdicción válida
    jurisdiction = fm.get("jurisdiction", "")
    if jurisdiction and jurisdiction not in VALID_JURISDICTIONS:
        result["warnings"].append(f"jurisdiction: '{jurisdiction}' no es una jurisdicción conocida")

    # Versión semántica
    version = str(fm.get("version", ""))
    if version and not SEMVER_RE.match(version):
        result["errors"].append(f"version: '{version}' no es semver válido (X.Y.Z)")

    # Estado permitido
    status = fm.get("status", "")
    if status and status not in VALID_STATUSES:
        result["errors"].append(f"status: '{status}' no es un estado válido")

    # translation_status
    ts = fm.get("translation_status", "")
    if ts and ts not in VALID_TRANSLATION_STATUSES:
        result["errors"].append(f"translation_status: '{ts}' no es válido")

    # legal_review_status
    lrs = fm.get("legal_review_status", "")
    if lrs and lrs not in VALID_LEGAL_REVIEW_STATUSES:
        result["errors"].append(f"legal_review_status: '{lrs}' no es válido")

    # operation_type
    op = fm.get("operation_type", "")
    if op and op not in VALID_OPERATION_TYPES:
        result["warnings"].append(f"operation_type: '{op}' no es un tipo de operación conocido")

    # phase
    phase = fm.get("phase", "")
    if phase and phase not in VALID_PHASES:
        result["warnings"].append(f"phase: '{phase}' no es una fase conocida")

    # APE code único
    ape_code = fm.get("ape_code", "")
    if ape_code:
        if ape_code not in ape_seen:
            ape_seen[ape_code] = []
        ape_seen[ape_code].append(str(path))

    # Cuerpo no vacío
    if not body.strip():
        result["warnings"].append("content.body: cuerpo del documento vacío")

    # Placeholders
    all_placeholders = PLACEHOLDER_RE.findall(raw)
    result["placeholders"] = sorted(set(all_placeholders))

    for ph in all_placeholders:
        prefix = ph.split(".")[0]
        if ph in LEGACY_PLACEHOLDERS:
            result["legacy_placeholders"].append(ph)
        elif prefix not in CANONICAL_PREFIXES:
            result["unknown_placeholders"].append(ph)

    if result["legacy_placeholders"]:
        result["warnings"].append(
            f"placeholders.legacy: {result['legacy_placeholders']} — migrar a contrato canónico"
        )
    if result["unknown_placeholders"]:
        result["warnings"].append(
            f"placeholders.unknown: {result['unknown_placeholders']} — prefijo fuera del contrato"
        )

    # Datos personales reales
    for pattern in PERSONAL_DATA_PATTERNS:
        matches = pattern.findall(body)
        if matches:
            result["errors"].append(
                f"personal_data: posibles datos personales reales detectados: {matches[:3]}"
            )

    # SHA-256
    result["sha256"] = hashlib.sha256(raw.encode("utf-8")).hexdigest()

    return result

# ── Verificación de paridad de placeholders ────────────────────────────────────

def check_placeholder_parity(
    results_by_key: dict[str, dict[str, list[str]]],
) -> list[dict[str, Any]]:
    parity_issues = []
    for key, lang_map in results_by_key.items():
        if "es" not in lang_map:
            continue
        es_phs = set(lang_map["es"])
        for lang, phs in lang_map.items():
            if lang == "es":
                continue
            lang_phs = set(phs)
            missing = es_phs - lang_phs
            extra = lang_phs - es_phs
            if missing or extra:
                parity_issues.append({
                    "template_key": key,
                    "language": lang,
                    "missing_from_translation": sorted(missing),
                    "extra_in_translation": sorted(extra),
                })
    return parity_issues

# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(description="Validador de plantillas DMS/CLM")
    parser.add_argument("--lang", help="Validar solo este idioma", default=None)
    parser.add_argument("--strict", action="store_true", help="Tratar warnings como errores")
    parser.add_argument("--output", default=str(ARTIFACTS_DIR / "dms_template_validation_report.json"))
    args = parser.parse_args()

    manifest = load_manifest()
    known_keys = build_known_keys(manifest)
    known_ape = build_known_ape_codes(manifest)
    ape_seen: dict[str, list[str]] = {}

    all_results = []
    results_by_key: dict[str, dict[str, list[str]]] = {}

    # Buscar archivos
    if not TEMPLATES_DIR.exists():
        print(f"ERROR: directorio {TEMPLATES_DIR} no existe", file=sys.stderr)
        return 1

    md_files = sorted(TEMPLATES_DIR.rglob("*.md"))
    if args.lang:
        md_files = [f for f in md_files if f.parent.name == args.lang]

    if not md_files:
        print("WARNING: no se encontraron archivos Markdown", file=sys.stderr)

    for path in md_files:
        r = validate_file(path, known_keys, known_ape, ape_seen)
        all_results.append(r)

        # Acumular para paridad
        fm = r.get("front_matter", {})
        key = fm.get("template_key", "")
        lang = fm.get("language", "")
        if key and lang:
            if key not in results_by_key:
                results_by_key[key] = {}
            results_by_key[key][lang] = r.get("placeholders", [])

    # APE codes duplicados
    ape_errors = []
    for code, paths in ape_seen.items():
        langs_seen = set()
        for p in paths:
            parts = Path(p).stem.split(".")
            if len(parts) >= 2:
                langs_seen.add(parts[-1])
        if len(paths) > len(langs_seen):
            ape_errors.append({
                "ape_code": code,
                "paths": paths,
                "issue": "APE code duplicado en el mismo idioma",
            })

    # Paridad de placeholders
    parity_issues = check_placeholder_parity(results_by_key)

    # Resumen
    total = len(all_results)
    total_errors = sum(len(r["errors"]) for r in all_results) + len(ape_errors)
    total_warnings = sum(len(r["warnings"]) for r in all_results) + len(parity_issues)
    files_with_errors = [r["file"] for r in all_results if r["errors"]]
    files_with_warnings = [r["file"] for r in all_results if r["warnings"]]

    report = {
        "generated_at": "2026-06-13",
        "total_files": total,
        "total_errors": total_errors,
        "total_warnings": total_warnings,
        "files_with_errors": files_with_errors,
        "files_with_warnings": files_with_warnings,
        "ape_code_conflicts": ape_errors,
        "placeholder_parity_issues": parity_issues,
        "files": all_results,
    }

    # Guardar reporte
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)

    # Imprimir resumen
    print(f"\nValidación completada: {total} archivos")
    print(f"  Errores críticos:  {total_errors}")
    print(f"  Advertencias:      {total_warnings}")
    print(f"  Reporte:           {output_path}")

    if files_with_errors:
        print("\nArchivos con errores críticos:")
        for f in files_with_errors[:20]:
            errs = next(r["errors"] for r in all_results if r["file"] == f)
            print(f"  {f}")
            for e in errs[:3]:
                print(f"    ERROR: {e}")

    if parity_issues:
        print(f"\nProblemas de paridad de placeholders: {len(parity_issues)}")
        for issue in parity_issues[:5]:
            print(f"  {issue['template_key']} [{issue['language']}]: "
                  f"faltan {issue['missing_from_translation']}")

    if ape_errors:
        print(f"\nConflictos APE code: {len(ape_errors)}")
        for ae in ape_errors:
            print(f"  {ae['ape_code']}: {ae['issue']}")

    critical = total_errors > 0
    if args.strict and total_warnings > 0:
        critical = True

    if critical:
        print("\nRESULTADO: ERRORES CRÍTICOS — corregir antes de publicar", file=sys.stderr)
        return 1

    print("\nRESULTADO: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
