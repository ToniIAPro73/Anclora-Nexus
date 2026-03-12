'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Search, Sparkles } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import {
  fetchPartnerNetwork,
  fetchPartnerNetworkSummary,
  sharePartnerOpportunity,
  updatePartnerNetwork,
  type PartnerNetworkItem,
  type PartnerNetworkTier,
  type PartnerRelationshipStatus,
} from '@/lib/partner-network-api'

const inputClassName = 'ui-input'
const textareaClassName = 'ui-textarea'

export default function PartnerNetworkPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<PartnerNetworkItem[]>([])
  const [summary, setSummary] = useState<Record<string, number> | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [relationshipFilter, setRelationshipFilter] = useState<PartnerRelationshipStatus | ''>('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState({
    partner_tier: 'approved' as PartnerNetworkTier,
    relationship_status: 'active' as PartnerRelationshipStatus,
    trust_score: 70,
    preferred_for_buyers: false,
    preferred_for_sellers: false,
    network_tags: '',
    strategic_notes: '',
  })
  const [shareForm, setShareForm] = useState({
    title: '',
    summary: '',
    opportunity_type: 'buyer_opportunity',
    target_zone: '',
    budget_context: '',
    next_step: '',
  })

  const selected = useMemo(() => items.find((item) => item.workspace_id === selectedId) ?? null, [items, selectedId])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [networkPayload, summaryPayload] = await Promise.all([
        fetchPartnerNetwork({
          relationship_status: relationshipFilter,
          service_category: categoryFilter || undefined,
          q: search || undefined,
        }),
        fetchPartnerNetworkSummary(),
      ])
      setItems(networkPayload.items)
      setSummary(summaryPayload as unknown as Record<string, number>)
      const nextSelected = networkPayload.items.find((item) => item.workspace_id === selectedId)?.workspace_id ?? networkPayload.items[0]?.workspace_id ?? null
      setSelectedId(nextSelected)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, relationshipFilter, search, selectedId, t])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!selected) return
    setDraft({
      partner_tier: selected.partner_tier,
      relationship_status: selected.relationship_status,
      trust_score: selected.trust_score,
      preferred_for_buyers: selected.preferred_for_buyers,
      preferred_for_sellers: selected.preferred_for_sellers,
      network_tags: selected.network_tags.join(', '),
      strategic_notes: selected.strategic_notes || '',
    })
  }, [selected])

  async function save() {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      await updatePartnerNetwork(selected.workspace_id, {
        partner_tier: draft.partner_tier,
        relationship_status: draft.relationship_status,
        trust_score: draft.trust_score,
        preferred_for_buyers: draft.preferred_for_buyers,
        preferred_for_sellers: draft.preferred_for_sellers,
        strategic_notes: draft.strategic_notes || undefined,
        network_tags: draft.network_tags.split(',').map((item) => item.trim()).filter(Boolean),
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
    } finally {
      setSaving(false)
    }
  }

  async function shareOpportunity() {
    if (!selected) return
    setSharing(true)
    setError(null)
    try {
      await sharePartnerOpportunity(selected.workspace_id, {
        title: shareForm.title,
        summary: shareForm.summary,
        opportunity_type: shareForm.opportunity_type,
        target_zone: shareForm.target_zone || undefined,
        budget_context: shareForm.budget_context || undefined,
        next_step: shareForm.next_step || undefined,
      })
      setShareForm({
        title: '',
        summary: '',
        opportunity_type: 'buyer_opportunity',
        target_zone: '',
        budget_context: '',
        next_step: '',
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy text-soft-white">
      <div className="mx-auto max-w-screen-2xl space-y-6 px-6 py-8">
        <section className="surface-primary rounded-3xl border border-soft-subtle/15 bg-gradient-to-br from-navy-deep/80 via-navy-surface/50 to-navy-deep/70 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Link href="/dashboard" className="mt-0.5 rounded-lg border border-soft-subtle/70 bg-navy-surface/40 p-2 text-soft-white transition-colors hover:border-gold/50">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="page-title">{t('partnerNetworkTitle')}</h1>
                <p className="page-subtitle mt-1">{t('partnerNetworkSubtitle')}</p>
              </div>
            </div>
            <button type="button" onClick={() => void load()} className="btn-action">
              <Sparkles className="h-4 w-4" />
              {t('refresh')}
            </button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-6">
          {[
            ['total', t('partnerNetworkKpiTotal')],
            ['strategic', t('partnerNetworkKpiStrategic')],
            ['preferred', t('partnerNetworkKpiPreferred')],
            ['eco_focus', t('partnerNetworkKpiEco')],
            ['buyer_referrals', t('partnerNetworkKpiBuyerReferrals')],
            ['shared_opportunities', t('partnerNetworkKpiSharedOpportunities')],
          ].map(([key, label]) => (
            <div key={key} className="surface-primary rounded-2xl border border-soft-subtle/15 bg-navy-deep/45 p-4">
              <p className="kpi-label">{label}</p>
              <p className="kpi-value mt-2">{summary?.[key] ?? 0}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
          <section className="surface-primary rounded-3xl border border-soft-subtle/15 bg-navy-deep/45 p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-soft-muted" />
                <input className={`${inputClassName} pl-11`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('partnerNetworkSearchPlaceholder')} />
              </div>
              <select className="ui-select" value={relationshipFilter} onChange={(e) => setRelationshipFilter(e.target.value as PartnerRelationshipStatus | '')}>
                <option value="">{t('partnerNetworkFilterAllRelationships')}</option>
                {(['active', 'watchlist', 'paused'] as const).map((status) => (
                  <option key={status} value={status}>{t(`partnerNetworkRelationship_${status}`)}</option>
                ))}
              </select>
              <select className="ui-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">{t('partnerAdmissionsFilterAllCategories')}</option>
                {(['real_estate', 'professional', 'luxury', 'eco', 'other'] as const).map((category) => (
                  <option key={category} value={category}>{t(`partnerAdmissionsCategory_${category}`)}</option>
                ))}
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? <p className="text-sm text-soft-muted">{t('loading')}</p> : null}
              {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
              {!loading && items.length === 0 ? <p className="text-sm text-soft-muted">{t('partnerNetworkEmpty')}</p> : null}
              {items.map((item) => {
                const active = selectedId === item.workspace_id
                return (
                  <button
                    key={item.workspace_id}
                    type="button"
                    onClick={() => setSelectedId(item.workspace_id)}
                    className={`surface-secondary surface-copy-safe w-full rounded-2xl border p-4 text-left transition ${active ? 'border-gold/35 bg-navy-darker/60' : 'border-soft-subtle/15 bg-navy-darker/35'}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-soft-white">{item.partner_name}</p>
                        <p className="mt-1 text-sm text-soft-muted">{item.company_name || t(`partnerAdmissionsCategory_${item.service_category}` as never)}</p>
                      </div>
                      <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                        {t(`partnerWorkspaceTier_${item.partner_tier}` as never)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-blue-light/20 bg-blue-light/10 px-3 py-1 text-xs text-blue-light">{t(`partnerNetworkRelationship_${item.relationship_status}` as never)}</span>
                      {item.sustainability_focus ? <span className="rounded-full border border-emerald-400/20 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-300">{t('partnerAdmissionsEcoBadge')}</span> : null}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-left">
                      <div>
                        <p className="kpi-label">{t('partnerNetworkBuyerReferrals')}</p>
                        <p className="mt-1 text-sm text-soft-white">{item.buyer_referrals_count}</p>
                      </div>
                      <div>
                        <p className="kpi-label">{t('partnerNetworkTrust')}</p>
                        <p className="mt-1 text-sm text-soft-white">{item.trust_score}</p>
                      </div>
                      <div>
                        <p className="kpi-label">{t('partnerNetworkOpportunities')}</p>
                        <p className="mt-1 text-sm text-soft-white">{item.opportunities_count}</p>
                      </div>
                      <div>
                        <p className="kpi-label">{t('partnerNetworkSharedOpportunities')}</p>
                        <p className="mt-1 text-sm text-soft-white">{item.shared_opportunities_count}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="surface-primary rounded-3xl border border-soft-subtle/15 bg-navy-deep/45 p-5">
            {!selected ? (
              <p className="text-sm text-soft-muted">{t('partnerNetworkSelectOne')}</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="section-title">{selected.partner_name}</h2>
                    <p className="section-subtitle mt-1">{selected.company_name || t(`partnerAdmissionsCategory_${selected.service_category}` as never)}</p>
                  </div>
                  {selected.workspace_launch_url ? (
                    <a href={selected.workspace_launch_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-semibold text-gold">
                      <ExternalLink className="h-4 w-4" />
                      {t('partnerAdmissionsWorkspaceOpen')}
                    </a>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerNetworkBuyerReferrals')}</p>
                    <p className="kpi-value mt-2">{selected.buyer_referrals_count}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerNetworkHighIntent')}</p>
                    <p className="kpi-value mt-2">{selected.high_intent_buyers_count}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerNetworkOpportunities')}</p>
                    <p className="kpi-value mt-2">{selected.opportunities_count}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerNetworkTrust')}</p>
                    <p className="kpi-value mt-2">{selected.trust_score}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerNetworkSharedOpportunities')}</p>
                    <p className="kpi-value mt-2">{selected.shared_opportunities_count}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerAdmissionsCoverageLabel')}</p>
                    <p className="mt-2 text-sm leading-6 text-soft-white">{selected.coverage_areas.join(', ') || t('partnerAdmissionsNoCoverage')}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerAdmissionsLanguagesLabel')}</p>
                    <p className="mt-2 text-sm leading-6 text-soft-white">{selected.languages.join(', ') || t('partnerAdmissionsNoLanguages')}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <select className="ui-select" value={draft.partner_tier} onChange={(e) => setDraft((prev) => ({ ...prev, partner_tier: e.target.value as PartnerNetworkTier }))}>
                    {(['approved', 'preferred', 'strategic'] as const).map((tier) => (
                      <option key={tier} value={tier}>{t(`partnerWorkspaceTier_${tier}`)}</option>
                    ))}
                  </select>
                  <select className="ui-select" value={draft.relationship_status} onChange={(e) => setDraft((prev) => ({ ...prev, relationship_status: e.target.value as PartnerRelationshipStatus }))}>
                    {(['active', 'watchlist', 'paused'] as const).map((status) => (
                      <option key={status} value={status}>{t(`partnerNetworkRelationship_${status}`)}</option>
                    ))}
                  </select>
                  <input className={inputClassName} type="number" min={0} max={100} value={draft.trust_score} onChange={(e) => setDraft((prev) => ({ ...prev, trust_score: Number(e.target.value || 0) }))} placeholder={t('partnerNetworkTrust')} />
                  <input className={inputClassName} value={draft.network_tags} onChange={(e) => setDraft((prev) => ({ ...prev, network_tags: e.target.value }))} placeholder={t('partnerNetworkTagsPlaceholder')} />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="ui-checkbox-row">
                    <input className="ui-checkbox" type="checkbox" checked={draft.preferred_for_buyers} onChange={(e) => setDraft((prev) => ({ ...prev, preferred_for_buyers: e.target.checked }))} />
                    {t('partnerNetworkPreferredBuyers')}
                  </label>
                  <label className="ui-checkbox-row">
                    <input className="ui-checkbox" type="checkbox" checked={draft.preferred_for_sellers} onChange={(e) => setDraft((prev) => ({ ...prev, preferred_for_sellers: e.target.checked }))} />
                    {t('partnerNetworkPreferredSellers')}
                  </label>
                </div>

                <textarea className={`${textareaClassName} min-h-36`} value={draft.strategic_notes} onChange={(e) => setDraft((prev) => ({ ...prev, strategic_notes: e.target.value }))} placeholder={t('partnerNetworkStrategicNotes')} />

                <button type="button" disabled={saving} onClick={() => void save()} className="btn-action">
                  <Sparkles className="h-4 w-4" />
                  {saving ? t('loading') : t('saveChanges')}
                </button>

                <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                  <p className="section-title text-2xl">{t('partnerNetworkShareTitle')}</p>
                  <p className="section-subtitle mt-1">{t('partnerNetworkShareSubtitle')}</p>
                  <div className="mt-4 space-y-3">
                    <input className={inputClassName} value={shareForm.title} onChange={(e) => setShareForm((prev) => ({ ...prev, title: e.target.value }))} placeholder={t('partnerNetworkShareFieldTitle')} />
                    <select className="ui-select" value={shareForm.opportunity_type} onChange={(e) => setShareForm((prev) => ({ ...prev, opportunity_type: e.target.value }))}>
                      {(['buyer_opportunity', 'seller_opportunity', 'service_request', 'strategic_invite'] as const).map((item) => (
                        <option key={item} value={item}>{t(`partnerNetworkShareType_${item}` as never)}</option>
                      ))}
                    </select>
                    <textarea className={`${textareaClassName} min-h-24`} value={shareForm.summary} onChange={(e) => setShareForm((prev) => ({ ...prev, summary: e.target.value }))} placeholder={t('partnerNetworkShareFieldSummary')} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <input className={inputClassName} value={shareForm.target_zone} onChange={(e) => setShareForm((prev) => ({ ...prev, target_zone: e.target.value }))} placeholder={t('partnerNetworkShareFieldZone')} />
                      <input className={inputClassName} value={shareForm.budget_context} onChange={(e) => setShareForm((prev) => ({ ...prev, budget_context: e.target.value }))} placeholder={t('partnerNetworkShareFieldBudget')} />
                    </div>
                    <textarea className={`${textareaClassName} min-h-20`} value={shareForm.next_step} onChange={(e) => setShareForm((prev) => ({ ...prev, next_step: e.target.value }))} placeholder={t('partnerNetworkShareFieldNextStep')} />
                    <button type="button" disabled={sharing} onClick={() => void shareOpportunity()} className="btn-action">
                      <Sparkles className="h-4 w-4" />
                      {sharing ? t('loading') : t('partnerNetworkShareAction')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
