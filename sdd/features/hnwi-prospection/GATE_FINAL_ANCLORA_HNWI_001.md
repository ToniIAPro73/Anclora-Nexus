# GATE FINAL – HNWI Prospection v1 (ANCLORA-HNWI-001)

**Fecha**: [a rellenar]
**Responsable QA**: [a rellenar]

## Precondiciones (Obligatorias)
- [ ] Migración de base de datos aplicada y verificada
- [ ] Workflow n8n v2 funcionando correctamente durante 48h
- [ ] Scoring logic validado con las 6 nacionalidades prioritarias
- [ ] Integración con outreach email supervisado probada
- [ ] Eventos FinOps generándose correctamente
- [ ] Dashboard de Source Observatory mostrando datos

## Checklist de Gates

### 1. Funcionalidad
- [ ] Scoring automático funciona correctamente
- [ ] Leads Hot con email verificado generan brief + email draft automáticamente
- [ ] Ingesta en Nexus 100% exitosa
- [ ] Eventos FinOps registrados con todos los metadatos

### 2. Rendimiento
- [ ] Tiempo promedio de procesamiento por lead < 5 segundos
- [ ] Workflow n8n soporta 100+ leads en menos de 10 minutos
- [ ] Sin errores de rate limiting en LinkedIn/Facebook

### 3. Calidad de Datos
- [ ] 95%+ de leads tienen nacionalidad y zona de interés detectadas
- [ ] Scoring coincide con intención real del lead
- [ ] No se procesan perfiles sin intención pública

### 4. Cumplimiento y Seguridad
- [ ] Cumplimiento GDPR verificado
- [ ] El email incluye lenguaje no invasivo y opción clara de no continuar
- [ ] Trazabilidad completa de fuente y consentimiento

### 5. Documentación
- [ ] SDD completo actualizado
- [ ] Workflow n8n documentado
- [ ] Guía de uso para el equipo comercial

## Resultado Esperado

**GO** → Feature lista para producción  
**NO-GO** → Lista priorizada de fixes (máximo 5 días)

**Aprobación Final**:
- [ ] QA Lead
- [ ] Product Owner (Toni)
- [ ] Technical Gate (Grok)

---

**Fin del Gate Final**
