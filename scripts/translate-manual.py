#!/usr/bin/env python3
"""
Traducción del Manual de Usuario de Anclora Nexus ES → EN
Implementa la skill manual-translator.md usando Groq LLM
"""

import os
import re
import time
from pathlib import Path
from groq import Groq
from typing import List, Dict, Tuple

# Configuración
GROQ_MODEL = "llama-3.3-70b-versatile"  # Updated model (llama-3.1 was decommissioned)
MAX_CHUNK_SIZE = 2000  # caracteres por chunk
PROTECTED_PATTERNS = [
    r'\*\*.*?\*\*',  # Bold
    r'\[.*?\]\(.*?\)',  # Links
    r'`.*?`',  # Inline code
    r'```[\s\S]*?```',  # Code blocks
    r'#{1,6}\s',  # Headings
]

# Glosario técnico (términos que NO deben traducirse o tienen traducción específica)
GLOSSARY = {
    "Anclora Nexus": "Anclora Nexus",
    "Intelligence Layer": "Intelligence Layer",
    "Dashboard": "Dashboard",
    "Lead": "Lead",
    "Leads": "Leads",
    "Pipeline": "Pipeline",
    "Seller": "Seller",
    "Sellers": "Sellers",
    "Opportunity Ranking": "Opportunity Ranking",
    "StateFox Bridge": "StateFox Bridge",
    "Command Center": "Command Center",
    "Deal Margin Simulator": "Deal Margin Simulator",
    "Source Observatory": "Source Observatory",
    "Feed Orchestrator": "Feed Orchestrator",
    "Data Quality": "Data Quality",
    "Ingestion": "Ingestion",
    "Prospection": "Prospection",
    "Tasks": "Tasks",
    "Team": "Team",
    "Properties": "Properties",
    "Intelligence": "Intelligence",
    "Automation & Alerting": "Automation & Alerting",
}

class ManualTranslator:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY not found in environment")

        self.client = Groq(api_key=self.api_key)
        self.chunks_translated = 0
        self.total_tokens_used = 0

    def split_into_chunks(self, content: str) -> List[str]:
        """Divide el contenido en chunks manejables"""
        # Dividir por secciones (## encabezados)
        sections = re.split(r'(^##\s+.*$)', content, flags=re.MULTILINE)

        chunks = []
        current_chunk = ""

        for section in sections:
            # Si añadir esta sección no excede el límite, agregar
            if len(current_chunk) + len(section) < MAX_CHUNK_SIZE:
                current_chunk += section
            else:
                # Guardar chunk actual y empezar uno nuevo
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                current_chunk = section

        # Añadir último chunk
        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        return chunks

    def protect_content(self, text: str) -> Tuple[str, Dict[str, str]]:
        """Protege elementos markdown que no deben traducirse"""
        protected = {}
        modified_text = text

        for i, pattern in enumerate(PROTECTED_PATTERNS):
            matches = re.finditer(pattern, modified_text)
            for j, match in enumerate(matches):
                placeholder = f"__PROTECTED_{i}_{j}__"
                protected[placeholder] = match.group(0)
                modified_text = modified_text.replace(match.group(0), placeholder, 1)

        return modified_text, protected

    def restore_content(self, text: str, protected: Dict[str, str]) -> str:
        """Restaura elementos protegidos"""
        restored = text
        for placeholder, original in protected.items():
            restored = restored.replace(placeholder, original)
        return restored

    def translate_chunk(self, chunk: str, chunk_number: int, total_chunks: int) -> str:
        """Traduce un chunk usando Groq"""
        print(f"   📝 Traduciendo chunk {chunk_number}/{total_chunks}... ({len(chunk)} chars)", end="", flush=True)

        # Proteger contenido markdown
        protected_chunk, protected_map = self.protect_content(chunk)

        # Construir prompt con glosario
        glossary_str = "\n".join([f"- {es} → {en}" for es, en in GLOSSARY.items()])

        prompt = f"""You are a professional translator specializing in technical documentation for real estate software.

Translate the following Spanish text to English. This is part of a user manual for Anclora Nexus, a real estate intelligence platform.

IMPORTANT RULES:
1. Maintain markdown formatting exactly (headings, lists, bold, links, code blocks)
2. Preserve technical terms from the glossary below
3. Use professional, clear English suitable for software documentation
4. Keep the tone professional but accessible
5. Do NOT translate placeholder tokens like __PROTECTED_X_Y__

GLOSSARY (DO NOT TRANSLATE THESE TERMS):
{glossary_str}

TEXT TO TRANSLATE:

{protected_chunk}

Provide ONLY the English translation, no explanations or comments."""

        try:
            # Llamar a Groq API
            response = self.client.chat.completions.create(
                model=GROQ_MODEL,
                messages=[
                    {"role": "system", "content": "You are a professional technical translator."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=4000,
            )

            translated = response.choices[0].message.content.strip()

            # Restaurar contenido protegido
            restored = self.restore_content(translated, protected_map)

            # Tracking
            self.chunks_translated += 1
            tokens_used = response.usage.total_tokens
            self.total_tokens_used += tokens_used

            print(f" ✅ ({tokens_used} tokens)")

            # Rate limiting (Groq: 30 req/min)
            time.sleep(2)

            return restored

        except Exception as e:
            print(f" ❌ Error: {e}")
            return chunk  # Return original on error

    def translate_manual(self, source_path: str, target_path: str):
        """Traduce el manual completo"""
        print(f"🔄 Leyendo manual ES: {source_path}")

        with open(source_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extraer frontmatter
        frontmatter = ""
        body = content
        if content.startswith("---"):
            parts = content.split("---", 2)
            if len(parts) >= 3:
                frontmatter = parts[1].strip()
                body = parts[2].strip()

        print(f"📊 Contenido: {len(body):,} caracteres")

        # Dividir en chunks
        chunks = self.split_into_chunks(body)
        print(f"📦 Dividido en {len(chunks)} chunks")
        print()

        # Traducir cada chunk
        translated_chunks = []
        for i, chunk in enumerate(chunks, 1):
            translated = self.translate_chunk(chunk, i, len(chunks))
            translated_chunks.append(translated)

        # Ensamblar documento traducido
        translated_body = "\n\n".join(translated_chunks)

        # Traducir frontmatter
        translated_frontmatter = frontmatter.replace("language: es", "language: en")
        translated_frontmatter = translated_frontmatter.replace("Manual de Usuario", "User Manual")

        # Construir documento final
        if translated_frontmatter:
            translated_content = f"---\n{translated_frontmatter}\n---\n\n{translated_body}"
        else:
            translated_content = translated_body

        # Guardar
        print(f"\n💾 Guardando traducción: {target_path}")
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(translated_content)

        # Verificar tamaño
        size = os.path.getsize(target_path)
        print(f"✅ Traducción completada!")
        print(f"   Chunks traducidos: {self.chunks_translated}")
        print(f"   Tokens usados: {self.total_tokens_used:,}")
        print(f"   Tamaño archivo: {size:,} bytes ({size/1024:.1f} KB)")


def main():
    print("=" * 60)
    print("🌍 TRADUCCIÓN DE MANUAL DE USUARIO ES → EN")
    print("=" * 60)
    print()

    # Rutas
    base_dir = "/home/dev/proyectos/anclora-nexus"
    source_path = f"{base_dir}/public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.md"
    target_path = f"{base_dir}/public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS_EN.md"

    # Verificar archivo fuente
    if not os.path.exists(source_path):
        print(f"❌ Error: No se encontró el archivo fuente: {source_path}")
        return

    # Verificar API key
    if not os.getenv("GROQ_API_KEY"):
        print("❌ Error: GROQ_API_KEY no encontrada en el entorno")
        print("   Ejecuta: export GROQ_API_KEY=your_key_here")
        return

    # Ejecutar traducción
    translator = ManualTranslator()
    translator.translate_manual(source_path, target_path)

    print("\n" + "=" * 60)
    print("✨ Traducción completada!")
    print("=" * 60)
    print()
    print("📋 Próximos pasos:")
    print("   1. Revisar traducción manualmente")
    print("   2. Generar DOCX EN con: python3 scripts/convert-manual-to-docx.py --lang en")
    print()


if __name__ == "__main__":
    main()
