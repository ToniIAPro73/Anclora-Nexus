'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Bot, Compass, Download, ExternalLink, MapPinned, Waypoints } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type DiscoveryPayload = {
  status: string
  provider?: string
  source_mode?: string
  evidence?: string[]
  entrypoints?: {
    observed?: string[]
    official_docs?: string[]
  }
  import_contract?: {
    primary_target?: string
    secondary_target?: string | null
    secondary_condition?: string
    property_fields?: string[]
    seller_signal_fields?: string[]
  }
  decision?: {
    reason?: string
  }
  observed_contract?: {
    startapp_pattern?: string
    public_property_pattern?: string
    notes?: string[]
  }
}

export default function StatefoxDiscoveryPage() {
  const { t } = useI18n()
  const [data, setData] = useState<DiscoveryPayload | null>(null)

  const load = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/intelligence/statefox-discovery`, { cache: 'no-store' })
    if (!res.ok) throw new Error('unavailable')
    const body = await res.json()
    setData(body.discovery as DiscoveryPayload)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void load()
    }, 0)

    return () => clearTimeout(timer)
  }, [load])

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/intelligence"
            className="p-2 rounded-lg bg-navy-surface/40 border border-soft-subtle hover:border-gold/50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-soft-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-soft-white">{t('statefoxDiscoveryPageTitle')}</h1>
            <p className="text-sm text-soft-muted mt-1">{t('statefoxDiscoveryPageSubtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 rounded-2xl border border-soft-subtle/20 bg-navy-surface/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bot className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-semibold text-soft-white">{t('statefoxDiscoveryEvidence')}</h2>
            </div>
            <ul className="space-y-3 text-soft-white text-sm">
              {(data?.evidence || []).map((item) => (
                <li key={item} className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-soft-subtle/20 bg-navy-surface/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Compass className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-semibold text-soft-white">{t('statefoxDiscoveryDecision')}</h2>
            </div>
            <p className="text-sm text-soft-white leading-relaxed">{data?.decision?.reason}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-soft-subtle/20 bg-navy-surface/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPinned className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-semibold text-soft-white">{t('statefoxDiscoveryEntryPoint')}</h2>
            </div>
            <ul className="space-y-3 text-sm text-soft-white">
              {(data?.entrypoints?.observed || []).map((item) => (
                <li key={item} className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">{item}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-soft-subtle/20 bg-navy-surface/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <ExternalLink className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-semibold text-soft-white">{t('statefoxDiscoveryOfficialDocs')}</h2>
            </div>
            <ul className="space-y-3 text-sm">
              {(data?.entrypoints?.official_docs || []).map((item) => (
                <li key={item}>
                  <a href={item} target="_blank" rel="noreferrer" className="text-blue-light hover:text-gold transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-soft-subtle/20 bg-navy-surface/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Compass className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-semibold text-soft-white">{t('statefoxBridgeObservedContract')}</h2>
            </div>
            <div className="space-y-3 text-sm text-soft-white">
              <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-soft-muted mb-1">{t('statefoxBridgeStartappPattern')}</p>
                <code className="text-blue-light break-all">{data?.observed_contract?.startapp_pattern}</code>
              </div>
              <div className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-soft-muted mb-1">{t('statefoxBridgePublicPattern')}</p>
                <code className="text-blue-light break-all">{data?.observed_contract?.public_property_pattern}</code>
              </div>
              {(data?.observed_contract?.notes || []).map((note) => (
                <div key={note} className="rounded-xl border border-soft-subtle/20 bg-navy-darker/20 p-4">{note}</div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-soft-subtle/20 bg-navy-surface/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Waypoints className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-semibold text-soft-white">{t('statefoxDiscoveryPrimaryTarget')}</h2>
            </div>
            <p className="text-sm text-soft-white mb-4">{t('statefoxDiscoveryRouteProperties')}</p>
            <div className="flex flex-wrap gap-2">
              {(data?.import_contract?.property_fields || []).map((field) => (
                <span key={field} className="px-2.5 py-1 rounded-full text-xs border border-soft-subtle/20 bg-navy-darker/30 text-soft-white">
                  {field}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-soft-subtle/20 bg-navy-surface/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Waypoints className="w-5 h-5 text-gold" />
              <h2 className="text-lg font-semibold text-soft-white">{t('statefoxDiscoverySecondaryTarget')}</h2>
            </div>
            <p className="text-sm text-soft-white mb-4">
              {data?.import_contract?.secondary_target ? t('statefoxDiscoveryRouteSellers') : t('statefoxDiscoveryNoSecondaryTarget')}
            </p>
            <p className="text-sm text-soft-muted mb-4">{data?.import_contract?.secondary_condition}</p>
            <div className="flex flex-wrap gap-2">
              {(data?.import_contract?.seller_signal_fields || []).map((field) => (
                <span key={field} className="px-2.5 py-1 rounded-full text-xs border border-soft-subtle/20 bg-navy-darker/30 text-soft-white">
                  {field}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/intelligence/statefox-bridge" className="btn-create inline-flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t('statefoxBridgeGoToBridge')}
          </Link>
        </div>
      </div>
    </div>
  )
}
