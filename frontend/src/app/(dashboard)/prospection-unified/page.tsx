'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Home, Users, Zap, Filter } from 'lucide-react'
import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import {
  getProspectionWorkspace,
  type ProspectionWorkspaceResponse,
} from '@/lib/prospection-api'

type SourceFilter = '' | 'manual' | 'widget' | 'pbm'

export default function ProspectionUnifiedPage() {
  const { t } = useI18n()
  const { formatMoney, formatCompact } = useCurrency()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('')
  const [workspace, setWorkspace] = useState<ProspectionWorkspaceResponse | null>(null)

  const loadWorkspace = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getProspectionWorkspace({
        source_system: sourceFilter || undefined,
        limit: 25,
        offset: 0,
      })
      setWorkspace(res)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error loading workspace'
      setError(message)
    }
    setLoading(false)
  }, [sourceFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadWorkspace()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadWorkspace])

  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/prospection"
              className="p-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-soft-white" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-soft-white">
                {t('prospection')} Unified
              </h1>
              <p className="text-sm text-soft-muted mt-1">
                Workspace único de propiedades, buyers y matches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-navy-surface/40 border border-soft-subtle">
              <Filter className="w-4 h-4 text-soft-muted" />
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                className="bg-transparent text-sm text-soft-white outline-none"
              >
                <option value="">{t('allSources') || 'Todos los orígenes'}</option>
                <option value="manual">manual</option>
                <option value="widget">widget</option>
                <option value="pbm">pbm</option>
              </select>
            </div>
          </div>
        </div>

        {workspace && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-navy-surface/40 border border-soft-subtle rounded-xl p-4">
              <p className="text-xs text-soft-muted uppercase tracking-wider">{t('prospectedProperties')}</p>
              <p className="text-2xl font-bold text-gold mt-2">{workspace.totals.properties}</p>
            </div>
            <div className="bg-navy-surface/40 border border-soft-subtle rounded-xl p-4">
              <p className="text-xs text-soft-muted uppercase tracking-wider">{t('buyerProfiles')}</p>
              <p className="text-2xl font-bold text-gold mt-2">{workspace.totals.buyers}</p>
            </div>
            <div className="bg-navy-surface/40 border border-soft-subtle rounded-xl p-4">
              <p className="text-xs text-soft-muted uppercase tracking-wider">{t('matchBoard')}</p>
              <p className="text-2xl font-bold text-gold mt-2">{workspace.totals.matches}</p>
            </div>
          </div>
        )}

        {workspace && (
          <div className="text-xs text-soft-muted">
            Scope: <span className="text-soft-white">{workspace.scope.role}</span>
          </div>
        )}

        {loading ? (
          <div className="text-soft-muted py-12">{t('loading')}</div>
        ) : error ? (
          <div className="text-red-400 py-12">{error}</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <section className="bg-navy-surface/40 border border-soft-subtle rounded-xl overflow-hidden">
              <header className="px-4 py-3 border-b border-soft-subtle/30 flex items-center gap-2 text-soft-white font-semibold">
                <Home className="w-4 h-4 text-gold" /> {t('prospectedProperties')}
              </header>
              <div className="max-h-[520px] overflow-auto">
                {(workspace?.properties.items || []).map((item) => (
                  <div key={item.id} className="px-4 py-3 border-b border-soft-subtle/20">
                    <p className="text-sm text-soft-white font-medium">{item.title || item.zone || t('noTitle')}</p>
                    <p className="text-xs text-soft-muted mt-1">
                      {item.price != null ? formatCompact(item.price) : '-'} · {item.source_system || item.source}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-navy-surface/40 border border-soft-subtle rounded-xl overflow-hidden">
              <header className="px-4 py-3 border-b border-soft-subtle/30 flex items-center gap-2 text-soft-white font-semibold">
                <Users className="w-4 h-4 text-gold" /> {t('buyerProfiles')}
              </header>
              <div className="max-h-[520px] overflow-auto">
                {(workspace?.buyers.items || []).map((item) => (
                  <div key={item.id} className="px-4 py-3 border-b border-soft-subtle/20">
                    <p className="text-sm text-soft-white font-medium">{item.full_name || t('noName')}</p>
                    <p className="text-xs text-soft-muted mt-1">
                      {item.budget_min != null && item.budget_max != null
                        ? `${formatMoney(item.budget_min, { minFractionDigits: 0, maxFractionDigits: 0 })} - ${formatMoney(item.budget_max, { minFractionDigits: 0, maxFractionDigits: 0 })}`
                        : '-'}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-navy-surface/40 border border-soft-subtle rounded-xl overflow-hidden">
              <header className="px-4 py-3 border-b border-soft-subtle/30 flex items-center gap-2 text-soft-white font-semibold">
                <Zap className="w-4 h-4 text-gold" /> {t('matchBoard')}
              </header>
              <div className="max-h-[520px] overflow-auto">
                {(workspace?.matches.items || []).map((item) => (
                  <div key={item.id} className="px-4 py-3 border-b border-soft-subtle/20">
                    <p className="text-sm text-soft-white font-medium">{item.property_title || item.property_id}</p>
                    <p className="text-xs text-soft-muted mt-1">
                      {item.buyer_name || item.buyer_id} · score {item.match_score}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </motion.div>
    </div>
  )
}
