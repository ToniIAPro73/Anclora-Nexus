# ANCLORA INTELLIGENCE — REGLAS OPERACIONALES
## Directrices, Anti-Patterns y Señales de Riesgo
### .agent/rules/anclora-intelligence.md

> **Naturaleza:** Directrices operacionales para ejecutores, desarrolladores y tomadores de decisión.
> **Jerarquía:** Subordinadas a intelligence-constitution.md. En caso de conflicto, prevalece Constitution.
> **Aplicación:** Obligatorias durante Phase 1-2. Revisables en Phase 3.

---

# PARTE I — PRINCIPIOS OPERACIONALES

## 1. Regla #1: "Consolidar Base Sólida Hoy Para Decidir Con Libertad Mañana"

Este es el **principio rector** que gobierna cada recomendación de Intelligence.

**Aplicación:**

Toda recomendación que pase por Governor deberá responder estos 5 filtros en orden:

```
1. ¿Consolida base financiera de la línea actual (inmobiliaria)?
   └─ Sí → Pasar a pregunta 2
   └─ No → Ir a pregunta 4

2. ¿Reduce riesgo estructural (laboral, fiscal, operativo)?
   └─ Sí → Pasar a pregunta 3
   └─ No → Ir a pregunta 4

3. ¿Aumenta opcionalidad futura (da más opciones, no menos)?
   └─ Sí → RECOMENDACIÓN: Ejecutar
   └─ No → Ir a pregunta 5

4. ¿Es expansión prematura (nueva línea, nuevo rol, nueva estructura)?
   └─ Sí → RECOMENDACIÓN: Postergar
   └─ No → Pasar a pregunta 5

5. ¿Puede esperar hasta validación de base actual?
   └─ Sí → RECOMENDACIÓN: Postergar
   └─ No → RECOMENDACIÓN: Reformular (encontrar versión postcopa)
```

**Impacto en recomendaciones:**

- Si pregunta 1-3 = Sí: **EJECUTAR**
- Si pregunta 4-5 = Sí: **POSTERGAR** (sin excepciones en Phase 1)
- Si ambiguo: **REFORMULAR** (encontrar alternativa que consolide sin expandir)
- Si imposible reformular: **DESCARTAR**

**Ejemplos de aplicación:**

| Consulta | Q1 | Q2 | Q3 | Q4 | Q5 | Recomendación |
|---|---|---|---|---|---|---|
| "¿Solicito excedencia en CGI?" | No | No | No | Sí | Sí | **POSTERGAR** |
| "¿Activo consultoría IA?" | No | No | No | Sí | Sí | **POSTERGAR** |
| "¿Invierto en AI tools para prospección?" | Sí | Sí | Sí | No | No | **EJECUTAR** |
| "¿Hago SL ahora?" | No | No | No | Sí | Sí | **POSTERGAR** |
| "¿Busco más leads en Andratx?" | Sí | Sí | Sí | No | No | **EJECUTAR** |

---

# PARTE II — ANTI-PATTERNS Y SEÑALES DE RIESGO

## 2. Anti-Pattern #1: Sobreingeniería Tecnológica Prematura

**Definición:**
Invertir en arquitectura, tools, productos o procesos sofisticados sin ingresos comprobados que justifiquen la inversión.

**Indicadores (FLAGS):**

- `overengineering-risk=HIGH`: Activa automáticamente si Governor detecta:
  - Propuesta de arquitectura sin tracción
  - Herramienta enterprise para necesidad simple
  - Producto nuevo sin validación de mercado
  - Automatización sofisticada de proceso 0x (volumen actual bajo)

**Ejemplos de Sobreingeniería (NO HACER):**

❌ "Creo un dashboard Founder OS antes de validar inmobiliaria"  
❌ "Activo NotebookLM sin haber usado Intelligence 50 veces"  
❌ "Construyo API multi-dominio cuando tengo 1 dominio"  
❌ "Hago SL para vender IA strategy cuando no tengo clientes"  
❌ "Invierto en ChatGPT Teams sin ROI medible en tasks"  

**Acción correcta:**
Si Governor marca `overengineering-risk=HIGH`, recomendación = **POSTERGAR** automáticamente.

---

## 3. Anti-Pattern #2: Multiplicación de Líneas Sin Caja Consolidada

**Definición:**
Activar nuevas líneas de negocio, estructura legal, o marca antes de que la línea actual genere cash flow validado.

**Indicadores (FLAGS):**

- `focus-risk=HIGH`: Activa si:
  - Propone nueva línea sin validación cash flow actual
  - Multiplica productos/servicios simultaneamente
  - Requiere dedicación parcial a ambas
  - Consumirá >10% del tiempo del owner

**Ejemplos de Multiplicación (NO HACER):**

❌ "Lanzo Anclora Cognitive Solutions antes de 3 cierres inmobiliarios"  
❌ "Abro rama de asesoría inmobiliaria mientras construyo IA OS"  
❌ "Hago consultoría de operaciones mientras prospecto"  
❌ "Empiezo a vender templates mientras valido product-market-fit"  

**Umbrales de Validación:**

| Línea | Cash Flow Mínimo | Duración | Hito Antes Expansión |
|---|---|---|---|
| Anclora Private Estates (Inmobiliaria) | €5k neto/mes | 3-6 meses | 3-5 cierres comprobados |
| Anclora Cognitive Solutions (IA) | N/A (diferido) | N/A | Inmobiliaria: €5k/mes stable |
| Anclora Labs (R&D) | N/A (diferido) | N/A | Dos líneas anteriores consolidadas |

**Acción correcta:**
Si propuesta viola umbrales, recomendación = **POSTERGAR** con timeline explícito.

---

## 4. Anti-Pattern #3: Cambios Laborales Emocionales Sin Validación

**Definición:**
Tomar decisiones irreversibles sobre relación laboral (excedencia, renuncia, cambio contrato) basadas en frustración o urgencia, no en validación operativa.

**Indicadores (FLAGS):**

- `labor-risk=HIGH`: Activa si propone cambio laboral sin:
  - Validación de cash flow alternativo (mín 6 meses)
  - Asesoramiento fiscal y legal
  - Plan de transición explícito
  - Señales objetivas (≥3 cierres validados)

**Decisiones PROHIBIDAS Sin HITL:**

❌ Solicitar excedencia  
❌ Renunciar a contrato indefinido  
❌ Cambiar a jornada parcial  
❌ Suspender relación laboral  

**Acción correcta:**
Governor marca `hitl_required=true`. Recomendación = **POSTERGAR** hasta confirmación humana explícita.

---

## 5. Anti-Pattern #4: Expansión de Marca Antes de Validación

**Definición:**
Comunicar, posicionar o expandir públicamente una marca/línea antes de que esté operativamente validada.

**Indicadores (FLAGS):**

- `brand-risk=HIGH`: Activa si propone:
  - Lanzar website/landing página de nueva línea
  - Publicar contenido sobre nuevo producto
  - Registrar dominio de nueva marca
  - Anunciar cambio público de positioning

**Ejemplos (NO HACER):**

❌ "Publico post sobre Anclora Cognitive Solutions sin tener clientes"  
❌ "Creo website de IA antes de validar inmobiliaria"  
❌ "Anuncio cambio a consultoría en LinkedIn prematuramente"  
❌ "Hago presencia pública en IA antes de tracción real"  

**Excepción:**
Contenido **discreto, educativo, sin venta** (blog sobre luxury real estate, tips de inversión) está permitido en Fase 1. Comunicar existencia de nuevo negocio = NO.

---

## 6. Anti-Pattern #5: Decisiones Anticipadas Sin Señales Objetivas

**Definición:**
Anticipar cambios (laborales, estructurales, de dedicación) basándose en planes hipotéticos, no en señales reales del mercado.

**Indicadores (FLAGS):**

- `focus-risk=MEDIUM`: Activa si propone decisión que depende de:
  - "Si tengo X clientes en futuro"
  - "Cuando genere Y ingresos"
  - "Cuando valide Z"
  - Sin timeline ni hito claro

**Ejemplos (NO HACER):**

❌ "Asumo que en 6 meses tendré ingresos → pido excedencia ahora"  
❌ "Asumo que Intel funcionará → invierto tiempo en IA OS ahora"  
❌ "Supongo que venderé asesoría → creo SL anticipada"  

**Acción correcta:**
Recomendación = **REFORMULAR**. Encontrar hitos objetivos antes de cualquier cambio.

---

# PARTE III — REGLAS EXPLÍCITAS DE GOVERNOR

## 7. Regla #7: Máximo 3 Dominios Por Consulta

**Obligatorio:**

El Router selecciona máx 3 dominios. Si consulta requiere análisis de 4+:

1. Governor rechaza automáticamente
2. Sugiere dividir en múltiples consultas
3. Registra en `flags: ["too_many_domains"]`

**Justificación:**
Previene análisis paralizante. Prioriza acción sobre exhaustividad.

---

## 8. Regla #8: Recomendación Nunca Sin Justificación Lógica

**Obligatorio:**

Toda recomendación debe incluir:

```
RECOMENDACIÓN: [Ejecutar | Postergar | Reformular | Descartar]

PORQUE:
1. [Criterio 1]: [Evaluación]
2. [Criterio 2]: [Evaluación]
3. [Criterio 3]: [Evaluación]
```

No aceptar respuestas vagas ("parece buena idea"). Exigir lógica.

---

## 9. Regla #9: Próximos 3 Pasos Exactamente, No Más, No Menos

**Obligatorio:**

`GovernorDecision.next_steps` deberá contener **exactamente 3 elementos**, siempre.

**Formato:**

```
1. [Acción concreta, verificable, reversible o pausable]
2. [Señal de validación que confirma paso 1]
3. [Punto de revisión/escalación si falla paso 2]
```

**No aceptar:**
- Menos de 3 pasos (incompleto)
- Más de 3 pasos (sobrecomplejidad)
- Pasos vagos ("piensa sobre esto")
- Pasos permanentes sin punto de reversión

---

## 10. Regla #10: "Qué NO Hacer" Es Tan Importante Como "Qué Hacer"

**Obligatorio:**

Toda respuesta debe incluir lista explícita de contraindicaciones.

**Ejemplos correctos:**

```
QUÉ NO HACER AHORA:
- No pedir excedencia sin validar 3 cierres comprobados
- No comunicar a CGI hasta tener plan de transición
- No asumir que excedencia = renuncia automática
```

**Justificación:**
Previene acciones por asunción. Marca explícitamente lo prohibido.

---

## 11. Regla #11: HITL Escalation es Automática, No Discrecional

**Obligatorio:**

Governor marca `hitl_required=true` **automáticamente** si:

- Recomendación involucra cambio laboral (excedencia, renuncia, contrato)
- Propone nueva estructura legal (SL, consultoría registrada)
- Risk score de labor o tax es HIGH
- Propone inversión >€5k sin cash flow comprobado

En estos casos, endpoint retorna status="escalated", no "success". UI muestra "Requiere confirmación humana".

**No hay excepciones** en Phase 1.

---

## 12. Regla #12: Strategic Mode es Inmutable en Runtime

**Obligatorio:**

- Strategic Mode se lee desde Git versionado
- Nunca se modifica desde UI o endpoint
- Cambio requiere commit con justificación explícita
- Loader cachea pero invalidate automáticamente cada 24h

**No aceptar:**
- Modificaciones dinámicas de Strategic Mode
- Hardcoding de reglas en código
- Overrides desde UI

---

## 13. Regla #13: Audit Log es Append-Only, Sin Excepciones

**Obligatorio:**

- Toda consulta se registra en `intelligence_audit_log`
- Registro incluye: user, timestamp, message, router output, governor output, flags, status
- No se pueden editar ni borrar registros históricos
- Fallos de audit no rompen endpoint (se añade flag `audit-write-failed=true`)

---

# PARTE IV — SEÑALES DE VALIDACIÓN Y PROGRESIÓN

## 14. Hitos de Validación Por Fase

### Phase 1: Validación (M1-M2)

**Hitos Intel operativos:**

- ✅ Router clasifica intención con 85%+ accuracy
- ✅ Governor evalúa riesgos correctamente
- ✅ Usuario realiza ≥3 consultas/semana
- ✅ Recomendaciones de Intelligence se ejecutan 60%+
- ✅ Cero violaciones constitucionales
- ✅ Audit log 100% complete

**Hitos operacionales (independientes de Intel):**

- ✅ ≥1 cierre inmobiliario validado
- ✅ Cash flow positivo en línea de inmobiliaria
- ✅ Procesos repetibles (prospeción, prospección, cierre)

### Phase 2: Escalación (M2-M3)

**Hitos para pasar a Phase 2:**

- ✅ Phase 1 hitos cumplidos
- ✅ ≥3 cierres comprobados en inmobiliaria
- ✅ Cash flow ≥€2k/mes en línea actual
- ✅ NotebookLM integrado (evidence layer)
- ✅ Strategic Mode v1.1 validado

**Nuevas capacidades Phase 2:**
- Multi-dominio operativo (Real Estate + Founder OS preparado)
- Integración con historial de decisiones
- Evidence layer (papers, datos, validaciones)

### Phase 3+ (Diferido)

No evaluar progresión hasta Phase 2 completada.

---

# PARTE V — MONITOREO Y ESCALACIÓN

## 15. Red Flags de Riesgo Crítico

Si Governor detecta cualquiera, marca con **flag crítica** y registra para review:

| Flag | Significado | Acción |
|---|---|---|
| `constitutional_violation` | Intento de violar Regla de Oro | Kill Switch L3 + Alert |
| `labor_risk_high_unvalidated` | Cambio laboral sin cash flow validado | HITL requerido |
| `overengineering_risk_high` | Inversión técnica sin tracción | POSTERGAR automático |
| `focus_risk_critical` | Multiplicación extrema sin validación | POSTERGAR + Timeline |
| `brand_risk_premature_expansion` | Expansión de marca antes de validación | DESCARTAR |
| `audit_write_failed` | Fallo en registro de consulta | Alert, pero no rompe endpoint |

## 16. Revisión Periódica de Reglas

**Cadencia:**

- **Semanal**: Review de flags críticas (Constitutional violations, HITL escalations)
- **Mensual**: Review de anti-patterns activados (overengineering, multiplicación, expansión prematura)
- **Trimestral**: Evaluación de efectividad de reglas, propuesta de ajustes

**Procedimiento:**
Cualquier cambio a estas Rules debe pasar por governance commit con justificación.

---

# COLOFÓN

Estas reglas operacionales no son sugerencias.

Son **barreras de protección** contra:
- Sobreingeniería tecnológica
- Multiplicación de líneas sin validación
- Decisiones laborales emocionales
- Expansión de marca prematura
- Antecedente sin validación

Cumplen el propósito central:

**Consolidar base sólida hoy para decidir con libertad mañana.**

Versión: **1.0-rules**  
Estado: **Norma Vigente (Phase 1)**  
Última actualización: **Febrero 2026**
