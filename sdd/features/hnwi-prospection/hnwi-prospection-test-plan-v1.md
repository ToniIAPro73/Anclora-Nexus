# HNWI Prospection – Test Plan v1 (ANCLORA-HNWI-001)

## 1. Objetivo del Plan de Pruebas
Validar que el sistema de prospección HNWI funcione correctamente, sea escalable, cumpla con GDPR y se integre perfectamente con el stack existente de Anclora Nexus.

## 2. Alcance de las Pruebas

### 2.1 Pruebas Unitarias
- Scoring logic (reglas de puntuación)
- Parser de leads (LinkedIn, Facebook, Reddit, Google Alerts)
- Validación de campos obligatorios

### 2.2 Pruebas de Integración
- Flujo completo: Detección → Enriquecimiento → Scoring → Ingesta en Nexus
- Integración con Email Qualification / Draft Preparation (solo leads Hot con email verificado)
- Generación de eventos FinOps
- Actualización de métricas en Source Observatory

### 2.3 Pruebas E2E
- Prospección manual → Lead Hot → Brief + email draft automático
- Múltiples canales en paralelo
- Carga de 50+ leads en menos de 5 minutos

### 2.4 Pruebas de Seguridad y Cumplimiento
- GDPR: Consentimiento implícito, opción de baja, trazabilidad
- No se procesan datos de perfiles sin intención pública
- Rate limiting y protección contra abuso

## 3. Casos de Prueba Principales

### 3.1 Caso: Lead Alemán Hot
**Input**: Perfil LinkedIn alemán buscando villa en Andratx con presupuesto €3M+
**Resultado Esperado**:
- Score ≥ 75
- Tier = "hot"
- Generación automática de email draft en menos de 30 segundos
- Evento FinOps registrado

### 3.2 Caso: Lead Británico Warm
**Input**: Post en Reddit buscando información sobre propiedades en Calvià
**Resultado Esperado**:
- Score 50-69
- Tier = "warm"
- Ingesta correcta en Nexus sin outreach automático cuando no hay email verificado
- Disponible para nurturing manual

### 3.3 Caso: Carga Masiva
**Input**: 100 leads de diferentes canales en 10 minutos
**Resultado Esperado**:
- 100% de ingestión exitosa
- Tiempo promedio por lead < 3 segundos
- Sin errores de rate limiting

## 4. Checklist de QA (Obligatorio antes de Gate)

- [ ] Scoring funciona correctamente para las 6 nacionalidades prioritarias
- [ ] El email draft solo se genera en leads Hot con `email_verified=true`
- [ ] Todos los eventos se registran en FinOps
- [ ] Dashboard de Source Observatory muestra datos correctos
- [ ] No se procesan perfiles sin intención pública
- [ ] Opción de baja funciona correctamente
- [ ] Workflow n8n v2 se ejecuta sin errores durante 24h
- [ ] Migración de base de datos se aplica correctamente
- [ ] El subject/body de email soporta es/en/de si se requiere

## 5. Herramientas de Prueba
- Postman / Bruno para testing de APIs
- n8n Execution Log para workflows
- Supabase Dashboard para verificación de datos
- Cliente email o SMTP sandbox para validación de envíos

## 6. Criterios de Aceptación (Go / No-Go)

**GO** si:
- 95%+ de los casos de prueba pasan
- No hay P0 o P1 abiertos
- Tiempo de respuesta promedio < 5 segundos
- Cumplimiento GDPR verificado

**NO-GO** si:
- Falla la generación del email draft o la preparación del envío supervisado
- Pérdida de datos o eventos FinOps
- Violación de privacidad detectada

---

**Fin del Test Plan v1**
