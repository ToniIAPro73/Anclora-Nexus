'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, LineChart, RefreshCw } from 'lucide-react'

import { useI18n } from '@/lib/i18n'
import {
  getSourceOverview,
  getSourceRanking,
  getSourceTrends,
  type ObservatorySummary,
  type RankingItem,
  type SourceScorecard,
  type TrendPoint,
} from '@/lib/source-observatory-api'

export default function SourceObservatoryPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<ObservatorySummary | null>(null)
  const [overview, setOverview] = useState<SourceScorecard[]>([])
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [trends, setTrends] = useState<TrendPoint[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [o, r, tr] = await Promise.all([getSourceOverview(), getSourceRanking(), getSourceTrends(6)])
      setSummary(o.summary || null)
      setOverview(o.items || [])
      setRanking(r.items || [])
      setTrends(tr.points || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : t('sourceObservatoryLoadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  const statusLabel = (status: string) => {
    if (status === 'healthy') return t('sourceObservatoryStatus_healthy')
    if (status === 'critical') return t('sourceObservatoryStatus_critical')
    return t('sourceObservatoryStatus_warning')
  }

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-5">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-soft-subtle/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl border border-soft-subtle bg-navy-surface/40 text-soft-muted hover:text-soft-white hover:border-blue-light/50 transition-all group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
              <h1 className="page-title">{t('sourceObservatoryMenu')}</h1>
            </div>
            <p className="page-subtitle">{t('sourceObservatorySubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="btn-action"
          >
            <RefreshCw className="h-4 w-4" />
            {t('refresh')}
          </button>
        </section>

        {error ? <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</section> : null}

        {loading ? (
          <section className="h-64 rounded-2xl border border-soft-subtle bg-navy-surface/30 animate-pulse" />
        ) : overview.length === 0 ? (
          <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-6 text-sm text-soft-muted">
            {t('sourceObservatoryEmpty')}
          </section>
        ) : (
          <>
            {summary && (
              <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                  <p className="kpi-label">{t('sourceObservatoryHealthy')}</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-300">{summary.healthy_sources}</p>
                  <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatorySources')}: {summary.total_sources}</p>
                </article>
                <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                  <p className="kpi-label">{t('sourceObservatoryDegraded')}</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-200">{summary.warning_sources + summary.critical_sources}</p>
                  <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryStale')}: {summary.stale_sources}</p>
                </article>
                <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                  <p className="kpi-label">{t('sourceObservatoryCreated')}</p>
                  <p className="mt-2 text-2xl font-semibold text-soft-white">{summary.total_created_entities}</p>
                  <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryEvents')}: {summary.total_events}</p>
                </article>
                <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                  <p className="kpi-label">{t('sourceObservatoryFailures')}</p>
                  <p className="mt-2 text-2xl font-semibold text-red-300">{summary.total_failures}</p>
                  <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryActionability')}</p>
                </article>
                <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4 col-span-2 lg:col-span-4">
                  <p className="kpi-label">{t('sourceObservatoryCloudChecks')}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                      {t('sourceObservatoryHealthy')}: {summary.cloud_checks_healthy}
                    </span>
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-200">
                      {t('sourceObservatoryStatus_warning')}: {summary.cloud_checks_warning}
                    </span>
                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-red-300">
                      {t('sourceObservatoryStatus_critical')}: {summary.cloud_checks_critical}
                    </span>
                  </div>
                </article>
              </section>
            )}

            <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <h2 className="mb-3 section-title">{t('sourceObservatoryScorecards')}</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {overview.slice(0, 9).map((item) => (
                  <article key={item.source_key} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-soft-white">{item.source_key}</p>
                      <span className={`rounded-full px-2 py-1 text-[11px] ${
                        item.operational_status === 'healthy'
                          ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                          : item.operational_status === 'critical'
                            ? 'border border-red-500/20 bg-red-500/10 text-red-300'
                            : 'border border-amber-500/20 bg-amber-500/10 text-amber-200'
                      }`}>
                        {statusLabel(item.operational_status)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-soft-muted">{t('sourceObservatorySuccessRate')}: {item.success_rate_pct.toFixed(2)}%</p>
                    <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryEvents')}: {item.total_events} · {t('sourceObservatoryCreated')}: {item.created_entities}</p>
                    <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryCoverage')}: {t('sourceObservatoryLeads')} {item.lead_count} · {t('sourceObservatoryProperties')} {item.property_count} · {t('sourceObservatorySellers')} {item.seller_count}</p>
                    <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryFreshness')}: {item.freshness_hours == null ? t('sourceObservatoryNoRuns') : `${item.freshness_hours}h`}</p>
                    {item.latency_ms != null || (item.retry_count || 0) > 0 ? (
                      <p className="mt-1 text-xs text-soft-muted">
                        {t('sourceObservatoryLatency')}: {item.latency_ms == null ? '-' : `${(item.latency_ms / 1000).toFixed(1)}s`} · {t('sourceObservatoryRetries')}: {item.retry_count || 0}
                      </p>
                    ) : null}
                    {item.ops_message ? <p className="mt-1 text-xs text-soft-muted break-words">{item.ops_message}</p> : null}
                  </article>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-3 section-title">{t('sourceObservatoryRanking')}</h2>
                <div className="space-y-2">
                  {ranking.slice(0, 8).map((row, idx) => (
                    <div key={row.source_key} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <p className="text-sm font-semibold text-soft-white">#{idx + 1} {row.source_key}</p>
                      <p className="text-xs text-gold">Score {row.score.toFixed(2)}</p>
                      <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryCreated')}: {row.created_entities} · {t('sourceObservatoryFreshness')}: {row.freshness_hours == null ? t('sourceObservatoryNoRuns') : `${row.freshness_hours}h`}</p>
                    </div>
                  ))}
                </div>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-3 section-title flex items-center gap-2">
                  <LineChart className="h-4 w-4 text-gold" />
                  {t('sourceObservatoryTrends')}
                </h2>
                <div className="space-y-2 max-h-[420px] overflow-auto pr-1 custom-scrollbar">
                  {trends.slice(0, 24).map((p) => (
                    <div key={`${p.period}-${p.source_key}`} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <p className="text-sm text-soft-white">{p.period} · {p.source_key}</p>
                      <p className="text-xs text-soft-muted">{t('sourceObservatoryEvents')}: {p.events} · {t('sourceObservatorySuccessRate')}: {p.success_rate_pct.toFixed(2)}%</p>
                      <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryProcessed')}: {p.processed_events} · {t('sourceObservatoryFailures')}: {p.failed_events} · {t('sourceObservatoryCreated')}: {p.created_entities}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
