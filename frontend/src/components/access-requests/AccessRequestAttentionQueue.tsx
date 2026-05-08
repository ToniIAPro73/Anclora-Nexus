'use client'

import { AlertTriangle, Clock, MailWarning } from 'lucide-react'
import type { TranslationKey } from '@/lib/i18n'
import type { AccessRequestAttentionItem } from '@/lib/access-requests-api'
import { productLabel, sourceLabel, statusLabel } from './AccessRequestsTable'

type Translate = (key: TranslationKey) => string

interface AccessRequestAttentionQueueProps {
  items: AccessRequestAttentionItem[]
  onSelect: (requestId: string) => void
  t: Translate
}

function reasonLabel(reason: string, t: Translate): string {
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

function severityClassName(severity: AccessRequestAttentionItem['severity']) {
  return severity === 'critical'
    ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-navy-surface/50 dark:text-rose-200'
    : 'border-gold/25 bg-gold/10 text-gold'
}

export function AccessRequestAttentionQueue({ items, onSelect, t }: AccessRequestAttentionQueueProps) {
  if (items.length === 0) {
    return (
      <div className="surface-secondary rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3 text-sm text-soft-muted">
        {t('accessRequestsAnalyticsAttentionEmpty')}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <button
          key={`${item.request_id}-${item.reason}-${index}`}
          type="button"
          onClick={() => onSelect(item.request_id)}
          className="surface-secondary surface-copy-safe w-full rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3 text-left transition hover:border-blue-light/35 hover:bg-navy-surface/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-soft-white">
                {item.severity === 'critical' ? (
                  <AlertTriangle className="h-4 w-4 text-rose-200" />
                ) : (
                  <MailWarning className="h-4 w-4 text-gold" />
                )}
                {reasonLabel(item.reason, t)}
              </p>
              <p className="mt-1 break-words text-xs text-soft-muted">{item.email}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${severityClassName(item.severity)}`}>
              {item.severity === 'critical' ? t('accessRequestsAnalyticsSeverityCritical') : t('accessRequestsAnalyticsSeverityWarning')}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-soft-muted">
            <span>{statusLabel(item.status, t)}</span>
            <span>{productLabel(item.product)}</span>
            <span>{sourceLabel(item.source, t)}</span>
            {typeof item.age_hours === 'number' ? (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {item.age_hours.toFixed(1)}h
              </span>
            ) : null}
          </div>
        </button>
      ))}
    </div>
  )
}
