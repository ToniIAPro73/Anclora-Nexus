# BASELINE OBLIGATORIO DE ENTREGA (A/B/C/D)

Uso obligatorio:
- Referenciar este baseline en `shared-context.md` y/o `master-parallel.md` de toda feature nueva.
- Este baseline aplica desde Agent A y no solo en QA.

## 1) Entorno y fuente de verdad (obligatorio)
- Leer siempre `.env` y `frontend/.env.local` antes de implementar o validar.
- Backend y frontend deben apuntar al mismo proyecto:
  - `SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
- Prohibido hardcodear `project_ref`, `org_id` o URLs de Supabase.

## 2) Regla de migraciones (obligatoria)
- Agent A genera migracion + rollback + verify SQL.
- La migracion debe aplicarse en el entorno objetivo antes de Agent B/C/D.
- Si migracion no aplicada: bloquear B/C/D con estado `MIGRATION_NOT_APPLIED`.

## 3) Reglas UX/UI obligatorias (Agent C)
- Mantener tipografia, espaciados y componentes del design system existente.
- Evitar scroll vertical innecesario en desktop (priorizar estructura eficiente).
- Evitar overflow/solapes en cards, tablas, filtros, sidebars y dropdowns.
- Respetar responsive en desktop + mobile.
- No introducir fuentes nuevas ni estilos aislados.
- Incluir boton de volver en nuevas pantallas de modulo cuando aplique flujo de navegacion.
- Mantener coherencia visual con pantallas de referencia del producto (ej. Prospeccion para layout premium).
- Evitar bloques sobredimensionados que empujen contenido critico fuera del primer viewport desktop.
- Garantizar margenes laterales y ritmo vertical consistentes con Dashboard/Prospeccion.

## 3.1) Sidebar y navegacion (obligatorio)
- El sidebar debe mostrar todas las opciones de menu principales sin ocultar controles esenciales.
- Los toggles globales (idioma, moneda, unidad) no deben depender de espacio residual del sidebar.
- Si crece la cantidad de modulos, aplicar agrupacion logica o patron escalable de navegacion, no hacks puntuales.
- Prohibido introducir cambios que hagan invisibles dropdowns, toggles o acciones primarias.

## 3.2) Contrato global de botones (obligatorio)
- Acciones de creacion (ej. "Nuevo contacto", "Nueva propiedad", "Invitar") deben usar patron `btn-create`.
- Acciones no-creacion (ej. "Recalcular", "Recomputar", "Refresh/Actualizar", "Re-score") deben usar patron `btn-action`.
- `btn-action` debe incluir un micro-indicador visual (emoji/icono pequeno) + texto.
- Prohibido mezclar estilos arbitrarios por pantalla para acciones equivalentes.

## 4) Reglas i18n obligatorias (Agent C + D)
- Todo texto nuevo/modificado visible en UI debe ir por i18n.
- Cobertura minima obligatoria: `es`, `en`, `de`, `ru`.
- Prohibido texto hardcodeado en componentes/paginas.
- Tambien aplica a labels de origen, estados, tiempos relativos, botones, placeholders, vacios y mensajes de ayuda.

## 4.1) Contrato de finalizacion UI (obligatorio)
- Cada feature con impacto frontend debe cerrar con checklist:
  1) Tipografia y spacing consistentes.
  2) Sin scroll vertical innecesario en vista desktop principal.
  3) Sin solapes/overflow en cards, tablas y filtros.
  4) Sidebar usable con todos los modulos visibles y controles globales accesibles.
  5) i18n completa `es/en/de/ru` para todo texto nuevo/modificado.

## 5) Criterios de bloqueo (NO-GO automatico)
- `ENV_MISMATCH`
- `MIGRATION_NOT_APPLIED`
- `I18N_MISSING_KEYS`
- `VISUAL_REGRESSION_P0` (solape, overflow o layout roto en vista principal)
- `NAVIGATION_SCALABILITY_BROKEN` (sidebar/toggles no accesibles o modulos ocultos por crecimiento)

## 6) Higiene de pruebas (obligatoria)
- Cualquier script temporal de prueba/diagnostico creado durante la iteracion debe eliminarse antes de cerrar la feature.
- No dejar artefactos temporales en raiz ni en carpetas funcionales (ej.: `debug_*.py`, `verify_*.py`, `tmp_*.ts`, `test_output.log`).
- Si se necesita conservar evidencia, guardarla en SDD/QA como reporte, no como script ejecutable temporal.
