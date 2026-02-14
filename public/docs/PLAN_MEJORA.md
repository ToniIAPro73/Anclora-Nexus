# PLAN_MEJORA: Anclora Nexus

## Objetivo del plan
Estabilizar de forma definitiva identidad, roles y accesos; luego escalar calidad técnica, experiencia de usuario y capacidad operativa del producto.

## Criterio de priorización
- Fase 1 = máxima criticidad (bloquea operación).
- Fase 2 = alta criticidad (evita regresiones y deuda peligrosa).
- Fase 3 = media criticidad (mejora velocidad y confianza).
- Fase 4 = optimización (valor incremental).

## Fase 1. Estabilidad de accesos y roles (máxima criticidad)
## 1.1 Definir contrato único de acceso
- Acción:
  - Documentar oficialmente el flujo permitido:
    - login con password,
    - alta solo por invitación (o bootstrap inicial),
    - recuperación de contraseña.
  - Desactivar rutas ambiguas no deseadas en UI.
- Motivo:
  - El usuario final no puede navegar decisiones técnicas.
- Beneficio:
  - Menos errores de entrada y soporte más simple.

## 1.2 Blindar reglas en base de datos
- Acción:
  - Aplicar y validar migraciones de integridad (`015`, `016`).
  - Verificar constraints:
    - owner activo único por org,
    - estados/roles normalizados,
    - consistencia de membresías activas.
- Motivo:
  - Si la BD permite estados inválidos, cualquier capa superior acabará fallando.
- Beneficio:
  - Prevención real de inconsistencias.

## 1.3 Centralizar autorizaciones en backend
- Acción:
  - Revisar endpoints críticos (`members`, `invitations`, cambios de rol).
  - Asegurar que frontend solo refleja reglas, no las define.
- Motivo:
  - Seguridad y comportamiento deben vivir en una fuente de verdad.
- Beneficio:
  - Menor riesgo de bypass y comportamientos divergentes.

## 1.4 Runbook de reparación de usuarios
- Acción:
  - Mantener script admin de reconciliación de usuario.
  - Crear procedimiento estándar para soporte:
    - confirmar usuario,
    - reset password,
    - sincronizar perfil y membresía.
- Motivo:
  - Incidentes de acceso seguirán ocurriendo si no hay operación guiada.
- Beneficio:
  - Resolución rápida y repetible.

## Fase 2. Endurecimiento técnico y anti-regresión (alta criticidad)
## 2.1 Suite de pruebas de identidad/membresía
- Acción:
  - Añadir tests E2E de flujos críticos:
    - owner bootstrap,
    - invitación manager,
    - signup invitado,
    - no invitado bloqueado,
    - cambio de rol y último owner.
- Motivo:
  - El problema principal es regresión funcional por cambios sucesivos.
- Beneficio:
  - Menos “romper-arreglar-romper” en producción.

## 2.2 Contratos API y errores consistentes
- Acción:
  - Estandarizar códigos y mensajes de error (`401/403/409/422`).
  - Evitar respuestas no-JSON en rutas API.
- Motivo:
  - Errores ambiguos degradan UX y dificultan debugging.
- Beneficio:
  - Frontend más robusto y soporte más rápido.

## 2.3 Observabilidad mínima obligatoria
- Acción:
  - Correlation ID por request.
  - Log estructurado para:
    - auth failures,
    - permission denied,
    - role mutation,
    - invitation lifecycle.
- Motivo:
  - Sin trazabilidad clara, cada incidencia se investiga “a ciegas”.
- Beneficio:
  - Diagnóstico preciso y menor tiempo de resolución.

## Fase 3. Experiencia de usuario y operación diaria (criticidad media)
## 3.1 UX de autenticación guiada
- Acción:
  - Mensajes explícitos por causa:
    - credenciales incorrectas,
    - cuenta no confirmada,
    - invitación requerida,
    - cuenta sin membresía activa.
  - Microcopy orientada a acción.
- Motivo:
  - Un buen sistema puede parecer roto si no explica bien errores.
- Beneficio:
  - Menor frustración y menos soporte manual.

## 3.2 Panel de administración de equipo más explícito
- Acción:
  - Mostrar reglas del sistema en UI:
    - owner único,
    - qué roles se pueden invitar,
    - cuándo no se puede eliminar/promocionar.
- Motivo:
  - Evitar intentos inválidos repetidos.
- Beneficio:
  - Gestión de equipo más predecible.

## 3.3 Manual operativo interno
- Acción:
  - Procedimientos para:
    - onboarding de nuevos miembros,
    - recuperación de acceso,
    - corrección de inconsistencias,
    - cambios de entorno local/cloud.
- Motivo:
  - La estabilidad también depende de operación, no solo de código.
- Beneficio:
  - Menor dependencia de conocimiento implícito.

## Fase 4. Escalado funcional y calidad continua (criticidad menor)
## 4.1 Gobierno de cambios
- Acción:
  - Checklist previo a merge para dominios críticos:
    - auth,
    - roles,
    - membership,
    - migrations.
- Motivo:
  - Evita introducir deuda en módulos sensibles.
- Beneficio:
  - Evolución sostenida del producto.

## 4.2 QA funcional recurrente
- Acción:
  - Test semanal de smoke:
    - login owner,
    - invitación y aceptación,
    - acceso dashboard,
    - cambio de rol manager.
- Motivo:
  - Detectar degradaciones tempranas.
- Beneficio:
  - Menos interrupciones de negocio.

## 4.3 Hoja de ruta de producto tras estabilización
- Acción:
  - Reanudar foco en valor comercial:
    - lead intake,
    - prospección semanal,
    - recap,
    - optimización de pipeline.
- Motivo:
  - El objetivo final es productividad, no solo corrección técnica.
- Beneficio:
  - Mayor impacto real en captación y cierre.

## Métricas de éxito del plan
- <2% de intentos de login fallidos por causa no-credencial.
- 0 incidencias de doble owner activo.
- 0 accesos de no invitados al dashboard.
- Resolución de incidencias de acceso en <15 minutos.
- Cobertura de tests críticos de identidad/membresía >80%.

## Resultado esperado al completar fases 1-2
Anclora Nexus pasa de un estado de alta fricción operativa a un sistema estable, auditable y predecible en su núcleo de identidad/autorización, habilitando crecimiento funcional sin inestabilidad recurrente.

