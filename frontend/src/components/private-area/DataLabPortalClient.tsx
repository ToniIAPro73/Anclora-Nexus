'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Database, Layers3, ShieldCheck, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { authFetch } from '@/lib/auth-fetch'
import supabase from '@/lib/supabase'

type IntelligencePack = {
  id: string
  pack_label: string
  notebook_name: string
  market_scope: string
  zone_scope: string[]
  language_code: string
  source_mode: string
  status: string
  is_default: boolean
  age_hours?: number | null
}

type IntelligencePackResponse = {
  items: IntelligencePack[]
  active_pack?: IntelligencePack | null
}

type SourceOverviewSummary = {
  total_sources: number
  healthy_sources: number
  warning_sources: number
  critical_sources: number
  stale_sources: number
}

type SourceOverviewResponse = {
  summary: SourceOverviewSummary
}

export function DataLabPortalClient() {
  const { t } = useI18n()
  const [mode, setMode] = useState<'loading' | 'guest' | 'authenticated'>('loading')
  const [packs, setPacks] = useState<IntelligencePack[]>([])
  const [activePack, setActivePack] = useState<IntelligencePack | null>(null)
  const [summary, setSummary] = useState<SourceOverviewSummary | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session?.access_token) {
        if (!cancelled) setMode('guest')
        return
      }

      try {
        const [packsRes, sourceRes] = await Promise.all([
          authFetch('/api/intelligence/packs', { cache: 'no-store' }),
          authFetch('/api/source-observatory/overview', { cache: 'no-store' }),
        ])

        if (!packsRes.ok) throw new Error(t('privateAreaDataLabLoadError'))
        const packsBody = (await packsRes.json()) as IntelligencePackResponse

        let sourceBody: SourceOverviewResponse | null = null
        if (sourceRes.ok) {
          sourceBody = (await sourceRes.json()) as SourceOverviewResponse
        }

        if (cancelled) return

        setPacks(packsBody.items || [])
        setActivePack(packsBody.active_pack || null)
        setSummary(sourceBody?.summary || null)
        setMode('authenticated')
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : t('privateAreaDataLabLoadError'))
        setMode('guest')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [t])

  const topPacks = useMemo(() => packs.slice(0, 4), [packs])

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
      <div className="space-y-5">
        <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
          <CardHeader>
            <CardTitle className="text-soft-white">{t('privateAreaDataLabScopeTitle')}</CardTitle>
            <CardDescription className="text-soft-muted">{t('privateAreaDataLabScopeSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {([
              ['packs', Database],
              ['observability', ShieldCheck],
              ['insights', Sparkles],
              ['distribution', Layers3],
            ] as const).map(([item, Icon]) => (
              <div key={item} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                <div className="mb-3 flex items-center gap-3 text-gold">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-semibold text-soft-white">{t(`privateAreaDataLabBlock_${item}_title`)}</span>
                </div>
                <p className="text-sm leading-6 text-soft-muted">{t(`privateAreaDataLabBlock_${item}_copy`)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
          <CardHeader>
            <CardTitle className="text-soft-white">{t('privateAreaDataLabCatalogTitle')}</CardTitle>
            <CardDescription className="text-soft-muted">{t('privateAreaDataLabCatalogSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mode === 'loading' ? <p className="text-sm text-soft-muted">{t('loading')}</p> : null}
            {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

            {mode === 'guest' ? (
              <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                <p className="text-sm font-semibold text-soft-white">{t('privateAreaDataLabGuestTitle')}</p>
                <p className="mt-2 text-sm leading-6 text-soft-muted">{t('privateAreaDataLabGuestCopy')}</p>
              </div>
            ) : null}

            {mode === 'authenticated' && packs.length === 0 ? (
              <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                <p className="text-sm font-semibold text-soft-white">{t('privateAreaDataLabNoPacksTitle')}</p>
                <p className="mt-2 text-sm leading-6 text-soft-muted">{t('privateAreaDataLabNoPacksCopy')}</p>
              </div>
            ) : null}

            {mode === 'authenticated' && topPacks.length > 0 ? (
              <div className="space-y-3">
                {topPacks.map((pack) => (
                  <div key={pack.id} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-soft-white">{pack.pack_label}</p>
                          {pack.is_default ? (
                            <span className="rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
                              {t('intelligencePacksActive')}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-sm text-soft-muted">{pack.notebook_name}</p>
                      </div>
                      <span className="rounded-full border border-soft-subtle/20 bg-navy-surface/40 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-soft-muted">
                        {t(`intelligencePackMarketScope_${pack.market_scope}` as never)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-blue-light/20 bg-blue-light/10 px-3 py-1 text-xs text-blue-light">
                        {(pack.zone_scope || []).join(', ') || '—'}
                      </span>
                      <span className="rounded-full border border-soft-subtle/20 bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">
                        {String(pack.language_code || 'es').toUpperCase()}
                      </span>
                      <span className="rounded-full border border-soft-subtle/20 bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">
                        {t(`intelligencePackSourceMode_${pack.source_mode}` as never)}
                      </span>
                      <span className="rounded-full border border-soft-subtle/20 bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">
                        {pack.age_hours == null ? '—' : `${pack.age_hours}h`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
          <CardHeader>
            <CardTitle className="text-soft-white">{t('privateAreaDataLabAccessTitle')}</CardTitle>
            <CardDescription className="text-soft-muted">{t('privateAreaDataLabAccessSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['access', 'tenancy', 'language'] as const).map((item) => (
              <div key={item} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                <p className="text-sm font-semibold text-soft-white">{t(`privateAreaDataLabPolicy_${item}_title`)}</p>
                <p className="mt-2 text-sm leading-6 text-soft-muted">{t(`privateAreaDataLabPolicy_${item}_copy`)}</p>
              </div>
            ))}
            <Link
              href="mailto:datalab@anclora.com?subject=Acceso%20Anclora%20Data%20Lab"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-gold/40 bg-gold px-5 py-3 text-sm font-semibold text-navy-darker transition hover:brightness-110"
            >
              {t('privateAreaDataLabPrimaryCta')}
            </Link>
          </CardContent>
        </Card>

        <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
          <CardHeader>
            <CardTitle className="text-soft-white">{t('privateAreaDataLabLiveTitle')}</CardTitle>
            <CardDescription className="text-soft-muted">{t('privateAreaDataLabLiveSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
              <p className="kpi-label">{t('privateAreaDataLabMetricPacks')}</p>
              <p className="kpi-value text-soft-white">{mode === 'authenticated' ? packs.length : '—'}</p>
            </div>
            <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
              <p className="kpi-label">{t('privateAreaDataLabMetricActivePack')}</p>
              <p className="mt-2 text-sm font-semibold text-soft-white">{activePack?.pack_label || '—'}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                <p className="kpi-label">{t('privateAreaDataLabMetricHealthySources')}</p>
                <p className="kpi-value text-emerald-300">{summary?.healthy_sources ?? '—'}</p>
              </div>
              <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                <p className="kpi-label">{t('privateAreaDataLabMetricWarningSources')}</p>
                <p className="kpi-value text-amber-300">{summary?.warning_sources ?? '—'}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/intelligence" className="inline-flex items-center gap-2 rounded-full border border-blue-light/30 bg-blue-light/10 px-4 py-2 text-sm font-semibold text-blue-light">
                <ArrowUpRight className="h-4 w-4" />
                {t('privateAreaDataLabGoIntelligence')}
              </Link>
              <Link href="/source-observatory" className="inline-flex items-center gap-2 rounded-full border border-soft-subtle/20 bg-navy-surface/40 px-4 py-2 text-sm font-semibold text-soft-white">
                <ArrowUpRight className="h-4 w-4" />
                {t('privateAreaDataLabGoObservatory')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
