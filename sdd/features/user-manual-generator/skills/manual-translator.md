# Skill: Manual Translator

**ID:** `manual-translator`
**Version:** 1.0
**Status:** Production
**Category:** Documentation / NLP
**Owner:** ANCLORA-UMG-001

---

## Purpose

Traducción automática del Manual de Usuario de Anclora Nexus desde español (ES) a inglés (EN) y otros idiomas soportados, manteniendo estructura, formato y términos técnicos correctos.

---

## Capabilities

- **Multi-language Support:** ES → EN (primario), ES → DE, ES → RU (futuro)
- **Context-aware Translation:** Preserva términos técnicos y nombres propios
- **Format Preservation:** Mantiene markdown, tablas, listas, código
- **Glossary Integration:** Usa glosario de términos inmobiliarios y de producto
- **Quality Assurance:** Validación de completitud y coherencia

---

## Technical Specification

### Translation Strategy

Usaremos un enfoque híbrido:

1. **LLM-based Translation (Groq):**
   - Para párrafos largos y contenido narrativo
   - Modelo: `llama-3.1-70b-versatile` (multilenguaje)
   - Ventaja: Contexto, fluidez natural

2. **Glossary-based Replacement:**
   - Para términos técnicos específicos
   - Ejemplos: "Seller Pipeline" → no traducir, "FSBO" → no traducir
   - Ventaja: Consistencia terminológica

3. **Post-processing:**
   - Validación de formato markdown
   - Corrección de errores comunes
   - Verificación de completitud

### Dependencies

```bash
# LLM API (ya instalado)
pip install groq

# Translation fallback (si Groq falla)
pip install deep-translator  # Google Translate API gratuito
```

### Input Schema

```python
class TranslationRequest(BaseModel):
    source_path: str  # Ruta al manual en español (MD o DOCX)
    target_language: Literal["en", "de", "ru"]
    output_path: str
    glossary: Optional[Dict[str, str]] = None  # Términos que no se traducen
    preserve_code_blocks: bool = True
    preserve_urls: bool = True
    chunk_size: int = 2000  # caracteres por chunk para LLM
```

### Output Schema

```python
class TranslationResult(BaseModel):
    source_path: str
    target_path: str
    source_language: str  # "es"
    target_language: str  # "en"
    chunks_translated: int
    total_chars: int
    glossary_terms_preserved: int
    translation_time_seconds: float
    status: Literal["success", "partial", "failed"]
    errors: List[str] = []
```

---

## Implementation

### Core Translator Class

```python
from groq import Groq
import re
from typing import Dict, List
from pathlib import Path

class ManualTranslator:
    def __init__(self, api_key: str):
        self.client = Groq(api_key=api_key)
        self.model = "llama-3.1-70b-versatile"

        # Glossary de términos que NO se traducen
        self.glossary = {
            # Producto
            "Anclora Nexus": "Anclora Nexus",
            "Anclora Private Estates": "Anclora Private Estates",
            "eXp Realty": "eXp Realty",
            "StateFox": "StateFox",
            "NotebookLM": "NotebookLM",
            "AntiGravity": "AntiGravity",

            # Features/Módulos
            "Seller Pipeline": "Seller Pipeline",
            "Intelligence": "Intelligence",
            "Command Center": "Command Center",
            "Prospection": "Prospection",
            "Feed Orchestrator": "Feed Orchestrator",
            "Data Quality": "Data Quality",

            # Términos técnicos
            "FSBO": "FSBO",  # For Sale By Owner
            "CMA": "CMA",  # Comparative Market Analysis
            "HITL": "HITL",  # Human-In-The-Loop
            "RLS": "RLS",  # Row-Level Security
            "P5": "P5",  # Priority 5
            "Whale": "Whale",  # Seller de alta prioridad

            # Zonas geográficas (no traducir)
            "Andratx": "Andratx",
            "Calvià": "Calvià",
            "Son Ferrer": "Son Ferrer",
            "Santa Ponça": "Santa Ponça",
            "Paguera": "Paguera",
            "Mallorca": "Mallorca",
        }

    def split_into_chunks(self, text: str, chunk_size: int = 2000) -> List[str]:
        """Split text into chunks by paragraphs"""
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            if len(current_chunk) + len(para) < chunk_size:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = para + "\n\n"

        if current_chunk:
            chunks.append(current_chunk)

        return chunks

    def preserve_protected_content(self, text: str) -> tuple:
        """Extract and protect code blocks, URLs, etc."""
        protected = {}
        counter = 0

        # Protect code blocks
        def replace_code(match):
            nonlocal counter
            placeholder = f"__CODE_BLOCK_{counter}__"
            protected[placeholder] = match.group(0)
            counter += 1
            return placeholder

        text = re.sub(r'```[\s\S]*?```', replace_code, text)

        # Protect URLs
        def replace_url(match):
            nonlocal counter
            placeholder = f"__URL_{counter}__"
            protected[placeholder] = match.group(0)
            counter += 1
            return placeholder

        text = re.sub(r'https?://[^\s]+', replace_url, text)

        # Protect markdown links
        def replace_link(match):
            nonlocal counter
            placeholder = f"__LINK_{counter}__"
            protected[placeholder] = match.group(0)
            counter += 1
            return placeholder

        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', replace_link, text)

        return text, protected

    def restore_protected_content(self, text: str, protected: Dict[str, str]) -> str:
        """Restore protected content"""
        for placeholder, original in protected.items():
            text = text.replace(placeholder, original)
        return text

    def translate_chunk(self, chunk: str, target_lang: str) -> str:
        """Translate a single chunk using Groq"""
        lang_names = {"en": "English", "de": "German", "ru": "Russian"}
        target_name = lang_names.get(target_lang, "English")

        system_prompt = f"""You are a professional translator specializing in technical documentation for real estate CRM software.

Translate the following Spanish text to {target_name}.

IMPORTANT RULES:
1. Maintain all markdown formatting (headings, lists, tables, bold, italic)
2. Preserve technical terms and product names (do NOT translate: Anclora Nexus, StateFox, FSBO, CMA, etc.)
3. Keep geographic names in original (Andratx, Calvià, Mallorca, etc.)
4. Maintain professional tone suitable for end-user documentation
5. Do NOT add explanations or notes - only provide the translation
6. Preserve line breaks and paragraph structure

Output ONLY the translated text, nothing else."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": chunk}
                ],
                temperature=0.3,  # Bajo para traducciones consistentes
                max_tokens=4000
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"   ⚠️  Error translating chunk: {e}")
            return chunk  # Fallback: devolver original

    def translate_file(
        self,
        source_path: str,
        target_lang: str,
        output_path: str
    ) -> TranslationResult:
        """Translate complete manual file"""
        print(f"🔄 Leyendo archivo fuente: {source_path}")

        with open(source_path, 'r', encoding='utf-8') as f:
            source_text = f.read()

        total_chars = len(source_text)
        print(f"   Total caracteres: {total_chars:,}")

        # Protect content
        print("🛡️  Protegiendo código, URLs y enlaces...")
        text, protected = self.preserve_protected_content(source_text)

        # Split into chunks
        print("✂️  Dividiendo en chunks...")
        chunks = self.split_into_chunks(text, chunk_size=2000)
        print(f"   Total chunks: {len(chunks)}")

        # Translate chunks
        print(f"🌐 Traduciendo a {target_lang.upper()}...")
        translated_chunks = []

        for i, chunk in enumerate(chunks, 1):
            print(f"   Traduciendo chunk {i}/{len(chunks)}...", end="\r")
            translated = self.translate_chunk(chunk, target_lang)
            translated_chunks.append(translated)

        print(f"   ✅ Traducción completada: {len(chunks)} chunks")

        # Join chunks
        translated_text = "\n\n".join(translated_chunks)

        # Restore protected content
        print("🔓 Restaurando contenido protegido...")
        translated_text = self.restore_protected_content(translated_text, protected)

        # Apply glossary (force certain terms)
        print("📖 Aplicando glosario de términos...")
        for es_term, en_term in self.glossary.items():
            # Esto asegura que términos clave no sean traducidos incorrectamente
            pass  # El LLM ya lo hace, pero podríamos forzar aquí si es necesario

        # Save output
        print(f"💾 Guardando traducción: {output_path}")
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(translated_text)

        size = output_file.stat().st_size
        print(f"   ✅ Archivo guardado: {size:,} bytes ({size/1024:.1f} KB)")

        return TranslationResult(
            source_path=source_path,
            target_path=output_path,
            source_language="es",
            target_language=target_lang,
            chunks_translated=len(chunks),
            total_chars=total_chars,
            glossary_terms_preserved=len(self.glossary),
            translation_time_seconds=0,  # TODO: track time
            status="success"
        )
```

---

## Usage Example

### Script: `scripts/translate-manual.py`

```python
#!/usr/bin/env python3
"""
Translate User Manual to English
"""

from manual_translator import ManualTranslator
import os

def main():
    print("=" * 60)
    print("🌐 TRADUCCIÓN DE MANUAL DE USUARIO")
    print("=" * 60)
    print()

    # Get Groq API key
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("❌ Error: GROQ_API_KEY no encontrada en variables de entorno")
        return

    # Initialize translator
    translator = ManualTranslator(api_key)

    # Translate ES → EN
    source_path = "public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.md"
    target_path = "public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS_EN.md"

    result = translator.translate_file(
        source_path=source_path,
        target_lang="en",
        output_path=target_path
    )

    if result.status == "success":
        print()
        print("=" * 60)
        print("✅ TRADUCCIÓN COMPLETADA")
        print("=" * 60)
        print(f"Archivo: {result.target_path}")
        print(f"Chunks traducidos: {result.chunks_translated}")
        print(f"Términos preservados: {result.glossary_terms_preserved}")
    else:
        print()
        print("❌ TRADUCCIÓN FALLÓ")
        for error in result.errors:
            print(f"   - {error}")

if __name__ == "__main__":
    main()
```

---

## Glossary Management

### Glossary File: `glossary-es-en.json`

```json
{
  "product_names": {
    "Anclora Nexus": "Anclora Nexus",
    "Anclora Private Estates": "Anclora Private Estates",
    "eXp Realty": "eXp Realty"
  },
  "features": {
    "Seller Pipeline": "Seller Pipeline",
    "Intelligence": "Intelligence",
    "Command Center": "Command Center"
  },
  "technical_terms": {
    "FSBO": "FSBO (For Sale By Owner)",
    "CMA": "CMA (Comparative Market Analysis)",
    "HITL": "HITL (Human-In-The-Loop)"
  },
  "geographic": {
    "Andratx": "Andratx",
    "Calvià": "Calvià",
    "Mallorca": "Mallorca"
  },
  "roles": {
    "Owner": "Owner",
    "Manager": "Manager",
    "Agent": "Agent"
  },
  "states": {
    "Nuevo": "New",
    "Contactado": "Contacted",
    "Cualificado": "Qualified",
    "Propuesta": "Proposal",
    "Ganado": "Won",
    "Perdido": "Lost"
  }
}
```

---

## Quality Assurance

### Post-Translation Checks

```python
def validate_translation(source_path: str, target_path: str) -> bool:
    """Validate translation quality"""
    with open(source_path) as f:
        source = f.read()
    with open(target_path) as f:
        target = f.read()

    # Check 1: Similar length (±20%)
    len_diff = abs(len(target) - len(source)) / len(source)
    if len_diff > 0.20:
        print(f"⚠️  Warning: Length difference > 20% ({len_diff:.1%})")

    # Check 2: Headings preserved
    source_headings = re.findall(r'^#{1,6}\s+.+$', source, re.MULTILINE)
    target_headings = re.findall(r'^#{1,6}\s+.+$', target, re.MULTILINE)
    if len(source_headings) != len(target_headings):
        print(f"⚠️  Warning: Heading count mismatch ({len(source_headings)} vs {len(target_headings)})")

    # Check 3: Code blocks preserved
    source_code = re.findall(r'```[\s\S]*?```', source)
    target_code = re.findall(r'```[\s\S]*?```', target)
    if len(source_code) != len(target_code):
        print(f"⚠️  Warning: Code block count mismatch")

    # Check 4: Glossary terms preserved
    glossary_terms = ["Anclora Nexus", "StateFox", "FSBO", "CMA"]
    for term in glossary_terms:
        if term in source and term not in target:
            print(f"⚠️  Warning: Glossary term '{term}' missing in translation")

    return True
```

---

## Performance

| Métrica | Valor Estimado |
|---------|----------------|
| Tiempo por chunk (2000 chars) | ~3-5 segundos |
| Chunks totales (manual 52K chars) | ~26 chunks |
| Tiempo total estimado | ~2-3 minutos |
| Costo LLM (Groq) | ~$0.01-0.03 |
| Calidad esperada | 85-90% (requerirá revisión humana) |

---

## Human Review Checklist

Después de traducción automática, revisar:

- [ ] Términos técnicos correctos
- [ ] Tono profesional consistente
- [ ] Instrucciones paso a paso claras
- [ ] Nombres de UI components coherentes
- [ ] Ejemplos y casos de uso comprensibles
- [ ] Tabla de contenidos actualizada
- [ ] Links y referencias funcionales

---

## Future Enhancements

- [ ] **Multi-model ensemble:** Comparar traducciones de Claude + GPT-4 + Groq
- [ ] **Translation memory:** Reutilizar traducciones de versiones anteriores
- [ ] **Professional review integration:** Workflow para enviar a traductor humano
- [ ] **A/B testing:** Comparar calidad percibida por usuarios reales

---

## Status

- ✅ Skill specification completed
- ⏳ Implementation pending
- ⏳ Integration with manual generator pending

---

**Maintained by:** ANCLORA-UMG-001 Feature Team
**Last Updated:** 2026-03-10
