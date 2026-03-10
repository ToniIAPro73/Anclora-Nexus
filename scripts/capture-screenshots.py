#!/usr/bin/env python3
"""
Capture screenshots for User Manual
Based on screenshot-capturer.md skill
"""

from playwright.sync_api import sync_playwright, Page
from PIL import Image
from pathlib import Path
import time
import os
import sys

class ScreenshotCapturer:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.output_dir = Path("public/docs/manual-usuario/assets/screenshots")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def authenticate(self, page: Page, email: str, password: str):
        """Login to the application"""
        print(f"🔐 Autenticando como {email}...")

        page.goto(f"{self.base_url}/login")

        try:
            # Wait for login form
            page.wait_for_selector('input[type="email"]', timeout=5000)

            # Fill credentials
            page.fill('input[type="email"]', email)
            page.fill('input[type="password"]', password)

            # Submit
            page.click('button[type="submit"]')

            # Wait for redirect to dashboard
            page.wait_for_url(f"{self.base_url}/dashboard", timeout=10000)

            print(f"   ✅ Autenticado exitosamente")
            return True

        except Exception as e:
            print(f"   ❌ Error en autenticación: {e}")
            return False

    def capture_route(
        self,
        page: Page,
        route: str,
        filename: str,
        wait_time: int = 3000
    ) -> dict:
        """Capture screenshot of a specific route"""
        try:
            print(f"   📸 Capturando: {filename}...", end="", flush=True)

            # Navigate
            page.goto(f"{self.base_url}{route}")

            # Wait for page load
            page.wait_for_load_state("networkidle", timeout=15000)

            # Additional wait for widgets to render
            time.sleep(wait_time / 1000)

            # Capture full page
            filepath = self.output_dir / filename
            page.screenshot(path=str(filepath), full_page=True)

            # Get file info
            size = filepath.stat().st_size
            img = Image.open(filepath)
            resolution = f"{img.width}x{img.height}"

            print(f" ✅ ({size/1024:.1f} KB, {resolution})")

            return {
                "route": route,
                "filename": filename,
                "filepath": str(filepath),
                "size_bytes": size,
                "resolution": resolution,
                "status": "success"
            }

        except Exception as e:
            print(f" ❌ Error: {e}")
            return {
                "route": route,
                "filename": filename,
                "status": "failed",
                "error": str(e)
            }

    def capture_all(
        self,
        email: str,
        password: str,
        routes_map: dict
    ) -> list:
        """Capture all specified routes"""
        results = []

        with sync_playwright() as p:
            # Launch browser
            print("🌐 Iniciando navegador Chromium...")
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                screen={"width": 1920, "height": 1080}
            )
            page = context.new_page()

            # Authenticate
            if not self.authenticate(page, email, password):
                print("\n❌ No se pudo autenticar. Verifica credenciales y que el servidor esté corriendo.")
                browser.close()
                return results

            print(f"\n📸 Capturando {len(routes_map)} pantallas...\n")

            # Capture each route
            for route, filename in routes_map.items():
                result = self.capture_route(page, route, filename)
                results.append(result)

            # Cleanup
            browser.close()

        return results


# Route mapping
ROUTES_TO_CAPTURE = {
    # Core
    "/dashboard": "01-dashboard.png",
    "/leads": "02-leads.png",
    "/properties": "03-properties.png",
    "/tasks": "04-tasks.png",
    "/team": "05-team.png",

    # Intelligence
    "/prospection-unified": "06-prospection-unified.png",
    "/sellers": "07-sellers.png",
    "/opportunity-ranking": "08-opportunity-ranking.png",
    "/intelligence": "09-intelligence.png",
    "/intelligence/statefox-bridge": "10-statefox-bridge.png",

    # Operations
    "/ingestion": "11-ingestion.png",
    "/data-quality": "12-data-quality.png",
    "/feed-orchestrator": "13-feed-orchestrator.png",
    "/automation-alerting": "14-automation-alerting.png",
    "/command-center": "15-command-center.png",
    "/deal-margin-simulator": "16-deal-margin-simulator.png",
    "/source-observatory": "17-source-observatory.png",
}


def main():
    print("=" * 60)
    print("📸 CAPTURA DE SCREENSHOTS - ANCLORA NEXUS")
    print("=" * 60)
    print()

    # Check if Playwright is installed
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("❌ Error: Playwright no está instalado")
        print("\n💡 Instala con:")
        print("   pip install playwright")
        print("   playwright install chromium")
        sys.exit(1)

    # Get credentials from environment or use defaults
    email = os.getenv("ANCLORA_TEST_EMAIL")
    password = os.getenv("ANCLORA_TEST_PASSWORD")

    if not email or not password:
        print("⚠️  Variables de entorno no encontradas")
        print("\n📝 Usando credenciales por defecto (test@anclora.com)")
        print("💡 Para usar otras credenciales, configura:")
        print("   export ANCLORA_TEST_EMAIL=tu-email@anclora.com")
        print("   export ANCLORA_TEST_PASSWORD=tu-password")
        print()

        email = input("Email de usuario de test: ").strip() or "test@anclora.com"
        password = input("Password: ").strip() or "test123"

    # Check if local server is running
    base_url = os.getenv("ANCLORA_BASE_URL", "http://localhost:3000")

    print(f"\n🔍 Verificando servidor en {base_url}...")
    import urllib.request
    try:
        urllib.request.urlopen(base_url, timeout=3)
        print("   ✅ Servidor accesible")
    except Exception as e:
        print(f"   ❌ Error: Servidor no accesible")
        print(f"\n💡 Asegúrate de que el servidor esté corriendo:")
        print(f"   cd frontend && npm run dev")
        print(f"   (en otra terminal)")
        sys.exit(1)

    print()

    # Initialize capturer
    capturer = ScreenshotCapturer(base_url=base_url)

    # Capture all routes
    results = capturer.capture_all(email, password, ROUTES_TO_CAPTURE)

    # Summary
    success_count = sum(1 for r in results if r["status"] == "success")
    failed_count = len(results) - success_count

    print()
    print("=" * 60)
    print(f"✅ CAPTURA COMPLETADA")
    print("=" * 60)
    print()
    print(f"📊 Resumen:")
    print(f"   • Total: {len(results)} pantallas")
    print(f"   • Exitosas: {success_count}")
    print(f"   • Fallidas: {failed_count}")
    print()

    if success_count > 0:
        total_size = sum(r.get("size_bytes", 0) for r in results if r["status"] == "success")
        print(f"   • Tamaño total: {total_size/1024/1024:.1f} MB")
        print(f"   • Ubicación: public/docs/manual-usuario/assets/screenshots/")
        print()

    # List failed
    if failed_count > 0:
        print("⚠️  Capturas fallidas:")
        for r in results:
            if r["status"] == "failed":
                print(f"   ❌ {r['route']}: {r.get('error', 'Unknown error')}")
        print()

    print("💡 Próximo paso:")
    print("   Las screenshots se incluirán automáticamente en el DOCX")
    print("   al regenerar el manual con: python3 scripts/generate-user-manual.py")
    print()


if __name__ == "__main__":
    main()
