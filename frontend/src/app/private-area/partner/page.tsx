'use client'

import { useState, type FormEvent } from 'react'
import { ClipboardList, Mail, ShieldCheck, TimerReset } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrivateAreaShell } from '@/components/private-area/PrivateAreaShell'
import { useI18n } from '@/lib/i18n'
import { createPublicPartnerAdmission, type PartnerServiceCategory } from '@/lib/partner-admissions-api'

const inputClassName =
  'w-full rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 px-4 py-3 text-sm text-soft-white placeholder:text-soft-muted focus:border-gold/40 focus:outline-none'

export default function PrivateAreaPartnerPage() {
  const { t } = useI18n()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    service_category: 'real_estate' as PartnerServiceCategory,
    service_summary: '',
    collaboration_pitch: '',
    coverage_areas: '',
    languages: '',
    website_url: '',
    linkedin_url: '',
    instagram_url: '',
    sustainability_focus: false,
    sustainability_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createPublicPartnerAdmission({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone || undefined,
        company_name: form.company_name || undefined,
        service_category: form.service_category,
        service_summary: form.service_summary,
        collaboration_pitch: form.collaboration_pitch || undefined,
        coverage_areas: form.coverage_areas.split(',').map((item) => item.trim()).filter(Boolean),
        languages: form.languages.split(',').map((item) => item.trim()).filter(Boolean),
        website_url: form.website_url || undefined,
        linkedin_url: form.linkedin_url || undefined,
        instagram_url: form.instagram_url || undefined,
        sustainability_focus: form.sustainability_focus,
        sustainability_notes: form.sustainability_notes || undefined,
        submission_source: 'private_estates',
      })
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unknownError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PrivateAreaShell
      eyebrow={t('privateAreaPartnerEyebrow')}
      title={t('privateAreaPartnerTitle')}
      subtitle={t('privateAreaPartnerSubtitle')}
    >
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
          <CardHeader>
            <CardTitle className="text-soft-white">{t('privateAreaPartnerAdmissionTitle')}</CardTitle>
            <CardDescription className="text-soft-muted">{t('privateAreaPartnerAdmissionSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
              <div className="mb-3 flex items-center gap-3 text-gold"><ClipboardList className="h-5 w-5" /><span className="text-sm font-semibold text-soft-white">{t('privateAreaPartnerStep_1_title')}</span></div>
              <p className="text-sm leading-6 text-soft-muted">{t('privateAreaPartnerStep_1_copy')}</p>
            </div>
            <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
              <div className="mb-3 flex items-center gap-3 text-gold"><ShieldCheck className="h-5 w-5" /><span className="text-sm font-semibold text-soft-white">{t('privateAreaPartnerStep_2_title')}</span></div>
              <p className="text-sm leading-6 text-soft-muted">{t('privateAreaPartnerStep_2_copy')}</p>
            </div>
            <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
              <div className="mb-3 flex items-center gap-3 text-gold"><TimerReset className="h-5 w-5" /><span className="text-sm font-semibold text-soft-white">{t('privateAreaPartnerStep_3_title')}</span></div>
              <p className="text-sm leading-6 text-soft-muted">{t('privateAreaPartnerStep_3_copy')}</p>
            </div>
            <div className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
              <div className="mb-3 flex items-center gap-3 text-gold"><Mail className="h-5 w-5" /><span className="text-sm font-semibold text-soft-white">{t('privateAreaPartnerStep_4_title')}</span></div>
              <p className="text-sm leading-6 text-soft-muted">{t('privateAreaPartnerStep_4_copy')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
          <CardHeader>
            <CardTitle className="text-soft-white">{t('privateAreaPartnerFormTitle')}</CardTitle>
            <CardDescription className="text-soft-muted">{t('privateAreaPartnerFormSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {submitted ? (
              <div className="surface-secondary rounded-2xl border border-emerald-400/20 bg-emerald-950/20 p-4">
                <p className="text-sm font-semibold text-emerald-300">{t('privateAreaPartnerSubmitSuccessTitle')}</p>
                <p className="mt-2 text-sm leading-6 text-soft-white">{t('privateAreaPartnerSubmitSuccessCopy')}</p>
              </div>
            ) : (
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="grid gap-3 md:grid-cols-2">
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldFullName')} value={form.full_name} onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))} />
                  <input className={inputClassName} type="email" placeholder={t('privateAreaPartnerFieldEmail')} value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldPhone')} value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldCompany')} value={form.company_name} onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))} />
                </div>
                <select className="ui-select" value={form.service_category} onChange={(e) => setForm((prev) => ({ ...prev, service_category: e.target.value as PartnerServiceCategory }))}>
                  {(['real_estate', 'professional', 'luxury', 'eco', 'other'] as const).map((item) => (
                    <option key={item} value={item}>{t(`partnerAdmissionsCategory_${item}`)}</option>
                  ))}
                </select>
                <textarea className={`${inputClassName} min-h-28`} placeholder={t('privateAreaPartnerFieldSummary')} value={form.service_summary} onChange={(e) => setForm((prev) => ({ ...prev, service_summary: e.target.value }))} />
                <textarea className={`${inputClassName} min-h-24`} placeholder={t('privateAreaPartnerFieldPitch')} value={form.collaboration_pitch} onChange={(e) => setForm((prev) => ({ ...prev, collaboration_pitch: e.target.value }))} />
                <div className="grid gap-3 md:grid-cols-2">
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldCoverage')} value={form.coverage_areas} onChange={(e) => setForm((prev) => ({ ...prev, coverage_areas: e.target.value }))} />
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldLanguages')} value={form.languages} onChange={(e) => setForm((prev) => ({ ...prev, languages: e.target.value }))} />
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldWebsite')} value={form.website_url} onChange={(e) => setForm((prev) => ({ ...prev, website_url: e.target.value }))} />
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldLinkedin')} value={form.linkedin_url} onChange={(e) => setForm((prev) => ({ ...prev, linkedin_url: e.target.value }))} />
                </div>
                <input className={inputClassName} placeholder={t('privateAreaPartnerFieldInstagram')} value={form.instagram_url} onChange={(e) => setForm((prev) => ({ ...prev, instagram_url: e.target.value }))} />
                <label className="flex items-center gap-3 rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 px-4 py-3 text-sm text-soft-muted">
                  <input type="checkbox" checked={form.sustainability_focus} onChange={(e) => setForm((prev) => ({ ...prev, sustainability_focus: e.target.checked }))} />
                  {t('privateAreaPartnerFieldSustainability')}
                </label>
                {form.sustainability_focus ? (
                  <textarea className={`${inputClassName} min-h-24`} placeholder={t('privateAreaPartnerFieldSustainabilityNotes')} value={form.sustainability_notes} onChange={(e) => setForm((prev) => ({ ...prev, sustainability_notes: e.target.value }))} />
                ) : null}
                {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
                <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center rounded-full border border-gold/40 bg-gold px-5 py-3 text-sm font-semibold text-navy-darker transition hover:brightness-110 disabled:opacity-70">
                  {loading ? t('privateAreaPartnerSubmitting') : t('privateAreaPartnerPrimaryCta')}
                </button>
              </form>
            )}

            <div className="pt-2">
              <p className="text-sm font-semibold text-soft-white">{t('privateAreaPartnerWhoFitsTitle')}</p>
              <div className="mt-3 space-y-3">
                {(['real_estate', 'professional', 'luxury', 'eco'] as const).map((item) => (
                  <div key={item} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                    <p className="text-sm font-semibold text-soft-white">{t(`privateAreaPartnerCategory_${item}_title`)}</p>
                    <p className="mt-2 text-sm leading-6 text-soft-muted">{t(`privateAreaPartnerCategory_${item}_copy`)}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PrivateAreaShell>
  )
}
