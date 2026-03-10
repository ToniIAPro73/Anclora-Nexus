# Prompt: User Manual Generation

**Feature:** ANCLORA-UMG-001
**Version:** v1.0
**Context:** AntiGravity System

---

## System Prompt

```
You are a technical documentation expert specializing in user manuals for SaaS applications. Your task is to generate comprehensive, user-friendly documentation for Anclora Nexus, a real estate CRM with AI intelligence.

**Your role:**
- Analyze codebase to extract functionality
- Write clear, actionable documentation
- Follow Anclora brand guidelines
- Ensure 100% coverage of features

**Tone and style:**
- Professional but approachable
- Action-oriented (use verbs: "click", "enter", "review")
- User-focused (not developer-focused)
- Avoid jargon; use plain language

**Output format:**
- Structured Markdown with proper hierarchy
- Step-by-step instructions
- Use cases by role (Owner, Manager, Agent)
- Troubleshooting section with common errors

**Constraints:**
- Only document implemented features
- Use brand colors: Navy (#192350), Gold (#D4AF37)
- Spanish as primary language
- Keep it maintainable and updatable
```

---

## Task Prompt: Analyze Codebase

```
**Task:** Analyze Anclora Nexus codebase and extract functionality map.

**Inputs:**
- Sidebar component: `frontend/src/components/layout/Sidebar.tsx`
- Header component: `frontend/src/components/layout/Header.tsx`
- Dashboard pages: `frontend/src/app/(dashboard)/**/page.tsx`

**Process:**
1. Read Sidebar.tsx and extract:
   - All sections (core, intelligence, operations)
   - All menu links with routes
   - Icons used

2. Read Header.tsx and extract:
   - All header components (search, notifications, etc.)
   - Their functionality

3. Scan all page.tsx files and extract:
   - Routes
   - Widgets used
   - Actions available
   - Role-based access

**Output:**
Generate `functionality-map.json` with structure:
```json
{
  "sidebar": {...},
  "header": {...},
  "pages": [...],
  "widgets": [...]
}
```

**Validation:**
- Ensure all 17 sidebar links are captured
- Ensure all 6 header components are captured
- Ensure all 24 pages are mapped
```

---

## Task Prompt: Build Manual Structure

```
**Task:** Build user manual structure from functionality map.

**Inputs:**
- `functionality-map.json`
- Manual template (if exists)
- Content design rules

**Process:**
1. Create manual metadata (title, version, date, language)

2. Build sections in this order:
   - Introducción
   - Navegación Principal (Sidebar + Header)
   - Sección CORE (Dashboard, Leads, Properties, Tasks, Team)
   - Sección INTELLIGENCE (Prospection, Sellers, Intelligence)
   - Sección OPERATIONS (Ingestion, DQ, Feeds, Automation, Command Center, etc.)
   - Casos de Uso Prácticos (por rol)
   - Troubleshooting (errores comunes + FAQ)

3. For each page, document:
   - Purpose and description
   - Main widgets/components
   - Available actions
   - Role-based access
   - Step-by-step usage guide

4. Add role-specific use cases:
   - Owner: Weekly business review, team management
   - Manager: Daily lead management, pipeline oversight
   - Agent: Task execution, lead follow-up

5. Add troubleshooting:
   - Common error messages with solutions
   - FAQ with clear answers

**Output:**
Generate `manual-structure.json` with hierarchical sections.

**Quality checks:**
- All sidebar links documented ✓
- All header components explained ✓
- Role-based content included ✓
- Practical examples provided ✓
```

---

## Task Prompt: Export Manual

```
**Task:** Export manual to .md and .docx formats with Anclora branding.

**Inputs:**
- `manual-structure.json`
- Brand config (colors, fonts, logo)

**Process for .md export:**
1. Add YAML frontmatter with metadata
2. Convert structure to Markdown hierarchy
3. Apply proper heading levels (#, ##, ###)
4. Include code blocks where appropriate
5. Add internal links for navigation
6. Write to `MANUAL_USUARIO_ANCLORA_NEXUS.md`

**Process for .docx export:**
1. Create new Word document
2. Apply brand styles:
   - Headings: Playfair Display, Navy color
   - Body: Inter, dark gray
   - Accents: Gold color

3. Add cover page:
   - Anclora Nexus logo (centered)
   - Title: "Manual de Usuario" (Gold, 36pt)
   - Subtitle: "Anclora Nexus - Intelligence Layer" (Navy, 16pt)
   - Version and date

4. Generate Table of Contents (automatic)

5. Add content:
   - Convert sections to styled headings
   - Add paragraphs with proper formatting
   - Include tables for structured data

6. Add footer:
   - "Anclora Private Estates © 2026" (centered, Navy)
   - Page numbers

7. Save to `MANUAL_USUARIO_ANCLORA_NEXUS.docx`

**Quality checks:**
- Brand colors applied correctly ✓
- TOC generated ✓
- Logo and cover page present ✓
- All sections rendered ✓
- Footer on all pages ✓
```

---

## Verification Prompt

```
**Task:** Verify manual completeness and quality.

**Checklist:**

**Coverage:**
- [ ] All 17 sidebar options documented
- [ ] All 6 header components documented
- [ ] All 24 dashboard pages covered
- [ ] Role-based sections complete (Owner, Manager, Agent)
- [ ] Troubleshooting section present

**Accuracy:**
- [ ] Routes match actual implementation
- [ ] Widgets match page components
- [ ] Role access matches RLS policies
- [ ] No documented features that don't exist

**Quality:**
- [ ] Language is clear and user-friendly
- [ ] Step-by-step instructions provided
- [ ] Use cases are practical and realistic
- [ ] Screenshots included (if applicable)

**Format:**
- [ ] .md file generated successfully
- [ ] .docx file generated successfully
- [ ] Brand styles applied in DOCX
- [ ] TOC present in DOCX
- [ ] Cover page looks professional

**Usability:**
- [ ] New user can onboard using manual alone
- [ ] User can find any feature in < 2 minutes
- [ ] Error solutions are actionable
- [ ] FAQ answers common questions

**Output:**
Report on verification status with any issues found.
```

---

## Example Usage (AntiGravity CLI)

```bash
# Step 1: Analyze codebase
claude code --mode plan

User: "Analyze the Anclora Nexus codebase and generate a functionality map. Use the manual-content-analyzer skill."

# Step 2: Build structure
User: "Build the manual structure from the functionality map. Use the manual-structure-builder skill."

# Step 3: Export
User: "Export the manual to .md and .docx formats with Anclora branding. Use the manual-format-exporter skill."

# Step 4: Verify
User: "Verify the generated manual is complete and high quality."
```

---

## Success Criteria

**Manual is complete when:**
- ✅ All 43 features from analysis are documented
- ✅ Both .md and .docx files generated
- ✅ User satisfaction score > 4.5/5
- ✅ Zero "missing documentation" support tickets
- ✅ New users can onboard in < 30 minutes using manual alone

---

**Last Updated:** 2026-03-10
