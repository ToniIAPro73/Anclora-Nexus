'use client'
import { useEffect, useState } from 'react'
import { ArrowLeft, RefreshCw, Play, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n'
import { useStore } from '@/lib/store'
import { DQMetricsCards } from '@/components/dq/DQMetricsCards'
import { DQIssueList } from '@/components/dq/DQIssueList'
import { DQCandidateList } from '@/components/dq/DQCandidateList'

export default function DataQualityPage() {
  const { t } = useI18n()
  const { 
    dqIssues, 
    dqMetrics, 
    dqCandidates, 
    fetchDqIssues, 
    fetchDqMetrics, 
    fetchDqCandidates,
    recomputeDq 
  } = useStore()

  const [isRecomputing, setIsRecomputing] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          fetchDqIssues(),
          fetchDqMetrics(),
          fetchDqCandidates()
        ])
      } finally {
        setInitialLoading(false)
      }
    }
    init()
  }, [fetchDqIssues, fetchDqMetrics, fetchDqCandidates])

  const handleRecompute = async () => {
    setIsRecomputing(true)
    try {
      await recomputeDq()
      // Give it a moment before refetching as it's a background task
      setTimeout(async () => {
        await Promise.all([
          fetchDqIssues(),
          fetchDqMetrics(),
          fetchDqCandidates()
        ])
        setIsRecomputing(false)
      }, 2000)
    } catch (error) {
      console.error('Recompute failed:', error)
      setIsRecomputing(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 text-blue-light animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full p-6 overflow-hidden">
      <div className="max-w-[1400px] mx-auto h-full flex flex-col gap-5 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-soft-subtle/50 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/dashboard"
              className="p-2 rounded-xl border border-soft-subtle bg-navy-surface/40 text-soft-muted hover:text-soft-white hover:border-blue-light/50 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>
            <h1 className="text-4xl font-bold text-soft-white tracking-tight">
              {t('dataQuality')}
            </h1>
          </div>
          <p className="text-white-soft/60">
            {t('dataQualitySubtitle')}
          </p>
        </div>
        
        <button
          onClick={handleRecompute}
          disabled={isRecomputing}
          className="btn-action min-w-[170px]"
        >
          <span className="btn-action-emoji" aria-hidden="true">🔄</span>
          {isRecomputing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          {t('dqRecompute')}
        </button>
      </div>

      <div className="shrink-0">
        <DQMetricsCards metrics={dqMetrics} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 min-h-0 overflow-hidden">
        <div className="space-y-4 min-h-0 overflow-auto pr-1 custom-scrollbar">
          <DQIssueList issues={dqIssues} />
        </div>
        <div className="space-y-4 min-h-0 overflow-auto pr-1 custom-scrollbar">
          <DQCandidateList candidates={dqCandidates} />
        </div>
      </div>
      </div>
    </div>
  )
}
