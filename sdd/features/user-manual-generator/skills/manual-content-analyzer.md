# Skill: manual-content-analyzer

**Skill ID:** manual-content-analyzer
**Feature:** ANCLORA-UMG-001
**Version:** v1.0
**Type:** Analysis
**Runtime:** Python 3.11+

---

## 1. Purpose

Extract comprehensive functionality information from the Anclora Nexus codebase to build an accurate, complete user manual. This skill analyzes source code to identify all user-facing features, menu structures, components, and workflows.

---

## 2. Inputs

| Input | Type | Source | Required |
|-------|------|--------|----------|
| Sidebar source | File | `frontend/src/components/layout/Sidebar.tsx` | Yes |
| Header source | File | `frontend/src/components/layout/Header.tsx` | Yes |
| Dashboard pages | Files | `frontend/src/app/(dashboard)/**/page.tsx` | Yes |
| Widget components | Files | `frontend/src/components/widgets/*.tsx` | Yes |
| i18n translations | File | `frontend/src/lib/i18n.ts` | Optional |

---

## 3. Outputs

### 3.1 Functionality Map (JSON)

```json
{
  "metadata": {
    "generated_at": "2026-03-10T10:30:00Z",
    "analyzer_version": "1.0",
    "codebase_commit": "47dbd88"
  },
  "sidebar": {
    "sections": [
      {
        "id": "core",
        "title": "Core Business",
        "title_i18n_key": "sidebarSectionCore",
        "icon": "LayoutDashboard",
        "links": [
          {
            "name": "Dashboard",
            "name_i18n_key": "dashboard",
            "href": "/dashboard",
            "icon": "LayoutDashboard",
            "implemented": true,
            "page_exists": true
          },
          {
            "name": "Leads",
            "name_i18n_key": "leads",
            "href": "/leads",
            "icon": "Users",
            "implemented": true,
            "page_exists": true
          }
        ]
      }
    ]
  },
  "header": {
    "components": [
      {
        "name": "search",
        "type": "SearchInput",
        "functionality": "Global search across leads, properties, tasks",
        "location": "Header left section"
      },
      {
        "name": "notifications",
        "type": "NotificationPanel",
        "functionality": "Display system notifications and alerts",
        "location": "Header right section"
      }
    ]
  },
  "pages": [
    {
      "route": "/dashboard",
      "title": "Dashboard",
      "description": "Main operational dashboard",
      "file_path": "frontend/src/app/(dashboard)/dashboard/page.tsx",
      "widgets": [
        "QuickStats",
        "LeadsPulse",
        "TasksToday",
        "PropertyPipeline",
        "AgentStream",
        "QuickActions",
        "BudgetStatusWidget",
        "RadarTerritorial"
      ],
      "actions": [
        "Create lead",
        "Create task",
        "View recent activity"
      ],
      "role_access": ["owner", "manager", "agent"]
    }
  ],
  "widgets": [
    {
      "name": "QuickStats",
      "file_path": "frontend/src/components/widgets/QuickStats.tsx",
      "description": "Display quick statistics and KPIs",
      "data_source": "backend:stats API",
      "update_frequency": "real-time"
    }
  ]
}
```

---

## 4. Processing Logic

### 4.1 Sidebar Analysis

**Algorithm:**

```python
import re
import json
from pathlib import Path

def analyze_sidebar(sidebar_path: str) -> dict:
    """
    Parse Sidebar.tsx to extract menu structure
    """
    with open(sidebar_path, 'r') as f:
        content = f.read()

    # Extract sections array
    sections_match = re.search(
        r'const sections: Array<\{.*?\}> = \[(.*?)\];',
        content,
        re.DOTALL
    )

    if not sections_match:
        raise ValueError("Could not find sections array in Sidebar.tsx")

    sections_raw = sections_match.group(1)

    # Parse each section
    sections = []
    section_blocks = re.findall(
        r'\{[\s\S]*?id:\s*[\'"](\w+)[\'"][\s\S]*?title:\s*t\([\'"]([^\'\"]+)[\'"][\s\S]*?links:\s*\[([\s\S]*?)\][\s\S]*?\}',
        sections_raw
    )

    for section_id, title_key, links_raw in section_blocks:
        # Parse links within section
        links = []
        link_matches = re.findall(
            r'\{\s*name:\s*[`\'"]([^`\'"]+)[`\'"],\s*href:\s*[\'"]([^\'\"]+)[\'"],\s*icon:\s*(\w+)',
            links_raw
        )

        for link_name, link_href, link_icon in link_matches:
            # Check if page exists
            page_path = Path(f"frontend/src/app/(dashboard){link_href}/page.tsx")
            page_exists = page_path.exists()

            links.append({
                "name": link_name,
                "name_i18n_key": extract_i18n_key(link_name),
                "href": link_href,
                "icon": link_icon,
                "implemented": True,  # Assume implemented if in sidebar
                "page_exists": page_exists
            })

        sections.append({
            "id": section_id,
            "title": resolve_i18n(title_key),
            "title_i18n_key": title_key,
            "icon": extract_section_icon(content, section_id),
            "links": links
        })

    return {"sections": sections}


def extract_i18n_key(text: str) -> str:
    """
    Extract i18n key from text
    Examples:
      "Dashboard" -> "dashboard"
      "${t('prospection')} studio" -> "prospection"
    """
    i18n_match = re.search(r"t\(['\"]([^'\"]+)['\"]\)", text)
    if i18n_match:
        return i18n_match.group(1)
    return text.lower().replace(" ", "_")


def resolve_i18n(key: str) -> str:
    """
    Resolve i18n key to Spanish text (default language)
    """
    i18n_map = {
        "sidebarSectionCore": "Core Business",
        "sidebarSectionIntelligence": "Intelligence & Prospection",
        "sidebarSectionOperations": "Operations & Tools",
        "dashboard": "Dashboard",
        "leads": "Leads",
        # ... load from i18n.ts
    }
    return i18n_map.get(key, key)
```

### 4.2 Page Analysis

**Algorithm:**

```python
from pathlib import Path
import re

def analyze_pages(dashboard_dir: str) -> list:
    """
    Analyze all dashboard page.tsx files to extract functionality
    """
    pages = []
    dashboard_path = Path(dashboard_dir)

    # Find all page.tsx files
    page_files = dashboard_path.rglob("page.tsx")

    for page_file in page_files:
        # Extract route from file path
        route = extract_route_from_path(str(page_file))

        # Read page content
        with open(page_file, 'r') as f:
            content = f.read()

        # Extract components/widgets used
        widgets = extract_components(content, type="widget")

        # Extract actions (buttons, forms, etc.)
        actions = extract_actions(content)

        # Infer role access from page content
        role_access = infer_role_access(content)

        pages.append({
            "route": route,
            "title": extract_page_title(content),
            "description": extract_page_description(content),
            "file_path": str(page_file),
            "widgets": widgets,
            "actions": actions,
            "role_access": role_access
        })

    return pages


def extract_route_from_path(file_path: str) -> str:
    """
    Convert file path to route
    Example:
      "frontend/src/app/(dashboard)/sellers/page.tsx" -> "/sellers"
      "frontend/src/app/(dashboard)/intelligence/statefox-bridge/page.tsx"
        -> "/intelligence/statefox-bridge"
    """
    match = re.search(r'/\(dashboard\)/(.*?)/page\.tsx', file_path)
    if match:
        return f"/{match.group(1)}"
    return "/"


def extract_components(content: str, type: str = "widget") -> list:
    """
    Extract component imports and usage
    """
    components = []

    # Find imports
    import_matches = re.findall(
        r'import\s+\{[^}]*?(\w+)[^}]*?\}\s+from\s+[\'"]@/components/(widgets|layout|modals)/[\'"]',
        content
    )

    for component, category in import_matches:
        if type == "widget" and category == "widgets":
            components.append(component)
        elif type == "all":
            components.append(component)

    return components


def extract_actions(content: str) -> list:
    """
    Extract user actions (buttons, forms, etc.)
    """
    actions = []

    # Find button labels
    button_matches = re.findall(r'<[Bb]utton[^>]*>(.*?)</[Bb]utton>', content)
    actions.extend(button_matches)

    # Find form submissions
    form_matches = re.findall(r'onSubmit=\{(.*?)\}', content)
    actions.extend([f"Submit {form}" for form in form_matches])

    return actions


def infer_role_access(content: str) -> list:
    """
    Infer role-based access from page content
    """
    # Check for role checks in code
    if 'role === "owner"' in content or 'role: "owner"' in content:
        return ["owner"]
    elif 'role === "manager"' in content or 'role: "manager"' in content:
        return ["owner", "manager"]
    else:
        return ["owner", "manager", "agent"]  # Default: accessible to all
```

### 4.3 Header Analysis

**Algorithm:**

```python
def analyze_header(header_path: str) -> dict:
    """
    Parse Header.tsx to extract header components
    """
    with open(header_path, 'r') as f:
        content = f.read()

    components = []

    # Extract component usage patterns
    component_patterns = [
        (r'<Search\s', "search", "SearchInput", "Global search"),
        (r'<NotificationPanel\s', "notifications", "NotificationPanel", "Notifications"),
        (r'<CurrencySelector\s', "currency", "CurrencySelector", "Currency selection"),
        (r'<LanguageSelector\s', "language", "LanguageSelector", "Language selection"),
        (r'<UnitSelector\s', "units", "UnitSelector", "Unit system selection"),
        (r'<UserMenu\s', "userMenu", "UserMenu", "User profile menu")
    ]

    for pattern, name, type_name, functionality in component_patterns:
        if re.search(pattern, content):
            components.append({
                "name": name,
                "type": type_name,
                "functionality": functionality,
                "location": "Header right section" if name != "search" else "Header left section"
            })

    return {"components": components}
```

---

## 5. Dependencies

### 5.1 Python Libraries

```python
# requirements.txt
pathlib>=1.0
re (built-in)
json (built-in)
typing (built-in)
```

### 5.2 Input Files

Must exist in codebase:
- `frontend/src/components/layout/Sidebar.tsx`
- `frontend/src/components/layout/Header.tsx`
- `frontend/src/app/(dashboard)/**/page.tsx` (multiple files)

---

## 6. Error Handling

### 6.1 Missing Files

```python
def validate_inputs():
    required_files = [
        "frontend/src/components/layout/Sidebar.tsx",
        "frontend/src/components/layout/Header.tsx"
    ]

    for file_path in required_files:
        if not Path(file_path).exists():
            raise FileNotFoundError(f"Required file not found: {file_path}")
```

### 6.2 Parse Errors

```python
def safe_analyze(file_path: str, analyzer_func):
    try:
        return analyzer_func(file_path)
    except Exception as e:
        print(f"Warning: Could not analyze {file_path}: {e}")
        return None
```

---

## 7. Execution Example

### 7.1 Command Line

```bash
# Run analyzer
python skills/manual-content-analyzer/analyze.py \
  --repo-path /home/dev/proyectos/anclora-nexus \
  --output functionality-map.json

# Output:
# {
#   "metadata": {...},
#   "sidebar": {...},
#   "header": {...},
#   "pages": [...]
# }
```

### 7.2 Programmatic

```python
from manual_content_analyzer import ManualContentAnalyzer

analyzer = ManualContentAnalyzer(repo_path="/home/dev/proyectos/anclora-nexus")
functionality_map = analyzer.analyze()

# Save to JSON
with open("functionality-map.json", "w") as f:
    json.dump(functionality_map, f, indent=2, ensure_ascii=False)
```

---

## 8. Testing

### 8.1 Unit Tests

```python
def test_analyze_sidebar():
    result = analyze_sidebar("test/fixtures/Sidebar.tsx")
    assert len(result["sections"]) == 3
    assert result["sections"][0]["id"] == "core"
    assert len(result["sections"][0]["links"]) == 5

def test_extract_route_from_path():
    path = "frontend/src/app/(dashboard)/sellers/page.tsx"
    route = extract_route_from_path(path)
    assert route == "/sellers"

def test_analyze_header():
    result = analyze_header("test/fixtures/Header.tsx")
    assert len(result["components"]) == 6
    assert any(c["name"] == "search" for c in result["components"])
```

---

## 9. Performance

### 9.1 Expected Runtime

- Sidebar analysis: < 1s
- Header analysis: < 1s
- Page analysis (24 pages): < 5s
- Widget analysis: < 2s
- **Total: < 10s**

### 9.2 Memory Usage

- Peak memory: < 100MB
- Output JSON size: ~50KB

---

## 10. Maintenance

### 10.1 Update Triggers

Re-run analyzer when:
- Sidebar.tsx changes
- New page added
- Header components change
- Major refactor

### 10.2 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-10 | Initial release |

---

**Next Skill:** [manual-structure-builder](./manual-structure-builder.md)
