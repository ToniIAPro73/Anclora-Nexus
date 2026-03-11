'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { BrandLogo } from '@/components/brand/BrandLogo'
import { useI18n } from '@/lib/i18n'

type PrivateAreaShellProps = {
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
}

export function PrivateAreaShell({ eyebrow, title, subtitle, children }: PrivateAreaShellProps) {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1a2a5c_0%,#10182f_45%,#0b1020_100%)] text-soft-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10">
        <div className="mb-8 flex items-center justify-between gap-4 rounded-3xl border border-soft-subtle/15 bg-navy-darker/50 px-5 py-4 backdrop-blur-xl">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-soft-muted transition hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('privateAreaBackToLogin')}
          </Link>
          <div className="flex items-center gap-3">
            <BrandLogo size={40} src="/brand/logo-nexus.png" />
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.28em] text-gold/80">{eyebrow}</p>
              <p className="text-xs text-soft-muted">{t('privateAreaBrandLine')}</p>
            </div>
          </div>
        </div>

        <section className="surface-primary surface-copy-safe rounded-[28px] border border-soft-subtle/15 bg-navy-surface/55 px-6 py-8 shadow-[0_30px_70px_rgba(0,0,0,0.28)] backdrop-blur-2xl lg:px-10 lg:py-10">
          <div className="max-w-3xl">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold/75">{eyebrow}</p>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle mt-4 text-base">{subtitle}</p>
          </div>

          <div className="mt-10">{children}</div>
        </section>
      </div>
    </div>
  )
}
