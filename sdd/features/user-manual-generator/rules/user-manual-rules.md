# User Manual Generation and Maintenance Rules

**Feature:** ANCLORA-UMG-001 - User Manual Generator
**Version:** v1.0
**Date:** 2026-03-10

---

## 1. Core Principles

### 1.1 Truth Principle
**Rule:** The manual must reflect actual implemented functionality, not planned or aspirational features.

**Implementation:**
- Extract functionality directly from source code
- Verify each documented feature exists in the codebase
- Mark "Coming Soon" features explicitly if included

**Validation:**
```bash
# Before publishing manual, verify all documented routes exist
grep -r "href:" manual.md | while read route; do
  if ! find frontend/src/app -name "page.tsx" | grep -q "$route"; then
    echo "ERROR: Documented route $route not implemented"
  fi
done
```

### 1.2 Completeness Principle
**Rule:** Every user-facing feature must be documented. No silent features.

**Coverage Checklist:**
- [x] All sidebar menu items (17 items)
- [x] All header components (6 components)
- [x] All dashboard pages (24 pages)
- [x] All major widgets (10+ widgets)
- [x] Role-based access controls

**Validation:**
```python
# Ensure all sidebar links have corresponding documentation
def validate_completeness():
    sidebar_links = extract_sidebar_links()
    documented_sections = extract_manual_sections()

    missing = [link for link in sidebar_links if link not in documented_sections]
    if missing:
        raise Exception(f"Missing documentation for: {missing}")
```

### 1.3 Clarity Principle
**Rule:** Write for end users, not developers. Use simple, actionable language.

**Guidelines:**
- ✅ "Click Dashboard to see your main panel"
- ❌ "Navigate to /dashboard route to render DashboardPage component"

**Tone:**
- Professional but approachable
- Action-oriented (verbs: click, select, enter, review)
- Avoid jargon (use "leads" not "prospection records")
- Provide context ("why" not just "how")

---

## 2. Generation Rules

### 2.1 Automated Analysis
**Rule:** Manual content must be generated from code analysis, not manual typing.

**Process:**
1. Run `manual-content-analyzer` on latest codebase
2. Extract sidebar structure from `Sidebar.tsx`
3. Map pages from `frontend/src/app/(dashboard)/**/page.tsx`
4. Identify widgets from component imports

**Cadence:**
- Run analysis on every major release
- Run on-demand when sidebar changes
- Run weekly in CI/CD pipeline (optional)

### 2.2 Structure Consistency
**Rule:** Manual structure must follow a fixed hierarchy.

**Standard Structure:**
```
1. Introducción
2. Navegación Principal
   2.1 Sidebar
   2.2 Header
3. Sección CORE
   3.1 Dashboard
   3.2 Leads
   ...
4. Sección INTELLIGENCE
   4.1 Prospection studio
   ...
5. Sección OPERATIONS
   5.1 Ingestion
   ...
6. Casos de Uso Prácticos
   6.1 Por Rol: Owner
   6.2 Por Rol: Manager
   6.3 Por Rol: Agent
7. Troubleshooting
   7.1 Errores comunes
   7.2 FAQ
```

**Enforcement:**
- Use `manual-structure-builder` with fixed template
- Reject manual edits that break structure
- Validate section order before export

### 2.3 Brand Alignment
**Rule:** DOCX exports must follow Anclora brand guidelines.

**Brand Styles:**
```python
BRAND_CONFIG = {
    "colors": {
        "primary": "#192350",     # Navy
        "accent": "#D4AF37",      # Gold
        "secondary": "#AFD2FA",   # Blue Light
        "background": "#F5F5F0"   # White Soft
    },
    "fonts": {
        "heading": "Playfair Display",
        "body": "Inter",
        "monospace": "Fira Code"
    },
    "logo": "public/brand/logo-nexus.png",
    "footer": "Anclora Private Estates © 2026"
}
```

**Application:**
- Cover page: Navy background, Gold title, logo
- Headings: Playfair Display, Navy color
- Body text: Inter, dark gray (#333)
- Code blocks: Fira Code, light gray background

---

## 3. Maintenance Rules

### 3.1 Update Triggers
**Rule:** Regenerate manual when these events occur:

| Trigger Event | Priority | Action |
|--------------|----------|--------|
| Sidebar structure change | HIGH | Immediate regeneration |
| New dashboard page added | HIGH | Regeneration within 24h |
| Major feature release | MEDIUM | Include in release checklist |
| UI/UX language change | MEDIUM | Update within week |
| Bug fix (no UI change) | LOW | No regeneration needed |

**Automation:**
```yaml
# GitHub Actions workflow
name: Manual Update Check
on:
  push:
    paths:
      - 'frontend/src/components/layout/Sidebar.tsx'
      - 'frontend/src/app/(dashboard)/**/page.tsx'
jobs:
  check-manual:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger manual regeneration
        run: |
          echo "Sidebar or pages changed. Regenerating manual..."
          npm run generate-manual
```

### 3.2 Version Control
**Rule:** Manual version must track application version.

**Format:**
```markdown
---
title: Manual de Usuario: Anclora Nexus
version: 1.2.3  # matches app version
date: 2026-03-10
status: current
---
```

**Changelog:**
```markdown
## Changelog

### v1.2.3 (2026-03-10)
- Added Seller Pipeline documentation
- Updated Intelligence section with StateFox
- Fixed screenshots for Command Center

### v1.2.2 (2026-03-05)
- Initial release
```

### 3.3 Review Process
**Rule:** Manual updates must be reviewed before publishing.

**Workflow:**
```
1. Auto-generate → 2. Tech Review → 3. UX Review → 4. Owner Approval → 5. Publish
```

**Reviewers:**
- **Tech Lead:** Verifies technical accuracy
- **UX Writer:** Verifies language clarity
- **Product Owner:** Verifies business alignment

**Timeline:** 48h max from generation to publish

---

## 4. Format Rules

### 4.1 Markdown (.md) Rules

**Purpose:** Source format for version control and editing

**Standards:**
- Use ATX-style headings (`#`, `##`, `###`)
- Use fenced code blocks with language tags
- Use tables for structured data
- Use task lists for checklists
- Keep line length < 120 characters

**Example:**
```markdown
## 3.1 Dashboard

El dashboard es tu centro de comando diario.

### Widgets Principales

| Widget | Función | Actualización |
|--------|---------|---------------|
| QuickStats | Métricas rápidas | Tiempo real |
| LeadsPulse | Leads recientes | Cada 5min |

### Acciones Rápidas

- [ ] Revisar QuickStats
- [ ] Atender leads prioritarios
- [ ] Completar tareas del día
```

### 4.2 DOCX Rules

**Purpose:** Professional format for distribution

**Layout:**
- Page size: A4
- Margins: 2.5cm all sides
- Line spacing: 1.15
- Font size: 11pt body, 14-18pt headings

**Elements:**
- Cover page with logo and title
- Automatic Table of Contents (TOC)
- Page numbers (centered footer)
- Headers with chapter name
- Footer with copyright notice

**Quality Checks:**
```python
def validate_docx(docx_path):
    doc = Document(docx_path)

    # Check cover exists
    assert doc.paragraphs[0].style.name == 'Cover'

    # Check TOC exists
    assert 'TOC' in [p.text for p in doc.paragraphs]

    # Check brand colors used
    for paragraph in doc.paragraphs:
        if paragraph.style.name == 'Heading 1':
            assert paragraph.runs[0].font.color.rgb == RGBColor(25, 35, 80)  # Navy
```

---

## 5. Content Rules

### 5.1 Screenshot Policy

**Rule:** Screenshots are optional but recommended for complex UI.

**Guidelines:**
- Use mock data only (no real customer data)
- Annotate with arrows/highlights for clarity
- Store in `public/docs/manual-usuario/assets/screenshots/`
- Reference in markdown: `![Dashboard view](./assets/screenshots/dashboard.png)`

**Update:** Regenerate screenshots when UI changes significantly

### 5.2 Example Data Policy

**Rule:** All examples must use fictional data.

**Approved Sample Data:**
```python
SAMPLE_DATA = {
    "owner_name": "Toni Amengual (example)",
    "lead_name": "Ana García (ejemplo)",
    "property_address": "Calle Ejemplo 123, Andratx",
    "price": "€850,000 (ejemplo)",
    "email": "ejemplo@anclora.com"
}
```

**Prohibited:**
- Real customer names/emails
- Real property addresses
- Real financial data
- Real API keys or credentials

### 5.3 Localization Rules

**Rule:** Primary language is Spanish (ES). English (EN) is secondary.

**Translation Priority:**
1. ES (Spanish) - Required
2. EN (English) - Recommended
3. DE (German) - Future
4. RU (Russian) - Future

**File Naming:**
- `MANUAL_USUARIO_ANCLORA_NEXUS.md` (ES)
- `MANUAL_USUARIO_ANCLORA_NEXUS.docx` (ES)
- `USER_MANUAL_ANCLORA_NEXUS_EN.md` (EN)
- `USER_MANUAL_ANCLORA_NEXUS_EN.docx` (EN)

---

## 6. Quality Assurance Rules

### 6.1 Pre-Publish Checklist

Before publishing manual, verify:

- [ ] All sidebar links documented
- [ ] All header components explained
- [ ] Role-based sections complete
- [ ] Screenshots updated (if applicable)
- [ ] Code examples tested
- [ ] Links valid (no 404s)
- [ ] Spelling/grammar checked
- [ ] Brand styles applied
- [ ] TOC generated
- [ ] Version number updated

### 6.2 Acceptance Criteria

**Manual is considered complete when:**
- ✅ New user can onboard without human assistance
- ✅ User can find any feature in < 2 minutes
- ✅ No reported "missing documentation" issues
- ✅ User satisfaction score > 4.5/5

**Measurement:**
- Survey new users after 1 week
- Track support tickets related to "how to use"
- Monitor time-to-first-value metric

---

## 7. Enforcement Mechanisms

### 7.1 Automated Checks (CI/CD)

```yaml
# Manual Quality Gate
name: Manual Quality Check
on:
  pull_request:
    paths:
      - 'public/docs/manual-usuario/**'
jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check completeness
        run: python scripts/check_manual_completeness.py

      - name: Check brand compliance
        run: python scripts/check_manual_branding.py

      - name: Validate links
        run: markdown-link-check public/docs/manual-usuario/*.md

      - name: Spell check
        run: cspell "public/docs/manual-usuario/**/*.md"
```

### 7.2 Manual Review (Human)

**Required Approvals:**
- 1x Tech Lead (accuracy)
- 1x Product Owner (alignment)

**Optional:**
- UX Writer (language)
- End User (usability)

---

## 8. Exception Handling

### 8.1 When Rules Can Be Broken

**Allowed exceptions:**
1. **Emergency hotfix:** Skip review for critical security fixes
2. **Backward compatibility:** Keep old section if users expect it
3. **Legal compliance:** Override brand styles if legally required

**Process:**
- Document exception in manual changelog
- Get explicit approval from Product Owner
- Set reminder to remove exception in next major version

### 8.2 Handling Incomplete Features

**If feature is partially implemented:**
```markdown
### 4.3 Advanced Matching (Beta)

⚠️ **Nota:** Esta funcionalidad está en fase beta. Algunas opciones avanzadas
estarán disponibles en la versión 1.3.

**Funcionalidad actual:**
- Matching básico por zona y presupuesto ✅
- Scoring explicable ✅

**Próximamente:**
- Matching por características detalladas (v1.3)
- IA predictiva de cierre (v1.4)
```

---

## 9. Governance

**Rule Owner:** Product Owner
**Technical Owner:** Tech Lead
**Review Cadence:** Quarterly

**Change Process:**
1. Propose rule change via GitHub Issue
2. Discuss in feature review meeting
3. Update this document if approved
4. Communicate to team

---

## 10. References

- [Content Design Governance](../../content-design-and-localization-governance/content-design-and-localization-governance-spec-v1.md)
- [Brand Guidelines](../../../../brain.md)
- [Technical Spec](../user-manual-generator-spec-v1.md)

---

**Last Updated:** 2026-03-10
**Next Review:** 2026-06-10
