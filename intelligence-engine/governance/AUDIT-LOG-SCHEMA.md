# AUDIT-LOG-SCHEMA: Intelligence Governance

## 1. Estrategia de Auditoría
Toda acción estratégica o ejecución de skill debe ser registrada en una tabla inmutable `intelligence_audit_log` con integridad verificada.

## 2. Schema de Registro (JSON)
```json
{
  "audit_id": "uuid",
  "timestamp": "iso-8601",
  "actor": {
    "agent_id": "uuid",
    "user_id": "uuid"
  },
  "action": "string (e.g. SKILL_EXECUTION)",
  "payload": {
    "input": "object",
    "output": "object",
    "metadata": {
      "llm_provider": "openai",
      "tokens": 123
    }
  },
  "security": {
    "hmac_sha256": "string",
    "nonce": "string"
  }
}
```

## 3. Reglas de Gobernanza
- **Inmutabilidad**: Prohibido `UPDATE` o `DELETE` en la tabla de logs.
- **Transparencia**: El frontend debe mostrar el `audit_id` en cada respuesta de inteligencia.
- **Compliance**: Los logs deben ser exportables a CSV para revisión manual de cumplimiento legal (GDPR).

## 4. Auditoría de Skills
Cada skill tiene su propio sub-schema de metadatos dentro del payload para facilitar el filtrado analítico.
