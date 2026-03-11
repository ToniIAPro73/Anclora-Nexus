'use client'

import Link from 'next/link'
import { BarChart3, Database, Orbit, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrivateAreaShell } from '@/components/private-area/PrivateAreaShell'
import { useI18n } from '@/lib/i18n'

export default function PrivateAreaDataLabPage() {
  const { t } = useI18n()

  return (
    <PrivateAreaShell
      eyebrow={t('privateAreaDataLabEyebrow')}
      title={t('privateAreaDataLabTitle')}
      subtitle={t('privateAreaDataLabSubtitle')}
    >
      <div className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Card className="surface-primary border-soft-subtle/15 bg-navy-deep/50">
          <CardHeader>
            <CardTitle className="text-soft-white">{t('privateAreaDataLabScopeTitle')}</CardTitle>
            <CardDescription className="text-soft-muted">{t('privateAreaDataLabScopeSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {([
              ['packs', Database],
              ['observability', ShieldCheck],
              ['insights', BarChart3],
              ['distribution', Orbit],
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
      </div>
    </PrivateAreaShell>
  )
}
