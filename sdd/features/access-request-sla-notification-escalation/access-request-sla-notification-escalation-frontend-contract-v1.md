# Frontend Contract v1 - Access Request SLA & Notification Escalation

## API Client

Extend `frontend/src/lib/access-requests-api.ts`:

```typescript
export type AccessRequestSlaSeverity = 'warning' | 'critical'
export type AccessRequestSlaReason = 
  | 'pending_older_than_24h'
  | 'pending_older_than_72h'
  | 'decision_email_failed'
  | 'decision_email_unknown'
  | 'retry_available'
  | 'provisioning_attention'

export interface AccessRequestSlaItem {
  request_id: string
  reason: AccessRequestSlaReason
  severity: AccessRequestSlaSeverity
  status: string
  product: string
  source: string
  email: string
  age_hours?: number
  audit_event_created: boolean
  suppressed_by_dedupe: boolean
  last_alert_at?: string
}

export interface AccessRequestSlaScanResponse {
  scan_id: string
  generated_at: string
  scanned_count: number
  alerts_created: number
  alerts_suppressed: number
  warning_count: number
  critical_count: number
  notification_status: string
  dedupe_window_hours: number
  items: AccessRequestSlaItem[]
}

export async function runAccessRequestSlaScan(): Promise<AccessRequestSlaScanResponse> {
  return authFetch<AccessRequestSlaScanResponse>('/api/access-requests/sla/scan', {
    method: 'POST',
  })
}
```

## UI Components

### `AccessRequestSlaPanel.tsx`
- Displays summary statistics from the last scan.
- Provides a "Run SLA Scan" button with loading state.
- Lists the `AccessRequestSlaItem` entries.
- Each entry links back to the request details.

## Translations

Add to `frontend/src/lib/i18n/translations.ts`:
- `accessRequestsSlaTitle`: "Cumplimiento de SLA"
- `accessRequestsRunSlaScan`: "Ejecutar escaneo SLA"
- `accessRequestsSlaScanSuccess`: "Escaneo SLA completado correctamente"
- `accessRequestsSlaScanError`: "Error al ejecutar escaneo SLA"
- `accessRequestsSlaAlertsCreated`: "Nuevas alertas creadas"
- `accessRequestsSlaAlertsSuppressed`: "Alertas duplicadas (suprimidas)"
- `accessRequestsSlaReasonPending24h`: "Pendiente > 24h"
- `accessRequestsSlaReasonPending72h`: "Pendiente > 72h (Crítico)"
- `accessRequestsSlaReasonEmailFailed`: "Error en email de decisión"
- `accessRequestsSlaReasonEmailUnknown`: "Estado de email desconocido"
- `accessRequestsSlaReasonRetryAvailable`: "Reintento disponible"
- `accessRequestsSlaReasonProvisioningAttention`: "Atención en aprovisionamiento"
