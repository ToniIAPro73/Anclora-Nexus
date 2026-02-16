# ANCLORA-CDLG-001 — Content Design and Localization Governance

## 1) Objetivo
Implementar un sistema multi-agente (Antigravity + NotebookLM) para auditar y mejorar de forma gobernada:
- Content Design
- UX Writing
- Terminología
- Localización (i18n/l10n)

Sobre repositorios o URLs, con ejecución de cambios **solo bajo aprobación explícita**.

---

## 2) Alcance funcional

### Incluye
- Auditoría de microcopy UI (CTA, errores, vacíos, ayudas, placeholders, estados).
- Detección de inconsistencias terminológicas.
- Riesgos de localización (variables, plurales, longitud, ambigüedad, neutralidad cultural).
- Informe priorizado por impacto (P0/P1/P2/P3).
- Plan de cambio y aplicación opcional en repo.

### No incluye (por defecto)
- Rediseño visual completo.
- Cambios de lógica de negocio.
- Traducción masiva completa (sí prepara el sistema para ello).

---

## 3) Arquitectura propuesta

## Agentes
- `AG-ORCH`: Orquestación, control de permisos y flujo.
- `AG-STRUCT`: Análisis estructural (mapa de strings, i18n, patrones).
- `AG-DOCTRINE`: Evaluación doctrinal (principios + impacto).
- `AG-EXEC`: Informe final + plan de cambio + ejecución aprobada.

## Skills
- `scan_repo_strings`
- `extract_web_microcopy` (si origen web)
- `generate_change_plan`
- `apply_repo_changes`
- `terminology_registry_update` (opcional)

## Flujo
1. ORCH detecta origen (`repo`/`web`).
2. STRUCT genera hallazgos técnicos y semánticos.
3. DOCTRINE evalúa contra principios de gobernanza.
4. EXEC emite informe Markdown y plan.
5. Si `repo`: solo con permiso explícito se aplican cambios.

---

## 4) Contratos de calidad (obligatorios)
- Sin `ENV_MISMATCH`.
- Sin `QA_INVALID_ENV_SOURCE`.
- Sin `I18N_MISSING_KEYS`.
- Sin `VISUAL_REGRESSION_P0`.
- Sin `NAVIGATION_SCALABILITY_BROKEN`.
- Sin `TEST_ARTIFACTS_NOT_CLEANED`.

---

## 5) Contratos UI globales (a futuro)

## Botones de creación
Patrón único `btn-create`:
- Nuevo contacto
- Nueva propiedad
- Invitar

## Botones de acción no-creación
Patrón único `btn-action` + `btn-action-emoji`:
- Recalcular
- Recomputar
- Refrescar/Actualizar
- Re-score

---

## 6) System prompts validados para NotebookLM

## Cuaderno 1 (obligatorio)
**Nombre sugerido**: `ANCLORA Doctrine — Content Design + UX Writing + Localization`

```txt
Eres la base doctrinal oficial de Anclora Nexus para Content Design, UX Writing, terminología y localización.

ROL:
- No analizas código directamente ni aplicas cambios.
- Evalúas decisiones de contenido contra principios doctrinales y devuelves criterios accionables.
- Tu salida debe ser consistente, priorizada y orientada a producto premium B2B real estate.

PRINCIPIOS OBLIGATORIOS:
1) Claridad funcional
2) Acción explícita y predecible
3) Consistencia terminológica
4) Economía cognitiva
5) Escalabilidad multilingüe (es, en, de, ru)
6) Neutralidad cultural
7) Gobernanza centralizada del lenguaje
8) Preparación para i18n (variables, pluralización, longitud)
9) No mezcla arbitraria de idiomas en una misma sesión UI
10) Trazabilidad y mantenibilidad

FORMATO DE RESPUESTA:
- doctrinal_issue
- violated_principles[]
- ux_impact
- localization_impact
- governance_impact
- risk_level (P0/P1/P2/P3)
- recommended_direction (estratégico, sin microedición literal salvo que se solicite)

RESTRICCIONES:
- No inventes contexto fuera de las fuentes.
- Si faltan datos, dilo explícitamente.
- Prioriza coherencia con diseño/tono existentes de Anclora Nexus.
```

## Cuaderno 2 (obligatorio)
**Nombre sugerido**: `ANCLORA Terminology Registry — Canonical Terms`

```txt
Eres el registro terminológico gobernado de Anclora Nexus.

MISIÓN:
- Definir y mantener términos canónicos, variantes permitidas y términos prohibidos.
- Resolver conflictos terminológicos para UI, documentación y comunicaciones del producto.
- Asegurar consistencia entre idiomas es/en/de/ru sin perder significado de negocio.

SALIDA OBLIGATORIA POR TÉRMINO:
- canonical_term
- definition
- usage_context
- allowed_variants[]
- forbidden_variants[]
- translations: { es, en, de, ru }
- localization_notes
- examples_good[]
- examples_bad[]
- governance_decision_reason

REGLAS:
- Una intención de producto = un término canónico.
- Evitar sinónimos competidores en UI.
- Evitar préstamos innecesarios si existe término claro.
- Mantener consistencia con tono premium, claro y operativo.
- Si hay duda semántica, priorizar claridad sobre estilo.

RESTRICCIONES:
- No reescribir toda la UI; responde sólo al término/conflicto consultado.
- Si no hay evidencia suficiente, marcar “needs_product_decision”.
```

## Cuaderno 3 (recomendado)
**Nombre sugerido**: `ANCLORA UX Writing Patterns — UI States & Actions`

```txt
Eres un catálogo de patrones de UX Writing para Anclora Nexus.

OBJETIVO:
- Normalizar cómo se escriben CTAs, estados vacíos, errores, mensajes de éxito, ayudas, placeholders y confirmaciones.

CONTRATOS CLAVE:
- Botones de creación -> patrón “create” (ej. Nuevo contacto, Nueva propiedad, Invitar).
- Botones de acción no-creación -> patrón “action” (ej. Recalcular, Recomputar, Actualizar).
- Mensajes de sistema breves, claros, accionables.
- Estados vacíos con orientación a siguiente paso.
- Sin mezclar idiomas dentro de la misma sesión UI.

FORMATO DE RESPUESTA:
- pattern_name
- when_to_use
- do[]
- dont[]
- examples_by_language {es,en,de,ru}
- accessibility_notes
- localization_risks

RESTRICCIONES:
- Mantener consistencia con terminología canónica.
- No introducir tono promocional en mensajes operativos.
```

---

## 7) Checklist para validar tus cuadernos al crearlos
- ¿Responden en formato estructurado y no en texto libre ambiguo?
- ¿Diferencian claramente “doctrina”, “terminología” y “patrones UX writing”?
- ¿Aplican cobertura de idiomas `es/en/de/ru`?
- ¿Evitan dar instrucciones de ejecución de código o cambios directos?
- ¿Mantienen la regla de no mezclar idiomas de interfaz en una sesión?

---

## 8) Próximo paso en el repo
Una vez creados los cuadernos, integrar por MCP:
1. Enlace de cuadernos en `shared-context` de la feature.
2. Prueba de consulta mínima por agente (`STRUCT`, `DOCTRINE`, `EXEC`).
3. QA de consistencia terminológica e i18n en un flujo real.

---

## 9) Portabilidad total (extraíble a cualquier repo o URL)

Para que esta feature funcione en cualquier proyecto sin reescribirla:

## 9.1 Reglas de diseño portable
- No hardcodear nombres de producto, rutas internas ni framework.
- No hardcodear `project_ref`, `org_id`, dominios o entornos.
- Separar configuración y lógica:
  - configuración en archivo declarativo
  - prompts y contratos en archivos versionados
  - ejecución por pipeline agnóstico (`repo` o `web`)

## 9.2 Config mínima portable (ejemplo)
```yaml
feature_id: ANCLORA-CDLG-001
mode: repo_or_url
source:
  type: repo # repo | web
  target: auto # path o URL
languages: [es, en, de, ru]
notebooklm:
  doctrine_notebook_id: TBD
  terminology_notebook_id: TBD
contracts:
  severity_levels: [P0, P1, P2, P3]
  output_format: markdown+json
gates:
  fail_on:
    - ENV_MISMATCH
    - QA_INVALID_ENV_SOURCE
    - I18N_MISSING_KEYS
    - VISUAL_REGRESSION_P0
    - TEST_ARTIFACTS_NOT_CLEANED
```

## 9.3 “Portable Kit” recomendado para copiar a otro repo
Copiar como bloque:
1. `SKILL.md` de la feature (flujo + contratos).
2. Prompts `shared-context`, `agent-a/b/c/d`, `gate-final`.
3. Este documento (`CONTENT_DESIGN_AND_LOCALIZATION_GOVERNANCE.md`).
4. Baselines globales:
   - `_feature-delivery-baseline.md`
   - `_qa-gate-baseline.md`
5. Checklist de adopción rápida (sección 9.4).

## 9.4 Checklist de adopción en nuevo repo
- Definir idiomas objetivo.
- Confirmar origen (`repo` o `url`).
- Conectar IDs de cuadernos NotebookLM.
- Validar salida JSON/Markdown de contratos entre agentes.
- Ejecutar un caso piloto de una pantalla/flujo.
- Validar Gate con bloqueos activos.

## 9.5 Modo URL (sin acceso a código)
Si no hay repo, el sistema sigue siendo útil:
- `extract_web_microcopy` como fuente estructural.
- evaluación doctrinal y terminológica completa.
- salida: informe + plan de cambios para equipo de producto.

## 9.6 Modo repo (con ejecución)
Si hay repo:
- informe + plan de cambios
- ejecución opcional en rama/PR con aprobación explícita
- commits atómicos y reversibles

## 9.7 Criterio de “portable-ready”
La feature se considera portable cuando:
- puede ejecutarse sin cambios de código en otro repo/URL,
- solo requiere editar configuración (IDs de cuadernos, idiomas, target),
- mantiene contratos y gates sin degradación.
