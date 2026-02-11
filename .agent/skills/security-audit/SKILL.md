```markdown
---
name: security-audit
description: "Verificar seguridad del proyecto: RLS policies, audit log inmutabilidad, input sanitization, OWASP LLM Top 10, rate limiting. Usar cuando se pida auditar seguridad, verificar compliance, o revisar vulnerabilidades."
---

# Security Audit Skill

## Contexto
Lee spec.md Seccion 20 (Seguridad, Auditoria y Compliance) completa.
Lee constitution.md Titulo XI (Seguridad).

## Instrucciones

### Checklist de Verificacion
Ejecutar TODOS los items del QA Checklist (spec.md Seccion 27):

1. RLS: Intentar query cross-org. Debe fallar.
2. audit_log: Intentar UPDATE y DELETE. Debe fallar.
3. HITL E2E: Crear ticket > verificar notificacion < 3s > aprobar > ejecutar.
4. Kill Switch: Activar L1-L4. Agente se detiene < 5s.
5. Input sanitization: Inyectar prompt injection patterns. Deben ser redactados.
6. MFA: TX > EUR 500 sin MFA debe ser bloqueada.
7. Stripe idempotency: Doble-envio no duplica pago.
8. Docker sandbox: MCP sin network no resuelve DNS.
9. JWT: Verificar expiracion 30min access, 7d refresh.
10. Env vars: grep recursivo confirma 0 secrets en codigo.

### Herramientas
```bash
# OWASP ZAP scan
docker run -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t $STAGING_URL

# Trivy container scan
trivy image openclaw-agent:latest --severity CRITICAL,HIGH

# Dependency audit
npm audit --production
pip-audit
```

## Criterios de Aceptacion
- 0 findings Critical en OWASP ZAP
- 0 findings High en Trivy
- Todos los items del checklist pasan
```

---