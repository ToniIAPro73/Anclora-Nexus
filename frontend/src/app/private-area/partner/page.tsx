'use client'

import Link from 'next/link'
import { ClipboardList, Mail, ShieldCheck, TimerReset } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrivateAreaShell } from '@/components/private-area/PrivateAreaShell'
import { useI18n } from '@/lib/i18n'

export default function PrivateAreaPartnerPage() {
  const { t } = useI18n()

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
            <CardTitle className="text-soft-white">{t('privateAreaPartnerWhoFitsTitle')}</CardTitle>
            <CardDescription className="text-soft-muted">{t('privateAreaPartnerWhoFitsSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(['real_estate', 'professional', 'luxury', 'eco'] as const).map((item) => (
              <div key={item} className="surface-secondary rounded-2xl border border-soft-subtle/15 bg-navy-darker/40 p-4">
                <p className="text-sm font-semibold text-soft-white">{t(`privateAreaPartnerCategory_${item}_title`)}</p>
                <p className="mt-2 text-sm leading-6 text-soft-muted">{t(`privateAreaPartnerCategory_${item}_copy`)}</p>
              </div>
            ))}
            <Link
              href="mailto:partners@anclora.com?subject=Solicitud%20Portal%20de%20Partner%20Anclora"
              className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-gold/40 bg-gold px-5 py-3 text-sm font-semibold text-navy-darker transition hover:brightness-110"
            >
              {t('privateAreaPartnerPrimaryCta')}
            </Link>
          </CardContent>
        </Card>
      </div>
    </PrivateAreaShell>
  )
}
