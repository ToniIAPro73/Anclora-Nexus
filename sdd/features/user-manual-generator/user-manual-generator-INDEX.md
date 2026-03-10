# Feature: User Manual Generator

**Feature ID:** ANCLORA-UMG-001
**Version:** v2.0 (Phase 1 Complete + Phase 2 Planned)
**Status:** ✅ Phase 1 Complete | 📝 Phase 2 Planned
**Owner:** System Documentation
**Priority:** High
**Target Release:** Q2 2026

---

## 1. Feature Overview

### Purpose
Provide a comprehensive, automatically updatable user manual for Anclora Nexus that covers all sidebar options, header components, and application functionality in both Markdown and DOCX formats.

### Business Value
- Reduces onboarding time for new users
- Maintains up-to-date documentation as features evolve
- Provides professional documentation for stakeholders
- Supports self-service user training

### Scope

#### Phase 1 (✅ Completed)
- ✅ Automated analysis of sidebar menu structure
- ✅ Documentation of all dashboard pages and components
- ✅ Header functionality documentation
- ✅ Role-based usage guides
- ✅ Common troubleshooting scenarios
- ✅ Export to .md and .docx formats
- ✅ Logo integration in DOCX cover

#### Phase 2 (📝 Planned - 40h effort)
- 📸 Screenshots automation (Playwright)
- 🌐 English translation (ES → EN with LLM)
- 📄 Google Docs format export
- 🎥 Video tutorials (7 chapters, ~21 min total)

#### Out of Scope
- API documentation (covered by OpenAPI spec)
- Developer documentation (covered by architecture.md)
- CI/CD automation (deferred to Phase 3)

---

## 2. Key Components

### Skills

#### Phase 1 (✅ Implemented)
1. **manual-content-analyzer** - Analyzes codebase to extract functionality
2. **manual-structure-builder** - Builds hierarchical manual structure
3. **manual-format-exporter** - Exports to .md and .docx with professional styling

#### Phase 2 (📝 Specified)
4. **screenshot-capturer** - Automated UI captures via Playwright
5. **manual-translator** - ES → EN translation with LLM + glossary
6. **google-docs-converter** - DOCX → Google Docs with sharing
7. **video-tutorial-generator** - Screen recordings + AI voiceover

### Rules
- Manual must be regenerated when sidebar structure changes
- Content must match actual implemented functionality
- Must support es/en/de/ru localization paths
- DOCX must follow brand guidelines (Navy/Gold palette)

### Outputs

#### Phase 1 (✅ Generated)
- ✅ `MANUAL_USUARIO_ANCLORA_NEXUS.md` (53 KB, 52,446 chars)
- ✅ `MANUAL_USUARIO_ANCLORA_NEXUS.docx` (1.5 MB with logo)
- ✅ `README.md` (documentation)

#### Phase 2 (⏳ Pending)
- ⏳ `MANUAL_USUARIO_ANCLORA_NEXUS_EN.md` (English version)
- ⏳ `MANUAL_USUARIO_ANCLORA_NEXUS_EN.docx` (English with logo)
- ⏳ `assets/screenshots/` (17 PNG files, ~3-5 MB)
- ⏳ `assets/videos/` (7 MP4 chapters, ~500 MB)
- ⏳ Google Docs URLs (ES + EN)

---

## 3. Document Map

### Core Documents
- [Spec v1](./user-manual-generator-spec-v1.md) - Full technical specification (Phase 1)
- [Test Plan v1](./user-manual-generator-test-plan-v1.md) - Validation criteria
- [Completion Report](./COMPLETION_REPORT.md) - Phase 1 completion summary
- [Phase 2 Implementation Plan](./PHASE2_IMPLEMENTATION_PLAN.md) - Roadmap for Phase 2

### Supporting Documents
- [Rules](./rules/user-manual-rules.md) - Generation and maintenance rules
- [Skills](./skills/) - 7 skill specifications (3 implemented + 4 specified)
  - ✅ manual-content-analyzer.md
  - ✅ manual-structure-builder.md
  - ✅ manual-format-exporter.md
  - 📝 screenshot-capturer.md
  - 📝 manual-translator.md
  - 📝 google-docs-converter.md
  - 📝 video-tutorial-generator.md
- [Prompts](./prompts/user-manual-prompt.md) - Prompt templates

---

## 4. Dependencies

### Technical Dependencies
- Sidebar.tsx (source of menu structure)
- frontend/src/app/(dashboard)/**/page.tsx (page implementations)
- Header.tsx (header components)
- Existing skill: `md-to-docx-with-covers` (adapted for export)

### Business Dependencies
- Content design and localization governance (ANCLORA-CDLG-001)
- Brand guidelines (Navy #192350, Gold #D4AF37)

---

## 5. Success Criteria

### Phase 1 (✅ Complete)
- [x] Manual covers 100% of sidebar options (17 menu items)
- [x] Manual covers 100% of header components (6 components)
- [x] Manual includes role-based usage guides (owner, manager, agent)
- [x] .md and .docx exports generated successfully
- [x] DOCX follows brand styling
- [x] Logo integrated in DOCX cover
- [x] Manual is maintainable and updatable automatically

### Phase 2 (⏳ Pending)
- [ ] Screenshots captured (17 screens)
- [ ] Screenshots embedded in DOCX
- [ ] English translation generated (ES → EN)
- [ ] EN DOCX with branding
- [ ] Google Docs uploaded (ES + EN)
- [ ] Video tutorials recorded (7 chapters)
- [ ] Videos hosted on YouTube

---

## 6. Related Features

- **ANCLORA-CDLG-001** - Content Design and Localization Governance
- **ANCLORA-RSWV-001** - Role Scoped Workspace Visibility
- **All dashboard features** - Source material for documentation

---

## 7. Status History

| Date | Version | Status | Notes |
|------|---------|--------|-------|
| 2026-03-10 | v1.0 | Specification Complete | Initial feature creation, Phase 1 |
| 2026-03-10 | v1.1 | Phase 1 Complete | Manual generated (MD + DOCX), logo integrated |
| 2026-03-10 | v2.0 | Phase 2 Planned | 4 new skills specified, 40h implementation roadmap |

---

## 8. Implementation Status

### Phase 1: ✅ COMPLETE (2026-03-10)

**Deliverables:**
- [x] Manual ES (MD): 53 KB, 52,446 chars
- [x] Manual ES (DOCX): 1.5 MB with logo
- [x] 3 skills documented
- [x] 2 scripts implemented
- [x] Complete feature documentation

**Effort:** ~30 hours

### Phase 2: 📝 PLANNED (Q2 2026)

**Deliverables:**
- [ ] Screenshots (17 files)
- [ ] Manual EN (MD + DOCX)
- [ ] Google Docs (ES + EN)
- [ ] Video tutorials (7 chapters)
- [ ] 4 new skills specified
- [ ] 4 new scripts to implement

**Estimated Effort:** ~40 hours (1 week sprint)

**Budget:** $5/month (ElevenLabs voiceover)

---

**Next Steps for Phase 2:**
1. Approve Phase 2 implementation plan
2. Allocate 40 hours dev time (1 week)
3. Set up external services (ElevenLabs, Google Cloud)
4. Implement screenshots + translation (Week 1 priority)
5. Defer videos if bandwidth limited

---

**Last Updated:** 2026-03-10
