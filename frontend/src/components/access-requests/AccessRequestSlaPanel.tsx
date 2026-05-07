'use client'

import React, { useState } from 'react'
import { AlertTriangle, Clock, MailWarning, Play, CheckCircle2, XCircle, Info, ExternalLink } from 'lucide-react'
import type { TranslationKey } from '@/lib/i18n'
import { runAccessRequestSlaScan, AccessRequestSlaScanResponse, AccessRequestSlaReason, AccessRequestSlaSeverity, AccessRequestStatus, AccessRequestProduct, ApiError } from '@/lib/access-requests-api'
import { productLabel, statusLabel } from './AccessRequestsTable'

type Translate = (key: TranslationKey) => string

interface AccessRequestSlaPanelProps {
  onSelectRequest: (requestId: string) => void
  onScanComplete?: () => void
  t: Translate
}

export function reasonLabel(reason: AccessRequestSlaReason | string, t: Translate): string {
  const labels: Record<string, TranslationKey> = {
    pending_older_than_24h: 'accessRequestsAnalyticsReasonPending24',
    pending_older_than_72h: 'accessRequestsAnalyticsReasonPending72',
    decision_email_failed: 'accessRequestsAnalyticsReasonEmailFailed',
    decision_email_unknown: 'accessRequestsAnalyticsReasonEmailUnknown',
    retry_available: 'accessRequestsAnalyticsReasonRetryAvailable',
    provisioning_attention: 'accessRequestsAnalyticsReasonProvisioning',
  }
  return t(labels[reason] ?? 'accessRequestsAnalyticsReasonUnknown')
}

function severityClassName(severity: AccessRequestSlaSeverity | string) {
  return severity === 'critical'
    ? 'border-rose-400/30 bg-rose-950/20 text-rose-200'
    : 'border-gold/25 bg-gold/10 text-gold'
}

export function AccessRequestSlaPanel({ onSelectRequest, onScanComplete, t }: AccessRequestSlaPanelProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<AccessRequestSlaScanResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleRunScan = async () => {
    setIsScanning(true)
    setError(null)
    try {
      const result = await runAccessRequestSlaScan()
      setScanResult(result)
      if (onScanComplete) {
        onScanComplete()
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Scan failed'
      setError(message)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="section-title text-soft-white">{t('accessRequestsSlaTitle')}</h3>
          <p className="section-subtitle text-soft-muted">{t('accessRequestsSlaSubtitle')}</p>
        </div>
        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="btn-action flex items-center gap-2 rounded-xl border border-soft-subtle/40 bg-navy-surface px-4 py-2 text-sm font-semibold text-soft-white transition hover:bg-navy-surface/60 disabled:opacity-50"
        >
          {isScanning ? (
            <>
              <Clock className="h-4 w-4 animate-spin" />
              {t('accessRequestsSlaScanning')}
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              {t('accessRequestsSlaRunScan')}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-400/30 bg-rose-950/20 p-4 text-sm text-rose-200">
          <XCircle className="h-5 w-5 shrink-0" />
          <p>{t('accessRequestsSlaScanFailed')}: {error}</p>
        </div>
      )}

      {scanResult && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-secondary rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-4">
            <p className="kpi-label text-soft-muted uppercase tracking-wider">{t('accessRequestsSlaAlertsCreated')}</p>
            <p className="mt-1 text-2xl font-bold text-soft-white">{scanResult.alerts_created}</p>
          </div>
          <div className="surface-secondary rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-4">
            <p className="kpi-label text-soft-muted uppercase tracking-wider">{t('accessRequestsSlaAlertsSuppressed')}</p>
            <p className="mt-1 text-2xl font-bold text-soft-muted">{scanResult.alerts_suppressed}</p>
          </div>
          <div className="surface-secondary rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-4">
            <p className="kpi-label text-rose-200 uppercase tracking-wider">{t('accessRequestsSlaCriticalCount')}</p>
            <p className="mt-1 text-2xl font-bold text-rose-200">{scanResult.critical_count}</p>
          </div>
          <div className="surface-secondary rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-4">
            <p className="kpi-label text-gold uppercase tracking-wider">{t('accessRequestsSlaWarningCount')}</p>
            <p className="mt-1 text-2xl font-bold text-gold">{scanResult.warning_count}</p>
          </div>
        </div>
      )}

      {scanResult && scanResult.items.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-soft-white">{t('accessRequestsSlaRecentAlerts')}</h4>
          <div className="space-y-2">
            {scanResult.items.map((item, idx) => (
              <div
                key={`${item.request_id}-${item.reason}-${idx}`}
                className="surface-secondary flex flex-wrap items-center justify-between gap-4 rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {item.severity === 'critical' ? (
                      <AlertTriangle className="h-4 w-4 text-rose-200" />
                    ) : (
                      <MailWarning className="h-4 w-4 text-gold" />
                    )}
                    <span className="text-sm font-semibold text-soft-white">
                      {reasonLabel(item.reason, t)}
                    </span>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${severityClassName(item.severity)}`}>
                      {item.severity === 'critical' ? t('accessRequestsAnalyticsSeverityCritical') : t('accessRequestsAnalyticsSeverityWarning')}
                    </span>
                    {item.suppressed_by_dedupe && (
                      <span className="rounded-full border border-soft-subtle/50 bg-navy-deep/50 px-2 py-0.5 text-[10px] font-bold text-soft-muted uppercase tracking-wide">
                        {t('accessRequestsSlaSuppressed')}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-soft-muted">
                    <span className="truncate">{item.email}</span>
                    <span>{statusLabel(item.status as AccessRequestStatus, t)}</span>
                    <span>{productLabel(item.product as AccessRequestProduct)}</span>
                    {item.age_hours && <span>{item.age_hours.toFixed(1)}h</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.audit_event_created ? (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {t('accessRequestsSlaAuditLogged')}
                    </div>
                  ) : item.suppressed_by_dedupe ? (
                    <div className="flex items-center gap-1 text-[10px] text-soft-muted">
                      <Info className="h-3.5 w-3.5" />
                      {t('accessRequestsSlaDeduplicated')}
                    </div>
                  ) : null}
                  <button
                    onClick={() => onSelectRequest(item.request_id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy-surface text-soft-muted transition hover:text-blue-light"
                    title={t('accessRequestsSlaOpenRequest')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scanResult && scanResult.items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-soft-subtle/30 bg-navy-deep/20 py-12 text-center">
          <CheckCircle2 className="mb-3 h-10 w-10 text-emerald-400/50" />
          <p className="text-sm font-medium text-soft-white">{t('accessRequestsSlaNoAlerts')}</p>
          <p className="mt-1 text-xs text-soft-muted">{t('accessRequestsSlaHealthChecked')}</p>
        </div>
      )}

      {scanResult && (
        <div className="flex items-center gap-4 text-[10px] text-soft-muted">
          <p>{t('accessRequestsSlaNotificationStatus')}: <span className="text-soft-white">{t('accessRequestsSlaAuditOnly')}</span></p>
          <p>{t('accessRequestsSlaDedupeWindow')}: <span className="text-soft-white">{scanResult.dedupe_window_hours}h</span></p>
          <p>{t('accessRequestsSlaGeneratedAt')}: <span className="text-soft-white">{new Date(scanResult.generated_at).toLocaleString()}</span></p>
        </div>
      )}
    </div>
  )
}
