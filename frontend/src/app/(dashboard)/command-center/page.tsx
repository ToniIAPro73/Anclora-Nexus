'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, RefreshCw, TrendingUp, Wallet } from 'lucide-react'

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
              <h1 className="text-4xl font-bold text-soft-white tracking-tight">{t('commandCenterMenu')}</h1>
            </div>
            <p className="text-soft-muted">{t('commandCenterSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-soft-subtle bg-navy-surface/40 px-4 text-sm font-semibold text-soft-white hover:border-blue-light/50 transition-all"
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
                <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">{t('commandCenterCommercialKpis')}</p>
                <p className="mt-2 text-3xl font-bold text-gold">{snapshot?.commercial_kpis?.length || 0}</p>
                <p className="mt-1 text-sm text-soft-muted">{t('commandCenterKpiBlocks')}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">{t('commandCenterProductivityKpis')}</p>
                <p className="mt-2 text-3xl font-bold text-gold">{snapshot?.productivity_kpis?.length || 0}</p>
                <p className="mt-1 text-sm text-soft-muted">{t('commandCenterOperationalSignals')}</p>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/40 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">{t('budgetStatus')}</p>
                <p className="mt-2 text-3xl font-bold text-gold">{snapshot?.budget_status || '-'}</p>
                <p className="mt-1 text-sm text-soft-muted">{snapshot?.cost_visibility === 'full' ? t('commandCenterCostVisibilityFull') : t('commandCenterCostVisibilityLimited')}</p>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-soft-white">
                  <BarChart3 className="h-4 w-4 text-gold" />
                  {t('commandCenterCommercialKpis')}
                </h2>
                <div className="space-y-2">
                  {(snapshot?.commercial_kpis || []).map((k) => (
                    <div key={k.label} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <p className="text-xs text-soft-muted">{t(k.label)}</p>
                      <p className="text-lg font-semibold text-soft-white">{formatKpi(k.value, k.unit)}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-soft-white">
                  <TrendingUp className="h-4 w-4 text-gold" />
                  {t('commandCenterProductivityKpis')}
                </h2>
                <div className="space-y-2">
                  {(snapshot?.productivity_kpis || []).map((k) => (
                    <div key={k.label} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <p className="text-xs text-soft-muted">{t(k.label)}</p>
                      <p className="text-lg font-semibold text-soft-white">{formatKpi(k.value, k.unit)}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-soft-white">
                <Wallet className="h-4 w-4 text-gold" />
                {t('commandCenterTrends')}
              </h2>
              <div className="overflow-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-soft-muted">
                      <th className="px-2 py-2 text-left">{t('date')}</th>
                      <th className="px-2 py-2 text-left">{t('commandCenterLeadsCreated')}</th>
                      <th className="px-2 py-2 text-left">{t('commandCenterTasksCompleted')}</th>
                      <th className="px-2 py-2 text-left">{t('cost')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(trends?.points || []).map((p) => (
                      <tr key={p.period} className="border-t border-soft-subtle/40">
                        <td className="px-2 py-2 text-soft-white">{p.period}</td>
                        <td className="px-2 py-2 text-soft-white">{p.leads_created}</td>
                        <td className="px-2 py-2 text-soft-white">{p.tasks_completed}</td>
                        <td className="px-2 py-2 text-soft-white">{p.cost_eur.toFixed(2)} EUR</td>
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
