'use client'
import { useStore } from '@/lib/store'
import { CountUp } from '@/components/effects/CountUp'
import { TrendingUp, MessageSquare, Briefcase } from 'lucide-react'

export function QuickStats() {
  const stats = useStore((state) => state.stats)

  const items = [
    { label: 'Leads/Week', value: stats.leadsThisWeek, icon: TrendingUp, color: 'text-blue-light' },
    { label: 'Resp. Rate', value: stats.responseRate, suffix: '%', icon: MessageSquare, color: 'text-gold' },
    { label: 'Mandates', value: stats.activeMandates, icon: Briefcase, color: 'text-emerald-400' },
  ]

  return (
    <div className="widget-card h-full flex items-center justify-around gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className={`p-2 rounded-full bg-white/[0.03] mb-2 ${item.color}`}>
            <item.icon className="w-4 h-4" />
          </div>
          <CountUp target={item.value} suffix={item.suffix} className="text-2xl font-bold text-soft-white tabular-nums" />
          <span className="text-[10px] uppercase tracking-wider text-soft-muted mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
