'use client'
import { AlertCircle, CheckCircle2, AlertTriangle, Database } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { DQMetrics } from '@/lib/dq-api'

interface DQMetricsCardsProps {
  metrics: DQMetrics | null
}

export function DQMetricsCards({ metrics }: DQMetricsCardsProps) {
  const { t } = useI18n()

  const stats = [
    {
      label: t('dqTotalIssues'),
      value: metrics?.total_issues ?? 0,
      icon: Database,
      color: 'text-blue-light',
      bg: 'bg-blue-light/10'
    },
    {
      label: t('dqOpenIssues'),
      value: metrics?.open_issues ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10'
    },
    {
      label: t('dqCriticalIssues'),
      value: metrics?.critical_issues ?? 0,
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/10'
    },
    {
      label: t('dqSuggestedMerges'),
      value: metrics?.suggested_merges ?? 0,
      icon: CheckCircle2,
      color: 'text-gold-muted',
      bg: 'bg-gold/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <div key={i} className="glass-panel p-6 border border-white/5 hover:border-blue-light/20 transition-all duration-300">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-white-soft/60 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white-soft mt-1">{stat.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
