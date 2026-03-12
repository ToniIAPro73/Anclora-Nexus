'use client'

import { useState, type FormEvent } from 'react'
import { ClipboardList, Mail, ShieldCheck, TimerReset } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RecaptchaPanel } from '@/components/private-area/RecaptchaPanel'
import { PrivateAreaShell } from '@/components/private-area/PrivateAreaShell'
import { useI18n } from '@/lib/i18n'
import { getPrivateEstatesPrivacyHref } from '@/lib/private-area-access'
import { createPublicPartnerAdmission, type PartnerServiceCategory } from '@/lib/partner-admissions-api'

const inputClassName = 'ui-input'
const textareaClassName = 'ui-textarea'

export default function PrivateAreaPartnerPage() {
  const { t, language } = useI18n()
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
    newsletter_opt_in: false,
    privacy_accepted: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [captchaToken, setCaptchaToken] = useState('')

  const privacyHref = getPrivateEstatesPrivacyHref(language)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    if (form.service_summary.trim().length < 20) {
      setError(t('privateAreaPartnerSummaryTooShort'))
      setLoading(false)
      return
    }
    if (!form.privacy_accepted) {
      setError(t('externalFormPrivacyRequired'))
      setLoading(false)
      return
    }
    if ((process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY || process.env.NEXT_PUBLIC_RECAPTCHA_KEY) && !captchaToken) {
      setError(t('externalFormCaptchaRequired'))
      setLoading(false)
      return
    }
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
        privacy_accepted: form.privacy_accepted,
        newsletter_opt_in: form.newsletter_opt_in,
        captcha_provider: captchaToken ? 'recaptcha' : undefined,
        captcha_token: captchaToken || undefined,
        submission_language: language,
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
      theme="premium"
      premiumVariant="partner"
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
                <textarea className={`${textareaClassName} min-h-28`} placeholder={t('privateAreaPartnerFieldSummary')} value={form.service_summary} onChange={(e) => setForm((prev) => ({ ...prev, service_summary: e.target.value }))} />
                <textarea className={`${textareaClassName} min-h-24`} placeholder={t('privateAreaPartnerFieldPitch')} value={form.collaboration_pitch} onChange={(e) => setForm((prev) => ({ ...prev, collaboration_pitch: e.target.value }))} />
                <div className="grid gap-3 md:grid-cols-2">
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldCoverage')} value={form.coverage_areas} onChange={(e) => setForm((prev) => ({ ...prev, coverage_areas: e.target.value }))} />
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldLanguages')} value={form.languages} onChange={(e) => setForm((prev) => ({ ...prev, languages: e.target.value }))} />
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldWebsite')} value={form.website_url} onChange={(e) => setForm((prev) => ({ ...prev, website_url: e.target.value }))} />
                  <input className={inputClassName} placeholder={t('privateAreaPartnerFieldLinkedin')} value={form.linkedin_url} onChange={(e) => setForm((prev) => ({ ...prev, linkedin_url: e.target.value }))} />
                </div>
                <input className={inputClassName} placeholder={t('privateAreaPartnerFieldInstagram')} value={form.instagram_url} onChange={(e) => setForm((prev) => ({ ...prev, instagram_url: e.target.value }))} />
                <label className="ui-checkbox-row">
                  <input className="ui-checkbox" type="checkbox" checked={form.sustainability_focus} onChange={(e) => setForm((prev) => ({ ...prev, sustainability_focus: e.target.checked }))} />
                  {t('privateAreaPartnerFieldSustainability')}
                </label>
                {form.sustainability_focus ? (
                  <textarea className={`${textareaClassName} min-h-24`} placeholder={t('privateAreaPartnerFieldSustainabilityNotes')} value={form.sustainability_notes} onChange={(e) => setForm((prev) => ({ ...prev, sustainability_notes: e.target.value }))} />
                ) : null}
                <RecaptchaPanel token={captchaToken} onTokenChange={setCaptchaToken} />
                <label className="ui-checkbox-row">
                  <input className="ui-checkbox" type="checkbox" checked={form.newsletter_opt_in} onChange={(e) => setForm((prev) => ({ ...prev, newsletter_opt_in: e.target.checked }))} />
                  {t('externalFormNewsletterOptIn')}
                </label>
                <label className="ui-checkbox-row items-start">
                  <input className="ui-checkbox mt-1" type="checkbox" checked={form.privacy_accepted} onChange={(e) => setForm((prev) => ({ ...prev, privacy_accepted: e.target.checked }))} />
                  <span>
                    {t('externalFormPrivacyAccepted')}{' '}
                    <a href={privacyHref} target="_blank" rel="noreferrer" className="text-gold underline underline-offset-4">
                      {t('externalFormPrivacyLinkLabel')}
                    </a>
                  </span>
                </label>
                {error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-950/20 px-4 py-3 text-sm text-rose-200">{error}</p> : null}
                <button type="submit" disabled={loading || !form.privacy_accepted || (!!(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || process.env.NEXT_PUBLIC_RECAPTCHA_SITEKEY || process.env.NEXT_PUBLIC_RECAPTCHA_KEY) && !captchaToken)} className="btn-private-estates w-full px-5 py-3 text-sm disabled:opacity-70">
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
