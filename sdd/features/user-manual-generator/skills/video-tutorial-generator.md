# Skill: Video Tutorial Generator

**ID:** `video-tutorial-generator`
**Version:** 1.0
**Status:** Specification
**Category:** Documentation / Multimedia
**Owner:** ANCLORA-UMG-001

---

## Purpose

Generación automática de video tutoriales interactivos del Manual de Usuario, con navegación guiada por la UI, voiceover generado por IA y anotaciones visuales.

---

## Capabilities

- **Screen Recording:** Navegación automatizada con Playwright
- **AI Voiceover:** Narración generada con TTS (Text-to-Speech)
- **Visual Annotations:** Highlights, arrows, tooltips en video
- **Multi-chapter:** Videos separados por módulo (Dashboard, Leads, etc.)
- **Interactive Elements:** Timestamps, capítulos, subtítulos

---

## Technical Specification

### Dependencies

```bash
# Screen recording
pip install playwright opencv-python pillow

# Video editing
pip install moviepy

# AI Voiceover
pip install elevenlabs  # o pyttsx3 para TTS local

# Subtitles
pip install srt
```

### Architecture

```
1. Script Generation (from manual markdown)
   ↓
2. Screen Recording (Playwright → MP4)
   ↓
3. Voiceover Generation (TTS → MP3)
   ↓
4. Video Composition (moviepy → final MP4)
   ↓
5. Subtitle Generation (SRT)
```

### Core Function

```python
from playwright.sync_api import sync_playwright
from moviepy.editor import VideoFileClip, AudioFileClip, concatenate_videoclips
from elevenlabs import generate, Voice
import cv2

class VideoTutorialGenerator:
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.output_dir = "public/docs/manual-usuario/assets/videos"

    def record_screen_navigation(
        self,
        route: str,
        actions: List[Dict],
        output_path: str
    ):
        """Record screen with Playwright + opencv"""
        with sync_playwright() as p:
            browser = p.chromium.launch()
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                record_video_dir=self.output_dir
            )
            page = context.new_page()

            # Navigate and perform actions
            page.goto(f"{self.base_url}{route}")

            for action in actions:
                if action['type'] == 'click':
                    page.click(action['selector'])
                elif action['type'] == 'type':
                    page.fill(action['selector'], action['text'])
                elif action['type'] == 'wait':
                    page.wait_for_timeout(action['duration'])

            context.close()
            browser.close()

    def generate_voiceover(
        self,
        script_text: str,
        output_path: str,
        voice: str = "Adam"  # ElevenLabs voice
    ):
        """Generate AI voiceover"""
        audio = generate(
            text=script_text,
            voice=Voice(voice_id="pNInz6obpgDQGcFmaJgB"),  # Adam
            model="eleven_multilingual_v2"
        )

        with open(output_path, 'wb') as f:
            f.write(audio)

    def compose_video(
        self,
        video_path: str,
        audio_path: str,
        output_path: str
    ):
        """Combine video and voiceover"""
        video = VideoFileClip(video_path)
        audio = AudioFileClip(audio_path)

        final = video.set_audio(audio)
        final.write_videofile(output_path, codec='libx264', audio_codec='aac')
```

---

## Video Structure

### Capítulos Sugeridos

| Capítulo | Duración | Contenido |
|----------|----------|-----------|
| 1. Intro | 1 min | Qué es Anclora Nexus, login |
| 2. Dashboard | 3 min | Widgets, navegación |
| 3. Leads | 4 min | Crear, gestionar, pipeline |
| 4. Sellers | 4 min | Seller Pipeline, contactar |
| 5. Intelligence | 3 min | Chat, territorial sync |
| 6. Prospection | 4 min | Cola de cierre, matches |
| 7. Command Center | 2 min | KPIs, métricas |
| **Total** | **21 min** | Tutorial completo |

---

## Voiceover Scripts

### Example: Dashboard Chapter

```
[INTRO]
Welcome to the Anclora Nexus Dashboard - your daily command center.

[SCENE: Dashboard loading]
When you log in, you'll see eight key widgets that give you complete visibility of your business.

[HIGHLIGHT: QuickStats]
The QuickStats widget shows your weekly leads, completed tasks, active properties, and conversion rate.

[HIGHLIGHT: LeadsPulse]
LeadsPulse displays your most recent leads with priority levels. Notice this lead is P5 - a Whale - which means it requires immediate attention within 15 minutes.

[CLICK: Lead detail]
Click any lead to open the detail drawer...

[Continue narration matching on-screen actions]
```

---

## Annotations

```python
def add_highlight_box(frame, x, y, width, height, color=(212, 175, 55)):
    """Add gold highlight box to frame"""
    cv2.rectangle(frame, (x, y), (x+width, y+height), color, 3)
    return frame

def add_arrow_pointer(frame, from_xy, to_xy):
    """Add arrow pointing to element"""
    cv2.arrowedLine(frame, from_xy, to_xy, (212, 175, 55), 3)
    return frame
```

---

## Output

```
public/docs/manual-usuario/assets/videos/
├── 01-intro-login.mp4
├── 02-dashboard-overview.mp4
├── 03-leads-management.mp4
├── 04-sellers-pipeline.mp4
├── 05-intelligence-center.mp4
├── 06-prospection-workflow.mp4
├── 07-command-center.mp4
└── FULL-TUTORIAL.mp4 (concatenated)
```

---

## Subtitles

```srt
1
00:00:00,000 --> 00:00:03,000
Welcome to the Anclora Nexus Dashboard

2
00:00:03,500 --> 00:00:07,000
your daily command center for real estate intelligence

3
00:00:08,000 --> 00:00:12,000
The QuickStats widget shows your weekly performance
```

---

## Performance

| Métrica | Valor Estimado |
|---------|----------------|
| Recording time per chapter | 5-10 min |
| Voiceover generation | 30-60 sec per chapter |
| Video composition | 2-5 min per chapter |
| **Total production time** | **2-3 hours (7 capítulos)** |
| File size per chapter (1080p) | ~50-100 MB |
| **Total size** | ~500-700 MB |

---

## Hosting Options

1. **YouTube (Unlisted):** Fácil, streaming, analytics
2. **Vimeo (Private):** Profesional, sin ads, mejor player
3. **Self-hosted:** Anclora server, full control
4. **LMS Platform:** Scorm package para training formal

---

## Future Enhancements

- Interactive quizzes overlaid on video
- Multi-language voiceover (EN, DE, RU)
- Auto-generated from manual updates
- User progress tracking
- Mobile-optimized versions

---

**Status:** Specification complete, requires production time investment

**Estimated Effort:** 16-20 hours for full 7-chapter series

**Last Updated:** 2026-03-10
