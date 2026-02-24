'use client'

import { useCallback, useEffect, useState } from 'react'
import { LineChart, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

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
    <div className="min-h-screen p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <section className="rounded-2xl border border-soft-subtle bg-gradient-to-br from-navy-deep/80 via-navy-surface/50 to-navy-deep/70 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-soft-white">{t('sourceObservatoryMenu')}</h1>
              <p className="mt-1 text-sm text-soft-muted">{t('sourceObservatorySubtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2 text-sm text-soft-white hover:border-gold/50"
            >
              <RefreshCw className="h-4 w-4" />
              {t('refresh')}
            </button>
          </div>
        </section>

        {error ? <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</section> : null}

        {loading ? (
          <section className="h-64 rounded-xl border border-soft-subtle bg-navy-surface/30 animate-pulse" />
        ) : overview.length === 0 ? (
          <section className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-6 text-sm text-soft-muted">
            {t('sourceObservatoryEmpty')}
          </section>
        ) : (
          <>
            <section className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
              <h2 className="mb-3 text-lg font-semibold text-soft-white">{t('sourceObservatoryScorecards')}</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {overview.slice(0, 9).map((item) => (
                  <article key={item.source_key} className="rounded-lg border border-soft-subtle/50 bg-navy-deep/30 p-3">
                    <p className="text-sm font-semibold text-soft-white">{item.source_key}</p>
                    <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatorySuccessRate')}: {item.success_rate_pct.toFixed(2)}%</p>
                    <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryLeads')}: {item.lead_count}</p>
                    <p className="mt-1 text-xs text-soft-muted">{t('sourceObservatoryEvents')}: {item.total_events}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <article className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-3 text-lg font-semibold text-soft-white">{t('sourceObservatoryRanking')}</h2>
                <div className="space-y-2">
                  {ranking.slice(0, 8).map((row, idx) => (
                    <div key={row.source_key} className="rounded-lg border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <p className="text-sm font-semibold text-soft-white">#{idx + 1} {row.source_key}</p>
                      <p className="text-xs text-gold">Score {row.score.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </article>
              <article className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-soft-white">
                  <LineChart className="h-4 w-4 text-gold" />
                  {t('sourceObservatoryTrends')}
                </h2>
                <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                  {trends.slice(0, 24).map((p) => (
                    <div key={`${p.period}-${p.source_key}`} className="rounded-lg border border-soft-subtle/50 bg-navy-deep/30 p-3">
                      <p className="text-sm text-soft-white">{p.period} · {p.source_key}</p>
                      <p className="text-xs text-soft-muted">{t('sourceObservatoryEvents')}: {p.events} · {t('sourceObservatorySuccessRate')}: {p.success_rate_pct.toFixed(2)}%</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}
      </motion.div>
    </div>
  )
}
