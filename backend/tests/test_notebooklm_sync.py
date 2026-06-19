"""
Unit tests for the NotebookLM sync CLI module.

Validates:
- Scope governance validation (Requirements 8.2, 8.3)
- Manifest tracking (Requirement 8.4)
- CLI interface (Requirement 8.1)
- SOURCE_SCOPE_MISMATCH rejection and logging
"""

import json
from datetime import datetime, timezone
from pathlib import Path

import pytest

from backend.cli.notebooklm_sync import (
    ALLOWED_DOMAINS_BY_NOTEBOOK,
    DEFAULT_MANIFEST_PATH,
    ManifestEntry,
    SyncDocument,
    compute_document_hash,
    load_manifest,
    push_documents,
    run_sync,
    save_manifest,
    validate_documents,
    validate_scope,
    build_parser,
    main,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def valid_document() -> SyncDocument:
    """A document with valid scope for NOTEBOOK_01."""
    return SyncDocument(
        document_id="doc-fiscal-001",
        content="IVA trimestral para autónomos en Baleares",
        notebook_id="ANCLORA_NOTEBOOK_01_FISCALIDAD_AUTONOMO_ES_BAL",
        domain="fiscalidad_autonomo_es_bal",
    )


@pytest.fixture
def mismatched_document() -> SyncDocument:
    """A document with domain mismatched to its target notebook."""
    return SyncDocument(
        document_id="doc-brand-002",
        content="Estrategia de marca premium",
        notebook_id="ANCLORA_NOTEBOOK_01_FISCALIDAD_AUTONOMO_ES_BAL",
        domain="marca_posicionamiento",  # Wrong scope for NOTEBOOK_01
    )


@pytest.fixture
def unknown_notebook_document() -> SyncDocument:
    """A document targeting an unknown notebook."""
    return SyncDocument(
        document_id="doc-unknown-003",
        content="Some content",
        notebook_id="NONEXISTENT_NOTEBOOK",
        domain="some_domain",
    )


@pytest.fixture
def tmp_manifest(tmp_path: Path) -> Path:
    return tmp_path / "test_manifest.json"


# ---------------------------------------------------------------------------
# Hash computation
# ---------------------------------------------------------------------------


class TestComputeDocumentHash:
    def test_returns_sha256_hex_digest(self) -> None:
        content = "Hello, world!"
        result = compute_document_hash(content)
        assert len(result) == 64  # SHA-256 produces 64 hex chars
        assert all(c in "0123456789abcdef" for c in result)

    def test_deterministic_for_same_content(self) -> None:
        content = "Repeated content"
        assert compute_document_hash(content) == compute_document_hash(content)

    def test_different_content_produces_different_hash(self) -> None:
        assert compute_document_hash("a") != compute_document_hash("b")


# ---------------------------------------------------------------------------
# Scope validation
# ---------------------------------------------------------------------------


class TestValidateScope:
    def test_valid_domain_matches_notebook(self, valid_document: SyncDocument) -> None:
        result = validate_scope(valid_document)
        assert result.valid is True
        assert result.error is None

    def test_mismatched_domain_rejected(self, mismatched_document: SyncDocument) -> None:
        result = validate_scope(mismatched_document)
        assert result.valid is False
        assert result.error is not None
        assert "SOURCE_SCOPE_MISMATCH" in result.error

    def test_unknown_notebook_rejected(
        self, unknown_notebook_document: SyncDocument
    ) -> None:
        result = validate_scope(unknown_notebook_document)
        assert result.valid is False
        assert "SOURCE_SCOPE_MISMATCH" in result.error
        assert "Unknown notebook_id" in result.error

    def test_all_valid_notebook_domain_combinations(self) -> None:
        """Each notebook accepts exactly its designated domain."""
        for notebook_id, allowed_domain in ALLOWED_DOMAINS_BY_NOTEBOOK.items():
            doc = SyncDocument(
                document_id="test",
                content="test",
                notebook_id=notebook_id,
                domain=allowed_domain,
            )
            result = validate_scope(doc)
            assert result.valid is True, (
                f"Expected valid for {notebook_id}/{allowed_domain}"
            )

    def test_notebook_01_rejects_notebook_02_domain(self) -> None:
        doc = SyncDocument(
            document_id="test",
            content="test",
            notebook_id="ANCLORA_NOTEBOOK_01_FISCALIDAD_AUTONOMO_ES_BAL",
            domain="transicion_riesgo_laboral",
        )
        result = validate_scope(doc)
        assert result.valid is False
        assert "SOURCE_SCOPE_MISMATCH" in result.error


# ---------------------------------------------------------------------------
# Batch validation
# ---------------------------------------------------------------------------


class TestValidateDocuments:
    def test_separates_valid_from_rejected(
        self, valid_document: SyncDocument, mismatched_document: SyncDocument
    ) -> None:
        valid, rejections = validate_documents([valid_document, mismatched_document])
        assert len(valid) == 1
        assert len(rejections) == 1
        assert valid[0].document_id == "doc-fiscal-001"
        assert rejections[0].document_id == "doc-brand-002"

    def test_all_valid(self, valid_document: SyncDocument) -> None:
        valid, rejections = validate_documents([valid_document])
        assert len(valid) == 1
        assert len(rejections) == 0

    def test_all_rejected(self, mismatched_document: SyncDocument) -> None:
        valid, rejections = validate_documents([mismatched_document])
        assert len(valid) == 0
        assert len(rejections) == 1

    def test_empty_list(self) -> None:
        valid, rejections = validate_documents([])
        assert len(valid) == 0
        assert len(rejections) == 0


# ---------------------------------------------------------------------------
# Manifest persistence
# ---------------------------------------------------------------------------


class TestManifestPersistence:
    def test_save_and_load_round_trip(self, tmp_manifest: Path) -> None:
        entries = [
            ManifestEntry(
                document_id="doc-1",
                document_hash="abc123" * 10 + "abcd",
                notebook_id="ANCLORA_NOTEBOOK_01_FISCALIDAD_AUTONOMO_ES_BAL",
                domain="fiscalidad_autonomo_es_bal",
                sync_timestamp=datetime(2025, 1, 15, 10, 30, 0, tzinfo=timezone.utc),
                status="synced",
            )
        ]
        save_manifest(entries, tmp_manifest)
        loaded = load_manifest(tmp_manifest)
        assert len(loaded) == 1
        assert loaded[0].document_id == "doc-1"
        assert loaded[0].status == "synced"

    def test_load_nonexistent_file_returns_empty(self, tmp_path: Path) -> None:
        result = load_manifest(tmp_path / "missing.json")
        assert result == []

    def test_save_creates_valid_json(self, tmp_manifest: Path) -> None:
        entries = [
            ManifestEntry(
                document_id="doc-2",
                document_hash="def456" * 10 + "defg",
                notebook_id="ANCLORA_NOTEBOOK_02_TRANSICION_RIESGO_LABORAL",
                domain="transicion_riesgo_laboral",
                sync_timestamp=datetime(2025, 6, 1, 12, 0, 0, tzinfo=timezone.utc),
                status="pending",
            )
        ]
        save_manifest(entries, tmp_manifest)
        data = json.loads(tmp_manifest.read_text())
        assert isinstance(data, list)
        assert data[0]["document_id"] == "doc-2"


# ---------------------------------------------------------------------------
# Push and sync
# ---------------------------------------------------------------------------


class TestPushDocuments:
    def test_push_creates_manifest_entries(
        self, valid_document: SyncDocument, tmp_manifest: Path
    ) -> None:
        entries = push_documents([valid_document], manifest_path=tmp_manifest)
        assert len(entries) == 1
        assert entries[0].document_id == "doc-fiscal-001"
        assert entries[0].status == "synced"
        assert entries[0].notebook_id == valid_document.notebook_id
        assert entries[0].document_hash == compute_document_hash(valid_document.content)

    def test_push_updates_existing_entry(
        self, valid_document: SyncDocument, tmp_manifest: Path
    ) -> None:
        # First push
        push_documents([valid_document], manifest_path=tmp_manifest)
        # Second push with same document_id
        updated_doc = valid_document.model_copy(update={"content": "Updated content"})
        push_documents([updated_doc], manifest_path=tmp_manifest)

        loaded = load_manifest(tmp_manifest)
        assert len(loaded) == 1  # No duplicate
        assert loaded[0].document_hash == compute_document_hash("Updated content")


class TestRunSync:
    def test_validate_only_does_not_push(
        self, valid_document: SyncDocument, tmp_manifest: Path
    ) -> None:
        summary = run_sync(
            documents=[valid_document],
            validate_only=True,
            manifest_path=tmp_manifest,
        )
        assert summary["pushed"] is False
        assert summary["valid_count"] == 1
        assert not tmp_manifest.exists()

    def test_push_creates_manifest_file(
        self, valid_document: SyncDocument, tmp_manifest: Path
    ) -> None:
        summary = run_sync(
            documents=[valid_document],
            validate_only=False,
            manifest_path=tmp_manifest,
        )
        assert summary["pushed"] is True
        assert summary["synced_entries"]
        assert tmp_manifest.exists()

    def test_rejected_documents_reported(
        self, mismatched_document: SyncDocument, tmp_manifest: Path
    ) -> None:
        summary = run_sync(
            documents=[mismatched_document],
            validate_only=False,
            manifest_path=tmp_manifest,
        )
        assert summary["rejected_count"] == 1
        assert "SOURCE_SCOPE_MISMATCH" in summary["rejections"][0]["error"]

    def test_mixed_batch_only_pushes_valid(
        self,
        valid_document: SyncDocument,
        mismatched_document: SyncDocument,
        tmp_manifest: Path,
    ) -> None:
        summary = run_sync(
            documents=[valid_document, mismatched_document],
            validate_only=False,
            manifest_path=tmp_manifest,
        )
        assert summary["valid_count"] == 1
        assert summary["rejected_count"] == 1
        assert summary["pushed"] is True
        assert len(summary["synced_entries"]) == 1


# ---------------------------------------------------------------------------
# CLI integration
# ---------------------------------------------------------------------------


class TestCLI:
    def test_parser_requires_validate_or_push(self) -> None:
        """Parser errors when neither --validate nor --push is specified."""
        parser = build_parser()
        # argparse will not error on parse, but main() checks the logic
        args = parser.parse_args(["--source", "/tmp/docs"])
        assert args.validate is False
        assert args.push is False

    def test_main_returns_nonzero_without_flags(self, tmp_path: Path) -> None:
        """main() fails when no --validate or --push flag given."""
        source = tmp_path / "docs.json"
        source.write_text("[]")
        # SystemExit from argparse error
        with pytest.raises(SystemExit):
            main(["--source", str(source)])

    def test_main_returns_zero_with_valid_documents(self, tmp_path: Path) -> None:
        source = tmp_path / "docs.json"
        docs = [
            {
                "document_id": "doc-1",
                "content": "Fiscalidad contenido",
                "notebook_id": "ANCLORA_NOTEBOOK_01_FISCALIDAD_AUTONOMO_ES_BAL",
                "domain": "fiscalidad_autonomo_es_bal",
            }
        ]
        source.write_text(json.dumps(docs))
        manifest = tmp_path / "manifest.json"

        exit_code = main(
            ["--validate", "--push", "--source", str(source), "--manifest", str(manifest)]
        )
        assert exit_code == 0
        assert manifest.exists()

    def test_main_returns_nonzero_with_rejected_documents(
        self, tmp_path: Path
    ) -> None:
        source = tmp_path / "docs.json"
        docs = [
            {
                "document_id": "doc-bad",
                "content": "Wrong content",
                "notebook_id": "ANCLORA_NOTEBOOK_01_FISCALIDAD_AUTONOMO_ES_BAL",
                "domain": "marca_posicionamiento",
            }
        ]
        source.write_text(json.dumps(docs))
        manifest = tmp_path / "manifest.json"

        exit_code = main(
            ["--validate", "--source", str(source), "--manifest", str(manifest)]
        )
        assert exit_code == 1

    def test_main_returns_nonzero_missing_source(self) -> None:
        exit_code = main(["--validate", "--source", "/nonexistent/path"])
        assert exit_code == 1
