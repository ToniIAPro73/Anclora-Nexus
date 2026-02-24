'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, LineChart, RefreshCw } from 'lucide-react'

import { useI18n } from '@/lib/i18n'
import {
  getSourceOverview,
  getSourceRanking,
  getSourceTrends,
  type RankingItem,
  type SourceScorecard,
  type TrendPoint,
} from '@/lib/source-observatory-api'

export default function SourceObservatoryPage() {
  const { t } = useI18n()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<SourceScorecard[]>([])
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [trends, setTrends] = useState<TrendPoint[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [o, r, tr] = await Promise.all([getSourceOverview(), getSourceRanking(), getSourceTrends(6)])
      setOverview(o.items || [])
      setRanking(r.items || [])
      setTrends(tr.points || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : t('sourceObservatoryLoadError'))
    } finally {
      setLoading(false)
    }
  }, [t])

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
              <h1 className="text-4xl font-bold text-soft-white tracking-tight">{t('sourceObservatoryMenu')}</h1>
            </div>
            <p className="text-soft-muted">{t('sourceObservatorySubtitle')}</p>
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
            <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
              <h2 className="mb-3 text-lg font-semibold text-soft-white">{t('sourceObservatoryScorecards')}</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {overview.slice(0, 9).map((item) => (
                  <article key={item.source_key} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                    <p className="text-sm font-semibold text-soft-white">{item.source_key}</p>
                    <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatorySuccessRate')}: {item.success_rate_pct.toFixed(2)}%</p>
                    <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryLeads')}: {item.lead_count}</p>
                    <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryEvents')}: {item.total_events}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-3 text-lg font-semibold text-soft-white">{t('sourceObservatoryRanking')}</h2>
                <div className="space-y-2">
                  {ranking.slice(0, 8).map((row, idx) => (
                    <div key={row.source_key} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <p className="text-sm font-semibold text-soft-white">#{idx + 1} {row.source_key}</p>
                      <p className="text-xs text-gold">Score {row.score.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </article>
              <article className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-soft-white">
                  <LineChart className="h-4 w-4 text-gold" />
                  {t('sourceObservatoryTrends')}
                </h2>
                <div className="space-y-2 max-h-[420px] overflow-auto pr-1 custom-scrollbar">
                  {trends.slice(0, 24).map((p) => (
                    <div key={`${p.period}-${p.source_key}`} className="rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <p className="text-sm text-soft-white">{p.period} · {p.source_key}</p>
                      <p className="text-xs text-soft-muted">{t('sourceObservatoryEvents')}: {p.events} · {t('sourceObservatorySuccessRate')}: {p.success_rate_pct.toFixed(2)}%</p>
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
