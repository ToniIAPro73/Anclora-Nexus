'use client'
import { useStore } from '@/lib/store'
import { CountUp } from '@/components/effects/animations'
import { Users, Timer, Target } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export function QuickStats() {
  const stats = useStore((state) => state.stats)
  const { t } = useI18n()

  return (
    <div className="widget-card h-full flex flex-col p-0 overflow-hidden">
      <div className="flex-1 flex items-center justify-around p-4">
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

      {/* AI Insight Footer */}
      <div className="bg-gold/5 border-t border-gold/10 px-4 py-2.5 flex items-start gap-3 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <div className="mt-1 shrink-0 relative">
          <div className="absolute inset-0 bg-gold rounded-full animate-ping opacity-20" />
          <div className="w-1.5 h-1.5 bg-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[8px] font-bold text-gold uppercase tracking-widest mb-0.5 opacity-80">{t('weeklyInsight')}</div>
          <p className="text-[11px] text-soft-white/70 line-clamp-2 leading-tight italic font-light italic">
            &quot;{stats.latestInsight}&quot;
          </p>
        </div>
      </div>
    </div>
  )
}
