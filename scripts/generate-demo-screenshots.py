#!/usr/bin/env python3
"""
Generate demo screenshots for User Manual
(Placeholder images with route labels)
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# Colores Anclora
NAVY = (25, 35, 80)
GOLD = (212, 175, 55)
WHITE_SOFT = (245, 245, 240)
DARK_BG = (18, 18, 18)

def create_placeholder_screenshot(filename: str, title: str, width: int = 1920, height: int = 1080):
    """Create a placeholder screenshot with route label"""

    # Create image
    img = Image.new('RGB', (width, height), DARK_BG)
    draw = ImageDraw.Draw(img)

    # Try to use a better font, fallback to default
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 40)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()

    # Draw header bar (Navy)
    draw.rectangle([(0, 0), (width, 100)], fill=NAVY)

    # Draw sidebar (Navy dark)
    draw.rectangle([(0, 100), (300, height)], fill=(15, 25, 60))

    # Draw main content area
    draw.rectangle([(300, 100), (width, height)], fill=(28, 28, 28))

    # Draw Anclora Nexus title in header
    draw.text((20, 30), "ANCLORA NEXUS", fill=GOLD, font=title_font)

    # Draw route title in center
    text_bbox = draw.textbbox((0, 0), title, font=title_font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]

    x = (width + 300) // 2 - text_width // 2  # Center in main area
    y = height // 2 - text_height // 2

    draw.text((x, y), title, fill=WHITE_SOFT, font=title_font)

    # Draw subtitle
    subtitle = f"Screenshot: {filename}"
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]

    sx = (width + 300) // 2 - subtitle_width // 2
    sy = y + text_height + 40

    draw.text((sx, sy), subtitle, fill=GOLD, font=subtitle_font)

    # Draw decorative border
    draw.rectangle([(310, 110), (width - 10, height - 10)], outline=NAVY, width=3)

    return img


def main():
    print("=" * 60)
    print("🎨 GENERACIÓN DE SCREENSHOTS DEMO - ANCLORA NEXUS")
    print("=" * 60)
    print()

    output_dir = Path("public/docs/manual-usuario/assets/screenshots")
    output_dir.mkdir(parents=True, exist_ok=True)

    screenshots = {
        "01-dashboard.png": "Dashboard",
        "02-leads.png": "Leads",
        "03-properties.png": "Properties",
        "04-tasks.png": "Tasks",
        "05-team.png": "Team",
        "06-prospection-unified.png": "Prospection Operativa",
        "07-sellers.png": "Seller Pipeline",
        "08-opportunity-ranking.png": "Opportunity Ranking",
        "09-intelligence.png": "Intelligence",
        "10-statefox-bridge.png": "StateFox Bridge",
        "11-ingestion.png": "Ingestion",
        "12-data-quality.png": "Data Quality",
        "13-feed-orchestrator.png": "Feed Orchestrator",
        "14-automation-alerting.png": "Automation & Alerting",
        "15-command-center.png": "Command Center",
        "16-deal-margin-simulator.png": "Deal Margin Simulator",
        "17-source-observatory.png": "Source Observatory",
    }

    print(f"📸 Generando {len(screenshots)} screenshots demo...\n")

    total_size = 0
    for filename, title in screenshots.items():
        print(f"   🎨 Creando: {filename}...", end="", flush=True)

        img = create_placeholder_screenshot(filename, title)
        filepath = output_dir / filename
        img.save(filepath, 'PNG', optimize=True)

        size = filepath.stat().st_size
        total_size += size

        print(f" ✅ ({size/1024:.1f} KB)")

    print()
    print("=" * 60)
    print("✅ GENERACIÓN COMPLETADA")
    print("=" * 60)
    print()
    print(f"📊 Resumen:")
    print(f"   • Screenshots creados: {len(screenshots)}")
    print(f"   • Tamaño total: {total_size/1024/1024:.1f} MB")
    print(f"   • Ubicación: {output_dir}")
    print()
    print("💡 Nota:")
    print("   Estos son screenshots de demostración con placeholders.")
    print("   Para screenshots reales, usa: python3 scripts/capture-screenshots.py")
    print("   (requiere servidor local corriendo)")
    print()


if __name__ == "__main__":
    main()
