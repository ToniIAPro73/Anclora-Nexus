# OPTIMIZACION_FEATURES_ROADMAP.md

## Alcance de este roadmap
Este roadmap se ha construido a partir de:
- El documento adjunto `Optimización-Anclora-Nexus.pdf` (enfoque en integración con portales, agregadores, CRM, feeds XML, normalización y alertas).
- Los mocks en `public/docs/mocks` (dashboard de coste, prospección unificada, ficha de propiedad enriquecida, contactos por origen y settings de hard-stops).
- El estado real del producto (features ya implementadas: PBM, LSO, POU, CSL).

El objetivo es convertir Anclora Nexus en una plataforma operativa estable, escalable y optimizada en coste, sin romper la UX actual.

---

## Mejoras propuestas sobre el documento adjunto

### 1) De “integrar APIs” a “capa de conectores gobernada”
- Objetivo: evitar acoplar la app a cada portal/API.
- Motivo: el PDF propone varias fuentes, pero sin una capa anti-fragilidad.
- Mejora: introducir conectores con contrato interno único, versionado y fallback.
- Beneficio: menor coste de mantenimiento y menor riesgo ante cambios de terceros.

### 2) De “coste por proveedor” a “presupuesto por unidad de negocio”
- Objetivo: medir coste por lead útil, por match útil y por operación potencial.
- Motivo: el PDF se centra en viabilidad de integración, pero no en coste marginal real.
- Mejora: FinOps aplicado a flujos (captación, matching, enriquecimiento, scoring).
- Beneficio: decisiones de producto basadas en ROI comercial, no en coste bruto.

### 3) De “normalizar datos” a “calidad de dato con SLO”
- Objetivo: controlar frescura, completitud y deduplicación como SLO operativo.
- Motivo: normalizar no garantiza calidad sostenida.
- Mejora: pipeline de calidad (DQ rules + score de confianza por registro).
- Beneficio: mejores matches, menos ruido comercial y menos errores manuales.

### 4) De “webhooks” a “automatización segura con guardrails”
- Objetivo: automatizar sin disparar costes ni ruido operativo.
- Motivo: el PDF sugiere real-time, pero sin límites por tenant y por canal.
- Mejora: rate limits, colas por prioridad, ventanas horarias y hard-stops de gasto.
- Beneficio: estabilidad de operación y control de burn-rate.

### 5) De “feed XML” a “publicación multicanal gobernada”
- Objetivo: soportar XML/JSON por portal con validación previa.
- Motivo: los portales exigen formatos heterogéneos; errores rompen publicación.
- Mejora: motor de exportación con validadores por canal y sandbox de pruebas.
- Beneficio: menos rechazos de feed y más velocidad de salida a mercado.

---

## Orden de ejecución recomendado (criticidad -> impacto)

## Fase 1 (Crítica): Fundaciones de coste y gobierno de datos
- Objetivo: evitar seguir creciendo con deuda operativa.
- Motivo: sin observabilidad de coste/calidad, cualquier integración escala mal.
- Beneficio: base sólida para todo lo demás.
- Feature name: `cost-governance-foundation`

## Fase 2 (Alta): Conectores de captación y normalización unificada
- Objetivo: incorporar portales y fuentes sociales sin duplicar lógica.
- Motivo: el valor comercial depende de volumen + calidad de señales externas.
- Beneficio: más inventario y más leads con menor coste de integración incremental.
- Feature name: `source-connectors-unified-ingestion`

## Fase 3 (Alta): Calidad de dato y deduplicación cross-source
- Objetivo: asegurar que cada entidad (propiedad/lead) sea fiable y trazable.
- Motivo: la mezcla de fuentes produce colisiones, duplicados y falsos positivos.
- Beneficio: subida directa de precisión de scoring y matching.
- Feature name: `data-quality-and-entity-resolution`

## Fase 4 (Alta): Prospección unificada operativa
- Objetivo: consolidar en una sola experiencia la prospección manual/widget/pbm.
- Motivo: hoy la información está distribuida y genera fricción de uso.
- Beneficio: menos clics, mejor productividad diaria de owner/manager.
- Feature name: `prospection-unified-workspace`

## Fase 5 (Media-Alta): Publicación multicanal (XML/JSON) con validación
- Objetivo: publicar cartera propia en canales externos de forma robusta.
- Motivo: monetización requiere distribución fiable, no solo captación.
- Beneficio: mayor alcance comercial con menos errores de publicación.
- Feature name: `multichannel-feed-orchestrator`

## Fase 6 (Media-Alta): Origen + editabilidad gobernada en contactos y propiedades
- Objetivo: reglas claras de qué campo se puede editar según origen.
- Motivo: ya existe parte en propiedades/contactos, pero falta contrato integral.
- Beneficio: consistencia legal/comercial y menor riesgo de sobrescritura indebida.
- Feature name: `origin-aware-editability-policy`

## Fase 7 (Media): Matching comercial explicable + ranking de oportunidad
- Objetivo: priorizar combinaciones comprador-propiedad con score interpretable.
- Motivo: no basta score alto; hace falta explicar “por qué” y “acción siguiente”.
- Beneficio: mayor conversión del pipeline de oportunidades.
- Feature name: `explainable-opportunity-ranking`

## Fase 8 (Media): Alertas inteligentes y automatización con guardrails
- Objetivo: activar avisos útiles (nuevo match fuerte, cambio de precio, etc.).
- Motivo: automatizar sin control genera fatiga y coste.
- Beneficio: más velocidad comercial sin ruido operativo.
- Feature name: `guardrailed-automation-and-alerting`

## Fase 9 (Media): Dashboard FinOps + KPI comercial integrado
- Objetivo: visualizar coste, productividad y rendimiento en una vista ejecutiva.
- Motivo: hoy los indicadores están fragmentados.
- Beneficio: decisiones rápidas de inversión y priorización.
- Feature name: `finops-and-commercial-command-center`

## Fase 10 (Media-Baja): Simulador de margen y comisión por operación
- Objetivo: estimar rentabilidad real por oportunidad antes de invertir esfuerzo.
- Motivo: priorizar por ticket no siempre implica mejor margen.
- Beneficio: asignación eficiente de tiempo del equipo.
- Feature name: `deal-margin-simulator`

## Fase 11 (Baja): Observatorio de rendimiento de fuentes y canales
- Objetivo: saber qué fuente aporta mejor inventario y mejores compradores.
- Motivo: optimización continua del mix de adquisición.
- Beneficio: reducción progresiva de CAC y mejor LTV potencial.
- Feature name: `source-performance-observatory`

---

## Notas de integración con lo ya existente
- No se propone reemplazar pantallas actuales; se propone integración incremental sobre dashboard, prospección, propiedades y contactos.
- Las features implementadas (`lead-source-observability`, `property-origin-unification`, `currency-surface-localization`, `prospection-matching`) se toman como base, no como trabajo perdido.
- Cada nueva feature debe seguir el flujo SCC/SDD (spec, migration, test-plan, prompts por agente, gate final).

---

## Resultado esperado
Con este orden, Anclora Nexus pasa de “producto funcional con piezas avanzadas” a “plataforma comercial gobernada por coste, calidad de dato y conversión”, manteniendo velocidad de entrega sin sacrificar estabilidad.

