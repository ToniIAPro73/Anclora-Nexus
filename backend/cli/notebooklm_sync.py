"""
NotebookLM Sync CLI — Formal pipeline for synchronizing documents to NotebookLM.

Exposes existing build/validate scripts as a documented CLI command:
    python -m cli.notebooklm_sync --validate --push

Implements:
- SyncManifest tracking (notebook_id, document_hash, sync_timestamp)
- Scope governance validation before push
- Rejection with SOURCE_SCOPE_MISMATCH on scope mismatch

Requirements: 8.1, 8.2, 8.3, 8.4
"""

from __future__ import annotations

import argparse
import hashlib
import json
import logging
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

logger = logging.getLogger("notebooklm_sync")

# ---------------------------------------------------------------------------
# Scope governance definitions
# ---------------------------------------------------------------------------

NOTEBOOK_SCOPES: dict[str, dict[str, str]] = {
    "NOTEBOOK_01": {
        "id": "ANCLORA_NOTEBOOK_01_FISCALIDAD_AUTONOMO_ES_BAL",
        "domain": "fiscalidad_autonomo_es_bal",
        "description": "Fiscalidad autónomo España/Baleares",
    },
    "NOTEBOOK_02": {
        "id": "ANCLORA_NOTEBOOK_02_TRANSICION_RIESGO_LABORAL",
        "domain": "transicion_riesgo_laboral",
        "description": "Transición riesgo laboral",
    },
    "NOTEBOOK_03": {
        "id": "ANCLORA_NOTEBOOK_03_MARCA_POSICIONAMIENTO",
        "domain": "marca_posicionamiento",
        "description": "Marca posicionamiento",
    },
}

# Mapping from notebook_id to allowed domains for quick lookup.
ALLOWED_DOMAINS_BY_NOTEBOOK: dict[str, str] = {
    cfg["id"]: cfg["domain"] for cfg in NOTEBOOK_SCOPES.values()
}


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------


class ManifestEntry(BaseModel):
    """Single document entry in the sync manifest."""

    document_id: str
    document_hash: str = Field(description="SHA-256 of document content")
    notebook_id: str
    domain: str
    sync_timestamp: datetime
    status: Literal["synced", "pending", "failed"]


class SyncManifest(BaseModel):
    """Manifest tracking all documents synchronized to NotebookLM notebooks."""

    notebook_id: str
    entries: list[ManifestEntry] = Field(default_factory=list)


class SyncDocument(BaseModel):
    """Represents a source document to be validated and synced."""

    document_id: str
    content: str
    notebook_id: str
    domain: str


class ScopeValidationResult(BaseModel):
    """Result of scope governance validation."""

    document_id: str
    notebook_id: str
    domain: str
    valid: bool
    error: str | None = None


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

DEFAULT_MANIFEST_PATH = Path("notebooklm_manifest.json")


def compute_document_hash(content: str) -> str:
    """Compute SHA-256 hash of document content."""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def validate_scope(document: SyncDocument) -> ScopeValidationResult:
    """
    Validate a source document against scope governance rules.

    A document is valid if its domain matches the allowed domain for its
    target notebook_id. Otherwise it is rejected with SOURCE_SCOPE_MISMATCH.

    Requirements: 8.2, 8.3
    """
    allowed_domain = ALLOWED_DOMAINS_BY_NOTEBOOK.get(document.notebook_id)

    if allowed_domain is None:
        return ScopeValidationResult(
            document_id=document.document_id,
            notebook_id=document.notebook_id,
            domain=document.domain,
            valid=False,
            error=f"SOURCE_SCOPE_MISMATCH: Unknown notebook_id '{document.notebook_id}'",
        )

    if document.domain != allowed_domain:
        return ScopeValidationResult(
            document_id=document.document_id,
            notebook_id=document.notebook_id,
            domain=document.domain,
            valid=False,
            error=(
                f"SOURCE_SCOPE_MISMATCH: domain '{document.domain}' does not match "
                f"allowed scope '{allowed_domain}' for notebook '{document.notebook_id}'"
            ),
        )

    return ScopeValidationResult(
        document_id=document.document_id,
        notebook_id=document.notebook_id,
        domain=document.domain,
        valid=True,
        error=None,
    )


def load_manifest(manifest_path: Path) -> list[ManifestEntry]:
    """Load existing manifest entries from JSON file."""
    if not manifest_path.exists():
        return []

    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    return [ManifestEntry(**entry) for entry in data]


def save_manifest(entries: list[ManifestEntry], manifest_path: Path) -> None:
    """Save manifest entries to JSON file."""
    data = [entry.model_dump(mode="json") for entry in entries]
    manifest_path.write_text(
        json.dumps(data, indent=2, default=str), encoding="utf-8"
    )


def validate_documents(
    documents: list[SyncDocument],
) -> tuple[list[SyncDocument], list[ScopeValidationResult]]:
    """
    Validate a batch of documents against scope governance.

    Returns:
        Tuple of (valid_documents, rejection_results)
    """
    valid: list[SyncDocument] = []
    rejections: list[ScopeValidationResult] = []

    for doc in documents:
        result = validate_scope(doc)
        if result.valid:
            valid.append(doc)
        else:
            rejections.append(result)
            logger.warning(
                "Document rejected: %s — %s", doc.document_id, result.error
            )

    return valid, rejections


def push_documents(
    documents: list[SyncDocument],
    manifest_path: Path = DEFAULT_MANIFEST_PATH,
) -> list[ManifestEntry]:
    """
    Push validated documents and update manifest.

    This simulates the push operation — in production this would call
    the actual NotebookLM API. The manifest is updated with sync status.

    Requirements: 8.4
    """
    existing_entries = load_manifest(manifest_path)
    new_entries: list[ManifestEntry] = []

    for doc in documents:
        entry = ManifestEntry(
            document_id=doc.document_id,
            document_hash=compute_document_hash(doc.content),
            notebook_id=doc.notebook_id,
            domain=doc.domain,
            sync_timestamp=datetime.now(timezone.utc),
            status="synced",
        )
        new_entries.append(entry)

    # Merge: update existing entries or append new ones
    entry_map: dict[str, ManifestEntry] = {e.document_id: e for e in existing_entries}
    for entry in new_entries:
        entry_map[entry.document_id] = entry

    all_entries = list(entry_map.values())
    save_manifest(all_entries, manifest_path)

    return new_entries


def run_sync(
    documents: list[SyncDocument],
    validate_only: bool = False,
    manifest_path: Path = DEFAULT_MANIFEST_PATH,
) -> dict:
    """
    Execute the full sync pipeline: validate, optionally push.

    Args:
        documents: Source documents to sync
        validate_only: If True, only validate without pushing (dry run)
        manifest_path: Path to the manifest JSON file

    Returns:
        Summary dict with validation and push results
    """
    logger.info("Starting NotebookLM sync — %d documents", len(documents))

    valid_docs, rejections = validate_documents(documents)

    summary: dict = {
        "total_documents": len(documents),
        "valid_count": len(valid_docs),
        "rejected_count": len(rejections),
        "rejections": [r.model_dump(mode="json") for r in rejections],
        "pushed": False,
        "synced_entries": [],
    }

    if rejections:
        for r in rejections:
            logger.error("REJECTED: %s", r.error)

    if validate_only:
        logger.info(
            "Validation complete (dry run): %d valid, %d rejected",
            len(valid_docs),
            len(rejections),
        )
        return summary

    if valid_docs:
        synced = push_documents(valid_docs, manifest_path=manifest_path)
        summary["pushed"] = True
        summary["synced_entries"] = [e.model_dump(mode="json") for e in synced]
        logger.info("Push complete: %d documents synced", len(synced))
    else:
        logger.warning("No valid documents to push")

    return summary


# ---------------------------------------------------------------------------
# CLI entrypoint
# ---------------------------------------------------------------------------


def load_documents_from_path(source_path: Path) -> list[SyncDocument]:
    """
    Load documents from a source directory or JSON file.

    If source_path is a JSON file, expect it to be a list of document objects.
    If source_path is a directory, scan for .md and .txt files.
    """
    if source_path.is_file() and source_path.suffix == ".json":
        data = json.loads(source_path.read_text(encoding="utf-8"))
        return [SyncDocument(**doc) for doc in data]

    if source_path.is_dir():
        docs: list[SyncDocument] = []
        for file_path in sorted(source_path.glob("**/*")):
            if file_path.suffix in (".md", ".txt") and file_path.is_file():
                content = file_path.read_text(encoding="utf-8")
                # Extract metadata from frontmatter-like first lines or use defaults
                docs.append(
                    SyncDocument(
                        document_id=file_path.stem,
                        content=content,
                        notebook_id="",  # Must be specified via metadata
                        domain="",
                    )
                )
        return docs

    logger.error("Source path must be a JSON file or directory: %s", source_path)
    return []


def build_parser() -> argparse.ArgumentParser:
    """Build the CLI argument parser."""
    parser = argparse.ArgumentParser(
        prog="notebooklm_sync",
        description="NotebookLM document synchronization pipeline with scope governance",
    )
    parser.add_argument(
        "--validate",
        action="store_true",
        help="Validate source documents against scope governance (dry run, no push)",
    )
    parser.add_argument(
        "--push",
        action="store_true",
        help="Push validated documents to NotebookLM and update manifest",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=None,
        help="Path to source documents (JSON file or directory)",
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=DEFAULT_MANIFEST_PATH,
        help="Path to manifest JSON file (default: notebooklm_manifest.json)",
    )
    parser.add_argument(
        "--verbose",
        "-v",
        action="store_true",
        help="Enable verbose logging",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    """CLI entrypoint for NotebookLM sync."""
    parser = build_parser()
    args = parser.parse_args(argv)

    # Configure logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    if not args.validate and not args.push:
        parser.error("At least one of --validate or --push must be specified")
        return 1

    # Load documents
    if args.source is None:
        logger.error("--source is required to specify document source path")
        return 1

    documents = load_documents_from_path(args.source)
    if not documents:
        logger.error("No documents found at source: %s", args.source)
        return 1

    # Determine mode: --validate means dry run, --push means execute
    validate_only = args.validate and not args.push

    summary = run_sync(
        documents=documents,
        validate_only=validate_only,
        manifest_path=args.manifest,
    )

    # Output summary
    print(json.dumps(summary, indent=2, default=str))

    # Exit code: non-zero if there were rejections
    if summary["rejected_count"] > 0:
        return 1
    return 0


# Support `python -m cli.notebooklm_sync`
if __name__ == "__main__":
    sys.exit(main())
