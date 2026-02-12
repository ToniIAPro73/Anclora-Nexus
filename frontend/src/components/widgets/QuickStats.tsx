'use client'
import { useStore } from '@/lib/store'
import { CountUp } from '@/components/effects/animations'
import { Users, Timer, Target } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function QuickStats() {
  const stats = useStore((state) => state.stats)
  const { t } = useI18n()

  return (
    <div className="widget-card h-full flex items-center justify-around">
      <div className="flex flex-col items-center">
        <Users className="w-4 h-4 text-blue-light mb-2 opacity-60" />
        <CountUp target={stats.leadsThisWeek} className="metric-value text-2xl" />
        <span className="text-[9px] uppercase tracking-widest text-soft-muted mt-1">{t('leadsThisWeek')}</span>
      </div>

      <div className="w-[1px] h-8 bg-soft-subtle" />

      <div className="flex flex-col items-center">
        <Timer className="w-4 h-4 text-gold mb-2 opacity-60" />
        <CountUp target={stats.responseRate} suffix="%" className="metric-value text-2xl text-gold" />
        <span className="text-[9px] uppercase tracking-widest text-soft-muted mt-1">{t('responseRate')}</span>
      </div>

      <div className="w-[1px] h-8 bg-soft-subtle" />

      <div className="flex flex-col items-center">
        <Target className="w-4 h-4 text-blue-light mb-2 opacity-60" />
        <CountUp target={stats.activeMandates} className="metric-value text-2xl" />
        <span className="text-[9px] uppercase tracking-widest text-soft-muted mt-1">{t('activeMandates')}</span>
      </div>
    </div>
  )
}
