'use client'
import { useState } from 'react'
import { Copy, ArrowRight, Check, X, Info } from 'lucide-react'
import { useI18n } from '@/lib/i18n'
import { DQEntityCandidate, ResolutionAction } from '@/lib/dq-api'
import { useStore } from '@/lib/store'

interface DQCandidateListProps {
  candidates: DQEntityCandidate[]
}

export function DQCandidateList({ candidates }: DQCandidateListProps) {
  const { t } = useI18n()
  const resolveDqCandidate = useStore(state => state.resolveDqCandidate)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  if (candidates.length === 0) {
    return (
      <div className="glass-panel p-8 text-center border border-white/5">
        <Copy className="w-12 h-12 text-white-soft/20 mx-auto mb-4" />
        <p className="text-white-soft/60">{t('dqNoCandidatesFound')}</p>
      </div>
    )
  }

  const handleResolve = async (candidateId: string, action: ResolutionAction) => {
    setResolvingId(candidateId)
    try {
      await resolveDqCandidate(candidateId, action)
    } finally {
      setResolvingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white-soft flex items-center gap-2">
        <Copy className="w-5 h-5 text-blue-light" />
        {t('dqDeduplication')}
      </h2>

      <div className="grid gap-4">
        {candidates.map((candidate) => (
          <div key={candidate.id} className="glass-panel p-6 border border-white/5 bg-navy-surface/40">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider bg-blue-light/10 text-blue-light px-2 py-0.5 rounded border border-blue-light/20">
                  {candidate.entity_type === 'lead' ? t('lead') : t('property')}
                </span>
                <span className="text-white-soft/40 text-xs">#{candidate.id.split('-')[0]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white-soft/60 text-sm">{t('dqSimilarityScore')}:</span>
                <span className={`font-bold ${candidate.similarity_score >= 80 ? 'text-gold' : 'text-blue-light'}`}>
                  {Math.round(candidate.similarity_score)}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 p-3 rounded-lg bg-navy-darker/50 border border-white/5 truncate">
                <span className="text-white-soft/40 text-[10px] block uppercase mb-1">{t('dqEntity')} A</span>
                <span className="text-white-soft text-sm font-medium">
                  {candidate.left_entity_id.split('-')[0]}...
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-white-soft/20 flex-shrink-0" />
              <div className="flex-1 p-3 rounded-lg bg-navy-darker/50 border border-white/5 truncate">
                <span className="text-white-soft/40 text-[10px] block uppercase mb-1">{t('dqEntity')} B</span>
                <span className="text-white-soft text-sm font-medium">
                  {candidate.right_entity_id.split('-')[0]}...
                </span>
              </div>
            </div>

            {candidate.signals && Object.keys(candidate.signals).length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {Object.entries(candidate.signals).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-white-soft/70">
                    <Info className="w-3 h-3 text-blue-light/60" />
                    <span>{t(`dqSignal_${key}` as any) || key.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => handleResolve(candidate.id, 'approve_merge')}
                disabled={!!resolvingId}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-all font-medium text-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {t('dqMerge')}
              </button>
              <button
                onClick={() => handleResolve(candidate.id, 'reject_merge')}
                disabled={!!resolvingId}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white-soft/60 border border-white/5 hover:bg-white/10 hover:text-white-soft transition-all text-sm disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                {t('dqReject')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
