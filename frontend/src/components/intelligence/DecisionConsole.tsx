'use client'
import { GovernorDecision } from '@/lib/store'
import { useI18n } from '@/lib/i18n'
import { CheckCircle2, AlertTriangle, HelpCircle, XCircle, ArrowRight, ShieldAlert } from 'lucide-react'
import { RiskChips } from './RiskChips'

interface DecisionConsoleProps {
  decision: GovernorDecision
}

export function DecisionConsole({ decision }: DecisionConsoleProps) {
  const { t } = useI18n()

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case 'execute': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: <CheckCircle2 /> }
      case 'postpone': return { color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30', icon: <AlertTriangle /> }
      case 'reformulate': return { color: 'text-blue-light', bg: 'bg-blue-light/10', border: 'border-blue-light/30', icon: <HelpCircle /> }
      case 'discard': return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: <XCircle /> }
      default: return { color: 'text-soft-white', bg: 'bg-white/10', border: 'border-white/30', icon: <CheckCircle2 /> }
    }
  }

  const style = getRecommendationStyle(decision.recommendation)

  return (
    <div className="bg-navy-surface/80 backdrop-blur-2xl border border-blue-light/10 rounded-2xl p-5 flex flex-col gap-5 shadow-2xl">
      {/* RECOMMENDATION HEADER */}
      <div className={`p-4 rounded-xl border ${style.bg} ${style.border} flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className={`${style.color} scale-125`}>
            {style.icon}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 block mb-0.5">
              {t('recommendation')}
            </span>
            <h2 className={`text-2xl font-display font-bold uppercase transition-all ${style.color}`}>
              {t(decision.recommendation as any)}
            </h2>
          </div>
        </div>
        
        {decision.confidence && (
          <div className="text-right">
             <span className="text-[10px] font-bold uppercase tracking-widest text-soft-muted block mb-1">
              {t('confidence')}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-mono text-soft-white">{Math.round(decision.confidence * 100)}%</span>
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold animate-pulse shadow-[0_0_8px_#D4AF37]" 
                  style={{ width: `${decision.confidence * 100}%` }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DIAGNOSIS */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gold mb-3 flex items-center gap-2">
           <ShieldAlert className="w-4 h-4" />
           {t('diagnosis')}
        </h3>
        <p className="text-soft-white text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
          {decision.diagnosis}
        </p>
      </div>

      {/* RISKS */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-red-400/80 mb-3">
          {t('riskAnalysis')}
        </h3>
        <RiskChips risks={decision.risks} />
      </div>

      {/* STEPS & DON'T DO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400/80">
            {t('nextSteps')}
          </h3>
          <ul className="space-y-2">
            {decision.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 group">
                <div className="mt-1 w-4 h-4 rounded-full border border-emerald-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500/20 transition-all">
                  <ArrowRight className="w-2.5 h-2.5 text-emerald-400" />
                </div>
                <span className="text-soft-white text-xs">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-red-400/80">
            {t('dontDo')}
          </h3>
          <ul className="space-y-2">
            {decision.dont_do.map((step, i) => (
              <li key={i} className="flex items-start gap-3 group">
                <div className="mt-1 w-4 h-4 rounded-full border border-red-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-red-500/20 transition-all">
                  <span className="text-red-400 text-xs font-bold">!</span>
                </div>
                <span className="text-soft-muted text-xs line-through opacity-70 group-hover:opacity-100 transition-opacity">
                  {step}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
