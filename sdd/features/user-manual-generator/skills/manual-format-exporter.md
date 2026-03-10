# Skill: manual-format-exporter

**Skill ID:** manual-format-exporter
**Feature:** ANCLORA-UMG-001
**Version:** v1.0
**Type:** Export/Transform
**Runtime:** Python 3.11+

---

## 1. Purpose

Export the structured manual to professional .md and .docx formats with proper styling, branding, and layout. This skill is adapted from the existing `md-to-docx-with-covers` skill with Anclora Nexus brand customizations.

---

## 2. Inputs

| Input | Type | Required |
|-------|------|----------|
| Manual Structure (JSON) | JSON | Yes |
| Brand Config | JSON | Yes |
| Logo File | PNG | Optional |
| Output Directory | Path | Yes |

---

## 3. Outputs

- `MANUAL_USUARIO_ANCLORA_NEXUS.md` - Source markdown
- `MANUAL_USUARIO_ANCLORA_NEXUS.docx` - Styled Word document

---

## 4. Brand Configuration

```python
ANCLORA_BRAND = {
    "colors": {
        "navy": (25, 35, 80),        # RGB for #192350
        "gold": (212, 175, 55),      # RGB for #D4AF37
        "blue_light": (175, 210, 250),  # RGB for #AFD2FA
        "white_soft": (245, 245, 240)   # RGB for #F5F5F0
    },
    "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "monospace": "Fira Code"
    },
    "cover": {
        "logo_path": "public/brand/logo-nexus.png",
        "title": "Manual de Usuario",
        "subtitle": "Anclora Nexus - Intelligence Layer",
        "background_color": "navy",
        "title_color": "gold"
    },
    "footer": {
        "text": "Anclora Private Estates © 2026",
        "color": "navy"
    }
}
```

---

## 5. Export Logic

### 5.1 Markdown Export

```python
from typing import Dict, List

class MarkdownExporter:
    def __init__(self, manual_structure: Dict):
        self.manual = manual_structure
        self.output_lines = []

    def export(self, output_path: str):
        """Export to markdown"""
        self.add_frontmatter()
        self.add_content()
        self.write_file(output_path)

    def add_frontmatter(self):
        """Add YAML frontmatter"""
        meta = self.manual["metadata"]
        self.output_lines.extend([
            "---",
            f"title: {meta['title']}",
            f"version: {meta['version']}",
            f"date: {meta['date']}",
            f"language: {meta['language']}",
            f"status: {meta['status']}",
            "---",
            ""
        ])

    def add_content(self):
        """Add all sections"""
        self.output_lines.append(f"# {self.manual['metadata']['title']}\n")

        for section in self.manual["sections"]:
            self.add_section(section)

    def add_section(self, section: Dict):
        """Add a section with subsections"""
        level = section["level"]
        heading_prefix = "#" * level

        self.output_lines.append(f"{heading_prefix} {section['title']}\n")

        if section.get("content"):
            self.output_lines.append(f"{section['content']}\n")

        for subsection in section.get("subsections", []):
            self.add_section(subsection)

    def write_file(self, output_path: str):
        """Write to file"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(self.output_lines))
```

### 5.2 DOCX Export

```python
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

class DocxExporter:
    def __init__(self, manual_structure: Dict, brand_config: Dict):
        self.manual = manual_structure
        self.brand = brand_config
        self.doc = Document()

    def export(self, output_path: str):
        """Export to DOCX with branding"""
        self.setup_styles()
        self.add_cover_page()
        self.add_toc()
        self.add_content()
        self.add_footer()
        self.doc.save(output_path)

    def setup_styles(self):
        """Apply brand styles to document"""
        styles = self.doc.styles

        # Heading 1: Navy + Playfair Display
        h1 = styles['Heading 1']
        h1.font.name = self.brand["fonts"]["heading"]
        h1.font.size = Pt(18)
        h1.font.color.rgb = RGBColor(*self.brand["colors"]["navy"])

        # Heading 2: Navy + Playfair Display
        h2 = styles['Heading 2']
        h2.font.name = self.brand["fonts"]["heading"]
        h2.font.size = Pt(14)
        h2.font.color.rgb = RGBColor(*self.brand["colors"]["navy"])

        # Body: Inter
        body = styles['Normal']
        body.font.name = self.brand["fonts"]["body"]
        body.font.size = Pt(11)

    def add_cover_page(self):
        """Add branded cover page"""
        cover = self.brand["cover"]

        # Add logo
        if os.path.exists(cover["logo_path"]):
            self.doc.add_picture(cover["logo_path"], width=Inches(2))
            last_paragraph = self.doc.paragraphs[-1]
            last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

        # Title
        title = self.doc.add_paragraph()
        title_run = title.add_run(cover["title"])
        title_run.font.name = self.brand["fonts"]["heading"]
        title_run.font.size = Pt(36)
        title_run.font.color.rgb = RGBColor(*self.brand["colors"]["gold"])
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER

        # Subtitle
        subtitle = self.doc.add_paragraph()
        subtitle_run = subtitle.add_run(cover["subtitle"])
        subtitle_run.font.name = self.brand["fonts"]["body"]
        subtitle_run.font.size = Pt(16)
        subtitle_run.font.color.rgb = RGBColor(*self.brand["colors"]["navy"])
        subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER

        # Version and date
        meta = self.manual["metadata"]
        version_para = self.doc.add_paragraph()
        version_para.add_run(f"Versión {meta['version']} | {meta['date']}")
        version_para.alignment = WD_ALIGN_PARAGRAPH.CENTER

        # Page break
        self.doc.add_page_break()

    def add_toc(self):
        """Add Table of Contents"""
        self.doc.add_heading("Tabla de Contenido", 1)
        paragraph = self.doc.add_paragraph()
        run = paragraph.add_run()
        fldChar = OxmlElement('w:fldChar')
        fldChar.set(qn('w:fldCharType'), 'begin')
        run._r.append(fldChar)

        instrText = OxmlElement('w:instrText')
        instrText.set(qn('xml:space'), 'preserve')
        instrText.text = 'TOC \\o "1-3" \\h \\z \\u'
        run._r.append(instrText)

        fldChar = OxmlElement('w:fldChar')
        fldChar.set(qn('w:fldCharType'), 'end')
        run._r.append(fldChar)

        self.doc.add_page_break()

    def add_content(self):
        """Add all manual sections"""
        for section in self.manual["sections"]:
            self.add_section(section)

    def add_section(self, section: Dict):
        """Add section to document"""
        level = section["level"]
        self.doc.add_heading(section["title"], level=level)

        if section.get("content"):
            self.doc.add_paragraph(section["content"])

        for subsection in section.get("subsections", []):
            self.add_section(subsection)

    def add_footer(self):
        """Add footer to all pages"""
        section = self.doc.sections[0]
        footer = section.footer
        footer_para = footer.paragraphs[0]
        footer_para.text = self.brand["footer"]["text"]
        footer_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
```

---

## 6. Dependencies

```python
# requirements.txt
python-docx>=0.8.11
Pillow>=9.0.0  # For image handling
lxml>=4.9.0     # For XML manipulation
```

---

## 7. Execution Example

```bash
# Export manual
python skills/manual-format-exporter/export.py \
  --input manual-structure.json \
  --output-dir public/docs/manual-usuario \
  --formats md,docx

# Outputs:
# - public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.md
# - public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.docx
```

---

## 8. Testing

```python
def test_markdown_export():
    manual = load_mock_manual_structure()
    exporter = MarkdownExporter(manual)
    output_path = "/tmp/test_manual.md"
    exporter.export(output_path)

    assert os.path.exists(output_path)
    with open(output_path, "r") as f:
        content = f.read()
        assert "# Manual de Usuario: Anclora Nexus" in content
        assert "## Introducción" in content

def test_docx_export():
    manual = load_mock_manual_structure()
    exporter = DocxExporter(manual, ANCLORA_BRAND)
    output_path = "/tmp/test_manual.docx"
    exporter.export(output_path)

    assert os.path.exists(output_path)
    assert os.path.getsize(output_path) > 10000  # Non-empty document
```

---

**Adaptation Note:** This skill is adapted from `md-to-docx-with-covers` in `Anclora-Agents-Skills/skills/` with Anclora Nexus brand customizations.
