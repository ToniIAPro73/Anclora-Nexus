'use client'
import { RiskAssessment } from '@/lib/store'
import { AlertTriangle, ShieldCheck, AlertCircle, Zap } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

interface RiskChipsProps {
  risks: RiskAssessment[]
}

export function RiskChips({ risks }: RiskChipsProps) {
  const { t } = useI18n()

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'high': return <AlertCircle className="w-4 h-4" />
      case 'medium': return <Zap className="w-4 h-4" />
      case 'low': return <ShieldCheck className="w-4 h-4" />
      default: return <ShieldCheck className="w-4 h-4" />
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {risks.map((risk, index) => (
        <div 
          key={index}
          className={`px-3 py-2 rounded-lg border flex items-center gap-2 text-xs font-semibold transition-all hover:scale-105 cursor-default ${getRiskColor(risk.level)}`}
          title={risk.rationale}
        >
          {getRiskIcon(risk.level)}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <span>{t(`${risk.category}Risk` as any)}</span>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <span className="opacity-60 text-[10px] uppercase ml-1">{t(risk.level as any)}</span>
        </div>
      ))}
    </div>
  )
}
