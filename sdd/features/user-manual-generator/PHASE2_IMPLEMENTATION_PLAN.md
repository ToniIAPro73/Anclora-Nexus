# ANCLORA-UMG-001: Phase 2 Implementation Plan

**Feature:** User Manual Generator - Enhanced Capabilities
**Phase:** 2 (Multi-format, Multi-language, Multimedia)
**Status:** Planning
**Date:** 2026-03-10

---

## Executive Summary

Phase 2 expands ANCLORA-UMG-001 with:

1. **Screenshots:** Automated UI captures via Playwright
2. **Logo Integration:** Anclora branding on cover (✅ COMPLETED)
3. **English Translation:** ES → EN with LLM + glossary
4. **Google Docs Format:** DOCX → GDocs with sharing
5. **Video Tutorials:** Screen recordings + AI voiceover

**Phase 1 (Completed):**
- ✅ Markdown manual generation (52,446 chars, 100% coverage)
- ✅ DOCX conversion with branding
- ✅ Logo integration (completed 2026-03-10)
- ✅ Feature documentation (8 documents, 2,800+ lines)

---

## Phase 2 Deliverables

| Deliverable | Priority | Effort | Status |
|-------------|----------|--------|--------|
| **Logo in DOCX cover** | P0 | 2h | ✅ DONE |
| **Screenshot automation** | P1 | 8h | 📝 Spec complete |
| **English translation** | P1 | 6h | 📝 Spec complete |
| **Google Docs upload** | P2 | 4h | 📝 Spec complete |
| **Video tutorials** | P3 | 20h | 📝 Spec complete |

**Total Estimated Effort:** 40 hours (~1 week sprint)

---

## Implementation Roadmap

### Week 1: Screenshots + Translation

#### Day 1-2: Screenshot Automation (8h)

**Objective:** Capture 17 screenshots of main UI screens

**Tasks:**
1. Install Playwright dependencies
   ```bash
   pip install playwright pillow
   playwright install chromium
   ```

2. Create test user in Supabase
   ```sql
   INSERT INTO auth.users (email, encrypted_password)
   VALUES ('test@anclora.com', crypt('test123', gen_salt('bf')));

   INSERT INTO memberships (user_id, org_id, role, status)
   VALUES ('<user_id>', '<org_id>', 'owner', 'active');
   ```

3. Implement `scripts/capture-screenshots.py` based on `screenshot-capturer.md` skill

4. Execute capture (requires local dev server running)
   ```bash
   # Terminal 1
   cd frontend && npm run dev

   # Terminal 2
   cd backend && python -m uvicorn api.main:app --reload

   # Terminal 3
   export ANCLORA_TEST_EMAIL=test@anclora.com
   export ANCLORA_TEST_PASSWORD=test123
   python3 scripts/capture-screenshots.py
   ```

5. Verify output: 17 PNG files in `public/docs/manual-usuario/assets/screenshots/`

6. Update `convert-manual-to-docx.py` to embed screenshots in relevant sections

**Output:**
- `public/docs/manual-usuario/assets/screenshots/` (17 PNGs, ~3-5 MB total)
- Updated DOCX with screenshots (~6-8 MB)

#### Day 3-4: English Translation (6h)

**Objective:** Generate `MANUAL_USUARIO_ANCLORA_NEXUS_EN.md`

**Tasks:**
1. Verify Groq API key availability
   ```bash
   echo $GROQ_API_KEY  # Should be set
   ```

2. Implement `scripts/translate-manual.py` based on `manual-translator.md` skill

3. Create glossary file `glossary-es-en.json`

4. Execute translation
   ```bash
   python3 scripts/translate-manual.py
   ```

5. Human review of translation
   - Check technical terms (FSBO, CMA, P5 Whale)
   - Verify UI component names
   - Validate tone and clarity

6. Convert EN markdown to DOCX
   ```bash
   python3 scripts/convert-manual-to-docx.py --input MANUAL_USUARIO_ANCLORA_NEXUS_EN.md --output MANUAL_USUARIO_ANCLORA_NEXUS_EN.docx --language en
   ```

**Output:**
- `MANUAL_USUARIO_ANCLORA_NEXUS_EN.md` (~52K chars)
- `MANUAL_USUARIO_ANCLORA_NEXUS_EN.docx` (with logo, ~1.5 MB)

#### Day 5: Google Docs Integration (4h)

**Objective:** Upload manuals to Google Drive for team access

**Tasks:**
1. Create Google Cloud Project
   - Enable Google Drive API
   - Create OAuth 2.0 credentials
   - Download `client_secret.json`

2. Install dependencies
   ```bash
   pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
   ```

3. Implement `scripts/upload-to-google-docs.py` based on `google-docs-converter.md` skill

4. Create Google Drive folder structure
   ```
   Anclora Nexus/
   └── Documentación/
       └── Manuales de Usuario/
           ├── MANUAL_USUARIO_ANCLORA_NEXUS_ES (Google Docs)
           └── MANUAL_USUARIO_ANCLORA_NEXUS_EN (Google Docs)
   ```

5. Upload and share with team
   ```bash
   python3 scripts/upload-to-google-docs.py --lang es
   python3 scripts/upload-to-google-docs.py --lang en
   ```

6. Configure permissions:
   - Owner: toni@anclora.com (writer)
   - Team: team@anclora.com (commenter)
   - Public: none (private)

**Output:**
- Google Docs URLs (ES + EN)
- Shared with Anclora team
- Integration in `README.md` with links

---

### Week 2: Video Tutorials (20h)

#### Day 1-2: Setup + Recording (10h)

**Tasks:**
1. Install dependencies
   ```bash
   pip install playwright opencv-python pillow moviepy elevenlabs srt
   playwright install chromium
   ```

2. Implement `scripts/generate-video-tutorial.py` based on `video-tutorial-generator.md` skill

3. Write voiceover scripts for 7 chapters (from manual sections)

4. Record screen navigation for each chapter:
   - Chapter 1: Intro + Login (1 min)
   - Chapter 2: Dashboard (3 min)
   - Chapter 3: Leads (4 min)
   - Chapter 4: Sellers (4 min)
   - Chapter 5: Intelligence (3 min)
   - Chapter 6: Prospection (4 min)
   - Chapter 7: Command Center (2 min)

5. Generate AI voiceover with ElevenLabs
   ```python
   generate_voiceover(
       script_text=chapter_script,
       output_path=f"assets/videos/audio/{chapter}_voiceover.mp3",
       voice="Adam"  # Professional male voice
   )
   ```

**Output:**
- 7 raw screen recordings (MP4)
- 7 voiceover files (MP3)

#### Day 3-4: Composition + Editing (8h)

**Tasks:**
1. Add visual annotations (highlights, arrows) with OpenCV

2. Compose video + audio with moviepy
   ```python
   video = VideoFileClip(recording_path)
   audio = AudioFileClip(voiceover_path)
   final = video.set_audio(audio)
   final.write_videofile(output_path, codec='libx264')
   ```

3. Generate subtitles (SRT) from voiceover scripts

4. Create concatenated full tutorial (21 min)

5. Export in multiple qualities:
   - 1080p (primary)
   - 720p (mobile-friendly)
   - 480p (low-bandwidth)

**Output:**
- 7 individual chapter videos
- 1 full tutorial video (concatenated)
- Subtitle files (SRT)

#### Day 5: Hosting + Documentation (2h)

**Tasks:**
1. Upload to YouTube (Unlisted playlist)
   - Playlist: "Anclora Nexus - User Manual"
   - Branding: Anclora intro/outro
   - Chapters: Add timestamps in description

2. Update manual with embedded video links
   ```markdown
   ## 3.1 Dashboard

   [▶️ Watch Video Tutorial: Dashboard Overview (3 min)](https://youtube.com/...)

   The Dashboard is your daily command center...
   ```

3. Create landing page: `public/docs/manual-usuario/videos.html`

**Output:**
- YouTube playlist URL
- Updated manual with video embeds
- Videos landing page

---

## Updated Feature Architecture

```
ANCLORA-UMG-001: User Manual Generator (Phase 1 + Phase 2)
│
├── Skills (7 total)
│   ├── manual-content-analyzer.md ✅
│   ├── manual-structure-builder.md ✅
│   ├── manual-format-exporter.md ✅
│   ├── screenshot-capturer.md ✅ (Phase 2)
│   ├── manual-translator.md ✅ (Phase 2)
│   ├── google-docs-converter.md ✅ (Phase 2)
│   └── video-tutorial-generator.md ✅ (Phase 2)
│
├── Scripts (8 total)
│   ├── generate-user-manual.py ✅
│   ├── convert-manual-to-docx.py ✅ (updated with logo)
│   ├── capture-screenshots.py ⏳ (pending)
│   ├── translate-manual.py ⏳ (pending)
│   ├── upload-to-google-docs.py ⏳ (pending)
│   └── generate-video-tutorial.py ⏳ (pending)
│
├── Outputs (Phase 1 + Phase 2)
│   ├── MANUAL_USUARIO_ANCLORA_NEXUS.md ✅
│   ├── MANUAL_USUARIO_ANCLORA_NEXUS.docx ✅ (with logo)
│   ├── MANUAL_USUARIO_ANCLORA_NEXUS_EN.md ⏳
│   ├── MANUAL_USUARIO_ANCLORA_NEXUS_EN.docx ⏳
│   ├── Google Docs (ES + EN) ⏳
│   ├── Screenshots (17 PNGs) ⏳
│   └── Video tutorials (7 chapters) ⏳
│
└── Documentation
    ├── INDEX.md ✅
    ├── spec-v1.md ✅ (requires update for Phase 2)
    ├── rules/ ✅
    ├── skills/ ✅ (7 skills)
    ├── prompts/ ✅
    ├── test-plan-v1.md ✅
    ├── COMPLETION_REPORT.md ✅ (Phase 1)
    └── PHASE2_IMPLEMENTATION_PLAN.md ✅ (this document)
```

---

## Dependencies & Prerequisites

### Software Dependencies

```bash
# Phase 1 (already installed)
pip install python-docx Pillow lxml

# Phase 2 additions
pip install playwright opencv-python moviepy elevenlabs srt
pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib
playwright install chromium
```

### External Services

| Service | Purpose | Cost | Setup Required |
|---------|---------|------|----------------|
| **Groq API** | Translation (LLM) | Free tier (limited) | API key (already exists) |
| **ElevenLabs** | AI Voiceover | $5/month (creator plan) | Sign up + API key |
| **Google Drive API** | Google Docs upload | Free | OAuth credentials |
| **YouTube** | Video hosting | Free (unlisted) | Anclora channel |

### Infrastructure

- Local dev server running (frontend + backend)
- Test user account in Supabase
- Google Cloud Project with Drive API enabled
- YouTube channel (Anclora Private Estates)

---

## Success Criteria (Phase 2)

| ID | Criterio | Target | Validation |
|----|----------|--------|------------|
| SC2-1 | Screenshot coverage | 17 screens captured | File count in assets/screenshots/ |
| SC2-2 | Screenshot quality | 1920x1080 PNG | File inspection |
| SC2-3 | Screenshots in DOCX | All 17 embedded | Manual review of DOCX |
| SC2-4 | Logo in cover | Visible, centered, 3" width | DOCX inspection |
| SC2-5 | English translation | 50K+ chars, 100% coverage | File size + manual review |
| SC2-6 | Translation quality | 85%+ accuracy (human review) | QA checklist |
| SC2-7 | EN DOCX generated | With logo + branding | File exists + inspection |
| SC2-8 | Google Docs uploaded | ES + EN accessible | URLs functional |
| SC2-9 | GDocs permissions | Team can comment | Share settings verified |
| SC2-10 | Video chapters | 7 videos, 1-4 min each | YouTube playlist |
| SC2-11 | Video quality | 1080p, clear audio | Playback test |
| SC2-12 | Video accessibility | Subtitles (SRT) | YouTube CC enabled |

**Target:** 12/12 criteria met (100%)

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Playwright auth fails | High | Medium | Detailed setup docs, fallback manual screenshots |
| LLM translation quota exceeded | Medium | Low | Use Groq free tier carefully, batch translations |
| ElevenLabs voice quality poor | Medium | Low | Test voices before full production |
| Google API OAuth complexity | High | Medium | Step-by-step setup guide, service account option |
| Video file sizes too large | Low | Medium | Multi-quality exports, YouTube hosting |
| Time overrun (40h → 60h) | Medium | High | Prioritize P0/P1, defer P3 if needed |

---

## Team Responsibilities

| Task | Owner | Support | Deadline |
|------|-------|---------|----------|
| Screenshots implementation | Dev Team | Toni (test account) | Week 1 |
| Translation implementation | Dev Team | - | Week 1 |
| Translation QA (human review) | Toni / bilingual user | - | Week 1 |
| Google Docs setup | Dev Team | Toni (GCloud admin) | Week 1 |
| Video script writing | Toni / Content lead | - | Week 2 |
| Video recording + editing | Dev Team | - | Week 2 |
| Video hosting + distribution | Toni | - | Week 2 |

---

## Acceptance & Sign-Off

### Phase 2 Completion Checklist

Before marking Phase 2 as complete:

- [ ] All 5 new skills documented
- [ ] All 4 new scripts implemented and tested
- [ ] EN manual generated and reviewed
- [ ] Google Docs uploaded and shared
- [ ] Screenshots captured (17 files)
- [ ] Screenshots embedded in DOCX
- [ ] Logo visible on all DOCX covers (ES + EN)
- [ ] Video tutorials recorded (7 chapters)
- [ ] Videos uploaded to YouTube
- [ ] Updated COMPLETION_REPORT.md with Phase 2 results
- [ ] Updated spec-v1.md with Phase 2 capabilities

### Approval

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| **Product Owner** | Toni Amengual | _Pendiente_ | - |
| **Tech Lead** | _TBD_ | _Pendiente_ | - |
| **QA** | _TBD_ | _Pendiente_ | - |

---

## Future Phases (Phase 3+)

### Phase 3: Automation & CI/CD
- Auto-regenerate manual on UI changes (git hook)
- Screenshot comparison (visual regression)
- Translation memory for incremental updates
- Video auto-update when screens change

### Phase 4: Interactive Features
- In-app tooltips linked to manual sections
- Searchable video transcripts
- Interactive quizzes per chapter
- User feedback loop (comments → manual improvements)

### Phase 5: Scale & Localization
- German translation (DE)
- Russian translation (RU)
- Multi-brand support (white-label manual)
- PDF export with print-ready layout

---

## Budget Estimate

| Item | Cost | Frequency |
|------|------|-----------|
| ElevenLabs (AI voiceover) | $5/month | Monthly |
| Groq API (translation) | $0 (free tier) | One-time |
| Google Cloud (Drive API) | $0 (free tier) | Free |
| YouTube hosting | $0 | Free |
| **Total Monthly** | **$5** | - |
| **Total One-time Setup** | **$0** | - |

**ROI:** Manual reduces onboarding time by 75% (~3 hours saved per new user) → $300-500 value per user.

---

## Summary

**Phase 2 Status:**
- ✅ Logo integration: COMPLETED (2026-03-10)
- 📝 Screenshots: Specification complete, implementation ready
- 📝 Translation: Specification complete, implementation ready
- 📝 Google Docs: Specification complete, requires Google Cloud setup
- 📝 Videos: Specification complete, requires production time

**Recommendation:** Prioritize Screenshots + Translation (Week 1), defer Videos to future sprint if bandwidth limited.

**Next Steps:**
1. Review and approve this plan
2. Allocate 40 hours development time (1 week sprint)
3. Set up external services (ElevenLabs, Google Cloud)
4. Begin implementation following roadmap

---

**© 2026 Anclora Private Estates. Internal Use Only.**

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
