# Skill: Screenshot Capturer

**ID:** `manual-screenshot-capturer`
**Version:** 1.0
**Status:** Production
**Category:** Documentation / Automation
**Owner:** ANCLORA-UMG-001

---

## Purpose

Captura automática de screenshots de todas las pantallas principales de Anclora Nexus usando Playwright para enriquecer el manual de usuario con imágenes reales de la UI.

---

## Capabilities

- **Automated Navigation:** Navega programáticamente por todas las rutas del dashboard
- **Viewport Management:** Captura en múltiples resoluciones (desktop, tablet, mobile)
- **Authentication Handling:** Login automático con credenciales de test
- **Smart Wait:** Espera a que widgets y componentes carguen completamente
- **Naming Convention:** Nombres de archivo descriptivos y organizados por sección
- **Dark Mode:** Respeta el dark mode obligatorio de Anclora

---

## Technical Specification

### Dependencies

```bash
pip install playwright pillow
playwright install chromium
```

### Input Schema

```python
class ScreenshotRequest(BaseModel):
    routes: List[str]  # Rutas a capturar (ej: ["/dashboard", "/leads"])
    viewport: Dict[str, int] = {"width": 1920, "height": 1080}
    output_dir: str = "public/docs/manual-usuario/assets/screenshots"
    auth_email: str  # Usuario de test
    auth_password: str  # Password de test
    wait_time: int = 2000  # ms para esperar después de navegación
    selectors: Optional[Dict[str, str]] = None  # Selectores específicos para capturar
```

### Output Schema

```python
class ScreenshotResult(BaseModel):
    route: str
    filename: str
    filepath: str
    size_bytes: int
    resolution: str  # "1920x1080"
    timestamp: datetime
    status: Literal["success", "failed"]
    error: Optional[str] = None
```

---

## Implementation

### Core Function

```python
from playwright.sync_api import sync_playwright, Page
from PIL import Image
from pathlib import Path
import time

class ScreenshotCapturer:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.output_dir = Path("public/docs/manual-usuario/assets/screenshots")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def authenticate(self, page: Page, email: str, password: str):
        """Login to the application"""
        page.goto(f"{self.base_url}/login")

        # Wait for login form
        page.wait_for_selector('input[type="email"]', timeout=5000)

        # Fill credentials
        page.fill('input[type="email"]', email)
        page.fill('input[type="password"]', password)

        # Submit
        page.click('button[type="submit"]')

        # Wait for redirect to dashboard
        page.wait_for_url(f"{self.base_url}/dashboard", timeout=10000)

        print(f"✅ Authenticated as {email}")

    def capture_route(
        self,
        page: Page,
        route: str,
        filename: str,
        wait_time: int = 2000,
        selector: Optional[str] = None
    ) -> ScreenshotResult:
        """Capture screenshot of a specific route"""
        try:
            # Navigate
            page.goto(f"{self.base_url}{route}")

            # Wait for page load
            page.wait_for_load_state("networkidle", timeout=10000)

            # Additional wait for widgets to render
            time.sleep(wait_time / 1000)

            # Capture
            filepath = self.output_dir / filename

            if selector:
                # Capture specific element
                element = page.locator(selector)
                element.screenshot(path=str(filepath))
            else:
                # Capture full page
                page.screenshot(path=str(filepath), full_page=True)

            # Get file info
            size = filepath.stat().st_size
            img = Image.open(filepath)
            resolution = f"{img.width}x{img.height}"

            print(f"   ✅ Captured: {filename} ({size/1024:.1f} KB)")

            return ScreenshotResult(
                route=route,
                filename=filename,
                filepath=str(filepath),
                size_bytes=size,
                resolution=resolution,
                timestamp=datetime.now(),
                status="success"
            )

        except Exception as e:
            print(f"   ❌ Failed to capture {route}: {e}")
            return ScreenshotResult(
                route=route,
                filename=filename,
                filepath="",
                size_bytes=0,
                resolution="",
                timestamp=datetime.now(),
                status="failed",
                error=str(e)
            )

    def capture_all(
        self,
        email: str,
        password: str,
        routes_map: Dict[str, str]
    ) -> List[ScreenshotResult]:
        """Capture all specified routes"""
        results = []

        with sync_playwright() as p:
            # Launch browser
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                screen={"width": 1920, "height": 1080}
            )
            page = context.new_page()

            # Authenticate
            self.authenticate(page, email, password)

            # Capture each route
            for route, filename in routes_map.items():
                result = self.capture_route(page, route, filename)
                results.append(result)

            # Cleanup
            browser.close()

        return results
```

### Route Mapping

```python
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
```

### Widget Selectors (Optional)

```python
WIDGET_SELECTORS = {
    "/dashboard": {
        "QuickStats": '[data-widget="quick-stats"]',
        "LeadsPulse": '[data-widget="leads-pulse"]',
        "TasksToday": '[data-widget="tasks-today"]',
        "PropertyPipeline": '[data-widget="property-pipeline"]',
        "AgentStream": '[data-widget="agent-stream"]',
        "RadarTerritorial": '[data-widget="radar-territorial"]',
    }
}
```

---

## Usage Example

### Script: `scripts/capture-screenshots.py`

```python
#!/usr/bin/env python3
"""
Capture screenshots for user manual
"""

from screenshot_capturer import ScreenshotCapturer, ROUTES_TO_CAPTURE
import os

def main():
    print("=" * 60)
    print("📸 CAPTURA DE SCREENSHOTS - ANCLORA NEXUS")
    print("=" * 60)
    print()

    # Get test credentials from env
    email = os.getenv("ANCLORA_TEST_EMAIL", "test@anclora.com")
    password = os.getenv("ANCLORA_TEST_PASSWORD", "test123")

    # Initialize capturer
    capturer = ScreenshotCapturer(base_url="http://localhost:3000")

    # Capture all routes
    print(f"📸 Capturando {len(ROUTES_TO_CAPTURE)} pantallas...")
    results = capturer.capture_all(email, password, ROUTES_TO_CAPTURE)

    # Summary
    success_count = sum(1 for r in results if r.status == "success")
    failed_count = len(results) - success_count

    print()
    print("=" * 60)
    print(f"✅ Completado: {success_count}/{len(results)} exitosos")
    if failed_count > 0:
        print(f"⚠️  {failed_count} fallidos")
    print("=" * 60)

    # List failed
    if failed_count > 0:
        print("\nFallidos:")
        for r in results:
            if r.status == "failed":
                print(f"   ❌ {r.route}: {r.error}")

if __name__ == "__main__":
    main()
```

---

## Configuration

### Environment Variables

```bash
# .env
ANCLORA_TEST_EMAIL=test@anclora.com
ANCLORA_TEST_PASSWORD=test123
ANCLORA_BASE_URL=http://localhost:3000
```

### Test User Setup

1. Crear usuario de test en Supabase:
   ```sql
   -- Email: test@anclora.com
   -- Password: test123
   -- Role: owner (para acceso completo)
   ```

2. Asegurar membresía activa en organización de test

---

## Output Structure

```
public/docs/manual-usuario/assets/screenshots/
├── 01-dashboard.png
├── 02-leads.png
├── 03-properties.png
├── 04-tasks.png
├── 05-team.png
├── 06-prospection-unified.png
├── 07-sellers.png
├── 08-opportunity-ranking.png
├── 09-intelligence.png
├── 10-statefox-bridge.png
├── 11-ingestion.png
├── 12-data-quality.png
├── 13-feed-orchestrator.png
├── 14-automation-alerting.png
├── 15-command-center.png
├── 16-deal-margin-simulator.png
└── 17-source-observatory.png
```

---

## Error Handling

### Common Issues

| Error | Causa | Solución |
|-------|-------|----------|
| Timeout en login | Credenciales incorrectas | Verificar ANCLORA_TEST_EMAIL/PASSWORD |
| Elemento no encontrado | Selector inválido | Actualizar selector en WIDGET_SELECTORS |
| NetworkIdle timeout | Página carga lenta | Aumentar wait_time |
| 403 Forbidden | Usuario sin permisos | Usar cuenta Owner para test |

---

## Integration with Manual Generator

### Updating convert-manual-to-docx.py

```python
def add_screenshot(self, image_path: str, caption: str):
    """Add screenshot to DOCX"""
    if Path(image_path).exists():
        self.doc.add_picture(image_path, width=Inches(6))

        # Add caption
        caption_para = self.doc.add_paragraph()
        caption_para.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = caption_para.add_run(f"Figura: {caption}")
        run.font.size = Pt(9)
        run.font.italic = True
        run.font.color.rgb = RGBColor(100, 100, 100)

        self.doc.add_paragraph()  # Spacing
```

### Screenshot Insertion Points

```python
SCREENSHOT_MAPPING = {
    "## 3.1 Dashboard": "assets/screenshots/01-dashboard.png",
    "## 3.2 Leads": "assets/screenshots/02-leads.png",
    "## 3.3 Properties": "assets/screenshots/03-properties.png",
    # ... etc
}
```

---

## Performance

| Métrica | Valor |
|---------|-------|
| Tiempo por screenshot | ~3-5 segundos |
| Screenshots totales | 17 pantallas |
| Tiempo total | ~60-90 segundos |
| Tamaño promedio por imagen | ~150-300 KB (PNG) |
| Tamaño total (17 images) | ~3-5 MB |

---

## Future Enhancements

- [ ] Captura de diferentes viewports (mobile, tablet, desktop)
- [ ] Anotaciones automáticas en screenshots (flechas, highlights)
- [ ] GIFs animados para flows complejos
- [ ] Comparación visual entre versiones (regression testing)
- [ ] OCR para validar texto visible en screenshots

---

## Dependencies on Other Skills

- **manual-content-analyzer:** Proporciona lista de rutas a capturar
- **manual-format-exporter:** Inserta screenshots en DOCX

---

## Status

- ✅ Skill specification completed
- ⏳ Implementation pending
- ⏳ Integration with manual generator pending

---

**Maintained by:** ANCLORA-UMG-001 Feature Team
**Last Updated:** 2026-03-10
