'use client'

import { useState } from 'react'
import { Calculator, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'

import { useI18n } from '@/lib/i18n'
import { compareDealMargins, simulateDealMargin, type SimulationResult } from '@/lib/deal-margin-api'

export default function DealMarginSimulatorPage() {
  const { t } = useI18n()
  const [dealValue, setDealValue] = useState('1000000')
  const [acquisitionCost, setAcquisitionCost] = useState('800000')
  const [closingCost, setClosingCost] = useState('25000')
  const [renovationCost, setRenovationCost] = useState('15000')
  const [holdingCost, setHoldingCost] = useState('10000')
  const [taxCost, setTaxCost] = useState('30000')
  const [commissionRate, setCommissionRate] = useState('3')
  const [confidence, setConfidence] = useState('80')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [compareBest, setCompareBest] = useState<string | null>(null)

  const toNumber = (v: string): number => Number(v || '0')

  const baseAssumptions = () => ({
    deal_value_eur: toNumber(dealValue),
    acquisition_cost_eur: toNumber(acquisitionCost),
    closing_cost_eur: toNumber(closingCost),
    renovation_cost_eur: toNumber(renovationCost),
    holding_cost_eur: toNumber(holdingCost),
    tax_cost_eur: toNumber(taxCost),
    commission_rate_pct: toNumber(commissionRate),
    confidence_pct: toNumber(confidence),
  })

  const runSimulation = async () => {
    setLoading(true)
    setError(null)
    setCompareBest(null)
    try {
      const res = await simulateDealMargin({
        scenario_name: 'base',
        assumptions: baseAssumptions(),
      })
      setResult(res.result)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('dealMarginLoadError'))
    } finally {
      setLoading(false)
    }
  }

  const runComparison = async () => {
    setLoading(true)
    setError(null)
    try {
      const base = baseAssumptions()
      const optimistic = {
        ...base,
        acquisition_cost_eur: Math.max(0, base.acquisition_cost_eur * 0.95),
        confidence_pct: Math.min(100, base.confidence_pct + 5),
      }
      const conservative = {
        ...base,
        acquisition_cost_eur: base.acquisition_cost_eur * 1.05,
        confidence_pct: Math.max(1, base.confidence_pct - 5),
      }
      const res = await compareDealMargins({
        scenarios: [
          { scenario_name: 'base', assumptions: base },
          { scenario_name: 'optimistic', assumptions: optimistic },
          { scenario_name: 'conservative', assumptions: conservative },
        ],
      })
      const best = res.results.find((r) => r.scenario_name === res.best_scenario) || null
      setResult(best)
      setCompareBest(res.best_scenario)
    } catch (e) {
      setError(e instanceof Error ? e.message : t('dealMarginLoadError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        <section className="rounded-2xl border border-soft-subtle bg-gradient-to-br from-navy-deep/80 via-navy-surface/50 to-navy-deep/70 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-soft-white">{t('dealMarginMenu')}</h1>
              <p className="mt-1 text-sm text-soft-muted">{t('dealMarginSubtitle')}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setResult(null)
                setError(null)
                setCompareBest(null)
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-soft-subtle bg-navy-surface/40 px-3 py-2 text-sm text-soft-white hover:border-gold/50"
            >
              <RefreshCw className="h-4 w-4" />
              {t('dealMarginReset')}
            </button>
          </div>
        </section>

        {error ? <section className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</section> : null}

        <section className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-soft-white">
            <Calculator className="h-4 w-4 text-gold" />
            {t('dealMarginAssumptions')}
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input value={dealValue} onChange={(e) => setDealValue(e.target.value)} className="rounded-lg border border-soft-subtle bg-navy-deep/30 px-3 py-2 text-sm text-soft-white" placeholder={t('dealMarginDealValue')} />
            <input value={acquisitionCost} onChange={(e) => setAcquisitionCost(e.target.value)} className="rounded-lg border border-soft-subtle bg-navy-deep/30 px-3 py-2 text-sm text-soft-white" placeholder={t('dealMarginAcquisitionCost')} />
            <input value={closingCost} onChange={(e) => setClosingCost(e.target.value)} className="rounded-lg border border-soft-subtle bg-navy-deep/30 px-3 py-2 text-sm text-soft-white" placeholder={t('dealMarginClosingCost')} />
            <input value={renovationCost} onChange={(e) => setRenovationCost(e.target.value)} className="rounded-lg border border-soft-subtle bg-navy-deep/30 px-3 py-2 text-sm text-soft-white" placeholder={t('dealMarginRenovationCost')} />
            <input value={holdingCost} onChange={(e) => setHoldingCost(e.target.value)} className="rounded-lg border border-soft-subtle bg-navy-deep/30 px-3 py-2 text-sm text-soft-white" placeholder={t('dealMarginHoldingCost')} />
            <input value={taxCost} onChange={(e) => setTaxCost(e.target.value)} className="rounded-lg border border-soft-subtle bg-navy-deep/30 px-3 py-2 text-sm text-soft-white" placeholder={t('dealMarginTaxCost')} />
            <input value={commissionRate} onChange={(e) => setCommissionRate(e.target.value)} className="rounded-lg border border-soft-subtle bg-navy-deep/30 px-3 py-2 text-sm text-soft-white" placeholder={t('dealMarginCommissionRate')} />
            <input value={confidence} onChange={(e) => setConfidence(e.target.value)} className="rounded-lg border border-soft-subtle bg-navy-deep/30 px-3 py-2 text-sm text-soft-white" placeholder={t('dealMarginConfidence')} />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void runSimulation()}
              disabled={loading}
              className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-sm font-semibold text-gold hover:bg-gold/20 disabled:opacity-60"
            >
              {loading ? t('loading') : t('dealMarginSimulate')}
            </button>
            <button
              type="button"
              onClick={() => void runComparison()}
              disabled={loading}
              className="rounded-lg border border-blue-400/40 bg-blue-500/10 px-3 py-2 text-sm text-blue-200 hover:bg-blue-500/20 disabled:opacity-60"
            >
              {loading ? t('loading') : t('dealMarginCompare')}
            </button>
          </div>
        </section>

        {result ? (
          <section className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
              <p className="text-xs text-soft-muted">{t('dealMarginGrossEur')}</p>
              <p className="mt-1 text-2xl font-bold text-gold">{result.gross_margin_eur.toFixed(2)} EUR</p>
            </article>
            <article className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
              <p className="text-xs text-soft-muted">{t('dealMarginExpectedEur')}</p>
              <p className="mt-1 text-2xl font-bold text-gold">{result.expected_margin_eur.toFixed(2)} EUR</p>
            </article>
            <article className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
              <p className="text-xs text-soft-muted">{t('dealMarginCommissionEur')}</p>
              <p className="mt-1 text-2xl font-bold text-gold">{result.expected_commission_eur.toFixed(2)} EUR</p>
            </article>
            <article className="rounded-xl border border-soft-subtle bg-navy-surface/35 p-4">
              <p className="text-xs text-soft-muted">{t('dealMarginRecommendation')}</p>
              <p className="mt-1 text-2xl font-bold text-gold">{result.recommendation_band}</p>
            </article>
          </section>
        ) : null}

        {compareBest ? (
          <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            {t('dealMarginBestScenario')}: {compareBest}
          </section>
        ) : null}
      </motion.div>
    </div>
  )
}
