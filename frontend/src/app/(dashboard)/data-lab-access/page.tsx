'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Mail, Search, ShieldCheck, Sparkles, XCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import {
  fetchDataLabAccessRequests,
  fetchDataLabAccessSummary,
  reviewDataLabAccessRequest,
  type DataLabAccessRequestItem,
  type DataLabAccessStatus,
  type DataLabAccessTier,
  type DataLabProfileType,
  type DataLabScope,
} from '@/lib/data-lab-access-api'

export default function DataLabAccessPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<DataLabAccessRequestItem[]>([])
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<DataLabAccessStatus | ''>('submitted')
  const [profileFilter, setProfileFilter] = useState<DataLabProfileType | ''>('')
  const [search, setSearch] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [notifyApplicant, setNotifyApplicant] = useState(true)
  const [accessTier, setAccessTier] = useState<DataLabAccessTier>('limited')
  const [approvedScope, setApprovedScope] = useState<DataLabScope>('market_brief')
  const [saving, setSaving] = useState(false)

  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [itemsPayload, summaryPayload] = await Promise.all([
        fetchDataLabAccessRequests({ status: statusFilter, profile_type: profileFilter, q: search || undefined, limit: 50 }),
        fetchDataLabAccessSummary(),
      ])
      setItems(itemsPayload.items)
      setSummary(summaryPayload as unknown as Record<string, unknown>)
      const nextSelected = itemsPayload.items.find((item) => item.id === selectedId)?.id ?? itemsPayload.items[0]?.id ?? null
      setSelectedId(nextSelected)
      const active = itemsPayload.items.find((item) => item.id === nextSelected)
      setReviewNotes(active?.review_notes || '')
      setAccessTier((active?.workspace?.access_tier || 'limited') as DataLabAccessTier)
      setApprovedScope((active?.approved_scope || active?.requested_scope || 'market_brief') as DataLabScope)
      setNotifyApplicant(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [profileFilter, search, selectedId, statusFilter, t])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setReviewNotes(selected?.review_notes || '')
    setAccessTier((selected?.workspace?.access_tier || 'limited') as DataLabAccessTier)
    setApprovedScope((selected?.approved_scope || selected?.requested_scope || 'market_brief') as DataLabScope)
    setNotifyApplicant(true)
  }, [selected?.id, selected?.review_notes, selected?.workspace?.access_tier, selected?.approved_scope, selected?.requested_scope])

  async function applyReview(status: DataLabAccessStatus) {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      await reviewDataLabAccessRequest(selected.id, {
        status,
        review_notes: reviewNotes || undefined,
        notify_applicant: notifyApplicant,
        access_tier: status === 'approved' ? accessTier : undefined,
        approved_scope: status === 'approved' ? approvedScope : undefined,
      })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
    } finally {
      setSaving(false)
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
                <h1 className="page-title">{t('dataLabAccessTitle')}</h1>
                <p className="page-subtitle mt-1">{t('dataLabAccessSubtitle')}</p>
              </div>
            </div>
            <button type="button" onClick={() => void load()} className="btn-action">
              <Sparkles className="h-4 w-4" />
              {t('refresh')}
            </button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ['total', t('dataLabAccessKpiTotal')],
            ['submitted', t('dataLabAccessKpiSubmitted')],
            ['under_review', t('dataLabAccessKpiUnderReview')],
            ['approved', t('dataLabAccessKpiApproved')],
          ].map(([key, label]) => (
            <div key={key} className="surface-primary rounded-2xl border border-soft-subtle/15 bg-navy-deep/45 p-4">
              <p className="kpi-label">{label}</p>
              <p className="kpi-value mt-2">{Number(summary?.[key] || 0)}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
          <section className="surface-primary rounded-3xl border border-soft-subtle/15 bg-navy-deep/45 p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-soft-muted" />
                <input className="ui-input pl-11" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('dataLabAccessSearchPlaceholder')} />
              </div>
              <select className="ui-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as DataLabAccessStatus | '')}>
                <option value="">{t('dataLabAccessFilterAllStatus')}</option>
                {(['submitted', 'under_review', 'approved', 'rejected'] as const).map((status) => (
                  <option key={status} value={status}>{t(`dataLabAccessStatus_${status}` as never)}</option>
                ))}
              </select>
              <select className="ui-select" value={profileFilter} onChange={(e) => setProfileFilter(e.target.value as DataLabProfileType | '')}>
                <option value="">{t('dataLabAccessFilterAllProfiles')}</option>
                {(['partner', 'client', 'investor', 'other'] as const).map((profile) => (
                  <option key={profile} value={profile}>{t(`dataLabAccessProfile_${profile}` as never)}</option>
                ))}
              </select>
            </div>
            <div className="mt-5 space-y-3">
              {loading ? <p className="text-sm text-soft-muted">{t('loading')}</p> : null}
              {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
              {!loading && items.length === 0 ? <p className="text-sm text-soft-muted">{t('dataLabAccessEmpty')}</p> : null}
              {items.map((item) => {
                const active = selectedId === item.id
                return (
                  <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`surface-secondary surface-copy-safe w-full rounded-2xl border p-4 text-left transition ${active ? 'border-gold/35 bg-navy-darker/60' : 'border-soft-subtle/15 bg-navy-darker/35'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-soft-white">{item.full_name}</p>
                        <p className="mt-1 text-sm text-soft-muted">{item.company_name || item.email}</p>
                      </div>
                      <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                        {t(`dataLabAccessStatus_${item.status}` as never)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-soft-muted">{item.intended_use}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-blue-light/20 bg-blue-light/10 px-3 py-1 text-xs text-blue-light">{t(`dataLabAccessProfile_${item.profile_type}` as never)}</span>
                      <span className="rounded-full border border-soft-subtle/20 bg-navy-surface/40 px-3 py-1 text-xs text-soft-muted">{t(`dataLabAccessScope_${item.requested_scope}` as never)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="surface-primary rounded-3xl border border-soft-subtle/15 bg-navy-deep/45 p-5">
            {!selected ? (
              <p className="text-sm text-soft-muted">{t('dataLabAccessSelectOne')}</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="section-title">{selected.full_name}</h2>
                    <p className="section-subtitle mt-1">{selected.company_name || selected.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-soft-subtle/20 bg-navy-darker/50 px-3 py-1 text-xs text-soft-muted">{t(`dataLabAccessProfile_${selected.profile_type}` as never)}</span>
                    <span className="rounded-full border border-soft-subtle/20 bg-navy-darker/50 px-3 py-1 text-xs text-soft-muted">{t(`dataLabAccessScope_${selected.requested_scope}` as never)}</span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('dataLabAccessIntendedUse')}</p>
                    <p className="mt-2 text-sm leading-6 text-soft-white">{selected.intended_use}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('dataLabAccessCoverageLabel')}</p>
                    <p className="mt-2 text-sm leading-6 text-soft-white">{selected.geography_focus.join(', ') || '—'}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('dataLabAccessLanguagesLabel')}</p>
                    <p className="mt-2 text-sm leading-6 text-soft-white">{selected.languages.join(', ') || '—'}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('dataLabAccessWebsiteLabel')}</p>
                    <p className="mt-2 break-words text-sm leading-6 text-soft-white">{selected.website_url || '—'}</p>
                  </div>
                </div>

                {selected.notes ? (
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('dataLabAccessNotesLabel')}</p>
                    <p className="mt-2 text-sm leading-6 text-soft-white">{selected.notes}</p>
                  </div>
                ) : null}

                {selected.workspace ? (
                  <div className="surface-secondary rounded-2xl border border-gold/20 bg-gold/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="kpi-label">{t('dataLabAccessWorkspaceTitle')}</p>
                        <p className="mt-2 text-sm leading-6 text-soft-white">
                          {t(`dataLabAccessTier_${selected.workspace.access_tier}` as never)} · {t(`dataLabWorkspaceStatus_${selected.workspace.workspace_status}` as never)}
                        </p>
                      </div>
                      <a href={selected.workspace.launch_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold px-4 py-2 text-sm font-semibold text-navy-darker transition hover:brightness-110">
                        {t('dataLabAccessWorkspaceOpen')}
                      </a>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <select className="ui-select" value={approvedScope} onChange={(e) => setApprovedScope(e.target.value as DataLabScope)}>
                    {(['market_brief', 'partner_intelligence', 'client_pack', 'strategic_overview'] as const).map((scope) => (
                      <option key={scope} value={scope}>{t(`dataLabAccessScope_${scope}` as never)}</option>
                    ))}
                  </select>
                  <select className="ui-select" value={accessTier} onChange={(e) => setAccessTier(e.target.value as DataLabAccessTier)}>
                    {(['limited', 'standard', 'strategic'] as const).map((tier) => (
                      <option key={tier} value={tier}>{t(`dataLabAccessTier_${tier}` as never)}</option>
                    ))}
                  </select>
                </div>

                <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                  <label className="kpi-label" htmlFor="data-lab-review-notes">{t('dataLabAccessReviewNotes')}</label>
                  <textarea id="data-lab-review-notes" className="ui-textarea mt-3 min-h-32" value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} />
                  <label className="ui-checkbox-row mt-3 border-soft-subtle/10 bg-navy-surface/20 text-sm">
                    <input className="ui-checkbox" type="checkbox" checked={notifyApplicant} onChange={(e) => setNotifyApplicant(e.target.checked)} />
                    {t('dataLabAccessNotifyApplicant')}
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="button" disabled={saving} onClick={() => void applyReview('under_review')} className="inline-flex items-center gap-2 rounded-full border border-blue-light/30 bg-blue-light/10 px-5 py-3 text-sm font-semibold text-blue-light">
                    <ShieldCheck className="h-4 w-4" />
                    {t('dataLabAccessActionReview')}
                  </button>
                  <button type="button" disabled={saving} onClick={() => void applyReview('approved')} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/20 px-5 py-3 text-sm font-semibold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('dataLabAccessActionApprove')}
                  </button>
                  <button type="button" disabled={saving} onClick={() => void applyReview('rejected')} className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-950/20 px-5 py-3 text-sm font-semibold text-rose-200">
                    <XCircle className="h-4 w-4" />
                    {t('dataLabAccessActionReject')}
                  </button>
                  {notifyApplicant ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
                      <Mail className="h-4 w-4" />
                      {t('dataLabAccessNotifyHint')}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
