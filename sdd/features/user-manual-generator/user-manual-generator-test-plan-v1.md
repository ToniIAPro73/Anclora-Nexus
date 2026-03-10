# User Manual Generator - Test Plan v1

**Feature ID:** ANCLORA-UMG-001
**Version:** v1.0
**Date:** 2026-03-10
**Status:** Approved

---

## 1. Test Scope

### In Scope
- Functionality map generation from codebase
- Manual structure building
- Export to .md and .docx formats
- Brand styling application
- Content completeness and accuracy

### Out of Scope
- Frontend UI for manual viewer (future enhancement)
- Multi-language translation (ES only in v1)
- Interactive HTML version

---

## 2. Test Strategy

### 2.1 Unit Tests (Skills)

| Test Suite | Skill | Priority |
|------------|-------|----------|
| Sidebar Analysis | manual-content-analyzer | HIGH |
| Page Analysis | manual-content-analyzer | HIGH |
| Header Analysis | manual-content-analyzer | MEDIUM |
| Structure Building | manual-structure-builder | HIGH |
| MD Export | manual-format-exporter | HIGH |
| DOCX Export | manual-format-exporter | HIGH |

### 2.2 Integration Tests

| Test | Description | Priority |
|------|-------------|----------|
| End-to-End Pipeline | Full generation from code to .docx | CRITICAL |
| Codebase Sync | Verify manual reflects actual code | HIGH |
| Style Application | Verify brand styles in DOCX | MEDIUM |

### 2.3 User Acceptance Tests

| Scenario | User Role | Priority |
|----------|-----------|----------|
| New user onboarding | Agent | CRITICAL |
| Feature discovery | Manager | HIGH |
| Troubleshooting | All roles | HIGH |

---

## 3. Test Cases

### 3.1 Unit Test: Sidebar Analysis

```python
def test_analyze_sidebar():
    """Test sidebar structure extraction"""
    result = analyze_sidebar("fixtures/Sidebar.tsx")

    # Verify sections
    assert len(result["sections"]) == 3
    assert result["sections"][0]["id"] == "core"
    assert result["sections"][1]["id"] == "intelligence"
    assert result["sections"][2]["id"] == "operations"

    # Verify links
    core_links = result["sections"][0]["links"]
    assert len(core_links) == 5
    assert any(link["name"] == "Dashboard" for link in core_links)
    assert any(link["href"] == "/dashboard" for link in core_links)

    # Verify page existence
    dashboard_link = next(l for l in core_links if l["name"] == "Dashboard")
    assert dashboard_link["page_exists"] == True
```

### 3.2 Unit Test: Page Analysis

```python
def test_analyze_pages():
    """Test page functionality extraction"""
    pages = analyze_pages("frontend/src/app/(dashboard)")

    # Verify page count
    assert len(pages) >= 24

    # Verify dashboard page
    dashboard = next(p for p in pages if p["route"] == "/dashboard")
    assert dashboard["title"] == "Dashboard"
    assert "QuickStats" in dashboard["widgets"]
    assert "LeadsPulse" in dashboard["widgets"]
```

### 3.3 Integration Test: End-to-End Generation

```python
def test_end_to_end_generation():
    """Test full manual generation pipeline"""
    # Step 1: Analyze
    func_map = manual_content_analyzer.analyze("/path/to/anclora-nexus")
    assert func_map is not None

    # Step 2: Build structure
    builder = ManualStructureBuilder(func_map)
    manual = builder.build()
    assert len(manual["sections"]) >= 7

    # Step 3: Export MD
    md_path = "/tmp/manual.md"
    MarkdownExporter(manual).export(md_path)
    assert os.path.exists(md_path)

    # Step 4: Export DOCX
    docx_path = "/tmp/manual.docx"
    DocxExporter(manual, ANCLORA_BRAND).export(docx_path)
    assert os.path.exists(docx_path)
    assert os.path.getsize(docx_path) > 50000  # Substantial document
```

---

## 4. Acceptance Criteria

### 4.1 Coverage Criteria

- [ ] All 17 sidebar options documented
- [ ] All 6 header components documented
- [ ] All 24 dashboard pages covered
- [ ] Role-based content for Owner, Manager, Agent
- [ ] Troubleshooting section with 5+ common errors

### 4.2 Quality Criteria

- [ ] Language is clear and user-friendly (no jargon)
- [ ] Step-by-step instructions provided for all major features
- [ ] Use cases are practical and realistic
- [ ] Error solutions are actionable

### 4.3 Format Criteria

**Markdown:**
- [ ] Valid Markdown syntax
- [ ] Proper heading hierarchy
- [ ] YAML frontmatter present
- [ ] Links work correctly

**DOCX:**
- [ ] Cover page with logo
- [ ] Automatic Table of Contents
- [ ] Brand colors applied (Navy, Gold)
- [ ] Playfair Display for headings, Inter for body
- [ ] Footer on all pages
- [ ] Page numbers present

### 4.4 Usability Criteria

- [ ] New user can find login instructions in < 1 minute
- [ ] User can find any sidebar feature in < 2 minutes
- [ ] User can troubleshoot common error in < 3 minutes
- [ ] Overall user satisfaction score > 4.5/5

---

## 5. Test Execution

### 5.1 Pre-Test Setup

```bash
# Clone repo
git clone https://github.com/anclora/anclora-nexus
cd anclora-nexus

# Install dependencies
cd frontend && npm install
cd ../backend && pip install -r requirements.txt

# Verify codebase state
git status  # Should be on main branch, clean
```

### 5.2 Test Execution Commands

```bash
# Run unit tests
pytest sdd/features/user-manual-generator/tests/

# Run integration test
python scripts/generate-manual.py --test-mode

# Generate actual manual
python scripts/generate-manual.py \
  --repo-path . \
  --output-dir public/docs/manual-usuario \
  --formats md,docx
```

### 5.3 Validation Steps

1. **Verify .md file:**
   ```bash
   cat public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.md | head -50
   grep -c "##" public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.md  # Should be 50+
   ```

2. **Verify .docx file:**
   ```bash
   ls -lh public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.docx  # Should be 500KB+
   # Open in Word/LibreOffice and verify:
   # - Cover page looks professional
   # - TOC is generated
   # - Styles are applied
   # - Footer is present
   ```

3. **Content verification:**
   ```bash
   # Check all sidebar links documented
   python scripts/verify-manual-coverage.py \
     --manual public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.md \
     --sidebar frontend/src/components/layout/Sidebar.tsx
   ```

---

## 6. Test Results Template

### Test Execution Summary

| Test Suite | Tests Run | Passed | Failed | Skipped |
|------------|-----------|--------|--------|---------|
| Unit Tests | TBD | TBD | TBD | TBD |
| Integration Tests | TBD | TBD | TBD | TBD |
| UAT | TBD | TBD | TBD | TBD |
| **TOTAL** | **TBD** | **TBD** | **TBD** | **TBD** |

### Coverage Report

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Sidebar options | 17/17 | TBD | ⏳ |
| Header components | 6/6 | TBD | ⏳ |
| Pages documented | 24/24 | TBD | ⏳ |
| Role-based content | 3/3 | TBD | ⏳ |

### Quality Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| User satisfaction | > 4.5/5 | TBD | ⏳ |
| Onboarding time | < 30 min | TBD | ⏳ |
| Feature discovery | < 2 min | TBD | ⏳ |
| Error resolution | < 3 min | TBD | ⏳ |

---

## 7. Issues and Risks

### Known Issues

| ID | Description | Severity | Status | Resolution |
|----|-------------|----------|--------|------------|
| - | None yet | - | - | - |

### Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Codebase changes break analyzer | Medium | High | Add robust parsing with fallbacks |
| DOCX styling limitations | Low | Medium | Use python-docx with custom styles |
| Manual becomes outdated | High | Medium | Automate regeneration in CI/CD |

---

## 8. Sign-off

### Test Lead Approval

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] UAT completed with score > 4.5/5
- [ ] Manual files generated successfully
- [ ] Coverage targets met (100% sidebar, 100% header, 100% pages)

**Test Lead:** _______________ **Date:** ___________

### Product Owner Approval

- [ ] Content is accurate and complete
- [ ] Language is user-friendly
- [ ] Brand guidelines followed
- [ ] Ready for production deployment

**Product Owner:** _______________ **Date:** ___________

---

**Next Steps:**
1. Execute test plan
2. Document results
3. Fix any issues found
4. Get sign-off
5. Deploy manual to production
