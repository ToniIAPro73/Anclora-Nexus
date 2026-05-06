'use client'

import { AlertTriangle, BarChart3, Clock3, MailWarning, RotateCw } from 'lucide-react'
import type { ReactNode } from 'react'
import type { TranslationKey } from '@/lib/i18n'
import type { AccessRequestAnalyticsSummary } from '@/lib/access-requests-api'
import { AccessRequestAttentionQueue } from './AccessRequestAttentionQueue'

type Translate = (key: TranslationKey) => string

interface AccessRequestOperationsDashboardProps {
  analytics: AccessRequestAnalyticsSummary | null
  loading: boolean
  error: string | null
  onSelectAttentionItem: (requestId: string) => void
  t: Translate
}

function formatNumber(value?: number | null): string {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(value)
}

function formatGeneratedAt(value?: string | null): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function KpiCard({
  label,
  value,
  tone = 'default',
  icon,
}: {
  label: string
  value: string | number
  tone?: 'default' | 'gold' | 'critical'
  icon: ReactNode
}) {
  const valueClass = tone === 'critical' ? 'text-rose-200' : tone === 'gold' ? 'text-gold' : 'text-soft-white'
  return (
    <div className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="kpi-label">{label}</p>
        <span className="text-blue-light">{icon}</span>
      </div>
      <p className={`kpi-value mt-3 ${valueClass}`}>{value}</p>
    </div>
  )
}

function Breakdown({
  title,
  values,
  labels,
  t,
}: {
  title: string
  values: Record<string, number>
  labels: Record<string, TranslationKey | string>
  t: Translate
}) {
  const entries = Object.entries(values)
  const total = entries.reduce((sum, [, value]) => sum + value, 0)
  return (
    <div className="surface-secondary rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-4">
      <p className="kpi-label">{title}</p>
      <div className="mt-3 space-y-3">
        {entries.map(([key, value]) => {
          const width = total > 0 ? Math.max((value / total) * 100, value > 0 ? 8 : 0) : 0
          const labelKey = labels[key]
          const label = labelKey && String(labelKey).startsWith('accessRequests') ? t(labelKey as TranslationKey) : labelKey || key
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs text-soft-muted">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-navy-darker/70">
                <div className="h-full rounded-full bg-blue-light/70" style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AccessRequestOperationsDashboard({
  analytics,
  loading,
  error,
  onSelectAttentionItem,
  t,
}: AccessRequestOperationsDashboardProps) {
  if (loading) {
    return (
      <section className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5 text-sm text-soft-muted">
        {t('accessRequestsAnalyticsLoading')}
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">
        {error}
      </section>
    )
  }

  if (!analytics) {
    return (
      <section className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5 text-sm text-soft-muted">
        {t('accessRequestsAnalyticsEmpty')}
      </section>
    )
  }

  const failedOrUnknown = analytics.decision_email_failed_count + analytics.decision_email_unknown_count

  return (
    <section className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="section-title">{t('accessRequestsAnalyticsTitle')}</h2>
          <p className="section-subtitle mt-1">
            {t('accessRequestsAnalyticsSubtitle')} {t('accessRequestsAnalyticsGeneratedAt')}: {formatGeneratedAt(analytics.generated_at)}
          </p>
        </div>
        <div className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 px-3 py-2 text-xs text-soft-muted">
          {analytics.is_sampled
            ? `${t('accessRequestsAnalyticsSampled')} ${analytics.sample_size}/${analytics.sample_limit}`
            : `${t('accessRequestsAnalyticsSample')} ${analytics.sample_size}`}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label={t('accessRequestsAnalyticsTotal')} value={analytics.total_requests} icon={<BarChart3 className="h-4 w-4" />} />
        <KpiCard label={t('accessRequestsAnalyticsPendingAging')} value={analytics.pending_older_than_24h} tone="gold" icon={<Clock3 className="h-4 w-4" />} />
        <KpiCard label={t('accessRequestsAnalyticsPending72')} value={analytics.pending_older_than_72h} tone="critical" icon={<AlertTriangle className="h-4 w-4" />} />
        <KpiCard label={t('accessRequestsAnalyticsEmailAttention')} value={failedOrUnknown} tone={failedOrUnknown ? 'critical' : 'default'} icon={<MailWarning className="h-4 w-4" />} />
        <KpiCard label={t('accessRequestsAnalyticsRetryAvailable')} value={analytics.retry_available_count} tone={analytics.retry_available_count ? 'gold' : 'default'} icon={<RotateCw className="h-4 w-4" />} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <KpiCard
            label={t('accessRequestsAnalyticsAverageReview')}
            value={
              analytics.average_review_time_hours === null || analytics.average_review_time_hours === undefined
                ? '-'
                : `${formatNumber(analytics.average_review_time_hours)}h`
            }
            icon={<Clock3 className="h-4 w-4" />}
          />
          <KpiCard
            label={t('accessRequestsAnalyticsProvisioningAttention')}
            value={analytics.provisioning_attention_count}
            tone={analytics.provisioning_attention_count ? 'gold' : 'default'}
            icon={<AlertTriangle className="h-4 w-4" />}
          />
          <Breakdown
            title={t('accessRequestsAnalyticsByProduct')}
            values={analytics.requests_by_product}
            labels={{ synergi: 'Synergi', data_lab: 'Data Lab' }}
            t={t}
          />
          <Breakdown
            title={t('accessRequestsAnalyticsBySource')}
            values={analytics.requests_by_source}
            labels={{
              landing: 'accessRequestsSourceLanding',
              synergi_app: 'accessRequestsSourceSynergiApp',
              data_lab_app: 'accessRequestsSourceDataLabApp',
            }}
            t={t}
          />
        </div>
        <div>
          <div className="mb-3">
            <h3 className="section-title text-base">{t('accessRequestsAnalyticsAttentionTitle')}</h3>
            <p className="section-subtitle mt-1">{t('accessRequestsAnalyticsAttentionSubtitle')}</p>
          </div>
          <AccessRequestAttentionQueue items={analytics.attention_items} onSelect={onSelectAttentionItem} t={t} />
        </div>
      </div>
    </section>
  )
}
