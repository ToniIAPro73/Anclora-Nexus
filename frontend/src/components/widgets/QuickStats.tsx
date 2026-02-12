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
      <div className="flex flex-col items-center flex-1">
        <Users className="w-4 h-4 text-blue-light mb-2 opacity-60" />
        <CountUp target={stats.leadsThisWeek} className="metric-value text-2xl" />
        <span className="text-[9px] uppercase tracking-wide text-soft-muted mt-1 text-center px-1">{t('leadsThisWeek')}</span>
      </div>

      <div className="w-[1px] h-8 bg-soft-subtle/50" />

      <div className="flex flex-col items-center flex-1">
        <Timer className="w-4 h-4 text-gold mb-2 opacity-60" />
        <CountUp target={stats.responseRate} suffix="%" className="metric-value text-2xl text-gold" />
        <span className="text-[9px] uppercase tracking-wide text-soft-muted mt-1 text-center px-1">{t('responseRate')}</span>
      </div>

      <div className="w-[1px] h-8 bg-soft-subtle/50" />

      <div className="flex flex-col items-center flex-1">
        <Target className="w-4 h-4 text-blue-light mb-2 opacity-60" />
        <CountUp target={stats.activeMandates} className="metric-value text-2xl" />
        <span className="text-[9px] uppercase tracking-wide text-soft-muted mt-1 text-center px-1">{t('activeMandates')}</span>
      </div>
    </div>
  )
}
