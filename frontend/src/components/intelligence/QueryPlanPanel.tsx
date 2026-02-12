'use client'
import { QueryPlan } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { MapPin, Brain, Search, Info } from 'lucide-react'

interface QueryPlanPanelProps {
  plan: QueryPlan
}

export function QueryPlanPanel({ plan }: QueryPlanPanelProps) {
  const { t } = useI18n()

  return (
    <div className="bg-navy-surface/50 backdrop-blur-xl border border-blue-light/10 rounded-2xl p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-soft-white font-display text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-gold" />
          {t('queryPlan')}
        </h3>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${plan.mode === 'deep' ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-blue-light/10 text-blue-light border border-blue-light/20'}`}>
          {plan.mode} mode
        </span>
      </div>

      <div className="space-y-6">
        {/* Intent Section */}
        <div className="group">
          <div className="flex items-center gap-2 text-gold/80 text-xs font-bold uppercase tracking-widest mb-1 group-hover:text-gold transition-colors">
            <Search className="w-3.5 h-3.5" />
            Classified Intent
          </div>
          <p className="text-soft-white text-sm bg-white/5 rounded-lg p-3 border border-white/5">
            {plan.intent_classification}
          </p>
        </div>

        {/* Domains Section */}
        <div>
          <div className="flex items-center gap-2 text-blue-light/80 text-xs font-bold uppercase tracking-widest mb-2">
            <MapPin className="w-3.5 h-3.5" />
            Active Domains
          </div>
          <div className="flex flex-wrap gap-2">
            {plan.domains_selected.map((domain, i) => (
              <span key={i} className="px-3 py-1 bg-blue-light/10 text-blue-light border border-blue-light/20 rounded-full text-[11px] font-medium">
                {domain}
              </span>
            ))}
          </div>
        </div>

        {/* Rationale Section */}
        <div className="mt-auto">
          <div className="flex items-center gap-2 text-soft-muted text-xs font-bold uppercase tracking-widest mb-1">
            <Info className="w-3.5 h-3.5" />
            Selection Rationale
          </div>
          <p className="text-soft-muted text-xs leading-relaxed italic">
            "{plan.rationale}"
          </p>
        </div>
      </div>
    </div>
  )
}
