'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Mail, Search, ShieldCheck, Sparkles, XCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import {
  fetchPartnerAdmissions,
  fetchPartnerAdmissionsSummary,
  reviewPartnerAdmission,
  type PartnerAdmissionItem,
  type PartnerAdmissionStatus,
  type PartnerServiceCategory,
} from '@/lib/partner-admissions-api'

const inputClassName =
  'w-full rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 px-4 py-3 text-sm text-soft-white placeholder:text-soft-muted focus:border-gold/40 focus:outline-none'

export default function PartnerAdmissionsPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<PartnerAdmissionItem[]>([])
  const [summary, setSummary] = useState<Record<string, number> | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<PartnerAdmissionStatus | ''>('submitted')
  const [categoryFilter, setCategoryFilter] = useState<PartnerServiceCategory | ''>('')
  const [search, setSearch] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')
  const [notifyApplicant, setNotifyApplicant] = useState(false)
  const [saving, setSaving] = useState(false)

  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [itemsPayload, summaryPayload] = await Promise.all([
        fetchPartnerAdmissions({ status: statusFilter, service_category: categoryFilter, q: search || undefined, limit: 50 }),
        fetchPartnerAdmissionsSummary(),
      ])
      setItems(itemsPayload.items)
      setSummary(summaryPayload as unknown as Record<string, number>)
      const nextSelected = itemsPayload.items.find((item) => item.id === selectedId)?.id ?? itemsPayload.items[0]?.id ?? null
      setSelectedId(nextSelected)
      const active = itemsPayload.items.find((item) => item.id === nextSelected)
      setReviewNotes(active?.review_notes || '')
      setNotifyApplicant(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [categoryFilter, search, selectedId, statusFilter, t])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    setReviewNotes(selected?.review_notes || '')
    setNotifyApplicant(false)
  }, [selected?.id, selected?.review_notes])

  async function applyReview(status: PartnerAdmissionStatus) {
    if (!selected) return
    setSaving(true)
    setError(null)
    try {
      await reviewPartnerAdmission(selected.id, {
        status,
        review_notes: reviewNotes || undefined,
        notify_applicant: notifyApplicant,
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
                <h1 className="page-title">{t('partnerAdmissionsTitle')}</h1>
                <p className="page-subtitle mt-1">{t('partnerAdmissionsSubtitle')}</p>
              </div>
            </div>
            <button type="button" onClick={() => void load()} className="btn-action">
              <Sparkles className="h-4 w-4" />
              {t('refresh')}
            </button>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-5">
          {[
            ['total', t('partnerAdmissionsKpiTotal')],
            ['submitted', t('partnerAdmissionsKpiSubmitted')],
            ['under_review', t('partnerAdmissionsKpiUnderReview')],
            ['accepted', t('partnerAdmissionsKpiAccepted')],
            ['eco_focus', t('partnerAdmissionsKpiEco')],
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
                <input className={`${inputClassName} pl-11`} value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('partnerAdmissionsSearchPlaceholder')} />
              </div>
              <select className={inputClassName} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PartnerAdmissionStatus | '')}>
                <option value="">{t('partnerAdmissionsFilterAllStatus')}</option>
                {(['submitted', 'under_review', 'accepted', 'rejected'] as const).map((status) => (
                  <option key={status} value={status}>{t(`partnerAdmissionsStatus_${status}`)}</option>
                ))}
              </select>
              <select className={inputClassName} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as PartnerServiceCategory | '')}>
                <option value="">{t('partnerAdmissionsFilterAllCategories')}</option>
                {(['real_estate', 'professional', 'luxury', 'eco', 'other'] as const).map((category) => (
                  <option key={category} value={category}>{t(`partnerAdmissionsCategory_${category}`)}</option>
                ))}
              </select>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? <p className="text-sm text-soft-muted">{t('loading')}</p> : null}
              {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
              {!loading && items.length === 0 ? <p className="text-sm text-soft-muted">{t('partnerAdmissionsEmpty')}</p> : null}
              {items.map((item) => {
                const active = selectedId === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`surface-secondary surface-copy-safe w-full rounded-2xl border p-4 text-left transition ${active ? 'border-gold/35 bg-navy-darker/60' : 'border-soft-subtle/15 bg-navy-darker/35'}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-soft-white">{item.full_name}</p>
                        <p className="mt-1 text-sm text-soft-muted">{item.company_name || item.email}</p>
                      </div>
                      <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                        {t(`partnerAdmissionsStatus_${item.status}`)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-soft-muted">{item.service_summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-blue-light/20 bg-blue-light/10 px-3 py-1 text-xs text-blue-light">{t(`partnerAdmissionsCategory_${item.service_category}`)}</span>
                      {item.sustainability_focus ? <span className="rounded-full border border-emerald-400/20 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-300">{t('partnerAdmissionsEcoBadge')}</span> : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="surface-primary rounded-3xl border border-soft-subtle/15 bg-navy-deep/45 p-5">
            {!selected ? (
              <p className="text-sm text-soft-muted">{t('partnerAdmissionsSelectOne')}</p>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="section-title">{selected.full_name}</h2>
                    <p className="section-subtitle mt-1">{selected.company_name || selected.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-soft-subtle/20 bg-navy-darker/50 px-3 py-1 text-xs text-soft-muted">{selected.email}</span>
                    {selected.phone ? <span className="rounded-full border border-soft-subtle/20 bg-navy-darker/50 px-3 py-1 text-xs text-soft-muted">{selected.phone}</span> : null}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerAdmissionsOfferLabel')}</p>
                    <p className="mt-2 text-sm leading-6 text-soft-white">{selected.service_summary}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerAdmissionsPitchLabel')}</p>
                    <p className="mt-2 text-sm leading-6 text-soft-white">{selected.collaboration_pitch || t('partnerAdmissionsNoPitch')}</p>
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

                {selected.sustainability_focus ? (
                  <div className="surface-secondary rounded-2xl border border-emerald-400/20 bg-emerald-950/20 p-4">
                    <p className="kpi-label text-emerald-300">{t('partnerAdmissionsEcoLabel')}</p>
                    <p className="mt-2 text-sm leading-6 text-soft-white">{selected.sustainability_notes || t('partnerAdmissionsEcoGeneric')}</p>
                  </div>
                ) : null}

                {selected.workspace ? (
                  <div className="surface-secondary rounded-2xl border border-gold/20 bg-gold/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="kpi-label">{t('partnerAdmissionsWorkspaceTitle')}</p>
                        <p className="mt-2 text-sm leading-6 text-soft-white">
                          {t(`partnerWorkspaceTier_${selected.workspace.partner_tier}` as never)} ·{' '}
                          {t(`partnerWorkspaceStatus_${selected.workspace.workspace_status}` as never)}
                        </p>
                        <p className="mt-2 text-sm text-soft-muted">
                          {t('partnerAdmissionsWorkspaceOpportunities')} {selected.workspace.opportunities_count}
                        </p>
                      </div>
                      <a
                        href={selected.workspace.launch_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold px-4 py-2 text-sm font-semibold text-navy-darker transition hover:brightness-110"
                      >
                        {t('partnerAdmissionsWorkspaceOpen')}
                      </a>
                    </div>
                  </div>
                ) : null}

                <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                  <label className="kpi-label" htmlFor="partner-review-notes">{t('partnerAdmissionsReviewNotes')}</label>
                  <textarea
                    id="partner-review-notes"
                    className={`${inputClassName} mt-3 min-h-32`}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                  />
                  <label className="mt-3 flex items-center gap-3 text-sm text-soft-muted">
                    <input type="checkbox" checked={notifyApplicant} onChange={(e) => setNotifyApplicant(e.target.checked)} />
                    {t('partnerAdmissionsNotifyApplicant')}
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="button" disabled={saving} onClick={() => void applyReview('under_review')} className="inline-flex items-center gap-2 rounded-full border border-blue-light/30 bg-blue-light/10 px-5 py-3 text-sm font-semibold text-blue-light">
                    <ShieldCheck className="h-4 w-4" />
                    {t('partnerAdmissionsActionReview')}
                  </button>
                  <button type="button" disabled={saving} onClick={() => void applyReview('accepted')} className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/20 px-5 py-3 text-sm font-semibold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    {t('partnerAdmissionsActionAccept')}
                  </button>
                  <button type="button" disabled={saving} onClick={() => void applyReview('rejected')} className="inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-950/20 px-5 py-3 text-sm font-semibold text-rose-200">
                    <XCircle className="h-4 w-4" />
                    {t('partnerAdmissionsActionReject')}
                  </button>
                  {notifyApplicant ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
                      <Mail className="h-4 w-4" />
                      {t('partnerAdmissionsNotifyHint')}
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
