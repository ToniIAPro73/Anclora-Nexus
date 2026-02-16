'use client'
import { CheckCircle2, XCircle, AlertCircle, Database } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { IngestionStats } from '@/lib/ingestion-api'

interface Props {
  stats: IngestionStats | null
  loading: boolean
}

export function IngestionSummary({ stats, loading }: Props) {
  const { t } = useI18n()

  const cards = [
    {
      title: t('statsTotal'),
      value: stats?.total || 0,
      icon: Database,
      color: 'text-soft-white',
      bgColor: 'bg-soft-white/5',
      trend: 0
    },
    {
      title: t('statsProcessed'),
      value: stats?.processed || 0,
      icon: CheckCircle2,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      trend: stats?.trends.processed || 0
    },
    {
      title: t('statsRejected'),
      value: stats?.rejected || 0,
      icon: AlertCircle,
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      trend: stats?.trends.rejected || 0
    },
    {
      title: t('statsFailed'),
      value: stats?.failed || 0,
      icon: XCircle,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      trend: stats?.trends.failed || 0
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <div key={i} className="relative group overflow-hidden rounded-2xl border border-soft-subtle bg-navy-surface/40 backdrop-blur-md p-5 transition-all hover:border-blue-light/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-soft-muted uppercase tracking-wider mb-1">{card.title}</p>
              <h3 className={`text-2xl font-bold ${card.color} transition-all group-hover:scale-105 origin-left`}>
                {loading ? '...' : card.value}
              </h3>
              {card.trend !== 0 && (
                <p className={`text-[10px] mt-1 ${card.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {card.trend > 0 ? '+' : ''}{card.trend}% {t('recently')}
                </p>
              )}
            </div>
            <div className={`p-2 rounded-xl ${card.bgColor}`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-light/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  )
}
