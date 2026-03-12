'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Database, Layers3, ShieldCheck, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useI18n } from '@/lib/i18n'
import { authFetch } from '@/lib/auth-fetch'
import {
  createPublicDataLabAccessRequest,
  type DataLabProfileType,
  type DataLabScope,
} from '@/lib/data-lab-access-api'
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
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    company_name: '',
    profile_type: 'partner' as DataLabProfileType,
    requested_scope: 'market_brief' as DataLabScope,
    intended_use: '',
    geography_focus: '',
    languages: '',
    website_url: '',
    notes: '',
  })

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRequestLoading(true)
    setRequestError(null)
    try {
      await createPublicDataLabAccessRequest({
        full_name: form.full_name,
        email: form.email,
        company_name: form.company_name || undefined,
        profile_type: form.profile_type,
        requested_scope: form.requested_scope,
        intended_use: form.intended_use,
        geography_focus: form.geography_focus.split(',').map((item) => item.trim()).filter(Boolean),
        languages: form.languages.split(',').map((item) => item.trim()).filter(Boolean),
        website_url: form.website_url || undefined,
        notes: form.notes || undefined,
        submission_source: 'private_area_data_lab',
      })
      setRequestSuccess(true)
    } catch (err) {
      setRequestError(err instanceof Error ? err.message : t('privateAreaDataLabRequestError'))
    } finally {
      setRequestLoading(false)
    }
  }

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
            <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
              <p className="text-sm font-semibold text-soft-white">{t('privateAreaDataLabRequestTitle')}</p>
              <p className="mt-2 text-sm leading-6 text-soft-muted">{t('privateAreaDataLabRequestSubtitle')}</p>
              {requestSuccess ? (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-950/20 p-4">
                  <p className="text-sm font-semibold text-emerald-300">{t('privateAreaDataLabRequestSuccessTitle')}</p>
                  <p className="mt-2 text-sm leading-6 text-soft-white">{t('privateAreaDataLabRequestSuccessCopy')}</p>
                </div>
              ) : (
                <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input className="ui-input" placeholder={t('privateAreaDataLabFieldFullName')} value={form.full_name} onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))} />
                    <input className="ui-input" type="email" placeholder={t('privateAreaDataLabFieldEmail')} value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                    <input className="ui-input" placeholder={t('privateAreaDataLabFieldCompany')} value={form.company_name} onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))} />
                    <input className="ui-input" placeholder={t('privateAreaDataLabFieldWebsite')} value={form.website_url} onChange={(e) => setForm((prev) => ({ ...prev, website_url: e.target.value }))} />
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <select className="ui-select" value={form.profile_type} onChange={(e) => setForm((prev) => ({ ...prev, profile_type: e.target.value as DataLabProfileType }))}>
                      {(['partner', 'client', 'investor', 'other'] as const).map((item) => (
                        <option key={item} value={item}>{t(`dataLabAccessProfile_${item}` as never)}</option>
                      ))}
                    </select>
                    <select className="ui-select" value={form.requested_scope} onChange={(e) => setForm((prev) => ({ ...prev, requested_scope: e.target.value as DataLabScope }))}>
                      {(['market_brief', 'partner_intelligence', 'client_pack', 'strategic_overview'] as const).map((item) => (
                        <option key={item} value={item}>{t(`dataLabAccessScope_${item}` as never)}</option>
                      ))}
                    </select>
                  </div>
                  <textarea className="ui-textarea min-h-28" placeholder={t('privateAreaDataLabFieldIntendedUse')} value={form.intended_use} onChange={(e) => setForm((prev) => ({ ...prev, intended_use: e.target.value }))} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input className="ui-input" placeholder={t('privateAreaDataLabFieldGeography')} value={form.geography_focus} onChange={(e) => setForm((prev) => ({ ...prev, geography_focus: e.target.value }))} />
                    <input className="ui-input" placeholder={t('privateAreaDataLabFieldLanguages')} value={form.languages} onChange={(e) => setForm((prev) => ({ ...prev, languages: e.target.value }))} />
                  </div>
                  <textarea className="ui-textarea min-h-24" placeholder={t('privateAreaDataLabFieldNotes')} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
                  {requestError ? <p className="rounded-2xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">{requestError}</p> : null}
                  <button type="submit" disabled={requestLoading} className="btn-private-estates w-full px-5 py-3 text-sm disabled:opacity-70">
                    {requestLoading ? t('loading') : t('privateAreaDataLabPrimaryCta')}
                  </button>
                </form>
              )}
            </div>
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
