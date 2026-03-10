'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, BarChart3, RefreshCw, TrendingUp, Wallet } from 'lucide-react'

import { useI18n } from '@/lib/i18n'
import {
  getCommandCenterSnapshot,
  getCommandCenterTrends,
  type CommandCenterSnapshotResponse,
  type CommandCenterTrendsResponse,
} from '@/lib/command-center-api'

function formatKpi(value: number, unit: string): string {
  if (unit === 'percent') return `${value.toFixed(1)}%`
  return `${Math.round(value)}`
}

export default function CommandCenterPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<CommandCenterSnapshotResponse | null>(null)
  const [trends, setTrends] = useState<CommandCenterTrendsResponse | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [s, tr] = await Promise.all([getCommandCenterSnapshot(), getCommandCenterTrends(6)])
      setSnapshot(s)
      setTrends(tr)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('commandCenterLoadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const hasEmpty = useMemo(() => {
    return (snapshot?.commercial_kpis.length || 0) === 0 && (snapshot?.productivity_kpis.length || 0) === 0
  }, [snapshot])

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
              <h1 className="page-title">{t('commandCenterMenu')}</h1>
            </div>
            <p className="page-subtitle">{t('commandCenterSubtitle')}</p>
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
        ) : hasEmpty ? (
          <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-6 text-sm text-soft-muted">
            {t('commandCenterEmpty')}
          </section>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('commandCenterCommercialKpis')}</p>
                <p className="kpi-value text-gold">{snapshot?.commercial_kpis?.length || 0}</p>
                <p className="kpi-meta">{t('commandCenterKpiBlocks')}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('commandCenterProductivityKpis')}</p>
                <p className="kpi-value text-gold">{snapshot?.productivity_kpis?.length || 0}</p>
                <p className="kpi-meta">{t('commandCenterOperationalSignals')}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('budgetStatus')}</p>
                <p className="kpi-value text-gold">{snapshot?.budget_status || '-'}</p>
                <p className="kpi-meta">{snapshot?.cost_visibility === 'full' ? t('commandCenterCostVisibilityFull') : t('commandCenterCostVisibilityLimited')}</p>
              </article>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('commandCenterActiveAlerts')}</p>
                <p className="kpi-value text-soft-white">{snapshot?.operational_overview.active_alerts || 0}</p>
                <p className="kpi-meta">{t('commandCenterOperationalSignals')}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('commandCenterCriticalAlerts')}</p>
                <p className="kpi-value text-red-300">{snapshot?.operational_overview.critical_alerts || 0}</p>
                <p className="kpi-meta">{t('commandCenterNeedsAction')}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('commandCenterDegradedSources')}</p>
                <p className="kpi-value text-amber-200">{snapshot?.operational_overview.degraded_sources || 0}</p>
                <p className="kpi-meta">{t('commandCenterStaleSources')}: {snapshot?.operational_overview.stale_sources || 0}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('commandCenterTerritorialHealth')}</p>
                <p className="mt-2 text-sm font-semibold text-soft-white">
                  Sync: {snapshot?.operational_overview.territorial_sync_status || '-'}
                </p>
                <p className="mt-1 text-sm font-semibold text-soft-white">
                  Pipeline: {snapshot?.operational_overview.territorial_pipeline_status || '-'}
                </p>
              </article>
            </section>

            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('commandCenterSellerSignals')}</p>
                <p className="kpi-value text-soft-white">{snapshot?.pipeline_overview.seller_signals_processed || 0}</p>
                <p className="kpi-meta">{t('commandCenterPipelineThroughput')}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('commandCenterSellersTotal')}</p>
                <p className="kpi-value text-gold">{snapshot?.pipeline_overview.sellers_total || 0}</p>
                <p className="kpi-meta">{t('commandCenterHighPrioritySellers')}: {snapshot?.pipeline_overview.sellers_high_priority || 0}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('commandCenterSellersConverted')}</p>
                <p className="kpi-value text-emerald-300">{snapshot?.pipeline_overview.sellers_converted || 0}</p>
                <p className="kpi-meta">{snapshot?.pipeline_overview.seller_conversion_rate || 0}%</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="kpi-label">{t('commandCenterSupervisedSends')}</p>
                <p className="kpi-value text-blue-light">{snapshot?.pipeline_overview.supervised_sends_confirmed || 0}</p>
                <p className="kpi-meta">{t('commandCenterWorkbenchReady')}: {snapshot?.pipeline_overview.active_workbench_ready || 0}</p>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-3 section-title flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gold" />
                  {t('commandCenterCommercialKpis')}
                </h2>
                <div className="space-y-2">
                  {(snapshot?.commercial_kpis || []).map((k) => (
                    <div key={k.label} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <p className="text-xs text-soft-muted">{t(k.label)}</p>
                      <p className="section-title">{formatKpi(k.value, k.unit)}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-3 section-title flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gold" />
                  {t('commandCenterProductivityKpis')}
                </h2>
                <div className="space-y-2">
                  {(snapshot?.productivity_kpis || []).map((k) => (
                    <div key={k.label} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <p className="text-xs text-soft-muted">{t(k.label)}</p>
                      <p className="section-title">{formatKpi(k.value, k.unit)}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <h2 className="mb-3 section-title flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gold" />
                {t('commandCenterOperationalSignals')}
              </h2>
              <div className="space-y-2">
                {(snapshot?.operational_overview.top_alerts || []).length === 0 ? (
                  <p className="text-sm text-soft-muted">{t('automationNoAlerts')}</p>
                ) : (
                  (snapshot?.operational_overview.top_alerts || []).map((alert) => (
                    <div key={alert.id} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-soft-white">{alert.alert_type}</p>
                        <span className={`rounded-full px-2 py-1 text-[11px] ${
                          alert.severity === 'critical'
                            ? 'border border-red-500/30 bg-red-500/10 text-red-200'
                            : 'border border-amber-500/30 bg-amber-500/10 text-amber-100'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-soft-muted">{alert.message}</p>
                      <p className="mt-2 text-xs text-soft-muted">
                        {t('automationAlertScope')}: {alert.alert_scope} · {new Date(alert.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <h2 className="mb-3 section-title flex items-center gap-2">
                <Wallet className="h-4 w-4 text-gold" />
                {t('commandCenterTrends')}
              </h2>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="page-subtitle">
                      <th className="px-2 py-2 text-left">{t('date')}</th>
                      <th className="px-2 py-2 text-left">{t('commandCenterLeadsCreated')}</th>
                      <th className="px-2 py-2 text-left">{t('commandCenterTasksCompleted')}</th>
                      <th className="px-2 py-2 text-left">{t('cost')}</th>
                      <th className="px-2 py-2 text-left">{t('commandCenterActiveAlerts')}</th>
                      <th className="px-2 py-2 text-left">{t('commandCenterCriticalAlerts')}</th>
                      <th className="px-2 py-2 text-left">{t('commandCenterSellerSignals')}</th>
                      <th className="px-2 py-2 text-left">{t('commandCenterSellersCreated')}</th>
                      <th className="px-2 py-2 text-left">{t('commandCenterSupervisedSends')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(trends?.points || []).map((p) => (
                      <tr key={p.period} className="border-t border-soft-subtle/40">
                        <td className="px-2 py-2 text-soft-white">{p.period}</td>
                        <td className="px-2 py-2 text-soft-white">{p.leads_created}</td>
                        <td className="px-2 py-2 text-soft-white">{p.tasks_completed}</td>
                        <td className="px-2 py-2 text-soft-white">{p.cost_eur.toFixed(2)} EUR</td>
                        <td className="px-2 py-2 text-soft-white">{p.active_alerts}</td>
                        <td className="px-2 py-2 text-soft-white">{p.critical_alerts}</td>
                        <td className="px-2 py-2 text-soft-white">{p.seller_signals_processed}</td>
                        <td className="px-2 py-2 text-soft-white">{p.sellers_created}</td>
                        <td className="px-2 py-2 text-soft-white">{p.supervised_sends_confirmed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
