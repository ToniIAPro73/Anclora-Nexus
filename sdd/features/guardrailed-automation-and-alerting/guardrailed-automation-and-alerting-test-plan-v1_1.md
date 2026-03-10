# Test Plan - Guardrailed Automation and Alerting v1.1

1. Verify operational alert candidates are generated for degraded territorial pipeline and connectors.
2. Verify stale or recovered conditions resolve prior operational alerts.
3. Verify `GET /api/automation/alerts` returns scope, severity and metadata.
4. Verify `/automation-alerting` surfaces critical alerts and operational scopes.
