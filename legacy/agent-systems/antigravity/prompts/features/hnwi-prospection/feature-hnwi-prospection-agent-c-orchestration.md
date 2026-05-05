AGENT C (Orchestration)

Responsabilidad:
- adaptar `n8n_hnwi_prospection_workflow_v2.json`
- normalizar payloads externos al contrato real de Nexus
- disparar `generate-outreach` solo para leads `hot` con `email_verified=true`

No invadir:
- schema SQL
- lógica core de scoring
