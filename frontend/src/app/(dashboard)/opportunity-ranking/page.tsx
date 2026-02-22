'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Flame, Gauge, RefreshCcw, Snowflake, ThermometerSun } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import { getOpportunityRanking, type OpportunityRankingItem, type OpportunityRankingResponse } from '@/lib/prospection-api'

const BAND_STYLES: Record<'hot' | 'warm' | 'cold', string> = {
  hot: 'border-red-500/30 bg-red-500/10 text-red-200',
  warm: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
  cold: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-200',
}

export default function OpportunityRankingPage() {
  const { t } = useI18n()
  const { formatMoney } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [minScore, setMinScore] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [data, setData] = useState<OpportunityRankingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadRanking = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getOpportunityRanking({
        limit: 40,
        min_opportunity_score: minScore || undefined,
        match_status: statusFilter || undefined,
      })
      setData(response)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error'))
    } finally {
      setLoading(false)
    }
  }, [minScore, statusFilter, t])

  useEffect(() => {
    void loadRanking()
  }, [loadRanking])

  const items = useMemo(() => data?.items || [], [data?.items])

  return (
    <div className="h-full p-6 overflow-y-auto">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-5">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-soft-subtle/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href="/prospection"
                className="p-2 rounded-xl border border-soft-subtle bg-navy-surface/40 text-soft-muted hover:text-soft-white hover:border-blue-light/50 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-4xl font-bold text-soft-white tracking-tight">{t('opportunityRankingTitle')}</h1>
            </div>
            <p className="text-soft-muted">{t('opportunityRankingSubtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2 text-sm text-soft-white outline-none"
            >
              <option value="">{t('allStatuses')}</option>
              <option value="candidate">{t('candidate')}</option>
              <option value="contacted">{t('contacted')}</option>
              <option value="viewing">{t('viewingScheduled')}</option>
              <option value="negotiating">{t('leadStatusNegotiating')}</option>
              <option value="offer">{t('offer')}</option>
              <option value="closed">{t('closedWon')}</option>
            </select>
            <input
              type="number"
              min={0}
              max={100}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value || 0))}
              className="w-28 rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2 text-sm text-soft-white outline-none"
              placeholder={t('matchScore')}
            />
            <button type="button" onClick={() => void loadRanking()} className="btn-action inline-flex items-center gap-2">
              <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
          </div>
        </section>

        {error ? (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>
        ) : null}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">{t('total')}</p>
            <p className="mt-2 text-3xl font-bold text-soft-white">{data?.total ?? 0}</p>
          </article>
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">{t('hotOpportunities')}</p>
            <p className="mt-2 text-3xl font-bold text-red-300">{data?.totals.hot ?? 0}</p>
          </article>
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">{t('warmOpportunities')}</p>
            <p className="mt-2 text-3xl font-bold text-amber-300">{data?.totals.warm ?? 0}</p>
          </article>
          <article className="rounded-xl border border-soft-subtle bg-navy-surface/40 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-soft-muted">{t('coldOpportunities')}</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">{data?.totals.cold ?? 0}</p>
          </article>
        </section>

        <section className="rounded-2xl border border-soft-subtle bg-navy-surface/35 p-4">
          <header className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-soft-white">{t('rankedOpportunities')}</h2>
            <span className="text-xs text-soft-muted">{items.length} {t('feedRecords')}</span>
          </header>

          <div className="space-y-3 max-h-[62vh] overflow-y-auto pr-1 custom-scrollbar">
            {items.map((item) => (
              <OpportunityCard key={item.match_id} item={item} t={t} formatMoney={formatMoney} />
            ))}
            {!loading && items.length === 0 ? (
              <div className="py-10 text-center text-soft-muted">{t('noMatches')}</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

function OpportunityCard({
  item,
  t,
  formatMoney,
}: {
  item: OpportunityRankingItem
  t: (key: string) => string
  formatMoney: (amount: number, options?: { minFractionDigits?: number; maxFractionDigits?: number }) => string
}) {
  const bandIcon = item.priority_band === 'hot' ? Flame : item.priority_band === 'warm' ? ThermometerSun : Snowflake
  const BandIcon = bandIcon
  return (
    <article className="rounded-xl border border-soft-subtle/60 bg-navy-deep/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-soft-white font-semibold">{item.property_title || t('noTitle')}</h3>
          <p className="text-sm text-soft-muted">{item.buyer_name || t('noName')}</p>
          <p className="text-xs text-soft-muted mt-1">{t('nextSteps')}: <span className="text-blue-light">{item.next_action}</span></p>
        </div>
        <div className="text-right">
          <div className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${BAND_STYLES[item.priority_band]}`}>
            <BandIcon className="w-3.5 h-3.5" />
            {item.priority_band.toUpperCase()}
          </div>
          <p className="text-2xl font-bold text-gold mt-2">{Math.round(item.opportunity_score)}</p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
        <Metric label={t('matchScore')} value={`${Math.round(item.match_score)}`} />
        <Metric
          label={t('commissionEstimate')}
          value={item.commission_estimate != null ? formatMoney(item.commission_estimate, { minFractionDigits: 0, maxFractionDigits: 0 }) : '-'}
        />
        <Metric label={t('confidence')} value={`${Math.round(item.explanation.confidence)}%`} />
        <Metric label={t('status')} value={item.match_status} />
      </div>

      <div className="mt-3 rounded-lg border border-soft-subtle/40 bg-navy-surface/30 p-3">
        <p className="text-xs uppercase tracking-[0.14em] text-soft-muted mb-2">{t('scoreBreakdown')}</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
          <Metric label={t('matchScore')} value={`${Math.round(item.explanation.drivers.match_score)}%`} icon={<Gauge className="w-3.5 h-3.5 text-gold" />} />
          <Metric label={t('commissionEstimate')} value={`${Math.round(item.explanation.drivers.commission_potential)}%`} />
          <Metric label={t('motivationScore')} value={`${Math.round(item.explanation.drivers.buyer_motivation)}%`} />
        </div>
      </div>
    </article>
  )
}

function Metric({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-lg border border-soft-subtle/40 bg-navy-surface/20 px-2.5 py-2">
      <p className="text-soft-muted flex items-center gap-1">{icon}{label}</p>
      <p className="text-soft-white font-semibold">{value}</p>
    </div>
  )
}
