import os
import tempfile
from pathlib import Path
from unittest.mock import patch

from backend.services.advanced_document_parser import AdvancedDocumentParser, _parse_output_block


def test_parse_output_block_reads_marked_section() -> None:
    stdout = """
=== OUTPUT_ROOT ===
/tmp/output/demo

=== MARKDOWN_CANDIDATES ===
/tmp/output/demo/file.md
=== JSON_CANDIDATES ===
/tmp/output/demo/file.json
""".strip()

    assert _parse_output_block(stdout, "=== OUTPUT_ROOT ===") == ["/tmp/output/demo"]
    assert _parse_output_block(stdout, "=== MARKDOWN_CANDIDATES ===") == ["/tmp/output/demo/file.md"]


def test_parser_rejects_when_disabled() -> None:
    os.environ["ENABLE_MINERU_PARSER"] = "false"
    parser = AdvancedDocumentParser()

    try:
        parser.parse_document("/tmp/missing.pdf")
    except RuntimeError as error:
        assert "ENABLE_MINERU_PARSER=false" in str(error)
    else:
        raise AssertionError("Expected RuntimeError when MinerU is disabled")


def test_parser_reads_wrapper_output() -> None:
    os.environ["ENABLE_MINERU_PARSER"] = "true"
    with tempfile.NamedTemporaryFile() as wrapper:
        os.environ["MINERU_AGENT_INGEST_PATH"] = wrapper.name
        parser = AdvancedDocumentParser()

        completed = type(
            "Completed",
            (),
            {
                "stdout": "\n".join(
                    [
                        "=== OUTPUT_ROOT ===",
                        "/tmp/output/demo",
                        "=== MARKDOWN_CANDIDATES ===",
                        "/tmp/output/demo/file.md",
                        "=== JSON_CANDIDATES ===",
                        "/tmp/output/demo/file.json",
                    ]
                )
            },
        )()

        with patch("backend.services.advanced_document_parser.subprocess.run", return_value=completed):
            result = parser.parse_document("/tmp/doc.pdf")

        assert result.output_root == "/tmp/output/demo"
        assert result.markdown_candidates == ["/tmp/output/demo/file.md"]
