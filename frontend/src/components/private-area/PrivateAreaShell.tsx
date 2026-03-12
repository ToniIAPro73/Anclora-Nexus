'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useI18n } from '@/lib/i18n'
import { getPrivateEstatesPublicHref } from '@/lib/private-area-access'

type PrivateAreaShellProps = {
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
  theme?: 'default' | 'premium'
  premiumVariant?: 'partner' | 'data-lab' | 'default'
  backHref?: string
}

export function PrivateAreaShell({
  eyebrow,
  title,
  subtitle,
  children,
  theme = 'default',
  premiumVariant = 'default',
  backHref,
}: PrivateAreaShellProps) {
  const { t, language, setLanguage } = useI18n()
  const premium = theme === 'premium'
  const resolvedBackHref = backHref || (premium ? getPrivateEstatesPublicHref(language) : '/login')
  const premiumVariantClass =
    premium && premiumVariant === 'partner'
      ? 'private-estates-theme-partner'
      : premium && premiumVariant === 'data-lab'
        ? 'private-estates-theme-data-lab'
        : ''

  return (
    <div className={premium ? `private-estates-theme ${premiumVariantClass} min-h-screen text-soft-white` : 'min-h-screen bg-[radial-gradient(circle_at_top,#1a2a5c_0%,#10182f_45%,#0b1020_100%)] text-soft-white'}>
      <div className={`mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10 ${premium ? 'private-estates-frame' : ''}`}>
        <div className={`mb-8 flex items-center justify-between gap-4 rounded-3xl px-5 py-4 backdrop-blur-xl ${premium ? 'private-estates-topbar border border-[#D4AF37]/20 bg-[rgba(7,37,47,0.72)]' : 'border border-soft-subtle/15 bg-navy-darker/50'}`}>
          <Link
            href={resolvedBackHref}
            className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] transition ${premium ? 'text-[#E5DAC0] hover:text-[#FCF6BA]' : 'text-soft-muted hover:text-gold'}`}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('privateAreaBackToLogin')}
          </Link>
          <div className="flex items-center gap-3">
            {premium ? (
              <div className="flex items-center rounded-full border border-[#D4AF37]/22 bg-[rgba(6,33,42,0.44)] p-1">
                {(['es', 'en', 'de'] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      language === lang
                        ? 'bg-[linear-gradient(135deg,#BF953F_0%,#FCF6BA_45%,#B38728_50%,#FBF5B7_55%,#AA771C_100%)] text-[#08212a]'
                        : 'text-[#E5DAC0] hover:text-[#FCF6BA]'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            ) : null}
            <BrandLogo size={40} src="/brand/logo-nexus.png" />
            <div className="text-right">
              <p className={`text-[11px] uppercase tracking-[0.28em] ${premium ? 'text-[#D4AF37]' : 'text-gold/80'}`}>{eyebrow}</p>
              <p className={`text-xs ${premium ? 'text-[#D8DFD6]/72' : 'text-soft-muted'}`}>{t('privateAreaBrandLine')}</p>
            </div>
          </div>
        </div>

        <section className={`surface-primary surface-copy-safe rounded-[28px] px-6 py-8 shadow-[0_30px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:px-10 lg:py-10 ${premium ? 'private-estates-panel border border-[#D4AF37]/18' : 'border border-soft-subtle/15 bg-navy-surface/55'}`}>
          <div className="max-w-3xl">
            <p className={`mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] ${premium ? 'text-[#D4AF37]' : 'text-gold/75'}`}>{eyebrow}</p>
            <h1 className={premium ? 'private-estates-title' : 'page-title'}>{title}</h1>
            <p className={`mt-4 text-base ${premium ? 'private-estates-subtitle' : 'page-subtitle'}`}>{subtitle}</p>
          </div>

          <div className="mt-10">{children}</div>
        </section>
      </div>
    </div>
  )
}
