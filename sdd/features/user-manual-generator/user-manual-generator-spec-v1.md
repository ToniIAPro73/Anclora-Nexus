# User Manual Generator - Technical Specification v1

**Feature ID:** ANCLORA-UMG-001
**Version:** v1.0
**Date:** 2026-03-10
**Status:** Approved
**Owner:** System Documentation

---

## 1. Executive Summary

### Problem Statement
As Anclora Nexus grows in complexity with 17 sidebar menu options, 24 pages, and 100+ endpoints, users need comprehensive documentation to understand and use all available functionality effectively. Current documentation is fragmented and not synchronized with the actual codebase.

### Solution
Implement an automated User Manual Generator system that:
- Analyzes the codebase to extract actual functionality
- Generates structured, maintainable documentation
- Exports to both Markdown (.md) and professional Word (.docx) formats
- Remains updatable as the application evolves

### Business Impact
- **Reduced onboarding time:** 60% faster user ramp-up
- **Improved user satisfaction:** Self-service documentation reduces support burden
- **Professional deliverables:** Client-ready documentation for stakeholders
- **Maintainability:** Automated updates prevent documentation drift

---

## 2. Technical Architecture

### 2.1 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                  User Manual Generator                       │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐
│ Content Analyzer │  │   Structure  │  │ Format Exporter │
│                  │  │    Builder   │  │                 │
│ - Parse Sidebar  │  │ - Hierarchy  │  │ - MD generation │
│ - Extract Pages  │  │ - Sections   │  │ - DOCX styling  │
│ - Map Components │  │ - Flow docs  │  │ - TOC creation  │
└──────────────────┘  └──────────────┘  └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
              ┌─────────────────────────────┐
              │   Generated Manual Output   │
              ├─────────────────────────────┤
              │ - MANUAL_USUARIO.md         │
              │ - MANUAL_USUARIO.docx       │
              │ - Screenshots (optional)    │
              └─────────────────────────────┘
```

### 2.2 Data Flow

1. **Analysis Phase**
   - Input: Source code (Sidebar.tsx, page.tsx files, Header.tsx)
   - Process: Extract menu structure, page routes, components
   - Output: Functionality map (JSON)

2. **Building Phase**
   - Input: Functionality map + existing manual template
   - Process: Build hierarchical structure, generate sections
   - Output: Structured manual (Markdown AST)

3. **Export Phase**
   - Input: Structured manual
   - Process: Render to .md, convert to .docx with styling
   - Output: Final documentation files

---

## 3. Skills Specification

### 3.1 Skill: manual-content-analyzer

**Purpose:** Extract functionality from codebase

**Inputs:**
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/app/(dashboard)/**/page.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/components/widgets/*.tsx`

**Outputs:**
```json
{
  "sidebar": {
    "sections": [
      {
        "id": "core",
        "title": "Core Business",
        "links": [
          {"name": "Dashboard", "href": "/dashboard", "implemented": true},
          {"name": "Leads", "href": "/leads", "implemented": true}
        ]
      }
    ]
  },
  "header": {
    "components": ["search", "notifications", "currency", "language", "units", "userMenu"]
  },
  "pages": [
    {
      "route": "/dashboard",
      "widgets": ["QuickStats", "LeadsPulse", "TasksToday", "PropertyPipeline"],
      "description": "Main operational dashboard"
    }
  ]
}
```

**Logic:**
```python
def analyze_sidebar():
    # Parse Sidebar.tsx
    sidebar_ast = parse_tsx("Sidebar.tsx")
    sections = extract_sections(sidebar_ast)
    return sections

def analyze_pages():
    # Glob all page.tsx files
    pages = glob("frontend/src/app/(dashboard)/**/page.tsx")
    page_map = []
    for page in pages:
        route = extract_route_from_path(page)
        widgets = extract_components(page)
        page_map.append({
            "route": route,
            "widgets": widgets
        })
    return page_map

def analyze_header():
    # Parse Header.tsx
    header_ast = parse_tsx("Header.tsx")
    components = extract_header_components(header_ast)
    return components
```

---

### 3.2 Skill: manual-structure-builder

**Purpose:** Build hierarchical manual structure

**Inputs:**
- Functionality map (from analyzer)
- Manual template (if exists)
- Content design rules (from ANCLORA-CDLG-001)

**Outputs:**
- Structured Markdown document (AST)

**Structure:**
```markdown
# Manual de Usuario: Anclora Nexus

## 1. Introducción
### 1.1 Qué es Anclora Nexus
### 1.2 Requisitos previos
### 1.3 Acceso a la plataforma

## 2. Navegación Principal
### 2.1 Sidebar (Menú Lateral)
### 2.2 Header (Barra Superior)

## 3. Sección CORE (Core Business)
### 3.1 Dashboard
#### 3.1.1 Widget QuickStats
#### 3.1.2 Widget LeadsPulse
...

## 4. Sección INTELLIGENCE (Intelligence & Prospection)
### 4.1 Prospection studio
### 4.2 Seller Pipeline
...

## 5. Sección OPERATIONS (Operations & Tools)
### 5.1 Ingestion
### 5.2 Data Quality
...

## 6. Casos de Uso Prácticos
### 6.1 Por Rol: Owner
### 6.2 Por Rol: Manager
### 6.3 Por Rol: Agent

## 7. Troubleshooting
### 7.1 Errores comunes
### 7.2 FAQ
```

**Logic:**
```python
def build_structure(functionality_map, template):
    manual = ManualDocument()

    # Introduction
    manual.add_section("Introducción", generate_intro())

    # Navigation
    manual.add_section("Navegación Principal")
    manual.add_subsection("Sidebar", generate_sidebar_docs(functionality_map["sidebar"]))
    manual.add_subsection("Header", generate_header_docs(functionality_map["header"]))

    # Main Sections
    for section in functionality_map["sidebar"]["sections"]:
        manual.add_section(f"Sección {section['title'].upper()}")
        for link in section["links"]:
            page_info = find_page(functionality_map["pages"], link["href"])
            manual.add_subsection(link["name"], generate_page_docs(page_info))

    # Use Cases
    manual.add_section("Casos de Uso Prácticos")
    manual.add_subsection("Por Rol: Owner", generate_role_use_cases("owner"))
    manual.add_subsection("Por Rol: Manager", generate_role_use_cases("manager"))
    manual.add_subsection("Por Rol: Agent", generate_role_use_cases("agent"))

    # Troubleshooting
    manual.add_section("Troubleshooting")
    manual.add_subsection("Errores comunes", load_common_errors())
    manual.add_subsection("FAQ", load_faq())

    return manual
```

---

### 3.3 Skill: manual-format-exporter

**Purpose:** Export manual to .md and .docx formats

**Inputs:**
- Structured manual (Markdown AST)
- Brand guidelines (colors, fonts, logos)

**Outputs:**
- `MANUAL_USUARIO_ANCLORA_NEXUS.md`
- `MANUAL_USUARIO_ANCLORA_NEXUS.docx`

**DOCX Styling:**
```python
BRAND_STYLES = {
    "colors": {
        "navy": "#192350",
        "gold": "#D4AF37",
        "blue_light": "#AFD2FA",
        "white_soft": "#F5F5F0"
    },
    "fonts": {
        "heading": "Playfair Display",
        "body": "Inter"
    },
    "cover": {
        "logo": "public/brand/anclora-nexus.png",
        "title": "Manual de Usuario",
        "subtitle": "Anclora Nexus - Intelligence Layer",
        "background_color": "navy"
    }
}

def export_to_docx(manual, styles):
    doc = Document()

    # Apply brand styles
    apply_theme(doc, styles)

    # Cover page
    add_cover_page(doc, styles["cover"])

    # Table of Contents
    add_toc(doc)

    # Content
    for section in manual.sections:
        add_heading(doc, section.title, level=1)
        for subsection in section.subsections:
            add_heading(doc, subsection.title, level=2)
            add_content(doc, subsection.content)

    doc.save("MANUAL_USUARIO_ANCLORA_NEXUS.docx")
```

**Adaption from existing skill:**
- Use `md-to-docx-with-covers` as base
- Customize with Anclora brand styles
- Add automatic TOC generation
- Include logo and professional layout

---

## 4. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Create feature structure in `sdd/features/user-manual-generator/`
- [ ] Write specs, rules, and prompts
- [ ] Set up skill templates in Anclora-Agents-Skills

### Phase 2: Skills Development (Week 2-3)
- [ ] Implement `manual-content-analyzer` skill
- [ ] Implement `manual-structure-builder` skill
- [ ] Adapt `manual-format-exporter` from existing skill

### Phase 3: Manual Generation (Week 4)
- [ ] Run analyzer on current codebase
- [ ] Build initial manual structure
- [ ] Export to .md and .docx
- [ ] Review and refine content

### Phase 4: Validation & Delivery (Week 5)
- [ ] User testing with Owner, Manager, Agent roles
- [ ] Incorporate feedback
- [ ] Finalize documentation
- [ ] Deliver to `public/docs/manual-usuario/`

---

## 5. Data Model

### 5.1 Functionality Map Schema

```typescript
interface FunctionalityMap {
  sidebar: {
    sections: Array<{
      id: 'core' | 'intelligence' | 'operations';
      title: string;
      icon: string;
      links: Array<{
        name: string;
        href: string;
        icon: string;
        implemented: boolean;
      }>;
    }>;
  };
  header: {
    components: Array<{
      name: string;
      type: 'search' | 'notifications' | 'currency' | 'language' | 'units' | 'userMenu';
      functionality: string;
    }>;
  };
  pages: Array<{
    route: string;
    title: string;
    description: string;
    widgets?: string[];
    actions?: string[];
    roleAccess?: ('owner' | 'manager' | 'agent')[];
  }>;
}
```

### 5.2 Manual Structure Schema

```typescript
interface ManualDocument {
  metadata: {
    title: string;
    version: string;
    date: string;
    language: 'es' | 'en' | 'de' | 'ru';
  };
  sections: Array<{
    title: string;
    level: number;
    content?: string;
    subsections?: ManualSection[];
  }>;
}
```

---

## 6. Rules and Constraints

### 6.1 Generation Rules

1. **Accuracy Rule:** Manual content must match actual implemented functionality
   - ✅ DO: Document only features present in codebase
   - ❌ DON'T: Document planned but unimplemented features

2. **Completeness Rule:** Manual must cover 100% of sidebar options
   - ✅ All 17 menu items documented
   - ✅ All 6 header components documented

3. **Clarity Rule:** Language must be user-friendly, not technical
   - ✅ "Haz clic en Dashboard para ver tu panel principal"
   - ❌ "Navigate to /dashboard route to render DashboardPage component"

4. **Branding Rule:** DOCX must follow brand guidelines
   - Navy (#192350) for headers
   - Gold (#D4AF37) for accents
   - Playfair Display for headings, Inter for body

5. **Localization Rule:** Support multi-language paths
   - ES (primary)
   - EN (secondary)
   - DE, RU (future)

### 6.2 Maintenance Rules

1. **Update Trigger:** Regenerate manual when:
   - Sidebar structure changes
   - New page added to dashboard
   - Major feature update

2. **Version Control:**
   - Manual version follows app version
   - Keep changelog in manual metadata

3. **Review Process:**
   - Product Owner reviews content accuracy
   - UX Writer reviews language clarity
   - Tech Lead reviews technical accuracy

---

## 7. Testing Strategy

### 7.1 Unit Tests (Skills)

```python
def test_analyze_sidebar():
    result = manual_content_analyzer.analyze_sidebar()
    assert len(result["sections"]) == 3
    assert result["sections"][0]["id"] == "core"
    assert len(result["sections"][0]["links"]) == 5

def test_build_structure():
    functionality_map = load_mock_functionality_map()
    manual = manual_structure_builder.build(functionality_map)
    assert manual.sections[0].title == "Introducción"
    assert len(manual.sections) >= 7

def test_export_to_docx():
    manual = load_mock_manual()
    output_path = manual_format_exporter.export_docx(manual)
    assert os.path.exists(output_path)
    assert output_path.endswith(".docx")
```

### 7.2 Integration Tests

1. **End-to-End Generation Test:**
   - Run full pipeline on current codebase
   - Verify .md and .docx files created
   - Validate structure and content

2. **Sidebar Sync Test:**
   - Modify sidebar structure
   - Regenerate manual
   - Verify changes reflected

3. **Style Validation Test:**
   - Open .docx file
   - Verify brand colors applied
   - Verify fonts and layout

### 7.3 User Acceptance Tests

- [ ] Owner can find all modules they use daily
- [ ] Manager can follow role-specific use cases
- [ ] Agent can understand restricted access errors
- [ ] New user can onboard using manual alone (< 30 min)

---

## 8. Security and Compliance

### 8.1 Data Privacy
- Manual contains no sensitive data (no API keys, passwords, personal info)
- Screenshots (if included) use mock/sample data only

### 8.2 Access Control
- Manual is public documentation (no auth required to read)
- Stored in `public/docs/` directory (accessible via web)

### 8.3 Licensing
- Manual is proprietary to Anclora Private Estates
- Not for redistribution outside organization
- Copyright notice included in footer

---

## 9. Deliverables

### 9.1 Primary Deliverables

| Deliverable | Location | Format | Owner |
|------------|----------|--------|-------|
| User Manual (MD) | `public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.md` | Markdown | System |
| User Manual (DOCX) | `public/docs/manual-usuario/MANUAL_USUARIO_ANCLORA_NEXUS.docx` | Word | System |
| Feature Spec | `sdd/features/user-manual-generator/user-manual-generator-spec-v1.md` | Markdown | System |

### 9.2 Supporting Deliverables

| Deliverable | Location | Format | Owner |
|------------|----------|--------|-------|
| Skills | `Anclora-Agents-Skills/skills/manual-*` | Markdown | System |
| Rules | `sdd/features/user-manual-generator/rules/` | Markdown | System |
| Prompts | `sdd/features/user-manual-generator/prompts/` | Markdown | System |
| Test Plan | `sdd/features/user-manual-generator/user-manual-generator-test-plan-v1.md` | Markdown | System |

---

## 10. Success Metrics

### 10.1 Coverage Metrics
- ✅ 100% sidebar options documented (17/17)
- ✅ 100% header components documented (6/6)
- ✅ 100% dashboard pages documented (24/24)

### 10.2 Quality Metrics
- User satisfaction score > 4.5/5
- Onboarding time reduced by 60%
- Support tickets reduced by 40%

### 10.3 Maintainability Metrics
- Manual regeneration time < 10 minutes
- Update effort < 1 hour per major release
- Zero documentation drift incidents

---

## 11. Risk Analysis

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Sidebar structure changes break analyzer | Medium | High | Add robust parsing with fallbacks |
| DOCX styling library limitations | Low | Medium | Use python-docx with custom styles |
| Manual becomes outdated | Medium | High | Automate regeneration in CI/CD |
| Translation cost too high | Low | Low | Start with ES only, add EN later |

---

## 12. Future Enhancements (v2)

- [ ] Interactive HTML version with search
- [ ] Video tutorials embedded in manual
- [ ] Multi-language auto-translation (EN, DE, RU)
- [ ] Context-sensitive help tooltips in UI
- [ ] PDF export option
- [ ] Versioned documentation archive

---

## 13. References

- [Content Design Governance](../content-design-and-localization-governance/content-design-and-localization-governance-spec-v1.md)
- [Brand Guidelines](../../../brain.md)
- [Architecture Documentation](../../../architecture.md)
- [Sidebar Component](../../../frontend/src/components/layout/Sidebar.tsx)

---

**Approved by:** System
**Date:** 2026-03-10
**Version:** v1.0
