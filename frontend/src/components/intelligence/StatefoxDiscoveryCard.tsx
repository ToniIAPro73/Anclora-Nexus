'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Bot, ArrowRight, Compass, RefreshCw, ShieldAlert, Waypoints } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type StatefoxDiscovery = {
  status: 'discovery_ready' | 'blocked' | 'research' | string
  provider?: string
  source_mode?: string
  surface?: {
    mini_app_supported?: boolean
    direct_api_confirmed?: boolean
    location_query_observed?: boolean
    property_results_observed?: boolean
  }
  import_contract?: {
    primary_target?: string
    secondary_target?: string | null
  }
  automation?: {
    mode?: string
    constraints?: string[]
  }
  decision?: {
    go?: boolean
    reason?: string
  }
}

function statusKey(status: string): TranslationKey {
  if (status === 'discovery_ready') return 'statefoxDiscoveryStatusReady'
  if (status === 'blocked') return 'statefoxDiscoveryStatusBlocked'
  return 'statefoxDiscoveryStatusResearch'
}

export function StatefoxDiscoveryCard() {
  const { t } = useI18n()
  const [data, setData] = useState<StatefoxDiscovery | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/intelligence/statefox-discovery`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('unavailable')
      const body = await res.json()
      setData(body.discovery as StatefoxDiscovery)
    } catch {
      setData({ status: 'blocked' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const current = data || { status: 'research' }

  return (
    <div className="surface-primary surface-copy-safe rounded-2xl border border-soft-subtle/20 bg-navy-surface/40 p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-soft-white">{t('statefoxDiscoveryTitle')}</h2>
            <p className="text-sm text-soft-muted">{t('statefoxDiscoverySubtitle')}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-light/20 bg-blue-light/10 text-blue-light text-xs font-semibold uppercase tracking-wide">
            <Compass className="w-3.5 h-3.5" />
            {t(statusKey(current.status))}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            className="p-2 rounded-lg border border-soft-subtle/20 text-soft-muted hover:text-gold hover:border-gold/30 transition-colors"
            aria-label={t('refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
        <div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('statefoxDiscoverySurface')}</p>
          <p className="text-sm text-soft-white mt-2">{current.provider || 'Telegram Mini App'}</p>
        </div>
        <div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('statefoxDiscoveryPrimaryTarget')}</p>
          <p className="text-sm text-soft-white mt-2">{t('statefoxDiscoveryRouteProperties')}</p>
        </div>
        <div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('statefoxDiscoverySecondaryTarget')}</p>
          <p className="text-sm text-soft-white mt-2">
            {current.import_contract?.secondary_target ? t('statefoxDiscoveryRouteSellers') : t('statefoxDiscoveryNoSecondaryTarget')}
          </p>
        </div>
        <div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('statefoxDiscoveryAutomationMode')}</p>
          <p className="text-sm text-soft-white mt-2">{current.automation?.mode || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <div className="flex items-center gap-2">
            <Waypoints className="w-4 h-4 text-gold" />
            <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('statefoxDiscoveryDecision')}</p>
          </div>
          <p className="text-sm text-soft-white mt-2">{current.decision?.reason || t('statefoxDiscoveryAdapterHypothesis')}</p>
        </div>
        <div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <p className="text-[11px] uppercase tracking-wide text-soft-muted">{t('statefoxDiscoveryConstraints')}</p>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-soft-white">
            {(current.automation?.constraints || [t('statefoxDiscoverySupervisedOnly')]).slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-soft-subtle/20">
        <p className="text-sm text-soft-muted">{t('statefoxDiscoverySupervisedOnly')}</p>
        <Link href="/intelligence/statefox-discovery" className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold/80 transition-colors">
          {t('statefoxDiscoveryViewDetails')}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
