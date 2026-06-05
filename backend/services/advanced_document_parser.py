from __future__ import annotations

import os
import subprocess
from dataclasses import dataclass
from pathlib import Path


@dataclass
class AdvancedDocumentParseResult:
    parser_engine: str
    output_root: str
    markdown_candidates: list[str]
    json_candidates: list[str]


def _parse_output_block(stdout: str, marker: str) -> list[str]:
    lines = stdout.splitlines()
    try:
        index = lines.index(marker)
    except ValueError:
        return []

    values: list[str] = []
    for line in lines[index + 1:]:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.startswith("==="):
            break
        values.append(stripped)
    return values


class AdvancedDocumentParser:
    def __init__(self) -> None:
        self.enabled = os.getenv("ENABLE_MINERU_PARSER", "false").lower() == "true"
        self.wrapper_path = os.getenv(
            "MINERU_AGENT_INGEST_PATH",
            f"{Path.home()}/projects/agent-tooling/mineru/bin/mineru-agent-ingest.sh",
        )
        self.backend = os.getenv("MINERU_DEFAULT_BACKEND", "pipeline")
        self.timeout_ms = int(os.getenv("MINERU_PARSE_TIMEOUT_MS", "180000"))

    def parse_document(self, document_path: str, project: str = "nexus") -> AdvancedDocumentParseResult:
        if not self.enabled:
            raise RuntimeError("ENABLE_MINERU_PARSER=false")
        if not Path(self.wrapper_path).exists():
            raise FileNotFoundError(f"MinerU wrapper no encontrado: {self.wrapper_path}")

        completed = subprocess.run(
            [self.wrapper_path, document_path, project, self.backend],
            capture_output=True,
            text=True,
            timeout=max(self.timeout_ms / 1000, 1),
            check=True,
        )
        output_root = _parse_output_block(completed.stdout, "=== OUTPUT_ROOT ===")
        markdown = _parse_output_block(completed.stdout, "=== MARKDOWN_CANDIDATES ===")
        json_candidates = _parse_output_block(completed.stdout, "=== JSON_CANDIDATES ===")

        if not output_root or not markdown:
            raise RuntimeError("MinerU no genero salida Markdown valida")

        return AdvancedDocumentParseResult(
            parser_engine="mineru",
            output_root=output_root[0],
            markdown_candidates=markdown,
            json_candidates=json_candidates,
        )
