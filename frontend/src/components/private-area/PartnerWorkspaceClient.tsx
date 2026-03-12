'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowUpRight, Leaf, Network, Send } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrivateAreaShell } from '@/components/private-area/PrivateAreaShell'
import { useI18n } from '@/lib/i18n'
import {
  fetchPartnerWorkspace,
  submitPartnerWorkspaceOpportunity,
  type PartnerOpportunityType,
  type PartnerWorkspacePayload,
} from '@/lib/partner-workspace-api'

const inputClassName =
  'w-full rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 px-4 py-3 text-sm text-soft-white placeholder:text-soft-muted focus:border-gold/40 focus:outline-none'

export function PartnerWorkspaceClient({ token }: { token: string }) {
  const { t } = useI18n()
  const [workspace, setWorkspace] = useState<PartnerWorkspacePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    opportunity_type: 'collaboration_request' as PartnerOpportunityType,
    summary: '',
    target_zone: '',
    budget_range: '',
    next_step: '',
  })

  const loadWorkspace = useCallback(async () => {
    if (!token) {
      setError(t('partnerWorkspaceMissingToken'))
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const payload = await fetchPartnerWorkspace(token)
      setWorkspace(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
    } finally {
      setLoading(false)
    }
  }, [t, token])

  useEffect(() => {
    void loadWorkspace()
  }, [loadWorkspace])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!token) return
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      await submitPartnerWorkspaceOpportunity({
        token,
        title: form.title,
        opportunity_type: form.opportunity_type,
        summary: form.summary,
        target_zone: form.target_zone || undefined,
        budget_range: form.budget_range || undefined,
        next_step: form.next_step || undefined,
      })
      setForm({
        title: '',
        opportunity_type: 'collaboration_request',
        summary: '',
        target_zone: '',
        budget_range: '',
        next_step: '',
      })
      setSuccess(t('partnerWorkspaceSubmitSuccess'))
      await loadWorkspace()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
    } finally {
      setSubmitting(false)
    }
  }

  const serviceCategoryLabel = useMemo(() => {
    if (!workspace) return '—'
    return t(`partnerAdmissionsCategory_${workspace.service_category}` as never)
  }, [t, workspace])

  return (
    <PrivateAreaShell
      eyebrow={t('partnerWorkspaceEyebrow')}
      title={t('partnerWorkspaceTitle')}
      subtitle={t('partnerWorkspaceSubtitle')}
    >
      {loading ? <p className="text-sm text-soft-muted">{t('loading')}</p> : null}
      {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
      {!loading && !error && workspace ? (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
          <div className="space-y-5">
            <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-soft-white">{workspace.partner_name}</CardTitle>
                    <CardDescription className="mt-2 text-soft-muted">
                      {workspace.company_name || serviceCategoryLabel}
                    </CardDescription>
                  </div>
                  <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
                    {t(`partnerWorkspaceTier_${workspace.partner_tier}` as never)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                  <p className="text-sm font-semibold text-soft-white">{workspace.headline}</p>
                  <p className="mt-3 text-sm leading-6 text-soft-muted">{workspace.service_summary}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerWorkspaceCategory')}</p>
                    <p className="mt-2 text-sm text-soft-white">{serviceCategoryLabel}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerWorkspaceCoverage')}</p>
                    <p className="mt-2 text-sm text-soft-white break-words">{workspace.coverage_areas.join(', ') || '—'}</p>
                  </div>
                  <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="kpi-label">{t('partnerWorkspaceLanguages')}</p>
                    <p className="mt-2 text-sm text-soft-white break-words">{workspace.languages.join(', ') || '—'}</p>
                  </div>
                </div>
                <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                  <div className="flex items-center gap-3">
                    <Network className="h-4 w-4 text-gold" />
                    <p className="text-sm font-semibold text-soft-white">{t('partnerWorkspaceCollaborationFocus')}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {workspace.collaboration_focus.map((item) => (
                      <span key={item} className="rounded-full border border-blue-light/20 bg-blue-light/10 px-3 py-1 text-xs text-blue-light">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                {workspace.sustainability_focus ? (
                  <div className="surface-secondary rounded-2xl border border-emerald-400/20 bg-emerald-950/20 p-4">
                    <div className="flex items-center gap-3">
                      <Leaf className="h-4 w-4 text-emerald-300" />
                      <p className="text-sm font-semibold text-emerald-300">{t('partnerWorkspaceEcoTitle')}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-soft-white">
                      {workspace.sustainability_notes || t('partnerWorkspaceEcoFallback')}
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
              <CardHeader>
                <CardTitle className="text-soft-white">{t('partnerWorkspaceOpportunitiesTitle')}</CardTitle>
                <CardDescription className="text-soft-muted">{t('partnerWorkspaceOpportunitiesSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.opportunities.length === 0 ? (
                  <p className="text-sm text-soft-muted">{t('partnerWorkspaceOpportunitiesEmpty')}</p>
                ) : (
                  workspace.opportunities.map((item) => (
                    <div key={item.id} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-soft-white">{item.title}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-gold">
                            {t(`partnerWorkspaceOpportunityType_${item.opportunity_type}` as never)}
                          </p>
                        </div>
                        <span className="rounded-full border border-soft-subtle/20 bg-navy-surface/50 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-soft-muted">
                          {t(`partnerWorkspaceOpportunityStatus_${item.status}` as never)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-soft-muted">{item.summary}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
              <CardHeader>
                <CardTitle className="text-soft-white">{t('partnerWorkspaceNextStepsTitle')}</CardTitle>
                <CardDescription className="text-soft-muted">{t('partnerWorkspaceNextStepsSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.next_steps.map((step) => (
                  <div key={step} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4 text-sm leading-6 text-soft-white">
                    {step}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
              <CardHeader>
                <CardTitle className="text-soft-white">{t('partnerWorkspaceResourcesTitle')}</CardTitle>
                <CardDescription className="text-soft-muted">{t('partnerWorkspaceResourcesSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspace.resources.map((resource) => (
                  <div key={resource.label} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <div className="flex items-center gap-3">
                      <ArrowUpRight className="h-4 w-4 text-gold" />
                      <p className="text-sm font-semibold text-soft-white">{resource.label}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-soft-muted">{resource.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
              <CardHeader>
                <CardTitle className="text-soft-white">{t('partnerWorkspaceSubmitTitle')}</CardTitle>
                <CardDescription className="text-soft-muted">{t('partnerWorkspaceSubmitSubtitle')}</CardDescription>
              </CardHeader>
              <CardContent>
                {success ? <p className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <input className={inputClassName} placeholder={t('partnerWorkspaceFieldTitle')} value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
                  <select className="ui-select" value={form.opportunity_type} onChange={(e) => setForm((prev) => ({ ...prev, opportunity_type: e.target.value as PartnerOpportunityType }))}>
                    {(['collaboration_request', 'buyer_referral', 'seller_referral', 'service_offer'] as const).map((item) => (
                      <option key={item} value={item}>{t(`partnerWorkspaceOpportunityType_${item}` as never)}</option>
                    ))}
                  </select>
                  <textarea className={`${inputClassName} min-h-28`} placeholder={t('partnerWorkspaceFieldSummary')} value={form.summary} onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))} />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input className={inputClassName} placeholder={t('partnerWorkspaceFieldZone')} value={form.target_zone} onChange={(e) => setForm((prev) => ({ ...prev, target_zone: e.target.value }))} />
                    <input className={inputClassName} placeholder={t('partnerWorkspaceFieldBudget')} value={form.budget_range} onChange={(e) => setForm((prev) => ({ ...prev, budget_range: e.target.value }))} />
                  </div>
                  <textarea className={`${inputClassName} min-h-24`} placeholder={t('partnerWorkspaceFieldNextStep')} value={form.next_step} onChange={(e) => setForm((prev) => ({ ...prev, next_step: e.target.value }))} />
                  <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center rounded-full border border-gold/40 bg-gold px-5 py-3 text-sm font-semibold text-navy-darker transition hover:brightness-110 disabled:opacity-70">
                    <Send className="mr-2 h-4 w-4" />
                    {submitting ? t('loading') : t('partnerWorkspaceSubmitAction')}
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </PrivateAreaShell>
  )
}
