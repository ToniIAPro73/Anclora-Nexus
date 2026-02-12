# ANCLORA INTELLIGENCE — PRODUCT SPECIFICATION v1.0
## Motor de Orquestación Estratégica Multi-Dominio
### Especificación Funcional para Fases 1-2

> **Jerarquía:** Esta especificación es vinculante para Product (qué hace el sistema) y no puede contravenir `intelligence-constitution.md` ni `constitution-canonical.md`. Cuestiones técnicas de implementación se resuelven en `intelligence-spec-v1.md`.

---

# PARTE I — CONTEXTO Y PROPÓSITO

## 1. Definición de Anclora Intelligence

**Anclora Intelligence** es un orquestador estratégico cognitivo que:

- **Recibe**: Consultas abiertas del usuario sobre decisiones estratégicas
- **Analiza**: Contra Strategic Mode activo, Domain Packs, y contexto operativo
- **Diagnóstica**: Situación real con claridad, sin sesgos emocionales
- **Recomienda**: Ejecutar | Postergar | Reformular | Descartar (con justificación)
- **Alerta**: Sobre riesgos (laboral, fiscal, marca, foco)
- **Orquesta**: 3 próximos pasos concretos + contraindicaciones explícitas

**No es:**
- Un CRM con IA
- Un chatbot genérico
- Un SaaS para terceros
- Un motor de ejecución autónoma

**Sí es:**
- Sistema nervioso estratégico de Anclora Nexus
- Ventaja competitiva invisible en Fase 1
- Fundamento de futuro Founder OS Premium (post-Phase 3)

## 2. Principio Rector: "Strategic Mode v1 — Validation Phase"

```
Consolidar base sólida hoy para decidir con libertad mañana.
```

Cada consulta que pase por Intelligence deberá responder:

✅ ¿Consolida base financiera?  
✅ ¿Reduce riesgo estructural?  
✅ ¿Aumenta opcionalidad futura?  
❌ ¿Es expansión prematura?  
❌ ¿Puede esperar hasta validación?  

Si una acción propuesta no logra los primeros 3 **ni** logra "no" en los últimos 2, **se posterga**.

## 3. Ecosistema de Anclora

```
Anclora (Marca Matriz)
├── Anclora Private Estates (Inmobiliaria Premium — Foco Fase 1)
├── Anclora Cognitive Solutions (Consultoría IA — Diferido)
├── Anclora Nexus (Sistema Operativo)
│   └── Anclora Intelligence (Motor Estratégico — Este producto)
└── Anclora Labs (R&D futuro — Diferido)
```

**En Fase 1:** Intelligence es herramienta interna. No es marca externa. No se vende. No se comunica públicamente.

---

# PARTE II — CAPACIDADES Y WORKFLOWS

## 4. Capacidades Core (MVP Phase 1)

### 4.1. Consulta Estratégica Estructurada

**Entrada:**
- Mensaje natural del usuario (300-2000 caracteres)
- Modo implícito: Fast (análisis rápido) o Deep (análisis exhaustivo)
- Domain hint opcional (sugerencia de dominio)

**Proceso:**
1. **Router** clasifica intención y selecciona dominios (máx 3)
2. **Governor** aplica Strategic Mode y evalúa riesgos
3. **Synthesizer** genera respuesta estructurada

**Salida:**
```
Diagnóstico
Recomendación (Ejecutar | Postergar | Reformular | Descartar)
Riesgos (labor, tax, brand, focus)
3 Próximos Pasos
Qué NO Hacer
[metadata: mode, domains, confidence, flags]
```

### 4.2. Análisis de Riesgo Multidominio

Intelligence evalúa automáticamente:

| Dominio de Riesgo | Definición | Actores | Activación |
|---|---|---|---|
| **Labor-Risk** | Impacto en relación laboral con CGI, cambio contrato, excedencia | Empleador, contrato, estabilidad | Recomendación toca cambio laboral |
| **Tax-Risk** | Impacto fiscal, estructura legal, tributación, deuda | Hacienda, asesoría fiscal, tesorería | Recomendación toca negocio/SL/estructura |
| **Brand-Risk** | Impacto en diferenciación Anclora, posicionamiento, reputación | Mercado inmobiliario, competencia, partners | Recomendación toca identidad/comunicación |
| **Focus-Risk** | Dispersión de recursos, multiplicación líneas sin caja validada | Productividad, cash flow, oportunidad | Recomendación expande scope sin validación |

**Niveles:** LOW | MEDIUM | HIGH

Intelligence **nunca** recomienda acción HIGH-risk en labor/tax sin HITL explícito.

### 4.3. Gobernanza por Strategic Mode

Intelligence respeta **Strategic Mode Activo** (versionado en Git):

- Define contexto operativo vigente (qué se permite, qué se posterga, qué está prohibido)
- Governa comportamiento del Governor
- No editable en runtime
- Cambio solo vía commit documentado

**Strategic Mode v1 (Phase 1):**
- Fase: Validation (validar ingresos inmobiliaria)
- Prioridades: [1] Generación ingresos, [2] Estabilidad, [3] Posicionamiento, [4] Simplificación, [5] Motor estratégico, [6] Opcionalidad
- Restricciones: No activar consultoría IA pública, no constituir SL sin facturación, no cambios laborales sin validación
- Dominios activos: Real Estate Mallorca Premium (único)

### 4.4. Recomendaciones Estructuradas

Toda recomendación de Intelligence sigue formato:

```
RECOMENDACIÓN: [Ejecutar | Postergar | Reformular | Descartar]

JUSTIFICACIÓN:
- Consolida base: [Sí/No + explicación]
- Reduce riesgo: [Sí/No + explicación]
- Aumenta opcionalidad: [Sí/No + explicación]
- Expansión prematura: [Sí/No + explicación]

RIESGOS ASOCIADOS:
- Labor: [LOW/MEDIUM/HIGH] — [rationale]
- Tax: [LOW/MEDIUM/HIGH] — [rationale]
- Brand: [LOW/MEDIUM/HIGH] — [rationale]
- Focus: [LOW/MEDIUM/HIGH] — [rationale]

PRÓXIMOS 3 PASOS:
1. [Acción concreta, reversible/pausable]
2. [Señal de validación]
3. [Punto de revisión]

QUÉ NO HACER AHORA:
- [Contraindicación 1]
- [Contraindicación 2]
- [Contraindicación 3]
```

### 4.5. Detección de Overengineering

Intelligence marca automáticamente `overengineering-risk=HIGH` si:

- Propone inversión técnica sin ingresos comprobados en ese dominio
- Multiplica líneas sin caja consolidada
- Activa consultoría IA antes de validar base inmobiliaria
- Requiere cambios laborales anticipados

En estos casos, recomendación será **Postergar** con justificación explícita.

### 4.6. Multi-Dominio (Fase 2+)

**Phase 1:** Real Estate Mallorca Premium (único dominio activo)

**Phase 2:** Preparación para:
- Real Estate (expansion geográfica)
- Founder OS (estrategia, operaciones)
- Cognitive Consulting (productos/servicios)

**Regla:** Máximo 3 dominios simultáneamente por consulta. Expansión requiere Strategic Mode update.

---

# PARTE III — INTERFAZ DE USUARIO (CONTROL CENTER)

## 7. Layout Control Center (/intelligence)

Intelligence está accesible desde una ruta dedicada `/intelligence` que implementa patrón **Control Center**:

```
┌─────────────────────────────────────────────────────────────┐
│ ANCLORA INTELLIGENCE — CONTROL CENTER                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────┐  ┌─────────────────────────┐  │
│  │   CENTRAL CHAT ZONE      │  │  DECISION CONSOLE       │  │
│  │                          │  │  ┌─────────────────────┐│  │
│  │  [Consulta libre...]     │  │  │ Mode: [Fast|Deep]   ││  │
│  │                          │  │  │ Domain: [Real Est...]││  │
│  │  ─────────────────────   │  │  │ Confidence: 0.87    ││  │
│  │                          │  │  │ Flags: [list]       ││  │
│  │  [Diagnóstico]           │  │  │                     ││  │
│  │  [Recomendación]         │  │  └─────────────────────┘│  │
│  │  [Riesgos]               │  │                         │  │
│  │  [3 Pasos]               │  │  ┌─────────────────────┐│  │
│  │  [Qué NO hacer]          │  │  │ QUERY PLAN PANEL    ││  │
│  │                          │  │  │ Dominios: [Real Est]││  │
│  │  ─────────────────────   │  │  │ Rationale: ...      ││  │
│  │  [Respuesta IA]          │  │  │ Recommendation:     ││  │
│  │                          │  │  │ [Postergar]         ││  │
│  └──────────────────────────┘  │  └─────────────────────┘│  │
│                                                               │
└─────────────────────────────────────────────────────────────┘

Sidebar Entry: [Intelligence] — Acceso desde Anclora Nexus UI
```

### 7.1. Zona Central: Chat Console

- **Input**: Campo libre de texto (max 2000 caracteres)
- **Output**: Respuesta estructurada (diagnóstico → recomendación → riesgos → pasos → qué no hacer)
- **Historia**: Últimas 10 consultas con timestamps
- **Modo**: Toggle Fast ↔ Deep (en decision console)

### 7.2. Zona Derecha: Decision Console

- **Mode Selector**: Fast | Deep
  - **Fast**: 1-2 dominios, análisis rápido (60 segundos)
  - **Deep**: Máx 3 dominios, análisis exhaustivo (120 segundos)
- **Domain Selector**: Dropdown con Real Estate Mallorca (Phase 1), expandible Phase 2+
- **Confidence Meter**: 0.0-1.0 (indica certeza del análisis)
- **Flags**: Listado visual de flags críticos (overengineering-risk, labor-risk, hitl_required, etc.)

### 7.3. Zona Inferior: Query Plan Panel

- **Dominios Seleccionados**: [Real Estate Mallorca Premium]
- **Rationale**: Por qué se seleccionó este dominio
- **QueryPlan**: Detalles técnicos (colapsable, DEBUG mode)
- **Recommendation Visual**: [Ejecutar ✓] [Postergar ⏸] [Reformular ↻] [Descartar ✗]
- **Riesgos (Chips)**: labor-risk, tax-risk, brand-risk, focus-risk con color código (🟢 LOW, 🟡 MEDIUM, 🔴 HIGH)

### 7.4. Comportamiento Phase 1

**Lo que SÍ está:**
- Chat funcional
- Respuesta estructurada
- Modo Fast | Deep
- Decision Console
- QueryPlan básico
- Histórico simple

**Lo que NO está:**
- Evidence layer (NotebookLM — Phase 2)
- Multiagente visual
- Memoria persistente avanzada
- Export/integración con otros módulos
- Configuración de Strategic Mode desde UI (Git-only)

---

# PARTE IV — WORKFLOWS Y CASOS DE USO

## 8. User Story 1: Decisión sobre Excedencia/Cambio Laboral

**Escenario:**
Usuario considera solicitar excedencia en CGI para dedicarse 100% a inmobiliaria.

**Flujo:**

```
Usuario: "¿Es buen momento para solicitar excedencia en CGI?"

↓ ROUTER
Intención: Cambio laboral
Dominio sugerido: Real Estate (validación caja)
QueryPlan: {domains: [Real Estate], mode: Deep, confidence: 0.72}

↓ GOVERNOR
Strategic Mode v1: "No cambios laborales sin validación"
Risk Assessment:
  - labor-risk: HIGH (decisión irreversible)
  - tax-risk: MEDIUM (implicaciones fiscales)
  - focus-risk: MEDIUM (cambio de contexto)

Governor Decision:
  Recomendación: POSTERGAR
  Justificación: "Excedencia requiere ≥3 cierres validados. Hoy: 0. Postergar 6-12 meses."
  HITL: true (cambio laboral)
  
  Riesgos:
    labor: HIGH — Pérdida de contrato indefinido, estabilidad
    tax: MEDIUM — Implicaciones en SS, impuestos
    brand: LOW
    focus: MEDIUM — Cambio de contexto reduce productividad inicial

  Próximos 3 Pasos:
    1. Validar 3 cierres inmobiliarios con comisión neta comprobada
    2. Proyectar cash flow para 6 meses sin salario CGI
    3. Revisar con asesor fiscal implicaciones de excedencia vs. renuncia

  Qué NO hacer:
    - Comunicar a CGI hasta tener validación
    - Solicitar excedencia sin colchón de 6 meses
    - Asumir que excedencia = renuncia automática

↓ SYNTHESIZER
[Respuesta estructurada enviada a usuario]
[Flag hitl_required=true → usuario debe confirmar lectura]
[Audit: registrada en audit_log]
```

## 9. User Story 2: Decisión sobre Activación de Consultoría IA

**Escenario:**
Usuario considera lanzar "Anclora Cognitive Solutions" como línea de consultoría IA.

**Flujo:**

```
Usuario: "¿Debo activar Anclora Cognitive Solutions como nuevo negocio?"

↓ ROUTER
Intención: Expansión de línea de negocio
Dominio: Real Estate (validación base actual)
QueryPlan: {domains: [Real Estate], mode: Deep, confidence: 0.68}

↓ GOVERNOR
Strategic Mode v1: "No activar consultoría IA antes de validar base inmobiliaria"
Risk Assessment:
  - focus-risk: HIGH (dispersión, multiplicación sin validación)
  - overengineering-risk: HIGH (producto sin ingresos)
  - labor-risk: MEDIUM (requiere tiempo dedicación)

Governor Decision:
  Recomendación: POSTERGAR
  Justificación: "Consultoría IA está en Strategic Mode como NO-ACTIVAR en Fase 1. 
                  Esperar a ≥5 cierres validados y cash flow estable."
  
  Riesgos:
    labor: MEDIUM — Consumo de tiempo que resta a inmobiliaria
    tax: LOW
    brand: MEDIUM — Múltiples líneas antes de establecerse en una
    focus: HIGH — Atención dividida, menor probabilidad éxito inmobiliaria

  Próximos 3 Pasos:
    1. Validar 5 cierres inmobiliarios (≥6-12 meses)
    2. Automizar 80% de procesos inmobiliarios (para liberar tiempo)
    3. Revisar Strategic Mode Phase 2 para activación

  Qué NO hacer:
    - Comunicar existencia Anclora Cognitive Solutions públicamente
    - Invertir en producto antes de tracción inmobiliaria
    - Asumir que "IA premium" resolverá falta de foco

↓ SYNTHESIZER
[Respuesta clara sobre posterior, con timeline realista]
[Audit: registrada]
```

## 10. User Story 3: Decisión sobre Inversión Inmobiliaria

**Escenario:**
Usuario identifica propiedad premium en Andratx con potencial de negocio (reventa o inclusión portfolio).

**Flujo:**

```
Usuario: "Oportunidad en Andratx: Villa 5M€, venta 6M. ¿Entro como inversor silencioso o como agente?"

↓ ROUTER
Intención: Decisión inmobiliaria estratégica
Dominio: Real Estate Mallorca Premium
QueryPlan: {domains: [Real Estate Mallorca], mode: Deep, confidence: 0.88}

↓ GOVERNOR
Strategic Mode v1: Focus es generación ingresos, no inversión
Risk Assessment:
  - financial-risk: MEDIUM (capital requerido, cash tie-up)
  - labor-risk: LOW
  - tax-risk: MEDIUM (implicaciones plusvalía)
  - focus-risk: LOW (alineado con dominio)

Governor Decision:
  Recomendación: REFORMULAR
  Justificación: "En Fase 1, enfoque es comisiones (0 capital), no ownership.
                  Reformular como: ¿Puedo estructurar deal con comisión sin inversión propia?"
  
  Riesgos:
    labor: LOW
    tax: MEDIUM — Plusvalía inmobiliaria (consultar asesor)
    brand: LOW — Alineado con posicionamiento premium
    focus: LOW — Dentro de dominio

  Próximos 3 Pasos:
    1. Analizar estructura de deal: comisión vs. ownership
    2. Contactar propietario/intermediario para confirmar estructura
    3. Consultar asesor fiscal implicaciones de cada escenario

  Qué NO hacer:
    - Comprometerse a capital sin validar cash flow inmobiliaria
    - Asumir ownership como "diversificación"
    - Acelerar decisión por presión de timing

↓ SYNTHESIZER
[Respuesta con reencuadre estratégico]
[Audit: registrada]
```

---

# PARTE V — SCOPE Y LIMITACIONES

## 11. Qué Intelligence SÍ Hace (Phase 1)

✅ Recibe consultas abiertas  
✅ Analiza contra Strategic Mode v1  
✅ Identifica riesgos multidominio  
✅ Recomienda (Ejecutar|Postergar|Reformular|Descartar)  
✅ Genera 3 próximos pasos concretos  
✅ Marca contraindicaciones explícitas  
✅ Escalada automática a HITL si necesario  
✅ Auditoria inmutable de toda consulta  
✅ Control Center UI básico  
✅ Modo Fast | Deep  
✅ Dominio: Real Estate Mallorca Premium  

## 12. Qué Intelligence NO Hace (Phase 1)

❌ Ejecutar acciones autónomas  
❌ Realizar cambios en sistemas externos (CRM, emails, etc.)  
❌ Acceder a datos financieros privados  
❌ Cambiar Strategic Mode (Git-only)  
❌ Evidence layer (NotebookLM — Phase 2)  
❌ Multidominio operativo (Phase 2)  
❌ Integración con otros agentes (GEMs — Phase 3)  
❌ Exportar/compartir consultas públicamente  

## 13. Límites Explícitos

| Límite | Valor | Justificación |
|---|---|---|
| Máx dominios/consulta | 3 | Previene análisis paralizante |
| Máx tiempo procesamiento | 120 seg (Deep) | Respuesta ágil |
| Longitud respuesta | 800 palabras | Accionabilidad antes que exhaustividad |
| Histórico consultable | Últimas 50 | Privacidad, performance |
| Configuración vía UI | 0 % | Todo en Git (governance) |
| Ejecución autónoma | Prohibida | HITL obligatorio |

## 14. Diferimientos Explícitos

| Feature | Phase Prevista | Estado | Depende De |
|---|---|---|---|
| NotebookLM Bridge | Phase 2 | [DIFERIDO] | Validación Phase 1 + budget |
| Multi-Dominio operativo | Phase 2 | [DIFERIDO] | Strategic Mode v2 |
| GEM Agents | Phase 3 | [DIFERIDO] | Domain Packs completados |
| Configuración UI | Phase 3 | [DIFERIDO] | Madurez governor |
| Export/Integración | Phase 4 | [DIFERIDO] | Business case |
| Founder OS público | Post-Phase 3 | [DIFERIDO] | Tracción interna probada |

---

# PARTE VI — MÉTRICAS Y ÉXITO

## 15. Definición de Éxito (Phase 1)

**Métricas Técnicas:**
- ✅ Router clasifica intención con 85%+ accuracy
- ✅ Governor marca riesgos correctamente 90%+ de veces
- ✅ Tiempo respuesta: <60 seg (Fast) | <120 seg (Deep)
- ✅ Audit log: 100% de consultas registradas
- ✅ Uptime: 99%+

**Métricas Operativas:**
- ✅ Usuario realiza ≥3 consultas/semana
- ✅ Recomendaciones de Intelligence ejecutadas: 60%+
- ✅ Reduction en decision anxiety (feedback cualitativo)
- ✅ Cero violaciones constitucionales

**Métricas Estratégicas:**
- ✅ Intelligence previene 2+ decisiones overengineered
- ✅ Usuario aumenta claridad estratégica (medida en encuesta)
- ✅ Sistema es extractable sin modificación lógica core

---

# COLOFÓN

Anclora Intelligence es herramienta de ventaja competitiva invisible en Fase 1.

Su propósito es uno solo:

**Consolidar base sólida hoy para decidir con libertad mañana.**

No es producto. Es sistema nervioso.

Versión: **1.0-product-spec**  
Estado: **Norma Vigente (Phase 1-2)**  
Última actualización: **Febrero 2026**
